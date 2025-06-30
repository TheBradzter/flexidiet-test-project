import React from 'react';
import { Stack } from 'expo-router';
import '../global.css';

export default function RootLayout() {
  return (
    <Stack data-filename="pages/Project" data-linenumber="301" data-visual-selector-id="pages/Project301">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}