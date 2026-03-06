import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GistProvider } from '../hooks/GistContext';
import { NowProvider } from '../hooks/NowContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <GistProvider>
        <NowProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors[colorScheme].cardBackground,
              },
              headerTintColor: Colors[colorScheme].tint,
              headerTitleStyle: {
                color: Colors[colorScheme].text,
              },
              contentStyle: {
                backgroundColor: Colors[colorScheme].background,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="edit" 
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Edit Now Page',
                headerShadowVisible: false,
              }} 
            />
            <Stack.Screen 
              name="new-field" 
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Add New Field',
                headerShadowVisible: false,
              }} 
            />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </NowProvider>
      </GistProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
