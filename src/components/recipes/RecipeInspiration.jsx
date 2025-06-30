
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  ExternalLink,
  Search,
  Clock,
  Users,
  Plus // New icon for 'Import' button
} from 'lucide-react';

export default function RecipeInspiration({ onImportUrl }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState('all'); // New state for meal type filter
  const [inspirationRecipes, setInspirationRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data based on the previous recipeCategories, transformed into the new structure
  // This simulates fetched data that would come from an API
  const mockAllRecipes = [
    {
      title: "Garlic Butter Chicken",
      image_url: "https://images.unsplash.com/photo-1598511757337-fe2cafc31ba9?w=300&h=200&fit=crop&q=80",
      description: "A quick and easy chicken dish cooked in aromatic garlic butter, perfect for a weeknight meal.",
      cook_time: "20 min",
      servings: "4",
      source_url: "https://cafedelites.com/crispy-garlic-butter-chicken/",
      tags: ["Quick", "Protein", "Chicken", "Easy", "Dinner"]
    },
    {
      title: "One Pan Salmon",
      image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop&q=80",
      description: "Healthy and delicious salmon and asparagus cooked on a single pan for easy cleanup.",
      cook_time: "25 min",
      servings: "2",
      source_url: "https://www.delish.com/cooking/recipe-ideas/recipes/a58974/one-pan-garlic-herb-salmon-asparagus/",
      tags: ["Healthy", "Seafood", "Quick", "Easy", "Dinner"]
    },
    {
      title: "Classic Beef Stew",
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&q=80",
      description: "A hearty and comforting beef stew, slow-cooked to perfection with tender vegetables.",
      cook_time: "2 hours",
      servings: "6",
      source_url: "https://www.simplyrecipes.com/recipes/beef_stew/",
      tags: ["Comfort", "Hearty", "Beef", "Medium", "Dinner"]
    },
    {
      title: "Creamy Mushroom Risotto",
      image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=200&fit=crop&q=80",
      description: "Luxuriously creamy mushroom risotto, a vegetarian delight that's rich and flavorful.",
      cook_time: "45 min",
      servings: "4",
      source_url: "https://www.bonappetit.com/recipe/mushroom-risotto",
      tags: ["Vegetarian", "Creamy", "Italian", "Medium", "Dinner"]
    },
    {
      title: "Mediterranean Quinoa Bowl",
      image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop&q=80",
      description: "A vibrant and healthy quinoa bowl packed with Mediterranean flavors and fresh ingredients.",
      cook_time: "25 min",
      servings: "2",
      source_url: "https://cookieandkate.com/best-quinoa-salad-recipe/",
      tags: ["Vegan", "High Protein", "Healthy", "Easy", "Lunch"]
    },
    {
      title: "Asian Lettuce Wraps",
      image_url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop&q=80",
      description: "Light and flavorful lettuce wraps, a great low-carb alternative for an Asian-inspired meal.",
      cook_time: "30 min",
      servings: "4",
      source_url: "https://damndelicious.net/2014/05/21/pf-changs-chicken-lettuce-wraps/",
      tags: ["Low Carb", "Fresh", "Asian", "Easy", "Lunch"]
    },
    {
      title: "Classic Pavlova",
      image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop&q=80",
      description: "An iconic New Zealand dessert, crispy meringue with a soft center, topped with fresh fruit and cream.",
      cook_time: "1.5 hours",
      servings: "8",
      source_url: "https://www.woolworths.co.nz/recipes/dessert/1134/classic-pavlova",
      tags: ["Dessert", "Kiwi Classic", "Medium"]
    },
    {
      title: "Gypsy Chicken",
      image_url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=200&fit=crop&q=80",
      description: "A unique and hearty New Zealand chicken dish, full of rich flavors.",
      cook_time: "1 hour",
      servings: "4",
      source_url: "https://www.woolworths.co.nz/recipes/dinner/1136/gypsy-chicken",
      tags: ["Local", "Hearty", "Chicken", "Medium", "Dinner"]
    },
    {
      title: "Berry Smoothie",
      image_url: "https://images.unsplash.com/photo-1626082260654-e0c1b72a6b47?w=300&h=200&fit=crop&q=80",
      description: "A refreshing and healthy berry smoothie, perfect for a quick breakfast or snack.",
      cook_time: "5 min",
      servings: "1",
      source_url: "https://example.com/berry-smoothie",
      tags: ["Breakfast", "Snack", "Quick", "Healthy", "Vegan"]
    },
    {
      title: "Energy Bites",
      image_url: "https://images.unsplash.com/photo-1558907361-b5413009d57a?w=300&h=200&fit=crop&q=80",
      description: "No-bake energy bites, great for a pre-workout snack or healthy treat.",
      cook_time: "15 min",
      servings: "10",
      source_url: "https://example.com/energy-bites",
      tags: ["Snack", "Quick", "Healthy", "No-bake"]
    }
  ];

  useEffect(() => {
    // Simulate API call delay
    const fetchRecipes = setTimeout(() => {
      setInspirationRecipes(mockAllRecipes);
      setLoading(false);
    }, 1000); // 1 second delay

    return () => clearTimeout(fetchRecipes);
  }, []);

  // Add fallback image for broken images
  const handleImageError = (e) => {
    e.target.src = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d4388cd35_Flexidiet_Logo_transparent.png";
    e.target.className = "w-full h-48 object-contain bg-gray-100 p-4"; // Change to contain and add padding for logo
  };

  const filteredRecipes = inspirationRecipes.filter(recipe => {
    const matchesSearch = searchTerm === '' ||
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMealType = mealTypeFilter === 'all' ||
      (recipe.tags && recipe.tags.some(tag => {
        const normalizedTag = tag.toLowerCase().replace(/ /g, '_'); // Replace spaces with underscores for consistency
        return normalizedTag === mealTypeFilter || 
               (mealTypeFilter === 'snack' && (normalizedTag.includes('snack') || normalizedTag === 'quick'));
      }));
    
    return matchesSearch && matchesMealType;
  });

  return (
    <div className="space-y-8">
      <Card className="glass-card shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Recipe Inspiration
          </CardTitle>
          <p className="text-gray-600">Discover new recipes from popular cooking sites</p>

          {/* Search and Filters */}
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by recipe name or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-gray-100 focus:border-purple-500 rounded-xl"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                <SelectTrigger className="w-full sm:w-48 h-10 border-2 border-gray-100 focus:border-purple-500 rounded-xl">
                  <SelectValue placeholder="All Meal Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meal Types</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snacks</SelectItem>
                </SelectContent>
              </Select>
              
              {(searchTerm || mealTypeFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setMealTypeFilter('all');
                  }}
                  variant="outline"
                  className="h-10 border-2 border-gray-200 hover:border-purple-500 rounded-xl"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Finding delicious recipes...</p>
            </div>
          ) : (
            <>
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe, index) => (
                    <Card
                      key={index}
                      className="glass-card shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden"
                    >
                      <div className="relative">
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-48 object-cover"
                          onError={handleImageError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <h3 className="absolute bottom-4 left-4 right-4 text-white text-lg font-bold drop-shadow-lg line-clamp-2">
                          {recipe.title}
                        </h3>
                      </div>

                      <CardContent className="p-4 space-y-4">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {recipe.description}
                        </p>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {recipe.cook_time || 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {recipe.servings ? `${recipe.servings} servings` : 'N/A'}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <a href={recipe.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Recipe
                            </a>
                          </Button>

                          <Button
                            onClick={() => onImportUrl(recipe.source_url)}
                            size="sm"
                            className="flex-1 bg-lime-500 hover:bg-lime-600 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Import
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recipes found matching your criteria.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
