### SETUP FOR IMPORTS  ###
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))  # Add the parent directory to the system path

### TEST 1.4: FETCH ALL RECORDS (VALID) ###
from Backend.DatabaseManagerClass import database_manager
db_manager = database_manager(r"../../site_data.db")

records = db_manager.fetch_all_records("Imaginary table", ["username"], ["XP", 0])
print(records)