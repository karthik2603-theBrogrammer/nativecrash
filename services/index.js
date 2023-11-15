const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
// Add the cors middleware
app.use(cors());
app.use(express.json());

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

  // Create 'nativecrash' database if it doesn't exist
  con.query(`
  CREATE DATABASE IF NOT EXISTS nativecrash
  `);
  // Use 'nativecrash' database
  con.query(`
  USE nativecrash
  `);
   // Create 'device_surface_info' table for surface-level device information
  con.query(
    `
    CREATE TABLE IF NOT EXISTS device_surface_info (
      build_id VARCHAR(255) PRIMARY KEY,
      brand VARCHAR(255) NOT NULL,
      device_name VARCHAR(255) NOT NULL,
      os_name VARCHAR(255) NOT NULL,
      os_version VARCHAR(255) NOT NULL,
      manufacturer VARCHAR(255) NOT NULL,
      model_name VARCHAR(255) NOT NULL,
      cpu_architectures VARCHAR(255) NOT NULL,
      total_memory VARCHAR(255) NOT NULL,
      device_uptime VARCHAR(255) 
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Surface Level Info table created or already exists");
    }
  );

  // Create 'location' table to store crash locations
  con.query(
    `
    CREATE TABLE IF NOT EXISTS location (
      crash_id VARCHAR(255) NOT NULL,
      build_id VARCHAR(255) NOT NULL,
      latitude VARCHAR(20) NOT NULL,
      longitude VARCHAR(20) NOT NULL,
      location VARCHAR(255) NOT NULL,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id),
      PRIMARY KEY (crash_id, build_id)
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Location table created or already exists");
    }
  );

  // Create 'number_of_crashes' table to store crash counts
  // This table is result of a trigger.
  con.query(
    `
    CREATE TABLE IF NOT EXISTS number_of_crashes (
      build_id VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      number_of_crashes INT NOT NULL,
      PRIMARY KEY (build_id, location)
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Number of Crashes table created or already exists");
    }
  );

 // Create 'device_detailed_info' table for detailed device information
  con.query(
    `
    CREATE TABLE IF NOT EXISTS device_detailed_info (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      is_device BOOL NOT NULL,
      internal_build_id VARCHAR(255) NOT NULL,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Detailed Information table created or already exists");
    }
  );

  // Create 'crash_info' table to store crash reports
  con.query(
    `
    CREATE TABLE IF NOT EXISTS crash_info (
      crash_id INT PRIMARY KEY,
      error_title TEXT NOT NULL,
      error_description TEXT NOT NULL,
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Crash Report table created or already exists");
    }
  );

  // Create 'endpoint_data' table to store endpoint data
  con.query(
    `
  CREATE TABLE IF NOT EXISTS endpoint_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_title TEXT NOT NULL,
    error_description TEXT NOT NULL,
    brand VARCHAR(255) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    is_device BOOLEAN NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    build_id VARCHAR(255) NOT NULL,
    internal_build_id VARCHAR(255) NOT NULL,
    cpu_architectures VARCHAR(255) NOT NULL,
    total_memory VARCHAR(255) NOT NULL,
    os_name VARCHAR(255) NOT NULL,
    os_version VARCHAR(255) NOT NULL,
    device_uptime VARCHAR(255) NOT NULL,
    latitude VARCHAR(20) NOT NULL,
    longitude VARCHAR(20) NOT NULL,
    location VARCHAR(255) NOT NULL
  )
