import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { AppSettings } from "@/api/entities";
import { MealPlan } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock, Star, Check, X, AlertTriangle } from "lucide-react";

export default function PaywallGuard({ 
    feature, 
    children, 
    fallback = null, 
    showUpgradePrompt = true,
    checkType = 'feature' // 'feature', 'meal_plan_limit', 'recipe_swap_limit'
}) {
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [appSettings, setAppSettings] = useState(null);
    const [limitInfo, setLimitInfo] = useState(null);

    useEffect(() => {
        checkAccess();
    }, [feature, checkType]);

    const checkAccess = async () => {
        try {
            const currentUser = await User.me();
            const settings = await AppSettings.list();
            const appConfig = settings.length > 0 ? settings[0] : { premium_enabled_globally: true };
            
            setUser(currentUser);
            setAppSettings(appConfig);

            // Admin always has access
            if (currentUser.role === 'admin') {
                setHasAccess(true);
                setLoading(false);
                return;
            }

            // Global premium override for testing
            if (appConfig.premium_enabled_globally) {
                setHasAccess(true);
                setLoading(false);
                return;
            }

            // Check if user is premium
            const isPremium = (currentUser.subscription_tier === 'premium' && 
                            currentUser.subscription_status === 'active') ||
                            currentUser.admin_granted_premium;

            if (isPremium) {
                setHasAccess(true);
                setLoading(false);
                return;
            }

            // Handle different check types for free users
            if (checkType === 'meal_plan_limit') {
                // Check if free user already has a meal plan
                const existingPlans = await MealPlan.list();
                if (existingPlans.length > 0) {
                    setHasAccess(false);
                    setLimitInfo({
                        type: 'meal_plan_limit',
                        message: 'Free users can save only 1 meal plan. Upgrade to Premium for unlimited meal plans.'
                    });
                } else {
                    setHasAccess(true);
                }
            } else if (checkType === 'recipe_swap_limit') {
                // Check recipe swap limit
                const swapsUsed = currentUser.recipe_swaps_this_month || 0;
                if (swapsUsed >= 5) {
                    setHasAccess(false);
                    setLimitInfo({
                        type: 'recipe_swap_limit',
                        message: `You've used all 5 recipe swaps this month (${swapsUsed}/5). Upgrade to Premium for unlimited swaps.`
                    });
                } else {
                    setHasAccess(true);
                    setLimitInfo({
                        type: 'recipe_swap_remaining',
                        message: `Recipe swaps remaining this month: ${5 - swapsUsed}/5`
                    });
                }
            } else {
                // Regular feature check - free users don't have access
                setHasAccess(false);
            }

        } catch (error) {
            console.error("Error checking access:", error);
            setHasAccess(false);
        }
        setLoading(false);
    };

    const premiumFeatures = {
        'recipe_import': 'Recipe Import from Web',
        'custom_recipes': 'Create Custom Recipes', 
        'save_meal_plans': 'Save & Manage Multiple Meal Plans',
        'unlimited_recipe_swaps': 'Unlimited Recipe Swaps',
        'advanced_grocery': 'Smart Grocery Lists with Price Comparison',
        'pantry_cook': 'Cook from My Pantry',
        'adherence_tracking': 'Full Adherence Tracking & Reporting',
        'ai_nutrition': 'AI Nutrition Guidance',
        'export_features': 'Export to PDF & Email',
        'priority_support': 'Priority Support'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
            </div>
        );
    }

    if (hasAccess) {
        return (
            <>
                {limitInfo && limitInfo.type === 'recipe_swap_remaining' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="text-sm">{limitInfo.message}</p>
                        </div>
                    </div>
                )}
                {children}
            </>
        );
    }

    if (!showUpgradePrompt) {
        return fallback;
    }

    // Customize message based on limit type
    let title = "Premium Feature";
    let description = "Upgrade to Premium to unlock this feature and many more!";
    
    if (limitInfo?.type === 'meal_plan_limit') {
        title = "Meal Plan Limit Reached";
        description = limitInfo.message;
    } else if (limitInfo?.type === 'recipe_swap_limit') {
        title = "Recipe Swap Limit Reached";
        description = limitInfo.message;
    }

    return (
        <Card className="glass-card shadow-xl border-0 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-amber-800 flex items-center justify-center gap-2">
                    <Lock className="w-6 h-6" />
                    {title}
                </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-amber-700 mb-4">
                        {description}
                    </p>
                </div>

                <div className="bg-white/70 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-amber-800 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Free vs Premium Features:
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span>Meal Plan Generation</span>
                            <div className="flex gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                            <span>Saved Meal Plans</span>
                            <div className="flex gap-2">
                                <span className="text-xs text-amber-700">1</span>
                                <span className="text-xs text-amber-700">Unlimited</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                            <span>Recipe Swaps/Month</span>
                            <div className="flex gap-2">
                                <span className="text-xs text-amber-700">5</span>
                                <span className="text-xs text-amber-700">Unlimited</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span>Recipe Import & Custom Recipes</span>
                            <div className="flex gap-2">
                                <X className="w-4 h-4 text-red-600" />
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl shadow-lg">
                        <Crown className="w-5 h-5 mr-2" />
                        Upgrade to Premium - $4.99/month
                    </Button>
                    
                    {appSettings?.premium_enabled_globally && (
                        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                            <Badge className="bg-blue-500 text-white mb-2">
                                Testing Mode
                            </Badge>
                            <p className="text-sm text-blue-800">
                                Premium features are currently enabled for all users during testing.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}