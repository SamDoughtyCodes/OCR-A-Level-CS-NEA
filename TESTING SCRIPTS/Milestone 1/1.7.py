### SETUP FOR IMPORTS  ###
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))  # Add the parent directory to the system path

### TEST 1.7: ADD STUDENT TO CLASS ###
from Backend.DatabaseManagerClass import database_manager
db_manager = database_manager(r"C:\Users\Sam\Documents\Programming\Git Repos\NEA\OCR-A-Level-CS-NEA\site_data.db")

db_manager.add_student_class_link(1, 1)
