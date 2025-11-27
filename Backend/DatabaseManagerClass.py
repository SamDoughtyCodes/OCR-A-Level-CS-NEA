from sqlite3 import connect  # Import library to connect to and alter the database
from datetime import date  # Import library to get the current date

# Quick sort functions
def partition(arr, low_bound: int, high_bound: int):
    """
    Function to sort a partition of an array as part of a quicksort

    Parameters:
        arr (list of integers): The sublist to sort
        low_bound (int): The lower end of the partition to sort
        high_bound (int): The upper end of the partition to sort

    Returns:
        new_i (int): The index of the new pivot location
    """
    pivot = arr[high_bound]  # Select the final element of the sublist as the pivot
    i = low_bound - 1  # Set a pointer beneath the first element of the sublist
    for ii in range(low_bound, high_bound):  # Iterate over the sublist
        if arr[ii] <= pivot:  # If the current item is less than the pivot
            # Increment lower pointer and swap items
            i += 1
            arr[i], arr[ii] = arr[ii], arr[i]
    
    # Swap the pivot and item above pointer
    arr[i+1], arr[high_bound] = pivot, arr[i+1]
    new_i = i + 1  # Set index of new pivot
    return new_i


def quick_sort(arr, low: int, high: int):
    """
    The function used both to initiate a quicksort, and to recursively call it on each sublist

    Parameters:
        arr (list[int]): The array to sort
        low (int): Pointer for the lower bound of the list
        high (int): Pointer for the upper bound of the list

    Returns:
        sorted_arr (list[int])
    """
    if high > low:  # If the pointers have not crossed (base case)
        pivot = partition(arr, low, high)  # Sort list and find pivot to use
        quick_sort(arr, low, pivot-1)  # Call quicksort on lower segment
        quick_sort(arr, pivot+1, high)  # Call quicksort on upper segment
    return arr

