# API related imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path

# Token relateed imports
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import pytz

# Self made libraries
from DatabaseManagerClass import database_manager

# Create API app
app = FastAPI()

# Instantiate database management
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR.parent / "site_data.db"
db_control = database_manager(str(DB_PATH))

# --- Control of access to API ---
# The web pages which can make calls to the API
origins = ["http://localhost:3000", "127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Set the pages which can make requests
    allow_credentials=True,  # Allows sending of tokens and cookies
    allow_methods=["GET", "POST"],  # Only allow GET and POST requests
    allow_headers=["*"]  # Allow any headers to be passed
)

# --- Generate tokens ---
# Read the secret key from another file
FILE_PATH = BASE_DIR / "definately_not_a_secret_key.txt"
with open(FILE_PATH, "r") as f:
    SECRET_KEY = str(f.readlines())
ENC_ALG = "HS256"
security = HTTPBearer()

# Function to generate a token
def generate_token(payload: dict, expire_delta: timedelta = timedelta(hours=2)):
    """
    Function which generates a token, consisting of a payload and expiry
    
    :param payload: Dictionary containing data to encode in the token, such as the username, user type, and XP (for students)
    :type payload: dict
    :param expire_delta: The time the token is valid for, by default 2 hours
    :type expire_delta: timedelta
    """
    expiry = (datetime.now(timezone.utc) + expire_delta).timestamp()  # Calculate the expiry time of the token
    payload.update({"expires": expiry})  # Add the expiry time to the payload
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ENC_ALG)
    return encoded_jwt

# Function to validate a token
def validate_token(call_creds: HTTPAuthorizationCredentials = Depends(security)):
    """
    Function which takes a token, checks its validity and returns its payload
    
    :param call_creds: Credentials including the token provided
    :type call_creds: HTTPAuthorizationCredentials
    """
    print(call_creds)
    print(call_creds.credentials)
    token = call_creds.credentials  # Extract the token
    try:  # Attempt to access the token
        # Decode token and extract payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ENC_ALG])
        return payload
    except JWTError:  # If the token is invalid
        raise HTTPException(  # Raise an error
            status_code=status.HTTP_403_FORBIDDEN,  # Set error code
            detail="Invalid or expired token"  # Set error message
        )

# --- Endpoints ---
# - Endpoint to validate a token -
@app.get("/api/validate")
def ep_validate_token(payload: dict = Depends(validate_token)):
    return {"payload": payload}

# - Endpoint for existing users -
# Create struct for credentials to be sent
class ExistingCredentials(BaseModel):
    user: str
    hash_value: str

# Create function for endpoint
@app.post("/api/login")
def login_existing(creds: ExistingCredentials):
    """
    Endpoint which validates login requests for existing users
    
    :param creds: The credentials provided by the user logging in
    :type creds: ExistingCredentials
    """
    # Determine if the user has provided an email or a username
    usrval_type = "email" if "@" in creds.user else "username"

    # Fetch correct data based on the provided email or username
    teacher_hash_values = db_control.fetch_all_records("Teachers", ["hashed_password"], [usrval_type, creds.user])
    student_hash_values = db_control.fetch_all_records("Students", ["hashed_password"], [usrval_type, creds.user])
    print(usrval_type, teacher_hash_values, student_hash_values)
    
    # Make sure the queries exectuted successfully (did not return error text)
    if type(teacher_hash_values) == str or type(student_hash_values) == str:
        return {"success": False, "msg": "Issue fetching DB data", "token": None}
    # If there are no users matching the username/email
    elif len(list(teacher_hash_values)) == 0 and len(list(student_hash_values)) == 0:
        return {"success": False, "msg": "User not found", "token": None}
    else:  # Combine all hash values
        usr_to_check = teacher_hash_values[0] if len(list(student_hash_values)) == 0 else student_hash_values[0]
        usr_type = "Teacher" if len(list(student_hash_values)) == 0 else "Student"

    # Check the data against provided credentials
    if creds.hash_value == usr_to_check[0]:  # If password is correct
        payload = {"username": creds.user, "usr_type": usr_type}
        if usr_type == "Student":
            # Get the student ID and fetch their XP
            usr_id = db_control.fetch_all_records("Students", ["id"], [usrval_type, creds.user])
            xp = db_control.fetch_student_data(usr_id[0])
            payload["xp"] = xp["personal"]["xp"]

        token = generate_token(payload)
        return {"success": True, "msg": "Successful login", "token": token}
    else: # If password is incorrect
        return {"success": False, "msg": "Incorrect password", "token": None}
    