`,
    function (err, result) {
      if (err) throw err;
      console.log("endpoint_data table created or already exists");
    }
  );

  // Create procedure to insert or update device_surface_info
  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertDeviceSurfaceInfo(
      IN p_build_id VARCHAR(255),
      IN p_brand VARCHAR(255),
      IN p_device_name VARCHAR(255),
      IN p_os_name VARCHAR(255),
      IN p_os_version VARCHAR(255),
      IN p_manufacturer VARCHAR(255),
      IN p_cpu_architectures VARCHAR(255),
      IN p_model_name VARCHAR(255),      
      IN p_total_memory VARCHAR(255),
      IN p_device_uptime VARCHAR(255)
    )
    BEGIN
      INSERT INTO device_surface_info (
        build_id, brand, device_name, os_name,
        os_version, manufacturer, model_name,
        cpu_architectures, total_memory, device_uptime
        )
        VALUES (
          p_build_id, p_brand, p_device_name, p_os_name,
          p_os_version, p_manufacturer, p_cpu_architectures,
          p_model_name, p_total_memory, p_device_uptime
          )
          ON DUPLICATE KEY UPDATE
          brand = p_brand,
          device_name = p_device_name,
          os_name = p_os_name,
          os_version = p_os_version,
          manufacturer = p_manufacturer,
          model_name = p_model_name,
          cpu_architectures = p_cpu_architectures,
          total_memory = p_total_memory,
          device_uptime = p_device_uptime;
      END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertDeviceSurfaceInfo created successfully");
    }
  );

  // Create procedure to insert crash location information
  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertLocationInfo(
    IN p_crash_id INT,
    IN p_build_id VARCHAR(255),
    IN p_latitude VARCHAR(20),
    IN p_longitude VARCHAR(20),
    IN p_location VARCHAR(255)
  )
  BEGIN
    INSERT INTO location (
      crash_id, build_id, latitude, longitude, location
    )
    VALUES (
      p_crash_id, p_build_id, p_latitude, p_longitude, p_location
    );
    END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertLocationInfo created successfully");
    }
  );

  // Create procedure to insert or update device_detailed_info
  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertDetailedInfo(
    IN p_build_id VARCHAR(255),
    IN p_is_device bool,
    IN p_internal_build_id VARCHAR(255)
    )
    BEGIN
    INSERT INTO device_detailed_info (
      build_id, is_device, internal_build_id
      )
    VALUES (
      p_build_id, p_is_device, p_internal_build_id
      )
      ON DUPLICATE KEY UPDATE
      is_device = p_is_device,
      internal_build_id = p_internal_build_id;
      END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertDetailedInfo created successfully");
    }
  );

  // Create procedure to insert crash report information
  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertCrashReport(
    IN p_crash_id INT,
    IN p_error_title TEXT,
    IN p_error_description TEXT,
    IN p_time TIMESTAMP
    )
    BEGIN
    INSERT INTO crash_info (
      crash_id, error_title, error_description, time
    )
    VALUES (
      p_crash_id, p_error_title, p_error_description, p_time
      );
      END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertCrashReport created successfully");
    }
  );
// Create procedure to update the number_of_crashes table
con.query(
  `CREATE PROCEDURE IF NOT EXISTS UpdateNumberOfCrashes()
  BEGIN
    -- Delete existing data in number_of_crashes table
    DELETE FROM number_of_crashes;
    
    -- Insert new counts into the number_of_crashes table
    INSERT INTO number_of_crashes (build_id, location, number_of_crashes)
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

  END;`,
  (err, results) => {
    if (err) throw err;
    console.log("Procedure UpdateNumberOfCrashes created successfully");
  }
);

  // Create trigger to handle procedure calls after endpoint_data insertion
  const triggerQuery = `
CREATE TRIGGER IF NOT EXISTS InsertYourEndpointData
AFTER INSERT ON endpoint_data
FOR EACH ROW
BEGIN
CALL InsertDeviceSurfaceInfo(
      NEW.build_id, NEW.brand, NEW.device_name, NEW.os_name, NEW.os_version, 
      NEW.manufacturer, NEW.cpu_architectures, NEW.model_name, 
      NEW.total_memory, NEW.device_uptime
      );
      
      CALL InsertLocationInfo(
        NEW.id, NEW.build_id, NEW.latitude, NEW.longitude, NEW.location
        );
          
          CALL InsertDetailedInfo(
      NEW.build_id, NEW.is_device, NEW.internal_build_id
      );
      
      CALL InsertCrashReport(
        NEW.id, NEW.error_title, NEW.error_description, NEW.time
      );
      
      CALL UpdateNumberOfCrashes();

      END;
      `;

  con.query(triggerQuery, (err, results) => {
    if (err) throw err;
    console.log("Trigger InsertYourEndpointData created successfully");
  });
});
// Express route to handle a basic GET request
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public", "index.html");
  res.sendFile(indexPath);
});


// Express route to handle a POST request for logging crashes
app.post("/v2/log-crash", (req, res) => {
  try {
    const {
      time,
      errorTitle,
      errorDescription,
      brand,
      deviceName,
      isDevice,
      manufacturer,
      modelName,
      buildId,
      internalBuildId,
      cpuArchitectures,
      totalMemory,
      osName,
      osVersion,
      deviceUptime,
      coordinates: { latitude, longitude },
      locationData: { city, state, suburb },
    } = req.body;

    console.log("post req recieved 💀", brand);

    con.query(
      `INSERT INTO endpoint_data (
        time, error_title, error_description, brand, device_name, is_device,
        manufacturer, model_name, build_id, internal_build_id, cpu_architectures,
        total_memory, os_name, os_version, device_uptime, latitude, longitude, location
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )`,
      [
        time,
        errorTitle,
        errorDescription,
        brand,
        deviceName,
        isDevice,
        manufacturer,
        modelName,
        buildId,
        internalBuildId,
        cpuArchitectures,
        totalMemory,
        osName,
        osVersion,
        deviceUptime,
        latitude,
        longitude,
        `${suburb}, ${city}, ${state}`,
      ],
      (err, results) => {
        if (err) {
          console.error("Error executing INSERT query:", err);
          res.status(500).send("error inserting");
        } else {
          console.log("Data inserted into endpoint_data table successfully");
          res.status(200).send("inserted");
        }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("didnt work :/");
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

////////////////////sample req body
// {
//   "time": "2023-11-13T12:00:20",
//   "errorTitle": "Sample Error",
//   "errorDescription": "This is a sample error description.",
//   "brand": "SampleBrand",
//   "deviceName": "SampleDevice",
//   "isDevice": true,
//   "manufacturer": "SampleManufacturer",
//   "modelName": "SampleModel",
//   "buildId": "1234567890",
//   "internalBuildId": "987654321",
//   "cpuArchitectures": "x86_64",
//   "totalMemory": "8GB",
//   "osName": "SampleOS",
//   "osVersion": "1.0.0",
//   "deviceUptime": "4564564",
//   "coordinates": {
//     "latitude": "37.7749",
//     "longitude": "-122.4194"
//   },
//   "locationData": {
//     "city": "San Francisco",
//     "state": "California",
//     "suburb": "Sample Suburb"
//   }
// }

////////////////nested queries
// SELECT
//     ds.build_id,
//     ds.device_name,
//     (SELECT COUNT(DISTINCT l.crash_id) FROM location l WHERE l.build_id = ds.build_id) AS total_crashes
// FROM
//     device_surface_info ds;
//////////////////////

/////////////////////////////template for procedure
// const createProcedureQuery = `
// CREATE PROCEDURE IF NOT EXISTS your_procedure_name()
// BEGIN
//   -- Your procedure logic here
// END;
// `;

