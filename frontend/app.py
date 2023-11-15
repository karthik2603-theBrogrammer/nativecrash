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
def fetch_table_data(table_name):
    query = f"SELECT * FROM {table_name}"
    data = pd.read_sql(query, conn)
    return data

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

st.title("DBMS proj")
st.markdown(f"##### Made with ❤ by SRN: {SRN1}, {SRN2}")

st.sidebar.header("Navigation")
menu_option = st.sidebar.selectbox("Select an operation", ["Show Tables", "Show Join Tables", "Show Nested Query", "Update Table"])


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
        join_table_data = fetch_table_data("number_of_crashes")
        st.subheader(f"Data for Join Table")
        st.dataframe(join_table_data)


elif menu_option == "Show Nested Query":
    st.header("Show Nested Query")

    if st.button("Execute Nested Query"):
        nested_query_data = execute_nested_query()
        st.subheader("Results of Nested Query")
        st.dataframe(nested_query_data)

elif menu_option == "Update Table":
    st.header("Update Table")

    build_id = st.text_input("Enter Build ID:")
    location = st.text_input("Enter Location:")
    number_of_crashes = st.number_input("Enter Number of Crashes:")

    if st.button("Update Number of Crashes"):
        update_number_of_crashes(build_id, location, number_of_crashes)
        st.success("Number of Crashes updated successfully.")