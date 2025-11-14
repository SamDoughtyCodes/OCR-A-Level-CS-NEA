### SETUP FOR IMPORTS  ###
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))  # Add the parent directory to the system path

### TEST 1.3: NEW USER ADDED (INVALID) ###
from Backend.DatabaseManagerClass import database_manager
db_manager = database_manager(r"C:\Users\Sam\Documents\Programming\Git Repos\NEA\OCR-A-Level-CS-NEA\site_data.db")

db_manager.create_new_user(
    "Student",
    "InvalidUser",
    "e92c5623a54293eff4a8d60f936cfbe021da0cec711ca5a772508eca486f65e0",
    "19doughty.s@kesacademy.org.uk"
)