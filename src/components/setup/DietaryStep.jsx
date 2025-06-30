
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Heart, Wheat, Milk } from "lucide-react";

export default function DietaryStep({ formData, setFormData, onNext, onBack }) {
  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'bg-green-100 text-green-800' },
    { id: 'vegan', label: 'Vegan', icon: Leaf, color: 'bg-green-100 text-green-800' },
    { id: 'gluten_free', label: 'Gluten Free', icon: Wheat, color: 'bg-amber-100 text-amber-800' },
    { id: 'dairy_free', label: 'Dairy Free', icon: Milk, color: 'bg-blue-100 text-blue-800' },
    { id: 'keto', label: 'Ketogenic', icon: Heart, color: 'bg-purple-100 text-purple-800' },
    { id: 'paleo', label: 'Paleo', icon: Heart, color: 'bg-orange-100 text-orange-800' },
    { id: 'low_carb', label: 'Low Carb', icon: Wheat, color: 'bg-red-100 text-red-800' },
    { id: 'mediterranean', label: 'Mediterranean', icon: Heart, color: 'bg-teal-100 text-teal-800' }
  ];

  const toggleDietary = (optionId) => {
    const current = formData.dietary_requirements || [];
    const updated = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    
    setFormData(prev => ({ ...prev, dietary_requirements: updated }));
  };

  return (
    <Card className="glass-card shadow-2xl border-0 max-w-4xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full flex items-center justify-center">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-charcoal">Dietary Requirements</CardTitle>
        <p className="text-gray-600 mt-2">Select any dietary restrictions or preferences you follow</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dietaryOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = formData.dietary_requirements?.includes(option.id);
            
            return (
              <div
                key={option.id}
                onClick={() => toggleDietary(option.id)}
                className="cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <Card className={`h-full border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-lime-500 bg-lime-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}>
                  <CardContent className="p-4 text-center space-y-3">
                    <div className={`w-12 h-12 mx-auto rounded-full ${option.color.replace('text-', 'bg-').replace('bg-', 'bg-')} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-charcoal">{option.label}</p>
                      {isSelected && (
                        <div className="w-4 h-4 mx-auto bg-lime-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Selected: {formData.dietary_requirements?.length || 0} requirements
          </p>
          {formData.dietary_requirements?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {formData.dietary_requirements.map(req => (
                <Badge key={req} variant="secondary" className="bg-lime-100 text-lime-700">
                  {dietaryOptions.find(opt => opt.id === req)?.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full sm:flex-1 h-14 text-lg font-semibold border-2 border-gray-200 hover:border-lime-500 hover:bg-lime-50 rounded-xl"
          >
            Back
          </Button>
          <Button 
            onClick={onNext}
            className="w-full sm:flex-1 h-14 text-lg font-semibold bg-lime-500 hover:bg-lime-600 text-white rounded-xl shadow-lg transition-all duration-300"
          >
            Continue to Food Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
