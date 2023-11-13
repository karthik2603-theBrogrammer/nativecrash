const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require('dotenv')
dotenv.config()
const app = express();
// Add the cors middleware
app.use(cors());

// Create connection to MySQL database
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.PASSWORD,
  // database: "nativecrash" // Replace 'your_database_name' with your actual database name
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");

  // Surface Level Info Table
  con.query(`
  CREATE DATABASE IF NOT EXISTS nativecrash
  `)
  con.query(`
  USE nativecrash
  `)
  con.query(`
    CREATE TABLE IF NOT EXISTS device_surface_info (
      build_id VARCHAR(255) PRIMARY KEY,
      brand VARCHAR(255) NOT NULL,
      device_name VARCHAR(255) NOT NULL,
      device_type VARCHAR(255) NOT NULL,
      os_name VARCHAR(255) NOT NULL,
      os_version VARCHAR(255) NOT NULL,
      total_memory VARCHAR(255) NOT NULL,
      uptime VARCHAR(255) NOT NULL
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Surface Level Info table created or already exists");
  });
// supported_cpu_architectures VARCHAR(255) NOT NULL,


  // Location Table
  con.query(`
    CREATE TABLE IF NOT EXISTS location (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      crash_id VARCHAR(255) NOT NULL,
      latittude VARCHAR(20) NOT NULL,
      longitude VARCHAR(20) NOT NULL,
      location VARCHAR(255) NOT NULL,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Location table created or already exists");
  });

  // Number of Crashes Table
  // This table is result of a trigger.
  con.query(`
    CREATE TABLE IF NOT EXISTS number_of_crashes (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      number_of_crashes INT NOT NULL,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Number of Crashes table created or already exists");
  });

  // Detailed Information Table
  con.query(`
    CREATE TABLE IF NOT EXISTS device_detailed_information (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      real_or_fake ENUM('real', 'fake') NOT NULL,
      internal_build_id VARCHAR(255) NOT NULL,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Detailed Information table created or already exists");
  });

  // Crash Report Table
  con.query(`
    CREATE TABLE IF NOT EXISTS crash_info (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      crash_id INT NOT NULL,
      error_title VARCHAR(255) NOT NULL,
      error_description TEXT NOT NULL,
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Crash Report table created or already exists");
  });
});


app.post('/', async (req, res) => {
  try {
    
  } catch (error) {
    res.status(500).send({})
  }
})


app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
