### SETUP FOR IMPORTS  ###
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))  # Add the parent directory to the system path

### TEST 1.12: UPDATE XP ###
from Backend.DatabaseManagerClass import database_manager
db_manager = database_manager(r"../../site_data.db")

db_manager.update_xp(1, 50)