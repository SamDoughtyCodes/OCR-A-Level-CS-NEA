### SETUP FOR IMPORTS  ###
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))  # Add the parent directory to the system path

### TEST 1.11: CHANGE PASSWORD ###
from Backend.DatabaseManagerClass import database_manager
db_manager = database_manager(r"C:\Users\Sam\Documents\Programming\Git Repos\NEA\OCR-A-Level-CS-NEA\site_data.db")

db_manager.update_password(2, "873ac9ffea4dd04fa719")