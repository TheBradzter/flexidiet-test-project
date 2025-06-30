import React, { useState, useEffect } from "react";
import { Recipe } from "@/api/entities";
import { Food } from "@/api/entities";
import { User } from "@/api/entities";
import { MissingIngredient } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ChefHat, Shield, Trash2, Eye, Globe, Lock, FileWarning, CheckCircle, Flag } from "lucide-react";
import RecipeDetailModal from "../recipes/RecipeDetailModal";
import RecipeImporter from "../foods/RecipeImporter";

export default function AdminRecipesTab() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [missingIngredients, setMissingIngredients] = useState([]);
  const [missingCountryFilter, setMissingCountryFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allRecipes = await Recipe.list();
      
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

      const reportedIngredients = await MissingIngredient.filter({ status: 'reported' }, '-created_date');
      setMissingIngredients(reportedIngredients);

    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleToggleVisibility = async (recipe) => {
    try {
      const updatedRecipe = { ...recipe, is_public: !recipe.is_public };
      await Recipe.update(recipe.id, { is_public: updatedRecipe.is_public });
      
      if (recipe.food_id) {
        await Food.update(recipe.food_id, { is_public: updatedRecipe.is_public });
      }
      
      setRecipes(prev => prev.map(r => 
        r.id === recipe.id ? updatedRecipe : r
      ));
    } catch (error) {
      console.error("Error updating recipe visibility:", error);
      alert("Failed to update recipe visibility");
    }
  };

  const handleDeleteRecipe = async (recipe) => {
    if (!window.confirm(`Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      if (recipe.food_id) {
        await Food.delete(recipe.food_id);
      }
      await Recipe.delete(recipe.id);
      setRecipes(prev => prev.filter(r => r.id !== recipe.id));
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    }
  };

  const handleResolveMissing = async (id) => {
    try {
      await MissingIngredient.update(id, { status: 'resolved' });
      setMissingIngredients(prev => prev.filter(ing => ing.id !== id));
    } catch (error) {
      console.error("Failed to resolve ingredient:", error);
      alert("Could not resolve the ingredient. Please try again.");
    }
  };

  const handleRecipeUpdated = (updatedRecipe) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === updatedRecipe.id ? { ...recipe, ...updatedRecipe } : recipe
    ));
  };

  const handleRecipeDeleted = (deletedRecipeId) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== deletedRecipeId));
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || recipe.difficulty === difficultyFilter;
    const matchesVisibility = visibilityFilter === "all" || 
      (visibilityFilter === "public" && recipe.is_public) ||
      (visibilityFilter === "private" && !recipe.is_public);
    return matchesSearch && matchesDifficulty && matchesVisibility;
  });
  
  const filteredMissingIngredients = missingIngredients.filter(ing => 
    missingCountryFilter === "all" || ing.country === missingCountryFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-900">
        <RecipeImporter onRecipeAdded={loadData} />

        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <FileWarning className="w-6 h-6 text-amber-600" />
                    Missing Ingredients Report
                    <Badge variant="destructive">{filteredMissingIngredients.length}</Badge>
                </CardTitle>
                <p className="text-gray-600">Ingredients reported from recipe imports that are not in the food database.</p>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Select value={missingCountryFilter} onValueChange={setMissingCountryFilter}>
                        <SelectTrigger className="w-full md:w-48 h-12">
                            <SelectValue placeholder="Filter by Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            <SelectItem value="NZ">New Zealand</SelectItem>
                            <SelectItem value="USA">USA</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {filteredMissingIngredients.length > 0 ? (
                        filteredMissingIngredients.map(ing => (
                            <div key={ing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-4">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{ing.name}</p>
                                    <p className="text-xs text-gray-500">From recipe: <a href={ing.source_recipe_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{ing.source_recipe_name}</a></p>
                                </div>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <Flag className="w-3 h-3" />
                                    {ing.country}
                                </Badge>
                                <Button onClick={() => handleResolveMissing(ing.id)} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Resolved
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No missing ingredients to report.</p>
                    )}
                </div>
            </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
              
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full md:w-48 h-12">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger className="w-full md:w-48 h-12">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recipes</SelectItem>
                  <SelectItem value="public">Public Only</SelectItem>
                  <SelectItem value="private">Private Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-6 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Recipes Found</h3>
              <p className="text-gray-600">No recipes match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                <div className="relative">
                  <img 
                    src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80'}
                    alt={recipe.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold drop-shadow-lg">
                    {recipe.name}
                  </h3>
                  <div className="absolute top-3 right-3">
                    {recipe.is_public ? (
                      <Badge className="bg-green-500 text-white">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 text-white">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-4">
                  <p className="text-sm text-gray-600 h-10 overflow-hidden">
                    {recipe.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-700 pt-3 border-t border-gray-100">
                    <span>{recipe.servings} servings</span>
                    <span>{recipe.cook_time || 'N/A'}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedRecipe(recipe)}
                      size="sm"
                      className="flex-1 bg-lime-500 hover:bg-lime-600 text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      onClick={() => handleToggleVisibility(recipe)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      {recipe.is_public ? (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 mr-1" />
                          Make Public
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteRecipe(recipe)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
  );
}