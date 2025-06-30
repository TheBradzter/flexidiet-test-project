
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChefHat, Mail } from "lucide-react";
import { createRecipeFromData } from "@/api/functions";
import { verifyRecipeIngredients } from "@/api/functions";
import { SendEmail } from "@/api/integrations";

export default function ManualRecipeForm({ onRecipeCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    servings: 4,
    prep_time: "15-30 min",
    cook_time: "15-30 min",
    difficulty: "medium",
    ingredients: [{ name: "", amount: "", unit: "cups", display_amount: "" }], // Changed from "pieces" to "cups"
    instructions: [""]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingIngredient, setIsRequestingIngredient] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "cups", display_amount: "" }] // Changed from "pieces" to "cups"
    }));
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const updateInstruction = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const requestMissingIngredient = async (ingredientName) => {
    setIsRequestingIngredient(true);
    try {
      await SendEmail({
        to: "admin@flexidiet.com", // Replace with your admin email
        subject: "New Ingredient Request",
        body: `A user has requested a new ingredient to be added to the food database:

Ingredient Name: ${ingredientName}
Recipe: ${formData.name}

Please review and add this ingredient to the database if appropriate.

Thanks!`
      });
      
      alert("Ingredient request sent to admin! We'll add it to the database soon.");
    } catch (error) {
      console.error("Error sending ingredient request:", error);
      alert("Failed to send ingredient request. Please try again.");
    }
    setIsRequestingIngredient(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Verify ingredients exist in database
      const { data: verificationResult } = await verifyRecipeIngredients({
        ingredients: formData.ingredients.filter(ing => ing.name.trim())
      });

      if (verificationResult.missing && verificationResult.missing.length > 0) {
        const missingIngredients = verificationResult.missing.map(ing => ing.name).join(', ');
        const shouldContinue = confirm(
          `Some ingredients are not in our database: ${missingIngredients}\n\n` +
          "You can:\n" +
          "1. Click OK to create the recipe anyway (estimated nutrition)\n" +
          "2. Click Cancel to request these ingredients be added first"
        );
        
        if (!shouldContinue) {
          // Request missing ingredients
          for (const ingredient of verificationResult.missing) {
            await requestMissingIngredient(ingredient.name);
          }
          setIsSubmitting(false);
          return;
        }
      }

      // Process ingredients with found nutrition data
      const processedIngredients = formData.ingredients
        .filter(ing => ing.name.trim())
        .map(ing => {
          const foundFood = verificationResult.found?.find(f => 
            f.ingredient.name.toLowerCase() === ing.name.toLowerCase()
          )?.food;
          
          return {
            name: ing.name,
            amount: parseFloat(ing.amount) || 1,
            unit: ing.unit,
            display_amount: ing.display_amount || `${ing.amount} ${ing.unit}`,
            food_data: foundFood || null
          };
        });

      // Estimate nutrition (simplified calculation)
      const estimatedNutrition = {
        calories: 250, // Default estimate
        protein: 15,
        carbs: 30,
        fat: 8,
        fiber: 3
      };

      const recipeData = {
        ...formData,
        ingredients: processedIngredients,
        instructions: formData.instructions.filter(inst => inst.trim()),
        estimated_nutrition_per_100g: estimatedNutrition,
        dietary_tags: [] // Could be enhanced with AI categorization later
      };

      const { data: result } = await createRecipeFromData({ recipeData });
      
      if (result.success) {
        onRecipeCreated(result.recipe);
      } else {
        throw new Error(result.error || 'Failed to create recipe');
      }

    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to create recipe. Please try again.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="glass-card shadow-2xl border-0 bg-white max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-lime-600" />
            Create Recipe Manually
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Chicken Stir Fry"
                className="border-2 border-gray-100 focus:border-lime-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings" className="text-sm font-semibold text-gray-700">Servings *</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
                className="border-2 border-gray-100 focus:border-lime-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the dish..."
              className="border-2 border-gray-100 focus:border-lime-500 h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Prep Time</Label>
              <Select value={formData.prep_time} onValueChange={(value) => handleInputChange('prep_time', value)}>
                <SelectTrigger className="border-2 border-gray-100 focus:border-lime-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-15 min">5-15 min</SelectItem>
                  <SelectItem value="15-30 min">15-30 min</SelectItem>
                  <SelectItem value="30-45 min">30-45 min</SelectItem>
                  <SelectItem value="45+ min">45+ min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Cook Time</Label>
              <Select value={formData.cook_time} onValueChange={(value) => handleInputChange('cook_time', value)}>
                <SelectTrigger className="border-2 border-gray-100 focus:border-lime-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0 min">No cooking</SelectItem>
                  <SelectItem value="5-15 min">5-15 min</SelectItem>
                  <SelectItem value="15-30 min">15-30 min</SelectItem>
                  <SelectItem value="30-45 min">30-45 min</SelectItem>
                  <SelectItem value="45+ min">45+ min</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger className="border-2 border-gray-100 focus:border-lime-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold text-gray-700">Ingredients *</Label>
              <Button type="button" onClick={addIngredient} variant="outline" size="sm">
                Add Ingredient
              </Button>
            </div>
            
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    placeholder="e.g., chicken breast"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="border-2 border-gray-100 focus:border-lime-500"
                  />
                  {ingredient.name && !ingredient.name.match(/chicken|beef|rice|pasta|tomato|onion|garlic|salt|pepper|oil/i) && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-amber-600">Ingredient not found in database</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => requestMissingIngredient(ingredient.name)}
                        disabled={isRequestingIngredient}
                        className="text-xs h-6"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Request Addition
                      </Button>
                    </div>
                  )}
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Amount"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    className="border-2 border-gray-100 focus:border-lime-500"
                  />
                </div>
                <div className="w-24">
                  <Select 
                    value={ingredient.unit} 
                    onValueChange={(value) => updateIngredient(index, 'unit', value)}
                  >
                    <SelectTrigger className="border-2 border-gray-100 focus:border-lime-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cups">cups</SelectItem>
                      <SelectItem value="tbsp">tbsp</SelectItem>
                      <SelectItem value="tsp">tsp</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                      <SelectItem value="cloves">cloves</SelectItem>
                      <SelectItem value="slices">slices</SelectItem>
                      <SelectItem value="whole">whole</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.ingredients.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold text-gray-700">Instructions *</Label>
              <Button type="button" onClick={addInstruction} variant="outline" size="sm">
                Add Step
              </Button>
            </div>
            
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="text-sm font-medium text-gray-500 mt-2 min-w-[20px]">{index + 1}.</span>
                <Textarea
                  placeholder={`Step ${index + 1}...`}
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="border-2 border-gray-100 focus:border-lime-500 h-16"
                />
                {formData.instructions.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeInstruction(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-12 border-2 border-gray-200 hover:border-lime-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-lime-500 hover:bg-lime-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Recipe...
                </>
              ) : (
                'Create Recipe'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