# Class used for managing the database
class database_manager:
    def __init__(self, file_addr: str) -> None:
        """
        Constructor method called when the object is initialised 
            
        Parameters:
            file_addr (string): The file address of the database
        """
        self.file = file_addr
        self.con = connect(file_addr)
        self.cursor = self.con.cursor()

    def fetch_all_records(self, table: str, fields: list[str], *specifier):
        """
        Method to create a bespoke database query

        Parameters:
            table (str): The table from which to fetch records
            fields (list of strings): The fields to return data from, passed as a list
            *specifier (list of unknown/varied types): The condition of which to fetch data on, stored as a list including a field and value
        
        Returns:
            data (list of unknown/varied types): The data returned from the database query
        """
        try:  # Attempt to run code
            fields_str = ""
            for i in range(len(fields)):  # Iterate over all of the provided fields to return
                fields_str += str(fields[i])  # Add each item to the string
                fields_str += ", "  # Separate the items with a comma and space
            fields_str = fields_str[:-2]  # Remove the final comma and space to end the list correctly in the string
            
            if specifier:  # If a specifier was provided
                where_str = " WHERE " + str(specifier[0][0]) + " LIKE '" + str(specifier[0][1]) + "%'"  # Build the WHERE statement of the query
            else:
                where_str = ""  # If there was no specifer, the WHERE statement is empty (does not exist)
            
            query = "SELECT " + fields_str + " FROM " + table + where_str + ";"  # Build the query
            data = self.cursor.execute(query).fetchall()  # Run the query and save the result to data
        except:  # If an issue arises
            return "Issue executing query"
        return data

    def fetch_leaderboard(self, class_id: int):
        """
        Method to fetch all leaderboard data for a specified class

        Parameters:
            class_id (int): The ID of the class leaderboard to return

        Returns:
            leaderboard (list of varied types): The sorted leaderboard for the class
        """
        # Create the query to run
        query = """
                SELECT Students.username, Students.xp
                FROM Students JOIN Student_Class_Link ON (Students.id == Student_Class_Link.student_id)
                WHERE Student_Class_Link.class_id == 
                """ + str(class_id) + ";"
        data = self.cursor.execute(query).fetchall()  # Run the query to fetch the data
        leaderboard = quick_sort(data, 0, len(data))  # Sort the data into ascending order
        return leaderboard

    def create_new_user(self, user_type, username, hashed_password, email):
        """
        Method to persistently store a new user within the database given pre-validated data

        Parameters:
            user_type (str): The type of user to add (Student or Teacher)
            username (str): The username of the new user
            hashed_password (str): The hash value of the password
            email (str): The email associated with the new account

        Returns:
            success (bool): Flag to indicate if the operation was successful
        """
        # Check that the email provided is not already in use
        existing_email = self.fetch_all_records("Students", ["id"], ["email", email])
        if existing_email:
            success = False
            return success

        # Ensure that the username provided is unique
        existing_users = self.fetch_all_records("Students", ["username"], ["username", username])
        if existing_users:  # If the username is not unique
            new_int = len(existing_users)  # Find the integer needed for uniqueness
            username += str(new_int)  # Add the integer

        if user_type == "Student":  # Insert values to student table for students
            query = "INSERT INTO Students(username, hashed_password, email, xp) VALUES ('" + username + "', '"+ hashed_password +"', '"+ email +"', 0);"
            success = True
        elif user_type == "Teacher":  # Insert values to teacher table for teachers
            query = "INSERT INTO Teachers(username, hashed_password, email) VALUES ('"+ username +"', '"+ hashed_password +"', '"+ email +"');"
            success = True
        else:  # If the user type is invalid
            query = ""
            success = False
        self.cursor.execute(query)  # Run the query
        self.con.commit()  # Commit changes

        return success

    def add_student_class_link(self, student_id, class_id):
        """
        Method to add a new link inside the Student_Class_Link table

        Parameters:
            student_id (int): The ID of the student to add
            class_id (int): The ID of the class the student is being added to

        Returns:
            success (bool): A flag to indicate if the data was added successfully
        """
        try:  # Attempt to run code
            # Create query to add new link
            query = "INSERT INTO Student_Class_Link(student_id, class_id) VALUES (" + str(student_id) + ", " + str(class_id) + ");"
            self.cursor.execute(query)  # Run query
            self.con.commit()  # Commit changes
            success = True
        except:  # If an error is raised, the data was added unsuccessfully
            success = False
        return success

    def create_new_class(self, class_name, owner_id):
        """
        Method which creates a new empty class within the database

        Parameters:
            class_name (str): The name by which the class will be refered to as
            owner_id (int): The ID of the teacher associated with the class

        Returns:
            success (bool): A flag to indicate if the data was added successfully
        """
        try:  # Attempt to run code
            query = "INSERT INTO Classes(name, teacher_id) VALUES ('" + class_name + "', " + str(owner_id) + ");"
            self.cursor.execute(query)  # Run query
            self.con.commit()  # Commit changes
            success = True
        except:  # If an error is raised, the data was added unsuccessfully
            success = False
        return success

    def crete_new_task(self, set_id, due_date, class_id):
        """
        Method to persistently write a new task to the database

        Parameters:
            set_id (int): The ID of the question set that will feature in the task
            due_date (str): Stores date in the format YYYY-MM-DD
            class_id (int): The ID of the class that the task is being assigned to

        Returns:
            success (bool): A flag to indicate if the data was added successfully
        """
        try: # Attempt to run code
            # Validate due date
            # Split due date into day, month and year
            year = int(due_date[:4])
            month = int(due_date[5:7])
            day = int(due_date[8:])
            due_datetime = date(year, month, day)
            today = date.today()
            if today < due_datetime:  # If the provided date is later than today
                query = "INSERT INTO Tasks(set_id, due_date, class_id) VALUES (" + str(set_id) + ", '" + str(due_date) + "', " + str(class_id) + ");"
                self.cursor.execute(query)  # Run the query
                self.con.commit()  # Commit changes
                success = True  # Indicate that the code ran successfully
            else:
                success = False  # The provided date is invalid
        except:  # If an error is raised, the data was added unsuccessfully
            success = False
        return success

    def fetch_student_data(self, student_id):
        """
        Method which fetches relevant data for a student, including their username, XP, classes they ae a memeber of, and all submissions

        Parameters:
            student_id (int): The ID of the student to fetch data for

        Returns:
            usr_data (dict): The collated and formated data for the student
        """
        # Build queries
        query_user_tbl = "SELECT username, xp FROM Students WHERE id == " + str(student_id) + ";"
        query_class_link = """SELECT Classes.id, Classes.name
                            FROM Classes JOIN Student_Class_Link ON (Classes.id == Student_Class_Link.class_id)
                            WHERE Student_Class_Link.student_id == """ + str(student_id) + ";"
        query_submissions = """ SELECT Submissions.id, Submissions.completion_date, Submissions.Score, Tasks.set_id
                            FROM Submissions JOIN Tasks ON (Submissions.task_id == Tasks.id)
                            WHERE Submissions.student_id == """ + str(student_id) + ";"
        
        # Run the queries
        usr_tbl = self.cursor.execute(query_user_tbl).fetchall()
        classes = self.cursor.execute(query_class_link).fetchall()
        submissions = self.cursor.execute(query_submissions).fetchall()
        formatted_subs = []  # Create an empty list to store formatted submissions

        # Format submissions to be stored with the task names
        for submission in submissions:
            name = self.fetch_all_records("Q_Sets", ["name"], ["id", submission[3]])  # Index 3 is Tasks.set_id
            sub_dict = {  # Create a dictionary for this submission
                "id": submission[0],
                "completion date": submission[1],
                "score": submission[2],
                "set id": submission[3],
                "set name": name
            }
            formatted_subs.append(sub_dict)  # Add the data for this submission to the list of formatted subs
            del sub_dict  # Delete the dictionary so it can be re-used
        
        # Format the return data
        usr_data = {
            # Personal is a dict containing the username and xp of the student
            "personal": {
                "username": usr_tbl[0][0],  # 2nd index 0 is the username
                "xp": usr_tbl[0][1]  # 2nd index 1 is the xp
            },
            "classes": classes,  # Data on all classes the student is in
            "submissions": formatted_subs  # All submission data for that student
        }

        return usr_data
    
    def update_username(self, student_id, new_usrnm):
        """
        Method to update the username of a student to a new, unique one

        Parameters:
            student_id (int): The ID of the student which needs updating
            new_usrnm (str): The new username to change to

        Returns:
            success (bool): A flag to indicate if the change was made successfully
        """
        try:  # Attempt to run the code
            # Fetch all usernames like the newly provided one
            usrs = self.fetch_all_records("Students", ["username"], ["username", new_usrnm])

            # If there are users with this username already
            if usrs:
                # Append an integer to ensure it is unique
                new_int = len(usrs)
                new_usrnm += str(new_int)

            # The username is now unique and ready to update
            query = "UPDATE Students SET username = '" + new_usrnm + "' WHERE id == " + str(student_id) + ";"
            self.cursor.execute(query)  # Run the query
            self.con.commit()  # Persistently store changes in the DB
            success = True
        except:  # If an error was raised at any point
            success = False

        return success

    def update_password(self, student_id, new_hash):
        """ 
        Methof to update the password of a student to a new hash value

        Parameters:
            student_id (int): The ID of the student to update the password of
            new_hash (str): The hash value of the new password to use

        Returns:
            success (bool): A flag to indicate if the change was made successfully
        """
        try:  # Attempt to run the code
            # Create the query
            query = "UPDATE Students SET hashed_password = '" + new_hash + "' WHERE id == '" + str(student_id) + "';"
            self.cursor.execute(query)
            self.con.commit()
            success = False
        except:  # If an error is raised at any point
            success = True
        return success

    def update_xp(self, student_id, xp_increase):
        """
        Method to add XP to a student

        Parameters:
            student_id (int): The ID of the student to add XP to
            xp_increase (str): The ammount of XP to add
        """
        try:  # Attempt to run the code
            # Fetch the current XP score for the student
            current = self.fetch_all_records("Students", ["xp"], ["id", student_id])
            new = current[0][0] + xp_increase  # Add the new amount of xp to the existing amount
            # Build and run a query to update the XP score of the student
            query = "UPDATE Students SET xp = " + str(new) + " WHERE id == " + str(student_id) + ";"
            self.cursor.execute(query)
            self.con.commit()
            success = True  # The query ran successfully
        except:  # If there is an error raised at all
            success = False
        return success
    
    def fetch_question_set(self, set_id):
        """
        Method to fetch an entire questions set

        Parameters:
            set_id (int): The ID of the question set to fetch

        Returns:
            questions (dict): The complete question set including answers
        """
        # Build the query to fetch all questions and answers for a set
        query = """ SELECT Questions.id, Questions.q_text, Questions.media_src, Questions.type, Answers.id, Answers.a_text
                FROM Questions JOIN Answers ON (Questions.id == Answers.q_id)
                WHERE Questions.set_id == """ + str(set_id)
        res = self.cursor.execute(query).fetchall()

        # Create empty arrays to store the processed questions
        questions = []
        completed_ids = []

        # Itterate over all results returned
        for i in range(len(res)):
            # Move to the next item if the current question has already been processed
            # This is needed as questions will appear multiple times joined to other answers
            if res[i][0] in completed_ids:  # Index 0 is Questions.id
                continue  # Move to next i

            # Store processed answers
            answers_arr = []
            completed_ans_ids = []

            # Itterate over results again to find answers
            for ii in range(len(res)):
                # If the current question is the current record, and its answer is not stored
                # Index 0 is Questions.id, index 4 is Answers.id and index 5 is Answers.a_text
                if res[ii][0] == res[i][0] and res[ii][4] not in completed_ans_ids:
                    answers_arr.append(res[ii][5])
                    completed_ans_ids.append(res[ii][4])
            
            # Format the data for this specific question
            # Index 3 is Questions.type, index 1 is Questions.text and index 2 is Questions.media_src
            data = {
                "type": res[i][3],
                "text": res[i][1],
                "media": res[i][2],
                "answers": answers_arr
            }
            questions.append(data)
            del data  # Clear the data ready for the next iteration

        return questions

    def fetch_task_data(self, task_id):
        """
        Method to fetch all the data relevant to a specified task

        Parameters:
            task_id (int): The ID of the task to fetch data for

        Returns:
            data (dict): The data of the task that has been fetched
        """
        query = "SELECT * FROM Tasks WHERE id = " + str(task_id) + ";"
        data = self.cursor.execute(query).fetchall()  # Run the query
        return data  # Return the results of the query

    def fetch_completed_tasks(self, teacher_id):
        """
        Method to fetch all tasks past their due date for a teacher

        Parametrs:
            teacher_id (int): The ID of the teacher to fetch data for

        Returns:
            data (dict): The completed tasks to return
        """
        # Get the current date
        curr_date = date.today()

        # Build the query
        query = """SELECT Tasks.set_id, Tasks.due_date
                   FROM Tasks JOIN Classes ON (Tasks.class_id == Classes.id)
                   WHERE (Tasks.due_date < """ + str(curr_date) + """
                   AND Classes.teacher_id == """ + str(teacher_id) + ");"
        
        # Run query and use this to fetch names of sets through another query
        data = self.cursor.execute(query).fetchall()
        formated_data = []  # This will store dicts for each item
        names = []
        for i in range(len(data)):
            # Index 0 is Tasks.set_id
            name_query = "SELECT name FROM Q_Sets WHERE id == " + str(data[i][0]) + ";"
            curr_name = self.cursor.execute(name_query).fetchall()
            names.append(curr_name)
        
        # Add the names to each data point from the first query
        for ii in range(len(data)):
            iter_data = {
                "name": names[ii],
                "due": data[ii][1]  # Tasks.due_date is index 1
            }
            formated_data.append(iter_data)  # Add the data to the formatted data
            del iter_data  # Delete data so it can be reused next iteration

        # Return the formatted due tasks
        return data
    
    def fetch_active_tasks(self, teacher_id):
        """
        Method to fetch set tasks which are within their due date for a specified teacher

        Parametrs:
            teacher_id (int): The ID of the teacher to fetch data for

        Returns:
            data (dict): The completed tasks to return
        """
        # Get the current date
        curr_date = date.today()

        # Build the query
        query = """SELECT Tasks.set_id, Tasks.due_date
                   FROM Tasks JOIN Classes ON (Tasks.class_id == Classes.id)
                   WHERE (Tasks.due_date > """ + str(curr_date) + """
                   AND Classes.teacher_id == """ + str(teacher_id) + ");"
        
        # Run query and use this to fetch names of sets through another query
        data = self.cursor.execute(query).fetchall()
        formated_data = []  # This will store dicts for each item
        names = []
        for i in range(len(data)):
            # Index 0 is Tasks.set_id
            name_query = "SELECT name FROM Q_Sets WHERE id == " + str(data[i][0]) + ";"
            curr_name = self.cursor.execute(name_query).fetchall()
            names.append(curr_name)
        
        # Add the names to each data point from the first query
        for ii in range(len(data)):
            iter_data = {
                "name": names[ii],
                "due": data[ii][1]  # Tasks.due_date is index 1
            }
            formated_data.append(iter_data)  # Add the data to the formatted data
            del iter_data  # Delete data so it can be reused next iteration

        # Return the formatted due tasks
        return data