import React, { useState, useEffect } from "react";
import { Food } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Apple, Plus, AlertTriangle, BarChart3 } from "lucide-react";
import AdminImportPanel from "../foods/AdminImportPanel";
import AddCustomFoodForm from "../foods/AddCustomFoodForm";
import FoodDatabaseStats from "./FoodDatabaseStats";
import { User } from "@/api/entities";

export default function FoodDatabaseTab() {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadFoods();
    loadCurrentUser();
  }, []);

  const loadFoods = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      
      const userCountry = user.country === 'NZ' ? 'NZ' : 'USA';
      const publicFoods = await Food.filter({ is_public: true, country: userCountry });
      const privateFoods = await Food.filter({ is_public: false, created_by: user.email });
      
      const legacyFoods = await Food.filter({ is_public: true, country: null });
      
      const allFoods = [...publicFoods, ...privateFoods, ...legacyFoods];
      setFoods(allFoods);
    } catch (error) {
      console.error("Error loading foods:", error);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
      setCurrentUser(null);
    }
  };

  const categories = [
    { id: "all", label: "All Foods" },
    { id: "meat", label: "Meat" },
    { id: "starchy_carbs", label: "Starchy Carbs" },
    { id: "vegetables", label: "Vegetables" },
    { id: "good_fats", label: "Good Fats" },
    { id: "fruit", label: "Fruit" },
    { id: "dairy", label: "Dairy" },
    { id: "protein_powder", label: "Protein Powder" },
    { id: "beverages", label: "Beverages" },
    { id: "snacks", label: "Snacks" }
  ];

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-gray-900">
      {/* Toggle Stats View */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Food Database Management</h2>
        <Button
          onClick={() => setShowStats(!showStats)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </Button>
      </div>

      {showStats && <FoodDatabaseStats />}

      <AdminImportPanel onImportComplete={loadFoods} />

      {showCustomForm && (
        <AddCustomFoodForm 
          onFoodAdded={() => {
            loadFoods();
            setShowCustomForm(false);
          }}
          onCancel={() => setShowCustomForm(false)}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Browse Food Database</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
              <Button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="h-12 px-6 ml-4 bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Custom Food
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-10 px-4 rounded-full transition-all duration-300 border-2 font-medium ${
                    selectedCategory === category.id
                      ? 'text-white border-green-500 bg-green-500' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50' 
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {foods.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Apple className="w-16 h-16 mx-auto mb-6 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Foods in Database</h3>
            <p className="text-gray-600 mb-8">
              Use the Admin Panel to import the NZ Food Files to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFoods.map((food) => (
            <Card key={food.id} className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold text-gray-900">{food.name}</CardTitle>
                  <div className="flex flex-col gap-1">
                    {!food.is_public && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Private
                      </Badge>
                    )}
                    {food.is_incomplete && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Incomplete
                      </Badge>
                    )}
                    {food.country && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {food.country}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className="w-fit capitalize bg-green-500 text-white opacity-80"
                >
                  {food.category.replace('_', ' ')}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{Math.round(food.calories_per_100g)}</p>
                    <p className="text-gray-600 text-xs">Cal/100g</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{food.protein_per_100g || 0}g</p>
                    <p className="text-gray-600 text-xs">Protein</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{food.carbs_per_100g || 0}g</p>
                    <p className="text-gray-600 text-xs">Carbs</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900">{food.fat_per_100g || 0}g</p>
                    <p className="text-gray-600 text-xs">Fat</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}