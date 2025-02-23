import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="edit" 
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Edit Now Page',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerShadowVisible: false,
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
