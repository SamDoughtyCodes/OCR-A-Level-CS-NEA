from sqlite3 import connect  # Import library to connect to and alter the database

# Class used for managing the database
class database_manager:
    def __init__(self, file_addr: str) -> None:
        """
        Constructor method called when the object is initialised 
            
        Parameters:
            file_addr (string): The file address of the database
        """
        self.file = file_addr
        self.cursor = connect(file_addr)

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
        fields_str = ""
        for i in range(len(fields)):  # Iterate over all of the provided fields to return
            fields_str += str(i)  # Add each item to the string
            fields_str += ", "  # Separate the items with a comma and space
        fields_str = fields_str[:2]  # Remove the final comma and space to end the list correctly in the string
        
        if specifier:  # If a specifier was provided
            where_str = " WHERE " + specifier[0] + " LIKE '" + specifier[1] + "%'"  # Build the WHERE statement of the query
        else:
            where_str = ""  # If there was no specifer, the WHERE statement is empty (does not exist)
        
        query = "SELECT " + fields_str + " FROM " + table + where_str + ";"  # Build the query
        data = self.cursor.execute(query)  # Run the query and save the result to data
        return data
