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
  database: "nativecrash" // Replace 'your_database_name' with your actual database name
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
    CREATE TABLE IF NOT EXISTS surface_level_info (
      build_id VARCHAR(255) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      device_name VARCHAR(255) NOT NULL,
      device_type VARCHAR(255) NOT NULL,
      os_name VARCHAR(255) NOT NULL,
      os_version VARCHAR(255) NOT NULL,
      supported_cpu_architectures VARCHAR(255) NOT NULL,
      total_memory INT NOT NULL,
      uptime BIGINT NOT NULL
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Surface Level Info table created or already exists");
  });

  // Location Table
  con.query(`
    CREATE TABLE IF NOT EXISTS location (
      crash_id INT NOT NULL,
      build_id VARCHAR(255) NOT NULL,
      coordinates VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Location table created or already exists");
  });

  // Number of Crashes Table
  // This table is result of a trigger.
  con.query(`
    CREATE TABLE IF NOT EXISTS number_of_crashes (
      device_unique_id VARCHAR(255) NOT NULL,
      num_of_crashes INT NOT NULL
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Number of Crashes table created or already exists");
  });

  // Detailed Information Table
  con.query(`
    CREATE TABLE IF NOT EXISTS device_detailed_information (
      build_id VARCHAR(255) NOT NULL,
      real_or_fake ENUM('real', 'fake') NOT NULL,
      internal_build_id VARCHAR(255) NOT NULL
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Detailed Information table created or already exists");
  });

  // Crash Report Table
  con.query(`
    CREATE TABLE IF NOT EXISTS crash_info (
      crash_id INT NOT NULL,
      build_id VARCHAR(255) NOT NULL,
      error_title VARCHAR(255) NOT NULL,
      error_description TEXT NOT NULL,
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, function (err, result) {
    if (err) throw err;
    console.log("Crash Report table created or already exists");
  });

});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
