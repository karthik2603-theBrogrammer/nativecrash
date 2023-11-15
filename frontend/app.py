import streamlit as st
import pandas as pd
import xml.etree.ElementTree as ET
import mysql.connector

SRN1 = "PES1UG21CS300"
SRN2 = "PES1UG21CS269"

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="1234",
    database="nativecrash"
)
# Function to fetch data from a given table
def fetch_table_data(table_name):
    query = f"SELECT * FROM {table_name}"
    data = pd.read_sql(query, conn)
    return data

# Function to execute a join query and retrieve the result
def execute_join_query():
    query="""
    SELECT
    l.build_id,
    l.location,
    COUNT(DISTINCT ci.crash_id) AS number_of_crashes
    FROM
        location l
    JOIN
        device_surface_info ds ON l.build_id = ds.build_id
    LEFT JOIN
        crash_info ci ON l.crash_id = ci.crash_id
    GROUP BY
        l.build_id, l.location;
    """
    data = pd.read_sql(query, conn)
    return data

# Function to execute a nested query and retrieve the result
def execute_nested_query():
    query = """
    SELECT
        ds.build_id,
        ds.device_name,
        (SELECT COUNT(DISTINCT l.crash_id) FROM location l WHERE l.build_id = ds.build_id) AS total_crashes
    FROM
        device_surface_info ds;
    """
    data = pd.read_sql(query, conn)
    return data

# Function to update the number of crashes in the number_of_crashes table
def update_number_of_crashes(build_id, location, number_of_crashes):
    query = f"""
    INSERT INTO number_of_crashes (build_id, location, number_of_crashes)
    VALUES ('{build_id}', '{location}', {number_of_crashes})
    ON DUPLICATE KEY UPDATE number_of_crashes = {number_of_crashes};
    """
    cursor = conn.cursor()
    cursor.execute(query)
    conn.commit()
    cursor.close()

# Function to create a table with given name and columns
def create_table(table_name, columns):
    cursor = conn.cursor()
    
    # Build the CREATE TABLE query
    create_table_query = f"CREATE TABLE IF NOT EXISTS {table_name} ("
    for column in columns:
        create_table_query += f"{column} VARCHAR(255), "
    create_table_query = create_table_query.rstrip(', ')
    create_table_query += ")"
    
    # Execute the query
    cursor.execute(create_table_query)
    conn.commit()
    cursor.close()

# Function to insert data into a given table
def insert_data(table_name, data):
    cursor = conn.cursor()
    
    # Build the INSERT INTO query
    insert_query = f"INSERT INTO {table_name} VALUES ({', '.join(['%s' for _ in data])})"
    
    # Execute the query
    cursor.execute(insert_query, data)
    conn.commit()
    cursor.close()

# Function to delete a table with the given name
def delete_table(table_name):
    cursor = conn.cursor()

    # Build the DROP TABLE query
    drop_table_query = f"DROP TABLE IF EXISTS {table_name}"

    # Execute the query
    cursor.execute(drop_table_query)
    conn.commit()
    cursor.close()

# Function to create a role with the given name
def create_role(role_name):
    cursor = conn.cursor()

    # Build the CREATE ROLE query
    create_role_query = f"CREATE ROLE {role_name}"

    # Execute the query
    cursor.execute(create_role_query)
    conn.commit()
    cursor.close()

# Function to grant a privilege to a user on a table
def grant_privilege(user_id, privilege, table_name):
    cursor = conn.cursor()

    # Build the GRANT query
    grant_query = f"GRANT {privilege} ON {table_name} TO {user_id}"

    # Execute the query
    cursor.execute(grant_query)
    conn.commit()
    cursor.close()

# Function to revoke a privilege from a user on a table
def revoke_privilege(user_id, privilege, table_name):
    cursor = conn.cursor()

    # Build the REVOKE query
    revoke_query = f"REVOKE {privilege} ON {table_name} FROM {user_id}"

    # Execute the query
    cursor.execute(revoke_query)
    conn.commit()
    cursor.close()


st.title("DBMS proj")
st.markdown(f"##### Made with ❤ by SRN: {SRN1}, {SRN2}")

st.sidebar.header("Navigation")
menu_option = st.sidebar.selectbox("Select an operation", ["Show Tables", "Show Join Tables", "Show Nested Query", "Manage User Privilege", "CRUD"])


if menu_option == "Show Tables":
    
    st.header("Show Tables")

    selected_table = st.selectbox("Select a table", ["device_surface_info", "location", "crash_info"])

    if st.button("Show Table"):
        table_data = fetch_table_data(selected_table)
        st.subheader(f"Data for {selected_table} Table")
        st.dataframe(table_data)