// con.query(createProcedureQuery, (err, results) => {
//   if (err) throw err;
//   if (results.warningStatus === 0) {
//     console.log("Stored Procedure created successfully");
//   } else {
//     console.log("Stored Procedure already exists");
//   }
// });
/////////////////////////////////

////////////////////////////////////////was working kinda
// const triggerQuery = `
//   CREATE TRIGGER IF NOT EXISTS InsertYourEndpointData
//   AFTER INSERT ON endpoint_data
//   FOR EACH ROW
//   BEGIN
//     CALL InsertDeviceSurfaceInfo(
//       NEW.build_id, NEW.brand, NEW.device_name, NEW.os_name, NEW.os_version,
//       NEW.manufacturer, NEW.model_name, NEW.cpu_architectures,
//       NEW.total_memory, New,device_uptime
//     );

//     CALL InsertLocationInfo(
//       NEW.id, NEW.build_id, NEW.latitude, NEW.longitude, NEW.location
//     );

//     CALL InsertNumberOfCrashesInfo(
//       NEW.build_id, 1
//     );

//     CALL InsertDetailedInfo(
//       NEW.build_id, NEW.is_device, NEW.internal_build_id
//     );

//     CALL InsertCrashReport(
//       NEW.build_id, NEW.id, NEW.error_title, NEW.error_description, NEW.time
//     );
//   END;
// `;

// con.query(triggerQuery, (err, results) => {
//   if (err) throw err;
//   console.log("Trigger InsertYourEndpointData created successfully");
// });


  //////////////////////////////////// Procedure to Insert into number_of_crashes
  // con.query(
  //   `CREATE PROCEDURE IF NOT EXISTS InsertNumberOfCrashesInfo(
  //   IN p_build_id VARCHAR(255),
  //   IN p_number_of_crashes INT
  //   )
  //   BEGIN
  //   INSERT INTO number_of_crashes (
  //     build_id, number_of_crashes
  //     )
  //     VALUES (
  //       p_build_id, p_number_of_crashes
  //       )
  //       ON DUPLICATE KEY UPDATE
  //       number_of_crashes = number_of_crashes + p_number_of_crashes;
  //       END;`,
  //   (err, results) => {
  //     if (err) throw err;
  //     console.log("Procedure InsertNumberOfCrashesInfo created successfully");
  //   }
  // );

  
////////////////// Procedure to update the number_of_crashes table
// con.query(
//   `CREATE PROCEDURE IF NOT EXISTS UpdateNumberOfCrashes()
//   BEGIN
//     INSERT INTO number_of_crashes (build_id, location, number_of_crashes)
//     SELECT
//       ds.build_id,
//       loc.location,
//       COUNT(ci.crash_id) as crash_count
//     FROM device_surface_info ds
//     LEFT JOIN crash_info ci ON ds.build_id = ci.build_id
//     LEFT JOIN location loc ON ds.build_id = loc.build_id
//     GROUP BY ds.build_id, loc.location
//     ON DUPLICATE KEY UPDATE
//       number_of_crashes = number_of_crashes + 1;
//   END;`,
//   (err, results) => {
//     if (err) throw err;
//     console.log("Procedure UpdateNumberOfCrashes created successfully");
//   }
// );