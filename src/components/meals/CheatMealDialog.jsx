import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pizza, X, Calculator } from 'lucide-react';

export default function CheatMealDialog({ meal, onClose }) {
  const [calories, setCalories] = useState(meal?.target_calories || 500);
  const [protein, setProtein] = useState(20);
  const [carbs, setCarbs] = useState(60);
  const [fat, setFat] = useState(25);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-white shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Pizza className="w-6 h-6 text-orange-600" />
              Cheat Meal Options
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Find takeaway options that match your nutritional needs for this meal.
            </p>
          </div>

          {/* Target Nutrition */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Target Nutrition
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-orange-700">Calories</Label>
                <Input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="border-orange-300 focus:border-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-orange-700">Protein (g)</Label>
                <Input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="border-orange-300 focus:border-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-orange-700">Carbs (g)</Label>
                <Input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="border-orange-300 focus:border-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-orange-700">Fat (g)</Label>
                <Input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="border-orange-300 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Placeholder for takeaway options */}
          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
            <Pizza className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-700 mb-2">Takeaway Database Coming Soon</h3>
            <p className="text-sm text-gray-600">
              We're building a comprehensive database of takeaway nutrition info to help you make better cheat meal choices.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Find Options
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}