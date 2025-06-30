
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Clock, Users, Zap, Globe, Lock, ClipboardList, Utensils, Check } from 'lucide-react';
import ManualRecipeForm from '../foods/ManualRecipeForm';

export default function RecipeDetailModal({ recipe, onClose, onRecipeUpdated, onRecipeDeleted }) {
  const [isEditing, setIsEditing] = React.useState(false);

  if (!recipe) return null;

  const handleEditComplete = (updatedRecipe) => {
    setIsEditing(false);
    if (onRecipeUpdated) {
      onRecipeUpdated(updatedRecipe);
    }
  };

  const handleDeleteComplete = () => {
    setIsEditing(false);
    if (onRecipeDeleted) {
        onRecipeDeleted(recipe.id);
    }
    onClose();
  };

  if (isEditing) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
               <ManualRecipeForm
                  existingRecipe={recipe}
                  onRecipeUpdated={handleEditComplete}
                  onCancel={() => setIsEditing(false)}
                  onRecipeDeleted={handleDeleteComplete}
                />
            </div>
        </div>
    )
  }

  const nutrition = recipe.food_nutrition;
  
  const cleanWord = (word) => word ? word.toLowerCase().replace(/[^a-z]/g, '') : '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white relative" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-200 bg-white/90 backdrop-blur-sm">
                    <X className="w-6 h-6 text-gray-600" />
                </Button>
            </div>
            
            <CardHeader className="p-0">
                <div className="relative">
                    <img 
                        src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop&q=80'}
                        alt={recipe.name}
                        className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                        <CardTitle className="text-3xl font-bold text-white drop-shadow-lg">{recipe.name}</CardTitle>
                        <p className="text-white/90 drop-shadow-md mt-1 max-w-prose">{recipe.description}</p>
                    </div>
                    <div className="absolute top-4 left-4 flex gap-2">
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
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <Users className="w-8 h-8 mx-auto mb-2 text-[#005A8D]" />
                        <p className="text-2xl font-bold text-gray-900">{recipe.servings}</p>
                        <p className="text-sm font-medium text-gray-600">Servings</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-[#005A8D]" />
                        <p className="text-lg font-bold text-gray-900">{recipe.cook_time || 'N/A'}</p>
                        <p className="text-sm font-medium text-gray-600">Cook Time</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-[#005A8D]" />
                        <p className="text-lg font-bold text-gray-900">{recipe.prep_time || 'N/A'}</p>
                        <p className="text-sm font-medium text-gray-600">Prep Time</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 mx-auto mb-2 text-[#005A8D] flex items-center justify-center">
                            <div className="w-6 h-6 bg-[#005A8D] rounded flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    {recipe.difficulty === 'easy' ? 'E' : recipe.difficulty === 'medium' ? 'M' : 'H'}
                                </span>
                            </div>
                        </div>
                        <p className="text-lg font-bold text-gray-900 capitalize">{recipe.difficulty || 'N/A'}</p>
                        <p className="text-sm font-medium text-gray-600">Difficulty</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Utensils className="w-6 h-6 text-[#6BBD4F]" />
                            Ingredients
                        </h3>
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ing, index) => {
                                // FIX: Safely handle potentially missing properties
                                const displayAmountStr = ing.display_amount || '';
                                const nameStr = ing.name || '';

                                // Logic to prevent duplicating ingredient name
                                const displayWords = new Set(displayAmountStr.toLowerCase().split(/\s+/).map(cleanWord));
                                const nameWords = nameStr.toLowerCase().split(/\s+/).map(cleanWord);
                                
                                // Check if all words in ing.name are present in ing.display_amount
                                const isNameInDisplay = nameWords.every(word => word && displayWords.has(word));

                                return (
                                    <li key={index} className="flex gap-3 items-baseline p-3 bg-gray-50 rounded-lg">
                                        <span className="font-semibold text-gray-800 min-w-0">{displayAmountStr}</span>
                                        {!isNameInDisplay && nameStr && ( // Ensure ing.name is not empty
                                          <span className="text-gray-600">{nameStr}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-[#6BBD4F]" />
                            Instructions
                        </h3>
                        <div className="space-y-4">
                            {recipe.instructions.map((step, index) => (
                                <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-[#6BBD4F] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {nutrition && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-[#6BBD4F]" />
                        Nutrition per Serving
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="font-bold text-lg text-gray-900">{Math.round((nutrition.calories_per_100g / 100) * (recipe.servings || 1))}</p>
                        <p className="text-sm text-gray-500">Calories</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="font-bold text-lg text-gray-900">{Math.round((nutrition.protein_per_100g / 100) * (recipe.servings || 1))}g</p>
                        <p className="text-sm text-gray-500">Protein</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="font-bold text-lg text-gray-900">{Math.round((nutrition.carbs_per_100g / 100) * (recipe.servings || 1))}g</p>
                        <p className="text-sm text-gray-500">Carbs</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="font-bold text-lg text-gray-900">{Math.round((nutrition.fat_per_100g / 100) * (recipe.servings || 1))}g</p>
                        <p className="text-sm text-gray-500">Fat</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t">
                    <Button onClick={() => setIsEditing(true)} className="bg-[#6BBD4F] hover:bg-[#5aa03f] text-white">
                        Edit Recipe
                    </Button>
                </div>

            </CardContent>
        </Card>
    </div>
  );
}
