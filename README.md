# nativecrash ✨
Hey there ! Welcome to Nativecrash, an end to end crash management system for your application. 

For all the application developers out there, ever gotten tired by setting up a crash management system such as `Firebase Crashlytics` or `sentry` (Paid) or any such other ? If you have have you will know the time or money they take. If you dont, we have you covered as well.

This project governs the `DBMS Course (UE21CS351A)` in Semester V project, however we do not wish to stop there, visit [Nativecrash](https://github.com/Larry8668/nativeCrash-worksBTW) for setting up your react native application for `development (currently)` purposes.

## Contributors 🕺

<table>
  <tr>
    <td>Index</td>
    <td>SRN</td>
    <td>Full Name</td>
  </tr>
  <tr>
    <td>1</td>
    <td>PES1UG21CS269</td>
    <td>Karthik Namboori</td>
  </tr>
  <tr>
    <td>2</td>
    <td>PES1UG21CS300</td>
    <td>Leharaditya Kumar</td>
  </tr>
</table>

## Requirements

1. `MySQL` (The server must be runnning) 🔐
2. `node`
3. `python` and `pip`

# How to run the application ?

### Installation
```
cd frontend
pip3 install -r requirements.txt
```

```
cd services
npm install
```

### Setup Environment Variables 🔑
1. Navigate to services and make a `.env` file. Set your MySQL password here.
```
touch .env
```
```
PASSWORD = " "
```
2. Navigate to frontend and in `app.py` set your MySQL password in the SQL connector.
For Example:
```
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password=<SET_PASSWORD_HERE>,
    database="nativecrash" #Use this only if the database 'nativecrash' is already present, else, run the index.js file first, then come to the streamlit file.
)
```

### Running 🏃‍♂️
1. 
```
cd services
```
2. 
```
node index.js
```
or alternatively, for better development experience
```
npm run start
```
3. 
```
cd frontend
streamlit run app.py
```
