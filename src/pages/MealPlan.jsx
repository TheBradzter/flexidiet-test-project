
import React, { useState, useEffect } from "react";
import { UserProfile } from "@/api/entities";
import { MealPlan } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Utensils, RotateCcw, ClipboardCheck, AlertTriangle, CheckCircle2, LayoutGrid, List, ShoppingCart, Grid3X3 } from "lucide-react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PaywallGuard from "../components/subscription/PaywallGuard";
import { generateMealPlan } from "@/api/functions";

export default function MealPlanPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adherence, setAdherence] = useState(87); // Placeholder value for demo
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'

  const navigate = useNavigate();

  useEffect(() => {
    loadUserAndData();
  }, []);

  // Calculate macro targets
  const getMacroTargets = () => {
    if (!profile?.daily_calorie_target) return null;
    
    const totalCalories = profile.daily_calorie_target;
    // Default split: 40% carbs, 40% protein, 20% fat
    // 1g carb = 4 cal, 1g protein = 4 cal, 1g fat = 9 cal
    
    const carbCalories = totalCalories * 0.4;
    const proteinCalories = totalCalories * 0.4;
    const fatCalories = totalCalories * 0.2;
    
    return {
      carbs: Math.round(carbCalories / 4),
      protein: Math.round(proteinCalories / 4),
      fat: Math.round(fatCalories / 9)
    };
  };

  const macroTargets = getMacroTargets();

  // Calculate daily nutritional totals
  const getDayNutrition = (dayPlan) => {
    if (!dayPlan?.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return dayPlan.meals.reduce((total, meal) => {
      // For now, use estimated values - in future this would be calculated from actual recipe ingredients
      const mealNutrition = {
        calories: meal.actual_calories || meal.target_calories || 0,
        protein: Math.round((meal.actual_calories || meal.target_calories || 0) * 0.4 / 4),
        carbs: Math.round((meal.actual_calories || meal.target_calories || 0) * 0.4 / 4),
        fat: Math.round((meal.actual_calories || meal.target_calories || 0) * 0.2 / 9)
      };
      
      return {
        calories: total.calories + mealNutrition.calories,
        protein: total.protein + mealNutrition.protein,
        carbs: total.carbs + mealNutrition.carbs,
        fat: total.fat + mealNutrition.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const loadUserAndData = async () => {
    try {
      // SECURITY: Always load current user first
      const currentUser = await User.me();
      setUser(currentUser);
      
      // SECURITY: Only load profiles for current user
      const profiles = await UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        // Assuming profile object now includes subscription status from enhanced authentication
        // For demonstration, let's add a placeholder is_premium if it doesn't exist,
        // in a real app this would come from the backend/auth system.
        const userProfile = { ...profiles[0], is_premium: profiles[0].is_premium ?? false };
        setProfile(userProfile);
        
        // SECURITY: Only load meal plans for current user
        const plans = await MealPlan.filter({ created_by: currentUser.email }, '-created_date', 1);
        if (plans.length > 0) {
          setMealPlan(plans[0]);
          // TODO: Calculate real adherence based on AdherenceLog for this plan
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Don't throw the error, just log it and continue
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    if (!profile) {
      console.warn("Attempted to generate meal plan without a profile.");
      return;
    }
    
    setGenerating(true);
    try {
      // Pass the user's email to the generation function for proper attribution/isolation
      const { data } = await generateMealPlan(user.email);
      
      if (data && data.success) {
        setMealPlan(data.meal_plan);
      } else {
        throw new Error(data?.error || 'Failed to generate meal plan');
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      alert("Failed to generate meal plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const saveMealPlan = async () => {
    try {
      if (mealPlan && mealPlan.id === 'temp' && user?.email) { // Ensure user email is present
        const { id, ...planData } = mealPlan; // Remove temp ID
        // Assign created_by before saving
        const savedPlan = await MealPlan.create({ ...planData, created_by: user.email });
        setMealPlan(savedPlan);
      }
    } catch (error) {
      console.error("Error saving meal plan:", error);
      // Optionally, add a user-facing error message here if save fails
    }
  };

  // Count meals vs snacks properly
  const getMealCounts = () => {
    if (!profile?.preferred_meals) return { meals: 0, snacks: 0 };
    
    const mainMeals = ['breakfast', 'lunch', 'dinner'];
    const snacks = ['morning_snack', 'af ternoon_snack', 'post_workout'];
    
    const mealCount = profile.preferred_meals.filter(meal => mainMeals.includes(meal)).length;
    const snackCount = profile.preferred_meals.filter(meal => snacks.includes(meal)).length;
    
    return { meals: mealCount, snacks: snackCount };
  };

  const { meals: mealCount, snacks: snackCount } = getMealCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#005A8D]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#005A8D] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-[#005A8D] rounded-full flex items-center justify-center">
                <Utensils className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to FlexiDiet</h1>
              <p className="text-gray-600 mb-8 text-lg">
                Let's set up your profile to create personalized meal plans based on your goals and preferences.
              </p>
              <Link to={createPageUrl("Profile")}>
                <Button className="h-14 px-8 text-lg font-semibold bg-[#78C000] hover:bg-[#63a000] text-white rounded-xl shadow-lg">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 text-white bg-[#005A8D]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Meal Plan</h1>
            <p className="text-white/80 mt-1">Personalized nutrition for your goals</p>
          </div>
          
          {/* Hidden on mobile, shown on md screens and up */}
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => navigate(createPageUrl("GroceryList"))}
            className="text-white hover:bg-white/20 rounded-lg hidden md:inline-flex"
            title="Shopping List"
          >
            <ShoppingCart className="w-7 h-7" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to={createPageUrl("DailyPlan")} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-4 sm:px-6 bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-lg text-sm sm:text-base">
              Daily View
            </Button>
          </Link>
          <Link to={createPageUrl("GroceryList")} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-4 sm:px-6 bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-lg text-sm sm:text-base">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Grocery List
            </Button>
          </Link>
          <Link to={createPageUrl("Profile")} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-4 sm:px-6 bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-lg text-sm sm:text-base">
              Edit Profile
            </Button>
          </Link>
          <Button 
            onClick={handleGenerateMealPlan}
            disabled={generating}
            className="w-full sm:w-auto h-12 px-4 sm:px-6 text-white rounded-xl shadow-lg disabled:opacity-50 text-sm sm:text-base bg-[#6BBD4F] hover:bg-[#5aa03f] transition-colors"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Generate New Plan
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Link to={createPageUrl("Setup?step=2")}>
            <Card className="bg-white shadow-xl border-0 h-full hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <Target className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-[#005A8D]" />
                <p className="text-xs sm:text-sm font-medium text-gray-600">Daily Target</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{profile.daily_calorie_target || 'N/A'}</p>
                <p className="text-xs text-gray-500">calories</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Setup?step=5")}>
            <Card className="bg-white shadow-xl border-0 h-full hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <Utensils className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-[#005A8D]" />
                <p className="text-xs sm:text-sm font-medium text-gray-600">Daily Meals</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {mealCount > 0 && snackCount > 0 
                    ? `${mealCount} + ${snackCount}`
                    : mealCount > 0 
                    ? mealCount 
                    : snackCount}
                </p>
                <p className="text-xs text-gray-500">
                  {mealCount > 0 && snackCount > 0 
                    ? `Meals & Snacks`
                    : mealCount > 0 
                    ? `Meal${mealCount > 1 ? 's' : ''}` 
                    : `Snack${snackCount > 1 ? 's' : ''}`}
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to={createPageUrl("Setup?step=2")}>
            <Card className="bg-white shadow-xl border-0 h-full hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <Calendar className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-[#005A8D]" />
                <p className="text-xs sm:text-sm font-medium text-gray-600">Goal</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 capitalize">{profile.goal?.replace('_', ' ')}</p>
                 <p className="text-xs text-gray-500">&nbsp;</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("SuccessTracker")}>
            <Card className="bg-white shadow-xl border-0 h-full hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="p-4 sm:p-6 text-center">
                <ClipboardCheck className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-2 sm:mb-3 text-[#005A8D]" />
                <p className="text-xs sm:text-sm font-medium text-gray-600">Plan Adherence</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{adherence}%</p>
                <p className="text-xs text-gray-500">this week</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {mealPlan ? (
          <div className="space-y-6">
            {mealPlan.id === 'temp' && (
              <PaywallGuard 
                checkType="meal_plan_limit" 
                showUpgradePrompt={false}
                fallback={
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 text-amber-800">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Preview Mode</p>
                        <p className="text-sm">
                          Free users can save only 1 meal plan. Delete your current plan or upgrade to Premium to save this one.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-lime-800">
                      <CheckCircle2 className="w-5 h-5 text-lime-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Ready to Save</p>
                        <p className="text-sm">Your meal plan looks great! Save it to access it anytime.</p>
                      </div>
                    </div>
                    <Button 
                      onClick={saveMealPlan}
                      className="bg-[#78C000] hover:bg-[#63a000] text-white w-full sm:w-auto"
                    >
                      Save Meal Plan
                    </Button>
                  </div>
                </div>
              </PaywallGuard>
            )}

            {/* Enhanced Weekly Meal Plan */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                    <Calendar className="w-6 sm:w-7 h-6 sm:h-7" />
                    Week of {format(parseISO(mealPlan.week_start_date), 'MMM d, yyyy')}
                  </h2>
                  <p className="text-white/70 mt-1">Click any day to view detailed meals</p>
                </div>
                {/* Hidden on screens smaller than lg, where it's always single-column */}
                <div className="hidden lg:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
                    className="text-white hover:bg-white/20 rounded-lg"
                    title={layout === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                  >
                    {layout === 'grid' ? <List className="w-6 h-6" /> : <Grid3X3 className="w-6 h-6" />}
                  </Button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {layout === 'grid' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {mealPlan.daily_plans.map((dayPlan, index) => {
                      const dayNutrition = getDayNutrition(dayPlan);
                      const macroProgress = macroTargets ? {
                        carbs: Math.min((dayNutrition.carbs / macroTargets.carbs) * 100, 100),
                        protein: Math.min((dayNutrition.protein / macroTargets.protein) * 100, 100),
                        fat: Math.min((dayNutrition.fat / macroTargets.fat) * 100, 100)
                      } : null;

                      return (
                        <Link 
                          key={dayPlan.day} 
                          to={`${createPageUrl("DailyPlan")}?day=${index}`}
                          className="group"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                        >
                          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200/50 overflow-hidden cursor-pointer flex flex-col h-full">
                            <div className="bg-[#005A8D] p-3 text-center">
                              <h3 className="text-white font-bold text-sm sm:text-base capitalize">{dayPlan.day}</h3>
                              <p className="text-white/70 text-xs">{format(parseISO(dayPlan.date), 'MMM d')}</p>
                            </div>
                            <div className="p-3 space-y-2 flex-grow">
                              {dayPlan.meals.map((meal, mealIndex) => (
                                <div key={mealIndex} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 border border-gray-200 flex flex-col min-h-[90px]">
                                  <div>
                                    <span className="text-xs font-semibold text-gray-700 capitalize">{meal.meal_type.replace('_', ' ')}</span>
                                    <p className="text-xs font-bold text-[#005A8D]">{meal.actual_calories || meal.target_calories} cal</p>
                                  </div>
                                  <p className="text-xs text-gray-600 whitespace-normal break-words mt-auto pt-1">
                                    {meal.is_takeaway ? '🥡 Takeaway' : meal.recipe_name}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-t border-gray-200">
                              <div className="text-center mb-2">
                                <p className="text-sm font-bold text-gray-900">
                                  {dayNutrition.calories} cal
                                </p>
                              </div>
                              
                              {macroProgress && (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">C</span>
                                    <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${macroProgress.carbs}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">{dayNutrition.carbs}g</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">P</span>
                                    <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${macroProgress.protein}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">{dayNutrition.protein}g</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">F</span>
                                    <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${macroProgress.fat}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">{dayNutrition.fat}g</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mealPlan.daily_plans.map((dayPlan, index) => {
                       const dayNutrition = getDayNutrition(dayPlan);
                       return (
                        <Link 
                          key={dayPlan.day} 
                          to={`${createPageUrl("DailyPlan")}?day=${index}`}
                          className="group block"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                        >
                          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 overflow-hidden flex flex-col md:flex-row">
                            {/* Left Side: Day and Nutrition */}
                            <div className="w-full md:w-48 p-4 flex flex-row md:flex-col justify-between items-center md:items-start bg-[#005A8D] text-white">
                              <div>
                                <h3 className="font-bold text-lg capitalize">{dayPlan.day}</h3>
                                <p className="text-xs opacity-80">{format(parseISO(dayPlan.date), 'MMM d')}</p>
                              </div>
                              <div className="text-right md:text-left mt-0 md:mt-4">
                                <p className="text-xl font-bold">{dayNutrition.calories}</p>
                                <p className="text-xs opacity-80">Total Calories</p>
                              </div>
                            </div>
                            {/* Right Side: Meals */}
                            <div className="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {dayPlan.meals.map((meal, mealIndex) => (
                                <div key={mealIndex} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 flex flex-col justify-between min-h-[80px]">
                                  <div>
                                    <span className="text-xs font-semibold text-gray-700 capitalize">{meal.meal_type.replace('_', ' ')}</span>
                                    <p className="text-sm font-medium text-gray-800 mt-1 whitespace-normal break-words">
                                      {meal.is_takeaway ? '🥡 Takeaway' : meal.recipe_name}
                                    </p>
                                  </div>
                                  <p className="text-right text-sm font-bold text-[#005A8D] mt-2">
                                    {meal.actual_calories || meal.target_calories}cal
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Link>
                       );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="p-8 sm:p-12 text-center">
              <Calendar className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 sm:mb-6 text-gray-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">No Meal Plan Yet</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Generate your first personalized meal plan based on your profile.</p>
              <Button 
                onClick={handleGenerateMealPlan}
                disabled={generating}
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-[#78C000] hover:bg-[#63a000] text-white rounded-xl shadow-lg disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 sm:h-5 w-4 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
