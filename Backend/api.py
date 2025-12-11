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
    print(SECRET_KEY)
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
    expiry = datetime.now(timezone.utc) + expire_delta  # Calculate the expiry time of the token
    payload.update({"expires": expiry})  # Add the expiry time to the payload
    encoded_jwt = jwt.encode(payload, SECRET_KEY, ENC_ALG)
    return encoded_jwt

# --- Endpoints ---
# - Endpoint for existing users -
# Create struct for credentials to be sent
class ExistingCredentials(BaseModel):
    user: str
    hash_value: str

# Create function for endpoint
@app.post("/api/login")
def login_existing(creds: ExistingCredentials):
    pass
    