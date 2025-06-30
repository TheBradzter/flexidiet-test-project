
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Apple } from "lucide-react";

export default function FoodPreferencesStep({ formData, setFormData, onNext, onBack, isIsolated = false }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Based on your nutritionist checklist (removed protein powder - handled in cooking prefs)
  const foodCategories = {
    meat: [
      "Beef", "Pork/Bacon", "Lamb", "Venison", "Chicken", "Turkey", "Salmon", "Tuna", "Seafood/Prawns"
    ],
    starchy_carbs: [
      "Oats/Oatmeal", "Pasta", "Breads", "Rice", "Beans", "Lentils", "Peas", "Potatoes/Kumara", "Sweet Potato", "Couscous", "Wraps/Tortillas"
    ],
    vegetables: [
      "Asparagus", "Capsicum", "Broccoli", "Carrots", "Celery", "Tomato", "Spinach", "Mushroom", "Cauliflower", "Onions", "Garlic"
    ],
    good_fats: [
      "Avocado", "Peanuts", "Peanut Butter", "Almonds", "Olive Oil", "Coconut Oil"
    ],
    fruit: [
      "Banana", "Apple", "Oranges", "Strawberries", "Blueberries", "Pineapple", "Grapes"
    ],
    dairy: [
      "Milk", "Greek Yogurt", "Eggs", "Cottage Cheese", "Cheese", "Butter", "Cream"
    ]
  };

  const categoryLabels = {
    meat: "Meat",
    starchy_carbs: "Starchy Carbs", 
    vegetables: "Vegetables",
    good_fats: "Good Fats",
    fruit: "Fruit",
    dairy: "Dairy",
  };

  // Initialize with all foods selected by default, only if not in isolated mode
  // In isolated mode, we assume formData.liked_foods is already populated from an existing source.
  useEffect(() => {
    if (!isIsolated && (!formData.liked_foods || formData.liked_foods.length === 0)) {
      const allFoods = Object.values(foodCategories).flat();
      setFormData(prev => ({ ...prev, liked_foods: allFoods }));
    }
  }, [formData.liked_foods, setFormData, isIsolated]);

  const allFoods = Object.values(foodCategories).flat();
  
  const filteredFoods = searchTerm 
    ? allFoods.filter(food => food.toLowerCase().includes(searchTerm.toLowerCase()))
    : allFoods;

  const toggleFoodLike = (foodName) => {
    const current = formData.liked_foods || [];
    const updated = current.includes(foodName)
      ? current.filter(name => name !== foodName)
      : [...current, foodName];
    
    setFormData(prev => ({ ...prev, liked_foods: updated }));
  };

  const selectAllInCategory = (category) => {
    const current = formData.liked_foods || [];
    const categoryFoods = foodCategories[category];
    const allSelected = categoryFoods.every(food => current.includes(food));
    
    if (allSelected) {
      // Deselect all in category
      const updated = current.filter(food => !categoryFoods.includes(food));
      setFormData(prev => ({ ...prev, liked_foods: updated }));
    } else {
      // Select all in category
      const updated = Array.from(new Set([...current, ...categoryFoods]));
      setFormData(prev => ({ ...prev, liked_foods: updated }));
    }
  };

  return (
    <Card className="glass-card shadow-2xl border-0 max-w-6xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full flex items-center justify-center">
          <Apple className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-charcoal">Food Preferences</CardTitle>
        <p className="text-gray-600 mt-2">All foods are selected by default</p>
        <p className="text-sm text-red-600 font-medium mt-1">Please UNTICK any foods you don't want to see in your meal plans</p>
        <p className="text-xs text-gray-500 mt-1 italic">All selected foods will be used in recipes... NOT served on their own</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for specific foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl"
            />
          </div>
        </div>

        {searchTerm ? (
          // Show filtered search results
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFoods.map((food) => {
              const isLiked = formData.liked_foods?.includes(food);
              
              return (
                <div
                  key={food}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isLiked 
                      ? 'border-lime-500 bg-lime-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                  onClick={() => toggleFoodLike(food)}
                >
                  <Checkbox
                    checked={isLiked}
                    className="data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                  />
                  <span className={`font-medium ${isLiked ? 'text-charcoal' : 'text-red-700 line-through'}`}>
                    {food}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          // Show by categories
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Object.entries(foodCategories).map(([categoryKey, foods]) => {
              const categoryLikedCount = foods.filter(food => formData.liked_foods?.includes(food)).length;
              const allSelected = foods.length === categoryLikedCount;
              
              return (
                <div key={categoryKey} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-charcoal">{categoryLabels[categoryKey]}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllInCategory(categoryKey)}
                      className={`text-xs ${allSelected ? 'bg-lime-100 border-lime-500 text-lime-700' : 'bg-red-100 border-red-500 text-red-700'}`}
                    >
                      {allSelected ? 'Remove All' : 'Select All'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {foods.map((food) => {
                      const isLiked = formData.liked_foods?.includes(food);
                      
                      return (
                        <div
                          key={food}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                            isLiked 
                              ? 'border-lime-500 bg-lime-50' 
                              : 'border-red-200 bg-red-50'
                          }`}
                          onClick={() => toggleFoodLike(food)}
                        >
                          <Checkbox
                            checked={isLiked}
                            className="data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                          />
                          <span className={`font-medium ${isLiked ? 'text-charcoal' : 'text-red-700 line-through'}`}>
                            {food}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    {categoryLikedCount} of {foods.length} selected
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center bg-lime-50 rounded-xl p-6">
          <p className="text-lg font-semibold text-charcoal mb-2">
            {formData.liked_foods?.length || 0} foods selected for your meal plans
          </p>
          <p className="text-sm text-gray-600">
            Unticked foods will be excluded from all recipes and meal suggestions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full sm:flex-1 h-14 text-lg font-semibold border-2 border-gray-200 hover:border-lime-500 hover:bg-lime-50 rounded-xl"
          >
            {isIsolated ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={onNext}
            className="w-full sm:flex-1 h-14 text-lg font-semibold bg-lime-500 hover:bg-lime-600 text-white rounded-xl shadow-lg transition-all duration-300"
          >
            {isIsolated ? 'Save Changes' : 'Continue to Meal Schedule'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
