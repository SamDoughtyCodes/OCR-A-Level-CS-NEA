from sqlite3 import connect  # Import library to connect to and alter the database

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
        data = self.cursor.execute(query).fetchall()  # Run the query and save the result to data
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
