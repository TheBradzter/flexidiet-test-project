
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { Food } from "@/api/entities";

export default function AddCustomFoodForm({ onFoodAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    calories_per_100g: "",
    protein_per_100g: "",
    carbs_per_100g: "",
    fat_per_100g: "",
    fiber_per_100g: "",
    sugar_per_100g: "",
    sodium_per_100g: "",
    is_public: false, // Default to private
    dietary_tags: [],
    data_source: "manual"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "meat", label: "Meat" },
    { value: "starchy_carbs", label: "Starchy Carbs" },
    { value: "vegetables", label: "Vegetables" },
    { value: "good_fats", label: "Good Fats" },
    { value: "fruit", label: "Fruit" },
    { value: "dairy", label: "Dairy" },
    { value: "beverages", label: "Beverages" },
    { value: "snacks", label: "Snacks" }
  ];

  const commonTags = ["vegetarian", "vegan", "gluten-free", "dairy-free", "low-carb", "high-protein", "organic"];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter(t => t !== tag)
        : [...prev.dietary_tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.calories_per_100g) {
      alert("Please fill in the required fields: name, category, and calories");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert string numbers to actual numbers
      const processedData = {
        ...formData,
        calories_per_100g: parseFloat(formData.calories_per_100g) || 0,
        protein_per_100g: parseFloat(formData.protein_per_100g) || 0,
        carbs_per_100g: parseFloat(formData.carbs_per_100g) || 0,
        fat_per_100g: parseFloat(formData.fat_per_100g) || 0,
        fiber_per_100g: parseFloat(formData.fiber_per_100g) || 0,
        sugar_per_100g: parseFloat(formData.sugar_per_100g) || 0,
        sodium_per_100g: parseFloat(formData.sodium_per_100g) || 0,
      };

      await Food.create(processedData);
      onFoodAdded();
    } catch (error) {
      console.error("Error creating food:", error);
      alert("Failed to create food. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="glass-card shadow-lg border-0 bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-6 h-6 text-lime-600" />
            Add Your Custom Food
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          This food will be private to you by default. Only you can see and use it in your meal plans.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Food Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Homemade Smoothie"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-sm font-semibold text-gray-700">
                Calories/100g *
              </Label>
              <Input
                id="calories"
                type="number"
                step="0.1"
                value={formData.calories_per_100g}
                onChange={(e) => handleInputChange('calories_per_100g', e.target.value)}
                placeholder="250"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm font-semibold text-gray-700">
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={formData.protein_per_100g}
                onChange={(e) => handleInputChange('protein_per_100g', e.target.value)}
                placeholder="15"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-sm font-semibold text-gray-700">
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={formData.carbs_per_100g}
                onChange={(e) => handleInputChange('carbs_per_100g', e.target.value)}
                placeholder="30"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm font-semibold text-gray-700">
                Fat (g)
              </Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={formData.fat_per_100g}
                onChange={(e) => handleInputChange('fat_per_100g', e.target.value)}
                placeholder="8"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiber" className="text-sm font-semibold text-gray-700">
                Fiber (g)
              </Label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                value={formData.fiber_per_100g}
                onChange={(e) => handleInputChange('fiber_per_100g', e.target.value)}
                placeholder="5"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sugar" className="text-sm font-semibold text-gray-700">
                Sugar (g)
              </Label>
              <Input
                id="sugar"
                type="number"
                step="0.1"
                value={formData.sugar_per_100g}
                onChange={(e) => handleInputChange('sugar_per_100g', e.target.value)}
                placeholder="12"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sodium" className="text-sm font-semibold text-gray-700">
                Sodium (mg)
              </Label>
              <Input
                id="sodium"
                type="number"
                step="0.1"
                value={formData.sodium_per_100g}
                onChange={(e) => handleInputChange('sodium_per_100g', e.target.value)}
                placeholder="150"
                className="h-10 border-2 border-gray-100 focus:border-lime-500 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Dietary Tags</Label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full border-2 text-sm transition-colors ${
                    formData.dietary_tags.includes(tag)
                      ? 'bg-lime-500 text-white border-lime-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-lime-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={formData.is_public}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
              className="data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
            />
            <Label htmlFor="public" className="text-sm text-gray-700">
              Make this food available to all users (not recommended for personal recipes)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-10 border-2 border-gray-200 hover:border-lime-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-10 bg-lime-500 hover:bg-lime-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Food'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
