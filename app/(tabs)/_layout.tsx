import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs data-filename="pages/Project" data-linenumber="304" data-visual-selector-id="pages/Project304" screenOptions={{ tabBarActiveTintColor: '#16a34a', headerShown: false }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons data-filename='pages/Project' data-linenumber='304' data-visual-selector-id='pages/Project304' name="home" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="recipes" 
        options={{ 
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => <Ionicons data-filename='pages/Project' data-linenumber='304' data-visual-selector-id='pages/Project304' name="restaurant" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="grocery-list" 
        options={{ 
          title: 'Groceries',
          tabBarIcon: ({ color, size }) => <Ionicons data-filename='pages/Project' data-linenumber='304' data-visual-selector-id='pages/Project304' name="list" size={size} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons data-filename='pages/Project' data-linenumber='304' data-visual-selector-id='pages/Project304' name="person" size={size} color={color} />
        }} 
      />
    </Tabs>
  );
}