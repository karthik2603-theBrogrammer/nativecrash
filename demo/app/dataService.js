import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates"; //this can also b used to roll out updates to app and make it auto update read docs
import * as Device from 'expo-device';

import axios from "axios";

//to store data, val shd b json => stringify b4 store
export const storeData = (key, val) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.setItem(key, JSON.stringify(val))
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

//to fetch val which has a key; parse the result to get json
export const getData = (key) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(key)
      .then((data) => resolve(JSON.parse(data)))
      .catch((error) => reject(error));
  });
};

//to fetch all values with specified keys (in an array)
export const getMultipleData = (keys) => {
  return new Promise((resolve, reject) => {
    AsyncStorage.multiGet(keys)
      .then((data) => {
        const jsonData = {};
        data.forEach(([key, value]) => {
          jsonData[key] = JSON.parse(value);
        });
        resolve(jsonData);
      })
      .catch((error) => reject(error));
  });
};

//to get all the key-value from the async store
export const getAllData = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await getMultipleData(keys);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};

//to clear all data that has been sent to asyc store
export const clearAllData = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.clear()
      .then(() => resolve())
      .catch((error) => reject(error));
  });
};

/////////////////////////////////////
const getReverseGeoCode = async (location) => {
  if (location) {
    try {
      const response = await fetch(`https://geocode.maps.co/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
      // const response = await fetch(
      //   `https://geocode.maps.co/reverse?lat=${customLocation.lat}&lon=${customLocation.long}`
      // );
      if (response.ok) {
        const data = await response.json();
        const formattedAddress = data.address; // Replace with the actual property containing the address
        const locationObj = {
          suburb: formattedAddress.suburb,
          city: formattedAddress.city,
          state: formattedAddress.state,
        };
        // console.log(locationObj);
        return locationObj
      } else {
        console.log("Error getting reverse geocode");
      }
    } catch (error) {
      console.log("Error getting reverse geocode: " + error.message);
    }
  } else {
    console.log("Location data is not available");
  }
};

export const handleErrorLogging = async (error, info, location) => {
  console.log("in handleErrorLogging",error.toString(), info, location);
  const locationObj = await getReverseGeoCode(location);
  console.log(locationObj);
  const newErrorEntityToDB = {
    time: Date.now(),
    errorTitle: error.toString(),
    errorDescription: JSON.stringify(info),
    // brand: Device.brand,
    // deviceName: Device.deviceName,
    // isDevice: Device.isDevice,
    // manufacturer: Device.manufacturer,
    // modelName: Device.modelName,
    // buildId: Device.osBuildId,
    // internalBuildId: Device.osInternalBuildId,
    // cpuArchitectures: Device.supportedCpuArchitectures,
    // totalMemory: Device.totalMemory,
  };
  axios
    .post("https://yucca-interface.vercel.app/logerror", {
      errorTitle: newErrorEntityToDB.errorTitle,
      errorDescription: newErrorEntityToDB.errorDescription,
      time: newErrorEntityToDB.time,
    })
    .then(() => {
      console.log("Post req complete...");
    })
    .catch((error) => {
      console.error("Error making post req --> ", error);
    });
  storeData(newErrorEntityToDB.time.toString(), newErrorEntityToDB)
    .then(() => console.log("error logged ..."))
    .catch((error) => console.error("Error logging --> ", error));
};

export const handleRestartApp = async () => {
  try {
    await Updates.reloadAsync();
  } catch (error) {
    console.error("Error while restarting the app:", error);
  }
};

export const handleSendCrashMail = async (items) => {
  console.log("inside handleSendMail -->", items);
  axios
    .post("https://yucca-interface.vercel.app/sendcrashreport", {
      arrayOfErrors: items,
    })
    .then(() => {
      console.log("Post req complete (mail)...");
    })
    .catch((error) => {
      console.error("Error making Post req (mail)--> ", error);
    });
};
