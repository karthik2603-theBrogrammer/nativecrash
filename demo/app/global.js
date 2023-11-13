import React, { createContext, useContext, useState, useEffect } from "react";
import * as Location from "expo-location";

const LocationContext = createContext();

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [readableText, setReadableText] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  // const customLocation = { lat : 12.935601349002972, long : 77.53489128067099}

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);
      } catch (error) {
        setErrorMsg("Error fetching location: " + error.message);
      }
    })();
  }, []);

  useEffect(() => {
    console.log(readableText);
  }, [readableText]);

  useEffect(()=>{
    if(location!=null) getReverseGeoCode();
  },[location])

  const getReverseGeoCode = async () => {
    if (location) {
      try {
        // const response = await fetch(`https://geocode.maps.co/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
        const response = await fetch(
          `https://geocode.maps.co/reverse?lat=${customLocation.lat}&lon=${customLocation.long}`
        );
        if (response.ok) {
          const data = await response.json();
          const formattedAddress = data.address; // Replace with the actual property containing the address
          const locationObj = {
            suburb: formattedAddress.suburb,
            city: formattedAddress.city,
            state: formattedAddress.state,
          };
          setReadableText(locationObj);
          setSelectedOption(locationObj);
        } else {
          setErrorMsg("Error getting reverse geocode");
        }
      } catch (error) {
        setErrorMsg("Error getting reverse geocode: " + error.message);
      }
    } else {
      setErrorMsg("Location data is not available");
    }
  };

  const handleSelectedOptionChange = (obj) => {
    setSelectedOption(obj);
  };
  const value = {
    location,
    errorMsg,
    getReverseGeoCode,
    readableText,
    selectedOption,
    handleSelectedOptionChange,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
