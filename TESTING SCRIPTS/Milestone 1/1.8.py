### SETUP FOR IMPORTS  ###
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))  # Add the parent directory to the system path

### TEST 1.8: NEW TASK ###
from Backend.DatabaseManagerClass import database_manager
import datetime
db_manager = database_manager(r"C:\Users\Sam\Documents\Programming\Git Repos\NEA\OCR-A-Level-CS-NEA\site_data.db")
date = datetime.date(2026, 6, 18)
db_manager.crete_new_task(1, date, 1)
