from sqlite3 import connect  # Import library to connect to and alter the database

# Class used for managing the database
class database_manager:
    # Constructor method
    def __init__(self, file_addr) -> None:
        self.file = file_addr
        self.cursor = connect(file_addr)

    # Method to create a bespoke database query
    def fetch_all_records(self, table, fields, *specifier):
        pass  # Fill this when continuing