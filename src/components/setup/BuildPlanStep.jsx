import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChefHat, Loader2 } from "lucide-react";
import { generateMealPlan } from "@/api/functions";

export default function BuildPlanStep({ formData, onNext, onBack, hasExistingProfile = false }) {
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically build the plan for new users when this step is reached.
        if (!hasExistingProfile) {
            handleBuildMealPlan();
        }
    }, [hasExistingProfile]);

    const handleBuildMealPlan = async () => {
        try {
            // First, save the complete profile data by calling the function from SetupPage.
            await onNext(); 
            
            // Then, generate and save the meal plan via the backend function.
            const { data } = await generateMealPlan();
            
            if (data && data.success) {
                // On success, navigate to the meal plan page to display the new plan.
                navigate(createPageUrl("MealPlan"));
            } else {
                throw new Error(data.error || 'Failed to generate meal plan');
            }
        } catch (error) {
            console.error("Failed to save profile and generate meal plan:", error);
            alert("There was an issue generating your meal plan. You can try again manually from the Meal Plan page.");
            // Navigate to the meal plan page even if generation fails, so user isn't stuck.
            navigate(createPageUrl("MealPlan"));
        }
    };
    
    // This view is for existing users who might have been editing a profile step.
    // It's a simple confirmation.
    if (hasExistingProfile) {
        return (
             <Card className="glass-card shadow-2xl border-0 max-w-4xl mx-auto">
                <CardHeader className="text-center pb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-lime-500 to-lime-600 rounded-full flex items-center justify-center">
                        <ChefHat className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-charcoal">Update Complete</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 text-center">
                    <p className="text-gray-600 text-lg">Your profile has been updated.</p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <Button onClick={onBack} variant="outline" className="w-full sm:flex-1 h-14 text-lg font-semibold rounded-xl">Back</Button>
                        <Button onClick={onNext} className="w-full sm:flex-1 h-14 text-lg font-semibold bg-lime-500 text-white rounded-xl">
                            Return to Meal Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    // This is the view for new users. It's an automatic loading screen.
    return (
        <Card className="glass-card shadow-2xl border-0 max-w-4xl mx-auto">
            <CardContent className="p-8 sm:p-12 text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-6 text-lime-500 animate-spin" />
                <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-4">Building Your Plan...</h2>
                <p className="text-gray-600 text-lg mb-4">
                    We're generating your first personalized meal plan.
                </p>
                <p className="text-gray-600 text-base sm:text-lg mb-8">
                    This will only take a moment!
                </p>
            </CardContent>
        </Card>
    );
}