elif menu_option == "Show Join Tables":
    
    st.header("Show Join Tables")
    if st.button("Show Join Table Data"):
        join_table_data = execute_join_query()
        st.subheader(f"Data for Join Table")
        st.dataframe(join_table_data)


elif menu_option == "Show Nested Query":
    st.header("Show Nested Query")

    if st.button("Execute Nested Query"):
        nested_query_data = execute_nested_query()
        st.subheader("Results of Nested Query")
        st.dataframe(nested_query_data)

elif menu_option == "CRUD":
    st.header("CRUD Operations")

    # Dropdown to choose the CRUD operation
    crud_option = st.selectbox("Choose CRUD Operation", [ "Create Table", "Read/Insert into Table", "Update Table", "Delete Table"])

    if crud_option == "Update Table":
        # Update Table Section
        st.subheader("Updating table number_of_crashes")

        build_id = st.text_input("Enter Build ID:")
        location = st.text_input("Enter Location:")
        number_of_crashes = st.number_input("Enter Number of Crashes:")

        if st.button("Update Number of Crashes"):
            update_number_of_crashes(build_id, location, number_of_crashes)
            st.success("Number of Crashes updated successfully.")

    elif crud_option == "Create Table":
        # Create Table Section
        st.subheader("Create Table")

        # User input for table name and columns
        new_table_name = st.text_input("Enter Table Name:")
        new_columns = st.text_area("Enter Columns (comma-separated):")

        # Convert the input string of columns into a list
        new_columns_list = [col.strip() for col in new_columns.split(',')]

        if st.button("Create Table"):
            create_table(new_table_name, new_columns_list)
            st.success(f"Table '{new_table_name}' created successfully.")

    elif crud_option == "Read/Insert into Table":
        # Insert Data Section
        st.subheader("Insert & View Data")

        # User input for table name and data
        insert_table_name = st.text_input("Enter Table Name:")
        insert_data_input = st.text_area("Enter Data (comma-separated):")

        # Convert the input string of data into a list
        insert_data_list = [col.strip() for col in insert_data_input.split(',')]

        if st.button("Insert Data"):
            insert_data(insert_table_name, insert_data_list)
            st.success(f"Data inserted into '{insert_table_name}' successfully.")

    elif crud_option == "Delete Table":
        # Delete Table Section
        st.subheader("Delete Table")

        # User input for table name to delete
        delete_table_name = st.text_input("Enter Table Name:")

        if st.button("Delete Table"):
            delete_table(delete_table_name)
            st.success(f"Table '{delete_table_name}' deleted successfully.")
elif menu_option == "Manage User Privilege":
    st.header("Manage User Privilege")

    # Dropdown to choose the user privilege operation
    privilege_option = st.selectbox("Choose Privilege Operation", ["Create Role", "Grant Privilege", "Revoke Privilege"])

    if privilege_option == "Create Role":
        # Create Role Section
        st.subheader("Create Role")

        role_name = st.text_input("Enter Role Name:")
        if st.button("Create Role"):
            create_role(role_name)
            st.success(f"Role '{role_name}' created successfully.")

    elif privilege_option == "Grant Privilege":
        # Grant Privilege Section
        st.subheader("Grant Privilege")

        user_id_grant = st.text_input("Enter User ID:")
        privilege = st.selectbox("Select Privilege", ["SELECT", "INSERT", "UPDATE", "DELETE"])
        table_name_grant = st.text_input("Enter Table Name:")

        if st.button("Grant Privilege"):
            grant_privilege(user_id_grant, privilege, table_name_grant)
            st.success(f"Privilege '{privilege}' granted to '{user_id_grant}' on '{table_name_grant}'.")

    elif privilege_option == "Revoke Privilege":
        # Revoke Privilege Section
        st.subheader("Revoke Privilege")

        user_id_revoke = st.text_input("Enter User ID:")
        privilege = st.selectbox("Select Privilege", ["SELECT", "INSERT", "UPDATE", "DELETE"])
        table_name_revoke = st.text_input("Enter Table Name:")

        if st.button("Revoke Privilege"):
            revoke_privilege(user_id_revoke, privilege, table_name_revoke)
            st.success(f"Privilege '{privilege}' revoked from '{user_id_revoke}' on '{table_name_revoke}'.")



#####################################to check for all roles available
# SELECT user AS role_name
# FROM mysql.user
# WHERE host = '%'
#   AND NOT LENGTH(authentication_string);