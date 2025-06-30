
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Link, Loader2, AlertCircle, Shield, X, CheckCircle, Plus } from 'lucide-react';
import { InvokeLLM, GenerateImage } from "@/api/integrations";
import { createRecipeFromData } from '@/api/functions';
import { User } from '@/api/entities';
import { verifyRecipeIngredients } from '@/api/functions';

export default function RecipeImporter({ onRecipeAdded, preselectedUrl }) {
    const [url, setUrl] = useState(preselectedUrl || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPublic, setIsPublic] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // New states for validation flow
    const [incompleteRecipe, setIncompleteRecipe] = useState(null);
    const [missingFields, setMissingFields] = useState([]);
    const [showValidationModal, setShowValidationModal] = useState(false);

    // New states for ingredient verification
    const [showIngredientVerification, setShowIngredientVerification] = useState(false);
    const [ingredientResults, setIngredientResults] = useState(null);
    const [pendingRecipeData, setPendingRecipeData] = useState(null);

    useEffect(() => {
        const loadAndConfigureUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
                // Default to public for admins
                if (user?.role === 'admin') {
                    setIsPublic(true);
                }
            } catch (error) {
                console.error("Error loading user:", error);
            }
        };
        loadAndConfigureUser();
        
        // Set preselected URL if provided
        if (preselectedUrl) {
            setUrl(preselectedUrl);
        }
    }, [preselectedUrl]);

    // Function to generate detailed image prompt based on recipe data
    const generateImagePrompt = (recipeData) => {
        // Add null checks for ingredients array
        const ingredients = recipeData.ingredients || [];
        const mainIngredients = ingredients
            .slice(0, 4) // Take first 4 ingredients as they're usually the main ones
            .map(ing => ing?.name?.toLowerCase() || 'ingredient')
            .join(', ');

        const instructions = recipeData.instructions || [];
        const cookingMethod = instructions.length > 0 ? instructions[0]?.toLowerCase() || '' : '';
        let cookingStyle = 'prepared dish';
        
        if (cookingMethod.includes('grill')) cookingStyle = 'grilled';
        else if (cookingMethod.includes('bake') || cookingMethod.includes('roast')) cookingStyle = 'baked';
        else if (cookingMethod.includes('fry') || cookingMethod.includes('pan')) cookingStyle = 'pan-fried';
        else if (cookingMethod.includes('steam')) cookingStyle = 'steamed';
        else if (cookingMethod.includes('boil')) cookingStyle = 'boiled';
        else if (cookingMethod.includes('sauté')) cookingStyle = 'sautéed';

        const dishType = (recipeData.name || 'dish').toLowerCase();
        let plating = 'on a white ceramic plate';
        
        if (dishType.includes('soup') || dishType.includes('stew')) plating = 'in a rustic bowl';
        else if (dishType.includes('salad')) plating = 'in a large salad bowl';
        else if (dishType.includes('pasta')) plating = 'in a pasta bowl';
        else if (dishType.includes('sandwich') || dishType.includes('wrap')) plating = 'on a wooden cutting board';
        else if (dishType.includes('smoothie') || dishType.includes('drink')) plating = 'in a tall glass';

        return `Professional food photography of ${recipeData.name || 'delicious dish'}: ${cookingStyle} ${mainIngredients || 'fresh ingredients'} beautifully presented ${plating}. The dish should look exactly like ${dishType}, showing the key ingredients: ${mainIngredients || 'fresh ingredients'}. High-quality, well-lit, appetizing, restaurant-style presentation with natural lighting. The food should be the main focus, clearly showing the texture and colors of ${mainIngredients || 'the ingredients'}. No text or logos in the image.`;
    };

    // Function to finalize the recipe import (image generation, saving)
    const completeRecipeImport = async (dataToSave) => {
        setIsLoading(true); // Indicate loading for this phase
        setError(null); // Clear previous errors

        try {
            // Generate an AI image for the recipe with detailed prompt
            try {
                const detailedPrompt = generateImagePrompt(dataToSave);
                console.log('Generating image with prompt:', detailedPrompt); // For debugging
                
                const imageResult = await GenerateImage({
                    prompt: detailedPrompt
                });
                if (imageResult?.url) {
                    dataToSave.image_url = imageResult.url;
                }
            } catch (imageError) {
                console.warn('Failed to generate image:', imageError);
                // Use a default food image based on recipe type
                const recipeName = (dataToSave.name || '').toLowerCase();
                if (recipeName.includes('chicken')) {
                    dataToSave.image_url = 'https://images.unsplash.com/photo-1598511757337-fe2cafc31ba9?w=600&h=400&fit=crop&q=80';
                } else if (recipeName.includes('salmon') || recipeName.includes('fish')) {
                    dataToSave.image_url = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop&q=80';
                } else if (recipeName.includes('pasta')) {
                    dataToSave.image_url = 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600&h=400&fit=crop&q=80';
                } else if (recipeName.includes('salad')) {
                    dataToSave.image_url = 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop&q=80';
                } else if (recipeName.includes('soup') || recipeName.includes('stew')) {
                    dataToSave.image_url = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&q=80';
                } else {
                    dataToSave.image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80';
                }
            }

            // Add public flag for admin users
            if (currentUser?.role === 'admin') {
                dataToSave.is_public = isPublic;
            }

            const { data: result, error: saveError } = await createRecipeFromData({ recipeData: dataToSave });
            
            if (saveError || !result?.success) {
                throw new Error(saveError?.message || result?.error || 'Failed to save the imported recipe.');
            }

            setUrl(''); // Clear URL input on success
            setIsPublic(currentUser?.role === 'admin' ? true : false); // Reset public status for next import
            // Clear any validation-related states
            setIncompleteRecipe(null);
            setMissingFields([]);
            setShowValidationModal(false);
            // Clear ingredient verification states
            setIngredientResults(null);
            setPendingRecipeData(null);
            setShowIngredientVerification(false);

            if (onRecipeAdded) {
                onRecipeAdded(); // Notify parent component of successful addition
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to complete recipe import. Please try again.');
        } finally {
            setIsLoading(false); // Always stop loading at the end of this function
        }
    };

    // Function to verify ingredients against databases
    const verifyIngredients = async (recipeData) => {
        setIsLoading(true);
        try {
            const ingredients = recipeData.ingredients || [];
            const ingredientsToVerify = ingredients
                .filter(ing => ing?.name?.trim())
                .map(ing => ({ 
                    name: ing.name, 
                    display_amount: ing.display_amount, 
                    amount: ing.amount, 
                    unit: ing.unit 
                }));

            const { data: results } = await verifyRecipeIngredients({ 
                ingredients: ingredientsToVerify,
                recipeName: recipeData.name,
                recipeUrl: recipeData.source_url,
            });
            
            setIngredientResults(results);
            setPendingRecipeData(recipeData); // Store recipe data for later use
            
            // If all ingredients are found, proceed directly
            if (results?.missing?.length === 0) {
                await completeRecipeImport(recipeData);
            } else {
                // Show ingredient verification modal for missing ingredients
                setShowIngredientVerification(true);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Ingredient verification error:', error);
            setError('Failed to verify ingredients. Proceeding with recipe import...');
            // Proceed anyway if verification fails, as it's not a hard block
            await completeRecipeImport(recipeData);
        }
    };

    const handleImport = async () => {
        if (!url) {
            setError('Please enter a recipe URL.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const llmPrompt = `You are an expert recipe scraper. A user has provided this URL: ${url}. 
            Your task is to extract the recipe with extreme precision and structure the ingredients correctly.
            
            CRITICAL INSTRUCTIONS:
            1.  **Extract Basic Info**: Get the exact recipe title, description, servings, prep time, cook time, and determine the difficulty (easy, medium, hard).
            2.  **Extract Instructions**: Copy the cooking instructions step-by-step.
            3.  **Parse Ingredients (VERY IMPORTANT)**: For each ingredient, you MUST parse it into a structured object with four fields:
                *   \`name\`: The clean, main ingredient name (e.g., from '1 cup all-purpose flour, sifted', the name is 'all-purpose flour').
                *   \`amount\`: The primary numeric quantity (e.g., for "4 (6-oz) pieces", the amount is 4. For "1/2 cup", the amount is 0.5).
                *   \`unit\`: The unit of measurement. IMPORTANT RULES:
                    - For liquids (wine, broth, oil, vinegar, milk, etc.): use 'cups' or 'ml'
                    - For herbs/spices (parsley, cilantro, oregano, etc.): use 'tbsp' or 'tsp'
                    - For small items (chives, garlic cloves): use 'cloves' or 'tbsp'
                    - For meat/fish: use 'g' or 'kg' (convert from lb/oz)
                    - For vegetables: use 'pieces' only for countable items like "2 onions"
                    - For flour/sugar: use 'cups' or 'g'
                    - NEVER use 'pieces' for liquids, herbs, or spices
                *   \`display_amount\`: The full, original ingredient line as it appears on the page (e.g., '1 cup all-purpose flour, sifted').
            4.  **Handle Ambiguity**: If you cannot determine a unit, use the most logical one based on the ingredient type.
            5.  **Nutrition**: If nutritional info is on the page, use it. Otherwise, make reasonable estimates based on the ingredients.`;

            const recipeData = await InvokeLLM({
                prompt: llmPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "EXACT recipe name from the page" },
                        description: { type: "string", description: "Recipe description or summary" },
                        servings: { type: "number", description: "Number of servings" },
                        ingredients: { 
                            type: "array", 
                            items: { 
                                type: "object", 
                                properties: { 
                                    name: { type: "string", description: "The clean name of the ingredient" },
                                    amount: { type: "number", description: "The numeric quantity" },
                                    unit: {
                                        type: "string",
                                        description: "The unit of measurement - use appropriate units for ingredient type"
                                    },
                                    display_amount: { type: "string", description: "The original full text" }
                                },
                                required: ["name", "amount", "unit", "display_amount"]
                            } 
                        },
                        instructions: { 
                            type: "array", 
                            items: { type: "string", description: "EXACT instruction steps as written" } 
                        },
                        estimated_nutrition_per_100g: { 
                            type: "object", 
                            properties: { 
                                calories: { type: "number" }, 
                                protein: { type: "number" }, 
                                carbs: { type: "number" }, 
                                fat: { type: "number" }, 
                                fiber: { type: "number" } 
                            } 
                        },
                        dietary_tags: { 
                            type: "array", 
                            items: { type: "string" }, 
                            description: "Dietary tags like vegetarian, vegan, gluten-free based on ingredients" 
                        },
                        prep_time: { type: "string", description: "Preparation time as stated" },
                        cook_time: { type: "string", description: "Cooking time as stated - REQUIRED" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Difficulty based on complexity - REQUIRED" },
                        source_url: { type: "string", description: "The original URL" }
                    },
                    required: ["name", "ingredients", "instructions", "servings", "cook_time", "difficulty"]
                }
            });

            if (!recipeData || !recipeData.name) {
                throw new Error('Could not extract a valid recipe from the URL. The page might not contain a recipe or may have an unusual format.');
            }

            // Add the source URL for reference
            recipeData.source_url = url;

            // Ensure arrays exist with defaults
            recipeData.ingredients = recipeData.ingredients || [];
            recipeData.instructions = recipeData.instructions || [];
            recipeData.dietary_tags = recipeData.dietary_tags || [];

            // Check if required fields are missing and show validation modal
            const missingFields = [];
            if (!recipeData.difficulty) missingFields.push('difficulty');
            if (!recipeData.cook_time) missingFields.push('cook_time');
            if (!recipeData.servings) missingFields.push('servings');

            if (missingFields.length > 0) {
                setIncompleteRecipe(recipeData);
                setMissingFields(missingFields);
                setShowValidationModal(true);
                setIsLoading(false);
                return;
            }

            // If no missing fields, verify ingredients
            await verifyIngredients(recipeData);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to import recipe. Please check the URL and try again.');
            setIsLoading(false);
        }
    };

    // Function to complete ingredient verification and proceed with recipe import
    const handleIngredientVerificationComplete = async () => {
        setShowIngredientVerification(false);
        setIngredientResults(null);
        await completeRecipeImport(pendingRecipeData); // Use the stored pendingRecipeData
        setPendingRecipeData(null); // Clear pending data
    };

    return (
        <Card className="glass-card shadow-lg border-0 bg-white">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Link className="w-6 h-6 text-lime-600" />
                    Import Recipe from Web
                    {currentUser?.role === 'admin' && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="url"
                        placeholder="https://example.com/your-favorite-recipe"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading || showValidationModal || showIngredientVerification}
                        className="h-12 text-base border-gray-200 focus:border-[#6BBD4F] rounded-xl"
                    />
                    <Button
                        onClick={handleImport}
                        disabled={isLoading || showValidationModal || showIngredientVerification}
                        className="h-12 bg-[#6BBD4F] hover:bg-[#5aa03f] text-white w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            'Import Recipe'
                        )}
                    </Button>
                </div>

                {/* Admin-only public toggle */}
                {currentUser?.role === 'admin' && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <Checkbox
                            id="public"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                            disabled={isLoading || showValidationModal || showIngredientVerification}
                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                        />
                        <Label htmlFor="public" className="text-sm text-red-800 font-medium flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Make this recipe public (visible to all users)
                        </Label>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Placeholder for the validation modal UI */}
                {showValidationModal && incompleteRecipe && (
                    <div className="flex flex-col gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                        <p className="font-semibold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Additional Information Needed
                        </p>
                        <p>The imported recipe is missing the following details:</p>
                        <ul className="list-disc list-inside">
                            {missingFields.map((field, index) => (
                                <li key={index} className="capitalize">{field.replace('_', ' ')}</li>
                            ))}
                        </ul>
                        <p className="text-sm">Please provide these details to complete the import.</p>
                    </div>
                )}

                {/* Ingredient Verification Modal */}
                {showIngredientVerification && ingredientResults && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Ingredient Verification</h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setShowIngredientVerification(false);
                                            setIngredientResults(null);
                                            setPendingRecipeData(null);
                                            setIsLoading(false);
                                        }}
                                        className="hover:bg-gray-100 rounded-full"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* Found ingredients */}
                                    {ingredientResults.found && ingredientResults.found.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Found in Database ({ingredientResults.found.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {ingredientResults.found.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm">{item.ingredient?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Found in USDA */}
                                    {ingredientResults.foundInUSDA && ingredientResults.foundInUSDA.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                                                <Plus className="w-5 h-5" />
                                                Added from USDA Database ({ingredientResults.foundInUSDA.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {ingredientResults.foundInUSDA.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                                        <Plus className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm">{item.ingredient?.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Missing ingredients */}
                                    {ingredientResults.missing && ingredientResults.missing.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5" />
                                                Missing from Database ({ingredientResults.missing.length})
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                                {ingredientResults.missing.map((ingredient, index) => (
                                                    <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                                        <span className="text-sm">{ingredient.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Note:</strong> Admin has been notified that these ingredients do not exist.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                    <Button
                                        onClick={handleIngredientVerificationComplete}
                                        className="flex-1 bg-lime-500 hover:bg-lime-600 text-white"
                                    >
                                        Continue with Recipe Import
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setShowIngredientVerification(false);
                                            setIngredientResults(null);
                                            setPendingRecipeData(null);
                                            setIsLoading(false);
                                        }}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Cancel Import
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
