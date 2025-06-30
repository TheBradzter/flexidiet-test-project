import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs data-filename="pages/Project" data-linenumber="329" data-visual-selector-id="pages/Project329" screenOptions={{ tabBarActiveTintColor: '#16a34a', headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="recipes" options={{ title: 'Recipes' }} />
      <Tabs.Screen name="grocery-list" options={{ title: 'Groceries' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}