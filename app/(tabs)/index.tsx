import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function DashboardScreen() {
  return (
    <ScrollView data-filename="pages/Project" data-linenumber="305" data-visual-selector-id="pages/Project305" className="flex-1 bg-gray-50">
      <View data-filename='pages/Project' data-linenumber='305' data-visual-selector-id='pages/Project305' className="p-6">
        <Text data-filename='pages/Project' data-linenumber='305' data-visual-selector-id='pages/Project305' className="text-3xl font-bold text-gray-900 mb-2">Good Morning!</Text>
        <Text data-filename='pages/Project' data-linenumber='305' data-visual-selector-id='pages/Project305' className="text-gray-600 mb-6">Ready to start your healthy day?</Text>
        
        <View data-filename='pages/Project' data-linenumber='305' data-visual-selector-id='pages/Project305' className="bg-white rounded-xl p-6 mb-4 shadow-sm">
          <Text data-filename='pages/Project' data-linenumber='305' data-visual-selector-id='pages/Project305' className="text-xl font-semibold text-gray-900 mb-4">Today's Plan</Text>
          <Text data-filename='pages/Project' data-linenumber='305' data-visual-selector-id='pages/Project305' className="text-gray-600">Your personalized meal plan will appear here.</Text>
        </View>
      </View>
    </ScrollView>
  );
}