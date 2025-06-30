
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Sparkles, Loader2, ListX, RefreshCw, Calendar, Tag, Sprout, BookOpen, RotateCcw } from "lucide-react";
import { Recipe } from "@/api/entities";
import { GroceryList } from "@/api/entities";
import { User } from "@/api/entities";
import { AppSettings } from "@/api/entities";
import { Food } from "@/api/entities"; // Added Food entity import
import { format, startOfWeek } from "date-fns";
import PaywallGuard from "../components/subscription/PaywallGuard";

// Dummy function for createPageUrl to make the code runnable and avoid errors
// In a real application, this would likely be imported from a utility file or be part of a routing solution
const createPageUrl = (pageName) => {
  // A basic implementation to construct a URL. Adjust as per actual routing needs.
  switch (pageName) {
    case "FindNewRecipe":
      return "/find-new-recipe"; // Assuming a route like /find-new-recipe
    default:
      return `/${pageName.toLowerCase().replace(/ /g, '-')}`;
  }
};

export default function GroceryListPage() {
  const [currentGroceryList, setCurrentGroceryList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(new Set());
  const [sourceRecipes, setSourceRecipes] = useState([]);
  const [hasPriceCheckAccess, setHasPriceCheckAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    loadExistingGroceryList();
    checkPriceCheckAccess();
  }, []);

  useEffect(() => {
    if (currentGroceryList) {
      const getSourceRecipesFromList = (list) => {
        if (!list?.categories) return [];
        const recipeNames = new Set();
        Object.values(list.categories).forEach(items => {
          items.forEach(item => {
            if (item.source_recipes) {
              item.source_recipes.forEach(recipeName => {
                recipeNames.add(recipeName);
              });
            }
          });
        });
        return Array.from(recipeNames).map(name => ({ name, checked: true }));
      };
      setSourceRecipes(getSourceRecipesFromList(currentGroceryList));
    }
  }, [currentGroceryList]);

  const checkPriceCheckAccess = async () => {
    try {
        const currentUser = await User.me();
        const settings = await AppSettings.list();
        const appConfig = settings.length > 0 ? settings[0] : { premium_enabled_globally: true };
        
        if (currentUser.role === 'admin' || appConfig.premium_enabled_globally) {
            setHasPriceCheckAccess(true);
            return;
        }

        const isPremium = (currentUser.subscription_tier === 'premium' && 
                        currentUser.subscription_status === 'active') ||
                        currentUser.admin_granted_premium;
        
        setHasPriceCheckAccess(isPremium);

    } catch (error) {
        console.error("Error checking price check access:", error);
        setHasPriceCheckAccess(false);
    } finally {
        setCheckingAccess(false);
    }
  };

  const loadExistingGroceryList = async () => {
    setLoading(true);
    try {
      const lists = await GroceryList.list('-created_date', 1);
      if (lists.length > 0) {
        setCurrentGroceryList(lists[0]);
      }
    } catch (error) {
      console.error("Error loading grocery list:", error);
    }
    setLoading(false);
  };

  // Define pantry staples that should be grouped together
  const PANTRY_STAPLES = [
    'salt', 'pepper', 'black pepper', 'white pepper', 'sea salt', 'kosher salt',
    'oil', 'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'avocado oil',
    'flour', 'all-purpose flour', 'plain flour', 'self-raising flour', 'wholemeal flour',
    'sugar', 'white sugar', 'brown sugar', 'caster sugar', 'icing sugar', 'raw sugar',
    'baking powder', 'baking soda', 'bicarbonate of soda',
    'vanilla', 'vanilla extract', 'vanilla essence',
    'cinnamon', 'ground cinnamon', 'cinnamon powder',
    'paprika', 'smoked paprika', 'sweet paprika',
    'cumin', 'ground cumin', 'cumin seeds',
    'oregano', 'dried oregano', 'fresh oregano',
    'thyme', 'dried thyme', 'fresh thyme',
    'basil', 'dried basil', 'fresh basil',
    'garlic powder', 'onion powder',
    'vinegar', 'white vinegar', 'apple cider vinegar', 'balsamic vinegar',
    'soy sauce', 'light soy sauce', 'dark soy sauce',
    'stock', 'chicken stock', 'beef stock', 'vegetable stock',
    'broth', 'chicken broth', 'beef broth', 'vegetable broth',
    'honey', 'maple syrup', 'golden syrup',
    'mustard', 'dijon mustard', 'wholegrain mustard',
    'ketchup', 'tomato sauce', 'tomato ketchup',
    'mayonnaise', 'mayo', 'whole egg mayonnaise',
    'worcestershire sauce', 'worcestershire',
    'tomato paste', 'tomato puree',
    'curry powder', 'garam masala', 'turmeric',
    'chili powder', 'cayenne pepper', 'red pepper flakes',
    'sesame oil', 'fish sauce', 'oyster sauce',
    'cornstarch', 'cornflour', 'arrowroot',
    'yeast', 'active dry yeast', 'instant yeast'
  ];

  const isPantryStaple = (ingredientName) => {
    const name = ingredientName.toLowerCase().trim();
    return PANTRY_STAPLES.some(staple =>
      name.includes(staple) || staple.includes(name)
    );
  };

  const categorizeIngredient = (ingredientName) => {
    const name = ingredientName.toLowerCase().trim();

    // Check pantry staples first
    if (isPantryStaple(name)) {
      return 'Pantry Staples';
    }

    // Meat and proteins
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
        name.includes('lamb') || name.includes('fish') || name.includes('salmon') ||
        name.includes('tuna') || name.includes('bacon') || name.includes('ham') ||
        name.includes('turkey') || name.includes('prawns') || name.includes('shrimp')) {
      return 'Meat & Seafood';
    }

    // Dairy
    if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
        name.includes('yoghurt') || name.includes('cream') || name.includes('butter') ||
        name.includes('eggs') || name.includes('egg')) {
      return 'Dairy & Eggs';
    }

    // Produce
    if (name.includes('onion') || name.includes('garlic') || name.includes('tomato') ||
        name.includes('carrot') || name.includes('potato') || name.includes('lettuce') ||
        name.includes('spinach') || name.includes('broccoli') || name.includes('pepper') ||
        name.includes('mushroom') || name.includes('apple') || name.includes('banana') ||
        name.includes('orange') || name.includes('lemon') || name.includes('lime') ||
        name.includes('avocado') || name.includes('cucumber') || name.includes('celery')) {
      return 'Fresh Produce';
    }

    // Frozen
    if (name.includes('frozen')) {
      return 'Frozen Foods';
    }

    // Bakery
    if (name.includes('bread') || name.includes('rolls') || name.includes('bagel') ||
        name.includes('croissant') || name.includes('muffin')) {
      return 'Bakery';
    }

    // Default to grocery
    return 'Grocery Items';
  };

  // Define items that should be excluded from grocery lists
  const EXCLUDED_INGREDIENTS = [
    'water', 'tap water', 'cold water', 'warm water', 'hot water', 'boiling water',
    'ice', 'ice cubes'
  ];

  // US to NZ ingredient name mapping with aliases
  const US_TO_NZ_MAPPING = {
    'skirt steak': { name: 'beef skirt', aliases: ['minute steak'] },
    'flank steak': { name: 'beef flank', aliases: [] }, 
    'chuck roast': { name: 'blade roast', aliases: [] },
    'ground beef': { name: 'beef mince', aliases: [] },
    'cilantro': { name: 'coriander', aliases: [] },
    'arugula': { name: 'rocket', aliases: [] },
    'eggplant': { name: 'aubergine', aliases: [] },
    'zucchini': { name: 'courgette', aliases: [] },
    'bell pepper': { name: 'capsicum', aliases: [] },
    'green onions': { name: 'spring onions', aliases: [] },
    'scallions': { name: 'spring onions', aliases: [] },
    'ketchup': { name: 'tomato sauce', aliases: ['tomato ketchup'] },
    'tomato ketchup': { name: 'tomato sauce', aliases: ['ketchup'] }
  };

  // Convert imperial measurements to metric for NZ users
  const convertToMetric = (amount, unit) => {
    const conversions = {
      'lb': { factor: 453.592, newUnit: 'g' },
      'lbs': { factor: 453.592, newUnit: 'g' },
      'oz': { factor: 28.3495, newUnit: 'g' },
      'fluid oz': { factor: 29.5735, newUnit: 'ml' },
      'fl oz': { factor: 29.5735, newUnit: 'ml' }
    };

    const lowerCaseUnit = unit ? unit.toLowerCase() : '';

    if (conversions[lowerCaseUnit]) {
      const converted = amount * conversions[lowerCaseUnit].factor;
      let newUnit = conversions[lowerCaseUnit].newUnit;
      
      // Convert to kg if grams are > 1000
      if (newUnit === 'g' && converted >= 1000) {
        return { amount: +(converted / 1000).toFixed(2), unit: 'kg' };
      }
      
      return { amount: +converted.toFixed(0), unit: newUnit };
    }
    
    return { amount, unit };
  };

  // Format display amount with proper fractions and remove leading zeros
  const formatDisplayAmount = (amount, unit) => {
    let numAmount = parseFloat(amount);
    
    // Convert decimals to fractions for cups, tablespoons, teaspoons
    const fractionUnits = ['cups', 'cup', 'tbsp', 'tablespoons', 'tsp', 'teaspoons'];
    if (fractionUnits.includes(unit?.toLowerCase() || '')) {
      if (numAmount === 0.25) return '1/4';
      if (numAmount === 0.5) return '1/2';
      if (numAmount === 0.75) return '3/4';
      if (numAmount === 0.33 || numAmount === 0.333) return '1/3';
      if (numAmount === 0.67 || numAmount === 0.667) return '2/3';
    }
    
    // Remove .0 from whole numbers
    if (numAmount % 1 === 0) {
      return numAmount.toString();
    }
    
    return numAmount.toString();
  };

  // Generic ingredient grouping with aliases - now enhanced to check Food database
  const getGenericIngredientName = async (ingredientName) => {
    const name = ingredientName.toLowerCase().trim();
    
    // First, try to find this ingredient in the Food database
    try {
      const foods = await Food.filter({ name: ingredientName });
      if (foods.length > 0 && foods[0].aliases && foods[0].aliases.length > 0) {
        return { name: foods[0].name, aliases: foods[0].aliases };
      }
    } catch (error) {
      // console.log("Could not fetch food aliases:", error); // Keep this commented unless for debugging
    }
    
    // Group potato varieties
    if (name.includes('potato') || name.includes('russet') || name.includes('yukon') || 
        name.includes('red potato') || name.includes('fingerling')) {
      return { name: 'potatoes', aliases: [] };
    }
    
    // Group onion varieties  
    if (name.includes('yellow onion') || name.includes('white onion') || 
        name.includes('brown onion') || name.includes('cooking onion')) {
      return { name: 'onions', aliases: [] };
    }
    
    // Group tomato varieties
    if (name.includes('roma tomato') || name.includes('cherry tomato') || 
        name.includes('beef tomato') || name.includes('vine tomato')) {
      return { name: 'tomatoes', aliases: [] };
    }

    // Group capsicum varieties
    if (name.includes('red pepper') || name.includes('green pepper') || 
        name.includes('yellow pepper') || name.includes('orange pepper') || name.includes('bell pepper')) {
      return { name: 'capsicum', aliases: [] };
    }
    
    // Apply US to NZ mapping (keep as fallback)
    const mapped = US_TO_NZ_MAPPING[name];
    if (mapped) return mapped;
    
    return { name: ingredientName, aliases: [] }; // Return original if no grouping needed
  };

  // Smart unit assignment based on ingredient type
  const getSmartUnit = (ingredientName) => {
    const name = ingredientName.toLowerCase();
    
    // Liquids - including oils
    if (name.includes('wine') || name.includes('broth') || name.includes('stock') || 
        name.includes('oil') || name.includes('vinegar') || name.includes('milk') ||
        name.includes('cream') || name.includes('sauce') || name.includes('juice')) {
      return 'tbsp'; // Changed from 'cups' to 'tbsp' for more practical amounts
    }

    // Common spices that should show without quantities (people usually have these)
    if (name.includes('salt') || name.includes('pepper') || name.includes('paprika') || 
        name.includes('oregano') || name.includes('cumin') || name.includes('cinnamon') ||
        name.includes('thyme') || name.includes('rosemary') || name.includes('basil') ||
        name.includes('garlic powder') || name.includes('onion powder') || 
        name.includes('chili powder') || name.includes('curry powder') ||
        name.includes('turmeric') || name.includes('cayenne') || name.includes('smoked paprika')) {
      return ''; // No unit - just show ingredient name
    }
    
    // Fresh herbs and small amount ingredients
    if (name.includes('parsley') || name.includes('cilantro') || name.includes('coriander') ||
        name.includes('dill') || name.includes('sage') || name.includes('mint')) {
      return 'tbsp';
    }
    
    // Small items (cloves/pieces usually)
    if (name.includes('garlic') || name.includes('ginger') || name.includes('chives') ||
        name.includes('green onion') || name.includes('spring onion')) {
      return 'cloves';
    }
    
    // Powders and dry goods (larger amounts)
    if (name.includes('flour') || name.includes('sugar') || name.includes('cornstarch') ||
        name.includes('baking powder') || name.includes('baking soda')) {
      return 'cups';
    }
    
    // Meat and fish
    if (name.includes('chicken') || name.includes('beef') || name.includes('pork') ||
        name.includes('fish') || name.includes('salmon') || name.includes('steak')) {
      return 'g';
    }
    
    // Default to no unit for other items
    return '';
  };

  // Check if ingredient should show quantity (spices typically don't need quantities)
  const shouldShowQuantity = (ingredientName) => {
    const name = ingredientName.toLowerCase();
    
    // Basic spices that people usually have - don't show quantity
    const basicSpices = [
      'salt', 'pepper', 'black pepper', 'white pepper',
      'paprika', 'smoked paprika', 'oregano', 'thyme', 'basil',
      'cumin', 'cinnamon', 'garlic powder', 'onion powder',
      'chili powder', 'curry powder', 'turmeric', 'cayenne'
    ];
    
    return !basicSpices.some(spice => name.includes(spice));
  };

  // Fix unit issues - some ingredients are incorrectly getting 'pieces' unit
  const fixIngredientUnit = (ingredient) => {
    const smartUnit = getSmartUnit(ingredient.name);
    
    // Always use the smart unit over the existing unit for consistency
    return { ...ingredient, unit: smartUnit };
  };

  // Format ingredient name with aliases
  const formatIngredientWithAliases = (nameObj) => {
    if (!nameObj.aliases || nameObj.aliases.length === 0) {
      return nameObj.name;
    }
    
    if (nameObj.aliases.length === 1) {
      return `${nameObj.name} (AKA ${nameObj.aliases[0]})`;
    }
    
    return `${nameObj.name} (AKA ${nameObj.aliases.join(' or ')})`;
  };

  const handleGenerateList = async () => {
    setGenerating(true);
    setError(null);
    setSourceRecipes([]); // Clear previous recipe sources

    try {
      const user = await User.me();
      const publicRecipes = await Recipe.filter({ is_public: true });
      const privateRecipes = await Recipe.filter({ is_public: false, created_by: user.email });
      const allRecipes = [...publicRecipes, ...privateRecipes];

      if (allRecipes.length === 0) {
        setError("You have no recipes to generate a list from. Add some recipes first!");
        setGenerating(false);
        return;
      }

      // Manual consolidation - build ingredient map with recipe sources
      const ingredientMap = new Map();

      // Process recipes sequentially to handle async getGenericIngredientName calls
      for (const recipe of allRecipes) {
        if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
          for (const ingredient of recipe.ingredients) {
            if (!ingredient.name) {
              continue;
            }
            
            // Skip excluded ingredients like water
            if (EXCLUDED_INGREDIENTS.some(excluded => 
              ingredient.name.toLowerCase().includes(excluded))) {
              continue;
            }

            // Fix unit issues first
            const fixedIngredient = fixIngredientUnit(ingredient);
            
            // Get generic name for grouping (now returns object with aliases from database)
            const genericNameObj = await getGenericIngredientName(fixedIngredient.name);
            const key = genericNameObj.name.toLowerCase().trim();
            
            if (!ingredientMap.has(key)) {
              ingredientMap.set(key, {
                nameObj: genericNameObj,
                totalAmount: 0,
                unit: fixedIngredient.unit || '',
                source_recipes: []
              });
            }

            const item = ingredientMap.get(key);
            item.totalAmount += fixedIngredient.amount || 1;
            
            // Add recipe name to source_recipes if not already there
            if (recipe.name && !item.source_recipes.includes(recipe.name)) {
              item.source_recipes.push(recipe.name);
            }
          }
        } else {
          // console.log(`Recipe "${recipe.name}" has no valid ingredients array.`); // Debugging line removed
        }
      }

      // Categorize ingredients manually
      const categories = {};
      
      ingredientMap.forEach((item, key) => {
        const category = categorizeIngredient(item.nameObj.name);
        
        if (!categories[category]) {
          categories[category] = [];
        }
        
        // Convert measurements to metric for NZ users
        const { amount: convertedAmount, unit: convertedUnit } = convertToMetric(item.totalAmount, item.unit);
        
        // Check if we should show quantity for this ingredient
        const showQuantity = shouldShowQuantity(item.nameObj.name);
        const displayAmount = showQuantity ? formatDisplayAmount(convertedAmount, convertedUnit) : '';
        const displayUnit = showQuantity ? convertedUnit : '';
        
        // Format name with aliases
        const displayName = formatIngredientWithAliases(item.nameObj);
        
        const finalItem = {
          name: displayName,
          quantity: displayAmount,
          unit: displayUnit,
          checked: false, // Pantry staples are no longer checked by default
          source_recipes: item.source_recipes || [],
          show_quantity: showQuantity // Add flag to track if quantity should be displayed
        };
        
        categories[category].push(finalItem);
      });

      const groceryListData = {
        week_start_date: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
        categories: categories,
        total_recipes: allRecipes.length,
        generated_date: new Date().toISOString()
      };

      const savedList = await GroceryList.create(groceryListData);
      setCurrentGroceryList(savedList);
      setPrices({});

    } catch (err) {
      console.error("Failed to generate grocery list:", err);
      setError("An error occurred while generating the list. Please try again.");
    }
    setGenerating(false);
  };
  
  const handleToggleRecipe = (recipeNameToToggle) => {
    setSourceRecipes(prevRecipes =>
      prevRecipes.map(recipe =>
        recipe.name === recipeNameToToggle
          ? { ...recipe, checked: !recipe.checked }
          : recipe
      )
    );
  };

  const handleToggleItem = async (category, itemToToggle) => {
    if (!currentGroceryList) return;

    const updatedCategories = JSON.parse(JSON.stringify(currentGroceryList.categories));
    
    let itemFound = false;
    if (updatedCategories[category]) {
        const itemIndex = updatedCategories[category].findIndex(i => 
            i.name === itemToToggle.name && 
            i.quantity === itemToToggle.quantity && 
            i.unit === itemToToggle.unit
        );

        if (itemIndex > -1) {
            updatedCategories[category][itemIndex].checked = !updatedCategories[category][itemIndex].checked;
            itemFound = true;
        }
    }

    if (!itemFound) {
        console.error("Could not find item to toggle in master list");
        return;
    }

    try {
      await GroceryList.update(currentGroceryList.id, { categories: updatedCategories });
      setCurrentGroceryList(prev => ({
        ...prev,
        categories: updatedCategories
      }));
    } catch (error) {
      console.error("Error updating grocery list:", error);
    }
  };

  const handleToggleCategory = async (categoryName) => {
    if (!currentGroceryList) return;

    const updatedCategories = { ...currentGroceryList.categories };
    const items = updatedCategories[categoryName];
    
    // If all are checked, uncheck all. Otherwise, check all.
    const allChecked = items.every(item => item.checked);
    const newCheckedState = !allChecked;

    updatedCategories[categoryName] = items.map(item => ({
        ...item,
        checked: newCheckedState
    }));

    try {
        await GroceryList.update(currentGroceryList.id, { categories: updatedCategories });
        setCurrentGroceryList(prev => ({
            ...prev,
            categories: updatedCategories
        }));
    } catch (error) {
        console.error("Error updating grocery list category:", error);
    }
  };

  const handleFetchPrice = async (itemName) => {
    setLoadingPrices(prev => new Set(prev).add(itemName));

    const searchUrls = [
      { name: "New World", url: `https://www.newworld.co.nz/shop/search?q=${encodeURIComponent(itemName)}` },
      { name: "Woolworths", url: `https://www.woolworths.co.nz/shop/searchproducts?search=${encodeURIComponent(itemName)}` },
      { name: "Pak'nSave", url: `https://www.paknsave.co.nz/shop/search?q=${encodeURIComponent(itemName)}` },
    ];

    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

    setPrices(prev => ({
      ...prev,
      [itemName]: { searchUrls: searchUrls }
    }));

    setLoadingPrices(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemName);
      return newSet;
    });
  };

  const displayedCategories = useMemo(() => {
    if (!currentGroceryList?.categories) return {};

    const checkedRecipeNames = new Set(
      sourceRecipes.filter(r => r.checked).map(r => r.name)
    );

    // If sourceRecipes is not populated yet, it means the list just loaded.
    if (sourceRecipes.length === 0) {
      return currentGroceryList.categories;
    }

    // If no recipes are checked, the list should be empty.
    if (checkedRecipeNames.size === 0 && sourceRecipes.length > 0) {
        return {};
    }

    const resultCategories = {};
    for (const categoryName in currentGroceryList.categories) {
        const items = currentGroceryList.categories[categoryName];

        const newItems = items
            .map(item => {
                // For each item, filter its source_recipes to only include checked recipes
                const relevantSources = item.source_recipes?.filter(src => checkedRecipeNames.has(src));
                
                // If the item is still relevant (has sources from checked recipes)
                if (relevantSources && relevantSources.length > 0) {
                    // Return a new item object with the correctly filtered sources
                    return { ...item, source_recipes: relevantSources };
                }
                
                // This item is no longer needed, so return null to filter it out
                return null;
            })
            .filter(Boolean); // This removes all the null items

        // If the category still has items after filtering, add it to the final result
        if (newItems.length > 0) {
            resultCategories[categoryName] = newItems;
        }
    }
    
    return resultCategories;
  }, [currentGroceryList, sourceRecipes]);

  const getCompletionStats = () => {
    if (!currentGroceryList) return { total: 0, checked: 0 };

    let total = 0;
    let checked = 0;

    Object.values(displayedCategories).forEach(items => {
      total += items.length;
      checked += items.filter(item => item.checked).length;
    });

    return { total, checked };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#005A8D]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading your grocery list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 text-white" style={{ backgroundColor: '#005A8D' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Grocery List</h1>
            <p className="text-cyan-200 mt-1">Smart shopping list from all your recipes</p>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-red-700 font-medium text-center">
              {error}
            </CardContent>
          </Card>
        )}

        {currentGroceryList && (
          <>
            <Card className="glass-card shadow-xl border-0 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-cyan-800" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Week of {format(new Date(currentGroceryList.week_start_date), 'MMM d, yyyy')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        From {currentGroceryList.total_recipes} recipes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#6BBD4F]">
                      {stats.checked}/{stats.total}
                    </p>
                    <p className="text-sm text-gray-600">items completed</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#6BBD4F] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.checked / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cyan-800" />
                  Your Recipes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sourceRecipes.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4 -mt-2">
                      If any recipe is proving too expensive, untick this recipe and it will not show on your grocery list. You can also replace this recipe by clicking the <RotateCcw className="w-4 h-4 inline mx-1" /> icon.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {sourceRecipes.map(recipe => (
                        <div key={recipe.name} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border">
                          <Checkbox
                            id={`recipe-${recipe.name}`}
                            checked={recipe.checked}
                            onCheckedChange={() => handleToggleRecipe(recipe.name)}
                            className="data-[state=checked]:bg-[#6BBD4F]"
                          />
                          <Label
                            htmlFor={`recipe-${recipe.name}`}
                            className="text-sm font-medium text-gray-800 flex-1 cursor-pointer"
                          >
                            {recipe.name}
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-[#005A8D] hover:bg-blue-50"
                            title="Replace this recipe"
                            onClick={() => {
                              // Navigate to Find New Recipe page with context
                              window.location.href = createPageUrl("FindNewRecipe") + `?replace=${encodeURIComponent(recipe.name)}`;
                            }}
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleGenerateList}
                        disabled={generating}
                        className="w-full h-12 px-6 text-white rounded-xl shadow-lg transition-colors bg-[#6BBD4F] hover:bg-[#5aa03f]"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate List
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                      <p className="text-gray-600">No recipes found in the generated list.</p>
                      <Button
                        onClick={handleGenerateList}
                        disabled={generating}
                        className="mt-4 h-12 px-6 text-white rounded-xl shadow-lg transition-colors bg-[#6BBD4F] hover:bg-[#5aa03f]"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Generate List
                          </>
                        )}
                      </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card shadow-xl border-0 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-cyan-800" />
                  Your Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.keys(displayedCategories).length > 0 ? (
                  Object.entries(displayedCategories)
                    .sort(([a], [b]) => {
                      if (a === 'Pantry Staples') return -1; // Pantry Staples at top
                      if (b === 'Pantry Staples') return 1;
                      if (a === 'Fresh Produce') return -1; // Produce after Pantry Staples
                      if (b === 'Fresh Produce') return 1;
                      return a.localeCompare(b);
                    })
                    .map(([category, items]) => (
                    items.length > 0 && (
                      <div key={category}>
                        <div className="flex items-center justify-between border-b-2 border-[#6BBD4F]/30 pb-2 mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {category === 'Pantry Staples' && <Sprout className="w-5 h-5 text-cyan-700" />}
                            {category}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`select-all-${category}`} className="text-sm font-medium text-gray-600 cursor-pointer">
                              {`Tick All ${category}`}
                            </Label>
                            <Checkbox
                                id={`select-all-${category}`}
                                checked={
                                    items.length > 0 && items.every(item => item.checked)
                                    ? true
                                    : items.some(item => item.checked)
                                    ? 'indeterminate'
                                    : false
                                }
                                onCheckedChange={() => handleToggleCategory(category)}
                                className="data-[state=checked]:bg-[#6BBD4F] data-[state=indeterminate]:bg-[#6BBD4F]/80"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          {items.map((item, index) => {
                            const priceInfo = prices[item.name];
                            const isLoadingPrice = loadingPrices.has(item.name);

                            return (
                              <div
                                key={`${item.name}-${index}`}
                                className={`flex items-center space-x-4 p-3 rounded-lg border-2 transition-all min-h-[60px] ${
                                  item.checked
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-gray-100 bg-white hover:border-[#6BBD4F]/50'
                                }`}
                              >
                                <Checkbox
                                  id={`${category}-${item.name}-${index}`}
                                  checked={item.checked}
                                  onCheckedChange={() => handleToggleItem(category, item)}
                                  className="mt-1 data-[state=checked]:bg-[#6BBD4F] flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`${category}-${item.name}-${index}`}
                                    className={`block text-sm font-medium cursor-pointer ${
                                      item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                                    }`}
                                  >
                                    {item.show_quantity && item.quantity ? (
                                      `${item.quantity} ${item.unit} ${item.name}`.trim()
                                    ) : (
                                      item.name
                                    )}
                                  </Label>
                                  <div className="text-xs mt-1">
                                    <p className="text-blue-600 font-medium">
                                      {item.source_recipes && Array.isArray(item.source_recipes) && item.source_recipes.length > 0 
                                        ? `Used in: ${item.source_recipes.join(', ')}` 
                                        : 'No recipe source found'
                                      }
                                    </p>
                                  </div>
                                </div>

                                <div className="w-24 text-right flex-shrink-0">
                                  {checkingAccess ? (
                                      <Button size="sm" variant="outline" disabled className="h-8 w-full">
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                      </Button>
                                  ) : hasPriceCheckAccess ? (
                                    <>
                                      {isLoadingPrice ? (
                                        <Button size="sm" variant="outline" disabled className="h-8 w-full">
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        </Button>
                                      ) : priceInfo ? (
                                        <div className="space-y-1">
                                          {priceInfo.searchUrls && priceInfo.searchUrls.slice(0, 3).map((site, idx) => (
                                            <Button
                                              key={idx}
                                              asChild
                                              size="sm"
                                              variant="outline"
                                              className="h-6 w-full text-xs text-blue-600 hover:bg-blue-50 px-1"
                                            >
                                              <a
                                                href={site.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  window.open(site.url, '_blank', 'width=1200,height=800');
                                                }}
                                              >
                                                {site.name}
                                              </a>
                                            </Button>
                                          ))}
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleFetchPrice(item.name)}
                                          className="h-8 px-2 text-xs w-full"
                                        >
                                          <Tag className="w-3 h-3 mr-1"/>
                                          Price
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-center">
                                      <div className="text-xs text-gray-400 italic">
                                        Price check
                                      </div>
                                      <div className="text-xs text-cyan-600 font-medium">
                                        Premium
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  ))
                ) : (
                  <div className="text-center py-10">
                      <ListX className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700">Your shopping list is empty.</h3>
                      <p className="text-gray-500">Tick some recipes above to see the required ingredients.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!generating && !currentGroceryList && !error && (
          <Card className="glass-card shadow-2xl border-0 bg-white">
            <CardContent className="p-12 text-center">
              <ListX className="w-16 h-16 mx-auto mb-6 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Smart List Awaits</h3>
              <p className="text-gray-600 mb-8">
                Generate a consolidated shopping list with quantities from all your recipes.
              </p>
              <Button
                onClick={handleGenerateList}
                className="h-14 px-8 text-lg font-semibold bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-lg"
              >
                <Sparkles className="mr-3 h-5 w-5" />
                Generate Shopping List
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
