
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Coffee, Moon, Dumbbell, Apple, Utensils, Cookie } from "lucide-react";
import { UserProfile } from "@/api/entities";

export default function MealScheduleStep({ formData, setFormData, onNext, onBack, isIsolated = false }) {
  const mealOptions = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, time: '7:00 AM', description: 'Start your day right' },
    { id: 'morning_snack', label: 'Morning Snack', icon: Apple, time: '10:00 AM', description: 'Mid-morning fuel' },
    { id: 'lunch', label: 'Lunch', icon: Utensils, time: '12:30 PM', description: 'Midday meal' },
    { id: 'afternoon_snack', label: 'Afternoon Snack', icon: Cookie, time: '3:00 PM', description: 'Afternoon energy' },
    { id: 'dinner', label: 'Dinner', icon: Moon, time: '7:00 PM', description: 'Evening meal' },
    { id: 'post_workout', label: 'Post Workout', icon: Dumbbell, time: 'After exercise', description: 'Recovery nutrition' }
  ];

  const toggleMeal = (mealId) => {
    const current = formData.preferred_meals || [];
    const updated = current.includes(mealId)
      ? current.filter(id => id !== mealId)
      : [...current, mealId];
    
    setFormData(prev => ({ ...prev, preferred_meals: updated }));
  };

  const calculateCalories = () => {
    const { height_cm, weight_kg, age, gender, exercise_sessions_per_week, job_type, goal } = formData;
    
    // Mifflin-St Jeor Formula
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    } else {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }

    // Activity multiplier
    let activityMultiplier = 1.2; // Sedentary
    if (exercise_sessions_per_week >= 1 && exercise_sessions_per_week <= 2) {
      activityMultiplier = 1.375;
    } else if (exercise_sessions_per_week >= 3 && exercise_sessions_per_week <= 4) {
      activityMultiplier = 1.55;
    } else if (exercise_sessions_per_week >= 5) {
      activityMultiplier = 1.725;
    }

    // Job type adjustment
    if (job_type === 'physical') {
      activityMultiplier += 0.2;
    }

    let tdee = bmr * activityMultiplier;

    // Goal adjustment
    if (goal === 'lose_weight') {
      tdee -= 500;
    } else if (goal === 'build_muscle') {
      tdee += 300;
    }

    return Math.round(tdee);
  };

  return (
    <Card className="glass-card shadow-2xl border-0 max-w-4xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full flex items-center justify-center">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-charcoal">Meal Schedule</CardTitle>
        <p className="text-gray-600 mt-2">Select which meals you want to eat each day</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealOptions.map((meal) => {
            const Icon = meal.icon;
            const isSelected = formData.preferred_meals?.includes(meal.id);
            
            return (
              <div
                key={meal.id}
                onClick={() => toggleMeal(meal.id)}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? 'ring-2 ring-lime-500/30' : ''
                }`}
              >
                <Card className={`h-full border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-lime-500 bg-lime-50 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          className="data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
                        />
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-charcoal">{meal.label}</h3>
                      <p className="text-sm font-medium text-lime-600">{meal.time}</p>
                      <p className="text-gray-600 text-sm">{meal.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="bg-lime-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-charcoal mb-2">Your Daily Calorie Target</h3>
          <div className="text-3xl font-bold text-lime-600 mb-2">
            {calculateCalories()} calories
          </div>
          <p className="text-sm text-gray-600">
            Based on your profile and {formData.goal?.replace('_', ' ')} goal
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full sm:flex-1 h-14 text-lg font-semibold border-2 border-gray-200 hover:border-lime-500 hover:bg-lime-50 rounded-xl"
          >
            {isIsolated ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={onNext}
            disabled={!formData.preferred_meals?.length}
            className="w-full sm:flex-1 h-14 text-lg font-semibold bg-lime-500 hover:bg-lime-600 text-white rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isIsolated ? 'Save Changes' : 'Continue to Cooking Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
