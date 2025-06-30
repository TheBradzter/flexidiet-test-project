
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Minus, Plus } from "lucide-react";

export default function GoalsStep({ formData, setFormData, onNext, onBack, isIsolated = false }) {
  const goals = [
    {
      id: 'maintain',
      title: 'Maintain Weight',
      description: 'Keep your current weight stable',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      adjustment: 0
    },
    {
      id: 'lose_weight',
      title: 'Lose Weight',
      description: 'Create a calorie deficit to lose weight',
      icon: Minus,
      color: 'from-red-500 to-red-600',
      adjustment: -500
    },
    {
      id: 'build_muscle',
      title: 'Build Muscle',
      description: 'Add calories to support muscle growth',
      icon: Plus,
      color: 'from-green-500 to-green-600',
      adjustment: +300
    }
  ];

  const selectGoal = (goalId) => {
    setFormData(prev => ({ ...prev, goal: goalId }));
    
    // Auto-proceed to next step when a goal is selected (only in normal wizard flow)
    if (!isIsolated) {
      setTimeout(() => {
        onNext();
      }, 500); // Small delay to show the selection
    }
  };

  return (
    <Card className="glass-card shadow-2xl border-0 max-w-4xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-charcoal">What's your goal?</CardTitle>
        <p className="text-gray-600 mt-2">Choose your fitness objective to customize your meal plan</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = formData.goal === goal.id;
            
            return (
              <div
                key={goal.id}
                onClick={() => selectGoal(goal.id)}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isSelected ? 'ring-4 ring-lime-500/30' : ''
                }`}
              >
                <Card className={`h-full border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-lime-500 bg-lime-50 shadow-xl' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-charcoal">{goal.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{goal.description}</p>
                      <div className="text-sm font-semibold text-lime-600">
                        {goal.adjustment > 0 && '+'}
                        {goal.adjustment} calories
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="w-6 h-6 mx-auto bg-lime-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          {/* Updated button logic to conditionally change text based on isIsolated prop */}
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full sm:flex-1 h-14 text-lg font-semibold border-2 border-gray-200 hover:border-lime-500 hover:bg-lime-50 rounded-xl"
          >
            {isIsolated ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={onNext}
            disabled={!formData.goal}
            className="w-full sm:flex-1 h-14 text-lg font-semibold bg-lime-500 hover:bg-lime-600 text-white rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isIsolated ? 'Save Changes' : 'Continue to Dietary Requirements'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
