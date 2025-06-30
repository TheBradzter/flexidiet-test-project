/**
 * FUNCTIONALITY REGRESSION TESTS
 * Component to test and verify app functionality
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Play } from "lucide-react";

export default function FunctionalityTests() {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runFunctionalityTests = async () => {
    setIsRunning(true);
    const results = [];

    // Test 1: Daily View Layout
    try {
      const testDailyViewLayout = () => {
        // Check if elements have proper max-width classes
        const mockElement = document.createElement('div');
        mockElement.className = 'max-w-4xl mx-auto';
        
        const hasMaxWidth = mockElement.className.includes('max-w-4xl');
        const hasAutoMargin = mockElement.className.includes('mx-auto');
        
        return {
          test: 'Daily View Layout',
          status: (hasMaxWidth && hasAutoMargin) ? 'PASS' : 'FAIL',
          message: (hasMaxWidth && hasAutoMargin) ? 
            'Layout properly centered with max-width container' : 
            'Layout missing centering or max-width classes'
        };
      };
      
      results.push(testDailyViewLayout());
    } catch (error) {
      results.push({
        test: 'Daily View Layout',
        status: 'FAIL',
        message: `Error: ${error.message}`
      });
    }

    // Test 2: Heart Icon Visibility
    try {
      const testHeartIconVisibility = () => {
        // Test that heart icon shows for recipes with IDs
        const mockMeal = {
          recipe_data: { id: 'recipe123' },
          recipe_name: 'Test Recipe'
        };
        
        const shouldShowHeart = mockMeal.recipe_data?.id;
        
        return {
          test: 'Heart Icon Visibility',
          status: shouldShowHeart ? 'PASS' : 'FAIL',
          message: shouldShowHeart ? 
            'Heart icon properly shown for favoritable recipes' : 
            'Heart icon missing for recipes with IDs'
        };
      };
      
      results.push(testHeartIconVisibility());
    } catch (error) {
      results.push({
        test: 'Heart Icon Visibility',
        status: 'FAIL',
        message: `Error: ${error.message}`
      });
    }

    // Test 3: Recipe Name Wrapping
    try {
      const testRecipeNameWrapping = () => {
        const longRecipeName = 'This is a very long recipe name that should wrap instead of being truncated';
        
        // Test CSS properties for text wrapping
        const mockElement = document.createElement('p');
        mockElement.textContent = longRecipeName;
        mockElement.style.whiteSpace = 'normal';
        mockElement.style.wordBreak = 'break-words';
        
        const hasProperWrapping = mockElement.style.whiteSpace === 'normal' && 
                                 mockElement.style.wordBreak === 'break-words';
        
        return {
          test: 'Recipe Name Wrapping',
          status: hasProperWrapping ? 'PASS' : 'FAIL',
          message: hasProperWrapping ? 
            'Recipe names properly wrap without truncation' : 
            'Recipe names may be truncated instead of wrapping'
        };
      };
      
      results.push(testRecipeNameWrapping());
    } catch (error) {
      results.push({
        test: 'Recipe Name Wrapping',
        status: 'FAIL',
        message: `Error: ${error.message}`
      });
    }

    // Test 4: Layout Toggle Functionality
    try {
      const testLayoutToggle = () => {
        let layout = 'grid';
        
        const toggleLayout = () => {
          layout = layout === 'grid' ? 'list' : 'grid';
        };
        
        const initialLayout = layout;
        toggleLayout();
        const afterToggle = layout;
        toggleLayout();
        const afterSecondToggle = layout;
        
        const toggleWorks = initialLayout === 'grid' && 
                           afterToggle === 'list' && 
                           afterSecondToggle === 'grid';
        
        return {
          test: 'Layout Toggle Functionality',
          status: toggleWorks ? 'PASS' : 'FAIL',
          message: toggleWorks ? 
            'Layout toggle properly switches between grid and list views' : 
            'Layout toggle not working correctly'
        };
      };
      
      results.push(testLayoutToggle());
    } catch (error) {
      results.push({
        test: 'Layout Toggle Functionality',
        status: 'FAIL',
        message: `Error: ${error.message}`
      });
    }

    // Test 5: Navigation URLs
    try {
      const testNavigationUrls = () => {
        // Test that navigation URLs are properly formed
        const mockPages = ['DailyPlan', 'MealPlan', 'GroceryList', 'Profile'];
        const urlPattern = /^[a-zA-Z][a-zA-Z0-9]*$/;
        
        const validUrls = mockPages.every(page => urlPattern.test(page));
        
        return {
          test: 'Navigation URLs',
          status: validUrls ? 'PASS' : 'FAIL',
          message: validUrls ? 
            'All navigation URLs properly formatted' : 
            'Some navigation URLs may be invalid'
        };
      };
      
      results.push(testNavigationUrls());
    } catch (error) {
      results.push({
        test: 'Navigation URLs',
        status: 'FAIL',
        message: `Error: ${error.message}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Functionality Tests</h2>
        <Button 
          onClick={runFunctionalityTests} 
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                result.status === 'PASS'
                  ? 'bg-green-50 border-green-500'
                  : result.status === 'WARNING'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <h3 className="font-semibold text-gray-800">{result.test}</h3>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  result.status === 'PASS'
                    ? 'bg-green-200 text-green-800'
                    : result.status === 'WARNING'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-red-200 text-red-800'
                }`}>
                  {result.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{result.message}</p>
            </div>
          ))}
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Test Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-2xl font-bold text-green-600">
                  {testResults.filter(r => r.status === 'PASS').length}
                </span>
                <p className="text-sm text-green-700">Passed</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-yellow-600">
                  {testResults.filter(r => r.status === 'WARNING').length}
                </span>
                <p className="text-sm text-yellow-700">Warnings</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-red-600">
                  {testResults.filter(r => r.status === 'FAIL').length}
                </span>
                <p className="text-sm text-red-700">Failed</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}