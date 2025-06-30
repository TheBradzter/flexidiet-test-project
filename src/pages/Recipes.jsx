
import React, { useState, useEffect } from "react";
import { Recipe } from "@/api/entities";
import { Food } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChefHat, Link2, PenTool, CheckCircle, Clock } from "lucide-react";
import RecipeImporter from "../components/foods/RecipeImporter";
import ManualRecipeForm from "../components/foods/ManualRecipeForm";
import RecipeCard from "../components/recipes/RecipeCard";
import RecipeDetailModal from "../components/recipes/RecipeDetailModal";
import PaywallGuard from "../components/subscription/PaywallGuard";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [cookTimeFilter, setCookTimeFilter] = useState("all");
  const [mealTypeFilter, setMealTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [createMethod, setCreateMethod] = useState(null);
  const [preselectedUrl, setPreselectedUrl] = useState('');

  // Check URL parameters for import mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const importMode = urlParams.get('import');
    const importUrl = urlParams.get('url');
    
    if (importMode === 'true') {
      setShowImporter(true);
      if (importUrl) {
        setPreselectedUrl(decodeURIComponent(importUrl));
      }
    }
  }, []);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      const publicRecipes = await Recipe.filter({ is_public: true });
      const privateRecipes = await Recipe.filter({ is_public: false, created_by: user.email });
      
      // Get associated food nutrition data for each recipe
      const allRecipes = [...publicRecipes, ...privateRecipes];
      const recipesWithNutrition = await Promise.all(
        allRecipes.map(async (recipe) => {
          try {
            if (recipe.food_id) {
              const foods = await Food.filter({ id: recipe.food_id });
              if (foods.length > 0) {
                return { ...recipe, food_nutrition: foods[0] };
              }
            }
            return recipe;
          } catch (error) {
            console.error("Error loading nutrition for recipe:", recipe.id, error);
            return recipe;
          }
        })
      );
      
      setRecipes(recipesWithNutrition);
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
    setLoading(false);
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === updatedRecipe.id ? { ...recipe, ...updatedRecipe } : recipe
    ));
  };

  const handleRecipeDeleted = (deletedRecipeId) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== deletedRecipeId));
  };

  const handleCreateComplete = () => {
    setCreateMethod(null);
    setShowImporter(false);
    setPreselectedUrl('');
    loadRecipes();
  };

  // Helper function to parse cook time strings into minutes
  const parseCookTimeInMinutes = (cookTimeString) => {
    if (!cookTimeString) return 0;
    const lowerCaseStr = String(cookTimeString).toLowerCase();
    let totalMinutes = 0;

    // Handle "X hour(s) Y min(s)"
    const hourMinMatch = lowerCaseStr.match(/(\d+)\s*hour(?:s)?\s*(\d+)\s*min(?:s)?/);
    if (hourMinMatch) {
      totalMinutes += parseInt(hourMinMatch[1], 10) * 60;
      totalMinutes += parseInt(hourMinMatch[2], 10);
      return totalMinutes;
    }

    // Handle "X hour(s)"
    const hourMatch = lowerCaseStr.match(/(\d+)\s*hour(?:s)?/);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1], 10) * 60;
      return totalMinutes;
    }

    // Handle "X min(s)"
    const minMatch = lowerCaseStr.match(/(\d+)\s*min(?:s)?/);
    if (minMatch) {
      totalMinutes += parseInt(minMatch[1], 10);
      return totalMinutes;
    }

    // Handle just numbers
    const pureNumMatch = lowerCaseStr.match(/^(\d+)$/);
    if (pureNumMatch) {
      totalMinutes += parseInt(pureNumMatch[1], 10);
      return totalMinutes;
    }

    return 0;
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || recipe.difficulty === difficultyFilter;
    
    // Meal type filtering - check if recipe has meal_types property
    let matchesMealType = true;
    if (mealTypeFilter !== "all" && recipe.meal_types) {
      // If recipe has meal_types array, check if it includes the selected type
      if (Array.isArray(recipe.meal_types)) {
        matchesMealType = recipe.meal_types.includes(mealTypeFilter);
      }
    }
    
    let matchesCookTime = true;
    if (cookTimeFilter !== "all" && recipe.cook_time) {
      const cookTimeInMinutes = parseCookTimeInMinutes(recipe.cook_time);
      
      const cookTimeStrLower = String(recipe.cook_time).toLowerCase();
      const isActuallyZeroMinutes = cookTimeInMinutes === 0 && (cookTimeStrLower === "0" || cookTimeStrLower === "0 min");

      if (cookTimeInMinutes === 0 && !isActuallyZeroMinutes && recipe.cook_time.trim() !== "") {
        matchesCookTime = false;
      } else {
        switch (cookTimeFilter) {
          case "< 15 min":
            matchesCookTime = cookTimeInMinutes >= 0 && cookTimeInMinutes < 15;
            break;
          case "15-30 min":
            matchesCookTime = cookTimeInMinutes >= 15 && cookTimeInMinutes <= 30;
            break;
          case "30-45 min":
            matchesCookTime = cookTimeInMinutes > 30 && cookTimeInMinutes <= 45;
            break;
          case "> 45 min":
            matchesCookTime = cookTimeInMinutes > 45;
            break;
          default:
            matchesCookTime = true;
        }
      }
    }
    
    return matchesSearch && matchesDifficulty && matchesCookTime && matchesMealType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#005A8D' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading your recipes...</p>
        </div>
      </div>
    );
  }

  // Show create method views
  if (createMethod === 'manual') {
    return (
      <PaywallGuard feature="custom_recipes">
        <div className="min-h-screen py-8 px-4 text-white" style={{ backgroundColor: '#005A8D' }}>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Create Recipe Manually</h1>
              <Button
                onClick={() => setCreateMethod(null)}
                variant="outline"
                className="bg-white text-cyan-800 hover:bg-cyan-50"
              >
                Back to Recipes
              </Button>
            </div>
            <ManualRecipeForm 
              onRecipeAdded={handleCreateComplete}
              onCancel={() => setCreateMethod(null)}
            />
          </div>
        </div>
      </PaywallGuard>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 text-white" style={{ backgroundColor: '#005A8D' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Recipes</h1>
          <p className="text-white/80 mt-1">Manage your private recipes or browse the FlexiDiet catalog</p>
        </div>

        {/* Recipe Creation Options - Prominent Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Import from Web Card */}
          <PaywallGuard feature="recipe_import" fallback={
            <Card className="glass-card shadow-lg border-0 bg-white/20 backdrop-blur-sm border border-white/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Import from Web</h3>
                <p className="text-cyan-100 mb-4 text-sm">
                  Paste a recipe URL and let AI extract the ingredients and instructions automatically.
                </p>
                <div className="space-y-2 text-cyan-200 text-sm mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Quick and easy</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-yellow-300">⚠️</span>
                    <span>May need manual correction</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Works best with popular recipe sites</span>
                  </div>
                </div>
                <Button 
                  disabled
                  className="w-full h-12 bg-gray-500 text-white rounded-xl"
                >
                  Premium Feature
                </Button>
              </CardContent>
            </Card>
          } showUpgradePrompt={false}>
            <Card 
              className="glass-card shadow-lg border-0 bg-white cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setShowImporter(!showImporter)}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Link2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Import from Web</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Paste a recipe URL and let AI extract the ingredients and instructions automatically.
                </p>
                <div className="space-y-2 text-gray-600 text-sm mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Quick and easy</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-yellow-500">⚠️</span>
                    <span>May need manual correction</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Works best with popular recipe sites</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                >
                  {showImporter ? 'Cancel Import' : 'Import Recipe'}
                </Button>
              </CardContent>
            </Card>
          </PaywallGuard>

          {/* Create Manually Card */}
          <PaywallGuard feature="custom_recipes" fallback={
            <Card className="glass-card shadow-lg border-0 bg-white/20 backdrop-blur-sm border border-white/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#005A8D] rounded-full flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Create Manually</h3>
                <p className="text-cyan-100 mb-4 text-sm">
                  Enter all recipe details manually for complete control and accuracy.
                </p>
                <div className="space-y-2 text-cyan-200 text-sm mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>100% accurate</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Full control over details</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Takes more time</span>
                  </div>
                </div>
                <Button 
                  disabled
                  className="w-full h-12 bg-gray-500 text-white rounded-xl"
                >
                  Premium Feature
                </Button>
              </CardContent>
            </Card>
          } showUpgradePrompt={false}>
            <Card 
              className="glass-card shadow-lg border-0 bg-white cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setCreateMethod('manual')}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#005A8D] rounded-full flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create Manually</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Enter all recipe details manually for complete control and accuracy.
                </p>
                <div className="space-y-2 text-gray-600 text-sm mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>100% accurate</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>Full control over details</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Takes more time</span>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 bg-[#005A8D] hover:bg-[#004A75] text-white rounded-xl"
                >
                  Create Recipe
                </Button>
              </CardContent>
            </Card>
          </PaywallGuard>
        </div>

        {/* Show importer if active */}
        {showImporter && (
          <RecipeImporter 
            onRecipeAdded={handleCreateComplete} 
            preselectedUrl={preselectedUrl}
          />
        )}

        {/* Search and Filter */}
        <Card className="glass-card shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-100 focus:border-[#005A8D] rounded-xl"
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                  <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gray-100 focus:border-[#005A8D] rounded-xl">
                    <SelectValue placeholder="All Meal Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meal Types</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="morning_snack">Morning Snack</SelectItem>
                    <SelectItem value="afternoon_snack">Afternoon Snack</SelectItem>
                    <SelectItem value="post_workout">Post Workout</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gray-100 focus:border-[#005A8D] rounded-xl">
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={cookTimeFilter} onValueChange={setCookTimeFilter}>
                  <SelectTrigger className="w-full md:w-48 h-12 border-2 border-gray-100 focus:border-[#005A8D] rounded-xl">
                    <SelectValue placeholder="All Cook Times" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cook Times</SelectItem>
                    <SelectItem value="< 15 min">&lt; 15 min</SelectItem>
                    <SelectItem value="15-30 min">15-30 min</SelectItem>
                    <SelectItem value="30-45 min">30-45 min</SelectItem>
                    <SelectItem value="> 45 min">&gt; 45 min</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || difficultyFilter !== "all" || cookTimeFilter !== "all" || mealTypeFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setDifficultyFilter("all");
                      setCookTimeFilter("all");
                      setMealTypeFilter("all");
                    }}
                    variant="outline"
                    className="w-full md:w-auto h-12 border-2 border-gray-200 hover:border-[#005A8D] rounded-xl"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <Card className="glass-card shadow-2xl border-0 bg-white">
            <CardContent className="p-12 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-6 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Recipes Found</h3>
              <p className="text-gray-600 mb-8">
                {searchTerm || difficultyFilter !== "all" || cookTimeFilter !== "all" || mealTypeFilter !== "all"
                  ? "No recipes match your current filters." 
                  : "Create your first recipe using the options above!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onClick={setSelectedRecipe}
              />
            ))}
          </div>
        )}

        {selectedRecipe && (
          <RecipeDetailModal 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)}
            onRecipeUpdated={handleRecipeUpdated}
            onRecipeDeleted={handleRecipeDeleted}
          />
        )}
      </div>
    </div>
  );
}
