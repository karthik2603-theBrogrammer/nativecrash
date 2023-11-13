// React Hooks and Expo Router
import { Stack } from "expo-router/stack";
import React, { useEffect } from "react";
import ErrorBoundaryWithGlobalProvider from "./ErrorBoundary";

// Providers
import { LocationProvider, useLocation } from "./global";

// User Defined Components

export default function Layout() {
  return (
    <LocationProvider>
      <ErrorBoundaryWithGlobalProvider>
        <Stack
          initialRouteName="index"
          screenOptions={{
            statusBarColor: "black",
            headerShown: false,
          }}
        >
          {/* This is Stack of All Screens, the default Landing screen --> INDEX */}
          <Stack.Screen name="index" />
          <Stack.Screen name="crashScreen1" />
          <Stack.Screen name="crashScreen2" />
        </Stack>
      </ErrorBoundaryWithGlobalProvider>
    </LocationProvider>
  );
}
