import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import ErrorBoundary from "./ErrorBoundary";
import {
  buttonStyles,
  headingStyles,
  contactDevButtonStyle,
} from "./styles/inedx";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";

import { getAllData, clearAllData, handleSendCrashMail } from "./dataService";

function PageContent() {
  const theme = useColorScheme();
  const router = useRouter();
  // console.log(theme);
  const [state, setState] = useState(0);
  const [asyncStoreData, setAsyncStoreData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  const handleGetAllData = () => {
    // console.log("Entered handleGetAllData");
    getAllData()
      .then((data) => {
        // console.log("returned...");
        setAsyncStoreData(data);
      })
      .catch((error) => {
        console.error("Error fetching all data --> ", error);
      });
  };
  const handleClearAsyncStorage = () => {
    clearAllData()
      .then(() => console.log("Async Storage emptied..."))
      .catch((error) => console.error("Error clearing storage --> ", error));

    setAsyncStoreData({});
  };
  const handleContactDev = () => {
    console.log("CRASH LOGS --> ", asyncStoreData);
    setModalVisible(true);
    //key is the "time" of each error object in str

    Object.keys(asyncStoreData).length > 0
      ? handleSendCrashMail(Object.values(asyncStoreData))
          .then(() => console.log("Email Sent"))
          .catch((error) => console.error("Error sending mail --> ", error))
      : console.log("Nothing to mail");
  };

  const counterAdd = () => {
    setState((prevState) => prevState + 1);
  };

  const counterRemove = () => {
    setState((prevState) => prevState - 1);
  };
  if (state < 0) {
    // throw new Error("Value should be Postitive");
    // console.log(var)
    // const obj = null;
    // const value = obj.someProperty;
    function recursiveFunction() {
      recursiveFunction(); // RangeError: Maximum call stack size exceeded
    }
    recursiveFunction();
  }
  useEffect(() => {
    handleGetAllData();
    // console.log("here -->",asyncStoreData);
    // handleClearAsyncStorage(); //use this to reset the storage
  }, []);
  return (
    <>
      <View className="flex flex-col items-center justify-around bg-black h-[100%]">
        <View className="flex flex-col items-center justify-center h-auto">
          <View className="flex flex-col items-center justify-center space-y-4">
            <Text className={`${headingStyles}`}>R_crashlytics</Text>
            <Text className={`${headingStyles}`}>This one Works</Text>
          </View>
          <View className="flex flex-row m-3 space-x-4 ">
            <TouchableOpacity
              className={`${buttonStyles}`}
              onPress={() => {
                router.push("/crashScreen1");
              }}
            >
              <Text>Crash 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`${buttonStyles}`}
              onPress={() => {
                router.push("/crashScreen2");
              }}
            >
              <Text>Crash 2</Text>
            </TouchableOpacity>
          </View>
          <Pressable
            onPress={() => {
              counterAdd();
            }}
            android_ripple={{ color: "silver" }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 6,
              backgroundColor: "silver",
            }}
          >
            <Text> + </Text>
          </Pressable>
          <Text style={{ paddingHorizontal: 6 }}> {state} </Text>
          <Pressable
            onPress={() => {
              counterRemove();
            }}
            android_ripple={{ color: "silver" }}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 6,
              backgroundColor: "silver",
            }}
          >
            <Text> - </Text>
          </Pressable>
        </View>
        <TouchableOpacity
          className={`${contactDevButtonStyle}`}
          onPress={() => handleContactDev()}
          // disabled={!(asyncStoreData === null)} //NOT WORKING IDK
        >
          <Text>Send Crash Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleClearAsyncStorage()}
          className={`${contactDevButtonStyle}`}
        >
          <Text>Empty AsyncStore</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Modal
          isVisible={modalVisible}
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          onBackdropPress={() => {
            setModalVisible(false);
          }}
        >
          <ScrollView className="w-fit md:w-[50%]">
            {Object.keys(asyncStoreData).length > 0 ? (
              Object.keys(asyncStoreData).map((key, index) => (
                <View key={index}>
                  <Text style={{ color: "white" }}>Index: {index + 1}</Text>
                  <Text style={{ color: "white" }}>
                    Error Title: {asyncStoreData[key].errorTitle}
                  </Text>
                  <Text style={{ color: "white" }}>
                    Error Description:{" "}
                    {JSON.parse(
                      asyncStoreData[key].errorDescription
                    ).componentStack.slice(0, 300)}
                    {" .......... "}
                  </Text>
                  <Text style={{ color: "white" }}>
                    Time:{" "}
                    {new Date(asyncStoreData[key].time).toLocaleDateString()}
                  </Text>
                  <Text className="w-full border-b-2 border-dotted border-white my-2"></Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "white" }} className="text-center">
                No data to display.
              </Text>
            )}
          </ScrollView>
        </Modal>
      </View>
    </>
  );
}

export default function Page() {
  return <PageContent />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
