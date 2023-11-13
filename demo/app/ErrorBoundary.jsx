import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";

import { handleErrorLogging, handleRestartApp } from "./dataService";

import { useLocation } from "./global";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: "",
      errorInfo: "",
      myErrorsFromDB: [],
      theme: props.theme,
    };
  }
  static getDerivedStateFromError(error) {
    // console.log("ErrorStack ---: ", error.stack);
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  // setState((prev) => {})
  componentDidCatch(error, info) {
    console.table({
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    // Alert.alert(
    //   "Error!",
    //   "An error has been picked up. It has been logged safely and can hence be used to send to the concerned authorities!.",
    //   [{ text: "OK" }],
    //   { cancelable: false }
    // );
    // console.log("Error Info: " + JSON.stringify(info));

    handleErrorLogging(error, info, this.props.location);

    this.setState({
      error: error,
      errorInfo: info,
    });
  }
  render() {
    if (this.state.hasError) {
      return (
        <View
          className={`flex flex-col space-y-4 items-center justify-center p-5 my-9 mx-auto rounded-xl ${
            this.state.theme === "DARK_MODE" ? "bg-black" : "bg-gray-100"
          }`}
        >
          <Text
            className={`flex flex-col space-y-4 items-center justify-center  text-3xl text-center font-bold ${
              this.state.theme !== "DARK_MODE" ? "text-black" : "text-gray-100"
            }`}
          >
            Oops!!! Something went wrong..
          </Text>
          <Text
            className={`flex flex-col text-center space-y-2 items-center justify-center p-9 text-2xl font-bold ${
              this.state.theme !== "DARK_MODE" ? "text-black" : "text-gray-100"
            }`}
          >
            {this.state.error.toString()}
          </Text>
          <Text
            className={`flex flex-col text-center space-y-4 items-center justify-center  text-[15px] font-bold ${
              this.state.theme !== "DARK_MODE" ? "text-black" : "text-gray-100"
            }`}
          >
            Error Info: {JSON.stringify(this.state.errorInfo).slice(0, 100)}{" "}
            ....
          </Text>
          <TouchableOpacity
            className={`flex flex-col space-x-4 items-center justify-center p-2 text-2xl rounded-lg mb-3 font-bold ${
              this.state.theme === "DARK_MODE" ? " bg-white" : " bg-black"
            }`}
            onPress={() => {
              Alert.alert(
                "More About The Error!",
                `${JSON.stringify(this.state.errorInfo)}`,
                [{ text: "OK" }],
                { cancelable: false }
              );
            }}
          >
            <Text
              className={` text-2xl font-bold ${
                this.state.theme === "DARK_MODE" ? " text-black" : "text-white "
              }`}
            >
              Know More
            </Text>
          </TouchableOpacity>
          <Text
            className={`flex flex-col space-y-4 items-center justify-center  text-2xl text-center font-bold ${
              this.state.theme !== "DARK_MODE" ? "text-black" : "text-gray-100"
            }`}
          >
            The error has been logged. Send us the Crash report in the main menu
            ...
          </Text>
          <TouchableOpacity
            className={`flex flex-col space-x-4 items-center justify-center p-2 text-2xl rounded-lg mb-3 font-bold ${
              this.state.theme === "DARK_MODE" ? " bg-white" : " bg-black"
            }`}
            onPress={() => {
              handleRestartApp();
            }}
          >
            <Text
              className={` text-1xl font-bold ${
                this.state.theme === "DARK_MODE" ? " text-black" : "text-white "
              }`}
            >
              Restart
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// export default ErrorBoundary;

const ErrorBoundaryWithGlobalProvider = (props) => {
  const { location,  } = useLocation();

  return (
      <ErrorBoundary {...props} location={location} />
  );
};

export default ErrorBoundaryWithGlobalProvider;