# - Endpoint for new users - 
# Create structure for credentials to be passed through
class NewCredentials(BaseModel):
    is_student: bool
    email: str
    name: str
    hash_pass: str

# Function for endpoint
@app.post("/api/newuser")
def login_newuser(creds: NewCredentials):
    """
    Endpoint which creates an account for a new user
    
    :param creds: The login credentials provided by the backend
    :type creds: NewCredentials
    """
    # Set user type and name
    usr_type = "Student" if creds.is_student else "Teacher"
    username = creds.name

    # Create account itself
    (success, unique_user) = db_control.create_new_user(usr_type, username, creds.hash_pass, creds.email)
    return {"success": success, "username": unique_user}
    

# - Endpoint for fetching student data -
@app.get("/api/stud_data")
def fetch_stud_data(id: int):
    """
    Endpoint to fetch all of the data for a specified student
    
    :param id: The ID of the student to fetch data for
    :type id: int
    """
    data = db_control.fetch_student_data(id)
    return data

# - Endpoint for updating a username -
class NewUsername(BaseModel):
    id: int  # The ID of the student to update the username of
    name: str  # The new username to use

@app.post("api/students/upd_user")
def update_username(data: NewUsername):
    """
    Endpoint to change the username of a specified student
    
    :param data: Class to store data to update
    :type data: NewUsername
    """
    res = db_control.update_username(data.id, data.name)
    return res  # Return if the method executed successfully or not

# - Endpoint for updating a password -
class NewPass(BaseModel):
    id: int  # The ID of the student to update the password of
    hash: str  # Hash value of the new password

@app.post("api/students/upd_pass")
def update_password(data: NewPass):
    """
    Endpoint to change a user's password
    
    :param data: The data being updated
    :type data: NewPass
    """
    res = db_control.update_password(data.id, data.hash)
    return res  # Return if the method executed successfully or not

# - Endpoint to create a new task -
class NewTask(BaseModel):
    set_id: int  # The ID of the question set being used
    due: str  # The due date, formatted as a string YYYY-MM-DD
    class_id: int  # The ID of the class which the task is for

@app.post("api/tasks/new")
def create_task(data: NewTask):
    """
    Endpoint which recieves data about a new task and writes this
    to the database
    
    :param data: The data needed to store the task
    :type data: NewTask
    """
    res = db_control.crete_new_task(data.set_id, data.due, data.class_id)
    return res  # Return if the method executed successfully or not

# - Endpoint to create a new class -
class NewClass(BaseModel):
    name: str  # The name of the class (e.g. Y7Maths)
    owner_id: int  # The ID of the teacher who owns the class

@app.post("api/classes/new")
def create_class(data: NewClass):
    """
    Endpoint which persistently stores a new class to the database
    
    :param data: The data needed to create the class
    :type data: NewClass
    """
    res = db_control.create_new_class(data.name, data.owner_id)
    return res  # Return if the method executed successfully or not

# - Endpoint to add students to a class
class NewStuds(BaseModel):
    class_id: int  # ID of the class to add the students to
    stud_ids: list[int]  # List of IDs of students to add to the class

@app.post("api/classes/add")
def add_students(data: NewStuds):
    """
    Endpoint to add students to a class
    
    :param data: Stores the class to add to and the studnent IDs to add
    :type data: NewStuds
    """
    success = True  # Keep track of if any additions have failed
    for id in NewStuds.stud_ids:  # Iterate over all students to add
        # Add the student to the class, and compare the result
        if not db_control.add_student_class_link(id, NewStuds.class_id):
            success = False  # If failed, set flag
    
    return success
