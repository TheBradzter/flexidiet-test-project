import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View data-filename="pages/Project" data-linenumber="303" data-visual-selector-id="pages/Project303" className="flex-1 items-center justify-center bg-green-600 p-8">
      <Text data-filename='pages/Project' data-linenumber='303' data-visual-selector-id='pages/Project303' className="text-5xl font-bold text-white mb-4">FlexiDiet</Text>
      <Text data-filename='pages/Project' data-linenumber='303' data-visual-selector-id='pages/Project303' className="text-lg text-white text-center mb-12">Your personal companion for a flexible and healthy diet.</Text>
      <Link data-filename='pages/Project' data-linenumber='303' data-visual-selector-id='pages/Project303' href="/(tabs)/" asChild>
        <Pressable data-filename='pages/Project' data-linenumber='303' data-visual-selector-id='pages/Project303' className="bg-white rounded-full px-12 py-4">
          <Text data-filename='pages/Project' data-linenumber='303' data-visual-selector-id='pages/Project303' className="text-green-600 font-bold text-lg">Get Started</Text>
        </Pressable>
      </Link>
    </View>
  );
}