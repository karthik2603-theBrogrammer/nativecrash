import React from "react";
import { View, StyleSheet } from "react-native";
import MapScreen from "./MapScreen";
import ErrorBoundary from "./ErrorBoundary";

const AppContent = () => {
  return (
    <View style={styles.container}>
      <MapScreen />
    </View>
  );
};
const App = () => {
  // <ErrorBoundary>
    <AppContent />
  {/* </ErrorBoundary>; */}
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
export default App;
