const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  }
});
dotenv.config();
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


io.on("connection", function (socket) {
  socket.emit("announcements", { message: "A new user has joined!",  });
  const query = 'SELECT * FROM your_table_name ORDER BY id DESC LIMIT 1';
  // const watcher = con.query(query)
  //   .stream()
  //   .on('data', (row) => {
  //     socket.emit('newData', row);
  //   })
  //   .on('end', () => {
  //     console.log('Database watcher ended');
  //   });
  //   socket.on('data', (mes) => {
  //     console.log(mes)
  //     socket.emit("announcements", { message: "A new mom has joined!" })
  //   })

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A client disconnected');
    watcher.destroy(); // Stop watching when the client disconnects
  });
});



con.connect(function (err) {
  if (err) throw err;
  console.log("Connected To Database!");

  // Surface Level Info Table
  con.query(`
  CREATE DATABASE IF NOT EXISTS nativecrash
  `);
  con.query(`
  USE nativecrash
  `);
  con.query(
    `
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
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Surface Level Info table created or already exists");
    }
  );
  // supported_cpu_architectures VARCHAR(255) NOT NULL,

  // Location Table
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

  // Number of Crashes Table
  // This table is result of a trigger.
  con.query(
    `
    CREATE TABLE IF NOT EXISTS number_of_crashes (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      number_of_crashes INT NOT NULL,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Number of Crashes table created or already exists");
    }
  );

  // Detailed Information Table
  con.query(
    `
    CREATE TABLE IF NOT EXISTS device_detailed_information (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      real_or_fake ENUM('real', 'fake') NOT NULL,
      internal_build_id VARCHAR(255) NOT NULL,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Detailed Information table created or already exists");
    }
  );

  // Crash Report Table
  con.query(
    `
    CREATE TABLE IF NOT EXISTS crash_info (
      build_id VARCHAR(255) PRIMARY KEY NOT NULL,
      crash_id INT NOT NULL,
      error_title TEXT NOT NULL,
      error_description TEXT NOT NULL,
      time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (build_id) REFERENCES device_surface_info(build_id)
    )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("Crash Report table created or already exists");
    }
  );

  con.query(
    `
  CREATE TABLE IF NOT EXISTS your_endpoint_data (
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
    bruh VARCHAR(255) NOT NULL,
    latitude VARCHAR(20) NOT NULL,
    longitude VARCHAR(20) NOT NULL,
    location_city VARCHAR(255) NOT NULL,
    location_state VARCHAR(255) NOT NULL,
    location_suburb VARCHAR(255) NOT NULL
  )
  `,
    function (err, result) {
      if (err) throw err;
      console.log("your_endpoint_data table created or already exists");
    }
  );

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

  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertDeviceSurfaceInfo(
      IN p_build_id VARCHAR(255),
      IN p_brand VARCHAR(255),
      IN p_device_name VARCHAR(255),
      IN p_device_version VARCHAR(255),
      IN p_manufacturer VARCHAR(255),
      IN p_model_name VARCHAR(255),
      IN p_cpu_architectures VARCHAR(255),
      IN p_time TIMESTAMP,
      IN p_uptime TIMESTAMP
    )
    BEGIN
      INSERT INTO device_surface_info (
        build_id, brand, device_name, device_version,
        manufacturer, model_name, cpu_architectures, uptime
      )
      VALUES (
        p_build_id, p_brand, p_device_name, p_device_version,
        p_manufacturer, p_model_name, p_cpu_architectures, p_uptime
      )
      ON DUPLICATE KEY UPDATE
        brand = p_brand,
        device_name = p_device_name,
        device_version = p_device_version,
        manufacturer = p_manufacturer,
        model_name = p_model_name,
        cpu_architectures = p_cpu_architectures,
        uptime = p_uptime;
    END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertDeviceSurfaceInfo created successfully");
    }
  );

  ////////////////////////////////////////

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

  // Procedure to Insert into number_of_crashes
  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertNumberOfCrashesInfo(
    IN p_build_id VARCHAR(255),
    IN p_number_of_crashes INT
  )
  BEGIN
    INSERT INTO number_of_crashes (
      build_id, number_of_crashes
    )
    VALUES (
      p_build_id, p_number_of_crashes
    )
    ON DUPLICATE KEY UPDATE
      number_of_crashes = number_of_crashes + p_number_of_crashes;
  END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertNumberOfCrashesInfo created successfully");
    }
  );

  // Procedure to Insert into device_detailed_information
  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertDetailedInformation(
    IN p_build_id VARCHAR(255),
    IN p_real_or_fake ENUM('real', 'fake'),
    IN p_internal_build_id VARCHAR(255)
  )
  BEGIN
    INSERT INTO device_detailed_information (
      build_id, real_or_fake, internal_build_id
    )
    VALUES (
      p_build_id, p_real_or_fake, p_internal_build_id
    )
    ON DUPLICATE KEY UPDATE
      real_or_fake = p_real_or_fake,
      internal_build_id = p_internal_build_id;
  END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertDetailedInformation created successfully");
    }
  );

  // Procedure to Insert into crash_info
  con.query(
    `CREATE PROCEDURE IF NOT EXISTS InsertCrashReport(
    IN p_build_id VARCHAR(255),
    IN p_crash_id INT,
    IN p_error_title TEXT,
    IN p_error_description TEXT
  )
  BEGIN
    INSERT INTO crash_info (
      build_id, crash_id, error_title, error_description
    )
    VALUES (
      p_build_id, p_crash_id, p_error_title, p_error_description
    );
  END;`,
    (err, results) => {
      if (err) throw err;
      console.log("Procedure InsertCrashReport created successfully");
    }
  );
  //   con.query(`
  // DELIMITER //
  // CREATE TRIGGER InsertYourEndpointData
  // AFTER INSERT ON your_endpoint_data
  // FOR EACH ROW
  // BEGIN
  //   CALL InsertDeviceSurfaceInfo(
  //     NEW.build_id, NEW.brand, NEW.device_name, NEW.bruh,
  //     NEW.manufacturer, NEW.model_name, NEW.build_id, NEW.internal_build_id,
  //     NEW.cpu_architectures, NEW.total_memory, NEW.time, NEW.time
  //   );

  //   CALL InsertLocationInfo(
  //     NEW.id, NEW.build_id, NEW.latitude, NEW.longitude,
  //     CONCAT(NEW.location_city, ', ', NEW.location_state, ', ', NEW.location_suburb)
  //   );

  //   CALL InsertNumberOfCrashesInfo(
  //     NEW.build_id, 1 -- Assuming 1 as the default number_of_crashes for each entry
  //   );

  //   CALL InsertDetailedInformation(
  //     NEW.build_id, 'real', NEW.internal_build_id
  //   );

  //   CALL InsertCrashReport(
  //     NEW.build_id, NEW.id, NEW.error_title, NEW.error_description
  //   );
  // END //
  // DELIMITER ;
  //   `, function (err, result) {
  //     if (err) throw err;
  //     console.log("InsertYourEndpointData table created or already exists");
  //   });

  const triggerQuery = `
    CREATE TRIGGER IF NOT EXISTS InsertYourEndpointData
    AFTER INSERT ON your_endpoint_data
    FOR EACH ROW
    BEGIN
      CALL InsertDeviceSurfaceInfo(
        NEW.build_id, NEW.brand, NEW.device_name, NEW.bruh,
        NEW.manufacturer, NEW.model_name, NEW.cpu_architectures, NEW.time, NEW.time
      );

      CALL InsertLocationInfo(
        NEW.id, NEW.build_id, NEW.latitude, NEW.longitude,
        CONCAT(NEW.location_city, ', ', NEW.location_state, ', ', NEW.location_suburb)
      );

      CALL InsertNumberOfCrashesInfo(
        NEW.build_id, 1 -- Assuming 1 as the default number_of_crashes for each entry
      );

      CALL InsertDetailedInformation(
        NEW.build_id, 'real', NEW.internal_build_id
      );

      CALL InsertCrashReport(
        NEW.build_id, NEW.id, NEW.error_title, NEW.error_description
      );
    END;
  `;

  con.query(triggerQuery, (err, results) => {
    if (err) throw err;
    console.log("Trigger InsertYourEndpointData created successfully");
  });
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

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
      deviceVersion,
      locationData: { city, state, suburb },
      coordinates: { latitude, longitude },
    } = req.body;

    console.log("post req recieved 💀", brand);

    con.query(
      `INSERT INTO your_endpoint_data (
        time, error_title, error_description, brand, device_name, is_device,
        manufacturer, model_name, build_id, internal_build_id, cpu_architectures,
        total_memory, bruh, latitude, longitude, location_city,
        location_state, location_suburb
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
        deviceVersion,
        latitude,
        longitude,
        city,
        state,
        suburb,
      ],
      (err, results) => {
        if (err) {
          console.error("Error executing INSERT query:", err);
          res.status(500).send({});
        } else {
          console.log(
            "Data inserted into your_endpoint_data table successfully"
          );
          res.status(200).send("inserted");
        }
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("didnt work :/");
  }
});

// app.get("/v2/stream-data", async (req, res) => {
//   try {
//     io.on("connection", function (socket) {
//       socket.emit("announcements", { message: "A new user has joined!" });
//     });
//     res.status(200).send("inserted");
//   } catch (error) {
//     res.status(500).send(JSON(error));
//   }
// });

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// {
//   "time": "2023-11-15T12:30:00",
//   "errorTitle": "Sample Error",
//   "errorDescription": "This is a sample error description.",
//   "brand": "SampleBrand",
//   "deviceName": "SampleDevice",
//   "isDevice": true,
//   "manufacturer": "SampleManufacturer",
//   "modelName": "SampleModel",
//   "buildId": "SampleBuildID",
//   "internalBuildId": "SampleInternalBuildID",
//   "cpuArchitectures": "x86_64",
//   "totalMemory": "8GB",
//   "deviceVersion": "1.0",
//   "locationData":{
//   "city": "SampleCity",
//   "state": "SampleState",
//   "suburb": "SampleSuburb"
//   },
//   "coordinates":{
//   "latitude": "40.7128",
//   "longitude": "-74.0060"
//   }
// }
