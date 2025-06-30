
import React, { useState, useEffect } from "react";
import { UserProfile } from "@/api/entities";
import { MealPlan } from "@/api/entities";
import { UserFavorites } from "@/api/entities";
import { AdherenceLog } from "@/api/entities";
import { User } from "@/api/entities"; // Added User import
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Calendar, Heart, CheckCircle2, ClipboardCheck } from "lucide-react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import MealContextMenu from "../components/meals/MealContextMenu";
import CheatMealDialog from "../components/meals/CheatMealDialog";

export default function DailyPlanPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Added user state
  const [profile, setProfile] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, meal: null, dayIndex: null });
  const [showCheatMealDialog, setShowCheatMealDialog] = useState(false);
  const [selectedMealForCheat, setSelectedMealForCheat] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [adherenceData, setAdherenceData] = useState({});

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const mealImages = {
    breakfast: ["https://images.unsplash.com/photo-1563379091339-03246963d271?w=800&h=400&fit=crop&crop=faces,entropy&auto=format&fm=jpg&q=90"],
    lunch: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop&crop=faces,entropy&auto=format&fm=jpg&q=90"],
    dinner: ["https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop&crop=faces,entropy&auto=format&fm=jpg&q=90"],
    morning_snack: ["https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=800&h=400&fit=crop&crop=faces,entropy&auto=format&fm=jpg&q=90"],
    afternoon_snack: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=400&fit=crop&crop=faces,entropy&auto=format&fm=jpg&q=90"],
    post_workout: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=400&fit=crop&crop=faces,entropy&auto=format&fm=jpg&q=90"]
  };

  const loadUserAndData = async () => {
    try {
      // SECURITY: Always load current user first
      const currentUser = await User.me();
      setUser(currentUser);
      
      // SECURITY: Only load data for the authenticated user
      const profiles = await UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        
        // SECURITY: Only load meal plans created by this user
        const plans = await MealPlan.filter({ created_by: currentUser.email }, '-created_date', 1);
        if (plans.length > 0) {
          setMealPlan(plans[0]);
        }
      }
      
      await loadFavorites(currentUser.email); // Favorites can be loaded without mealPlan
      
    } catch (error) {
      console.error("Error loading user data:", error);
      // If user can't be loaded (e.g., not logged in), redirect to login/landing
      navigate(createPageUrl("Landing"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserAndData();
  }, [navigate]); // Added navigate to dependency array as it's from hook

  // Load adherence data and set current day once mealPlan and user are available
  useEffect(() => {
    if (mealPlan && user) { // Ensure both are loaded
      loadAdherenceData(user.email, mealPlan.id); // Pass user email and mealPlan ID
      const today = new Date().getDay(); // Sunday - 0, Monday - 1
      const mondayIndex = today === 0 ? 6 : today - 1; 
      setCurrentDayIndex(mondayIndex);
    }
  }, [mealPlan, user]); // Added user to dependency array

  // Get day index from URL params (also depends on mealPlan being loaded)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dayParam = urlParams.get('day');
    if (dayParam && mealPlan) { // Ensure mealPlan is loaded before trying to set day index
      const dayIndex = parseInt(dayParam, 10);
      if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex < 7) {
        setCurrentDayIndex(dayIndex);
      }
    }
  }, [mealPlan]); 

  // Scroll to top when day changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentDayIndex]);

  const loadFavorites = async (userEmail) => {
    try {
      // SECURITY: Only load favorites for current user
      const userFavorites = await UserFavorites.filter({ created_by: userEmail });
      setFavorites(userFavorites.map(fav => fav.recipe_id));
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]);
    }
  };

  const loadAdherenceData = async (userEmail, currentMealPlanId) => {
    try {
      // Use the passed mealPlanId or state mealPlan.id if available
      const effectiveMealPlanId = currentMealPlanId || mealPlan?.id;

      if (!effectiveMealPlanId || !userEmail) return; // Ensure mealPlan ID and user email are available

      // SECURITY: Only load adherence data for current user and their meal plan
      const logs = await AdherenceLog.filter({ 
        meal_plan_id: effectiveMealPlanId,
        created_by: userEmail 
      });
      
      const adherenceMap = {};
      if (Array.isArray(logs)) { // Ensure logs is an array
        logs.forEach(log => {
          const key = `${log.day}-${log.meal_type}`;
          adherenceMap[key] = log.status;
        });
      }
      setAdherenceData(adherenceMap);
    } catch (error) {
      console.error("Error loading adherence data:", error);
      setAdherenceData({});
    }
  };

  const toggleFavorite = async (recipeId, recipeName) => {
    try {
      if (!user) { // Ensure user is logged in
        console.warn("User not logged in, cannot toggle favorite.");
        return;
      }
      
      const isFavorited = favorites.includes(recipeId);
      
      if (isFavorited) {
        // Remove from favorites
        // SECURITY: Only remove favorites created by current user
        const existingFavorite = await UserFavorites.filter({ 
          recipe_id: recipeId,
          created_by: user.email 
        });
        if (existingFavorite.length > 0) {
          await UserFavorites.delete(existingFavorite[0].id);
        }
        setFavorites(prev => prev.filter(id => id !== recipeId));
      } else {
        // Add to favorites
        // Assumes the ORM automatically sets 'created_by' based on the authenticated user.
        await UserFavorites.create({
          recipe_id: recipeId,
          recipe_name: recipeName,
          favorited_date: new Date().toISOString()
        });
        setFavorites(prev => [...prev, recipeId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const toggleAdherence = async (day, mealType, currentStatus) => {
    try {
      if (!mealPlan || !user) { // Ensure mealPlan and user are available
        console.warn("Meal plan or user not loaded, cannot toggle adherence.");
        return;
      }
      
      const key = `${day}-${mealType}`;
      const newStatus = currentStatus === 'followed' ? 'pending' : 'followed';
      const currentDateISO = mealPlan.week_start_date; // Assuming this is start of week
      const currentDayDate = addDays(parseISO(currentDateISO), weekDays.indexOf(day));
      
      // Check if log exists
      // SECURITY: Only check adherence logs for current user
      const existingLogs = await AdherenceLog.filter({ 
        meal_plan_id: mealPlan.id,
        day: day,
        meal_type: mealType,
        created_by: user.email
      });

      if (existingLogs.length > 0) {
        await AdherenceLog.update(existingLogs[0].id, { status: newStatus });
      } else {
        // Assumes the ORM automatically sets 'created_by' based on the authenticated user.
        await AdherenceLog.create({
          date: format(currentDayDate, 'yyyy-MM-dd'),
          meal_plan_id: mealPlan.id,
          day: day,
          meal_type: mealType,
          status: newStatus
        });
      }
      
      setAdherenceData(prev => ({
        ...prev,
        [key]: newStatus
      }));
    } catch (error) {
      console.error("Error toggling adherence:", error);
    }
  };

  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && currentDayIndex < 6) setCurrentDayIndex(prev => prev + 1);
    if (isRightSwipe && currentDayIndex > 0) setCurrentDayIndex(prev => prev - 1);
  };

  const getMealImage = (mealType, dayIndex) => mealImages[mealType]?.[0] || mealImages.breakfast[0];
  const getMealTitle = (mealType) => (mealType.replace('_', ' ') || 'Meal').toUpperCase();

  const handleMealRightClick = (e, meal, dayIndex) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      meal,
      dayIndex
    });
  };

  const handleMealLongPress = (meal, dayIndex) => {
    setContextMenu({
      show: true,
      x: window.innerWidth / 2, // Center horizontally
      y: window.innerHeight / 2, // Center vertically
      meal,
      dayIndex
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, meal: null, dayIndex: null });
  };

  const handleCheatMeal = (meal) => {
    setSelectedMealForCheat(meal);
    setShowCheatMealDialog(true);
    closeContextMenu();
  };

  // Calculate daily nutrition with target vs actual
  const getDayNutrition = (dayPlan) => {
    if (!dayPlan?.meals || !Array.isArray(dayPlan.meals)) return { 
      target: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      actual: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };
    
    const target = dayPlan.meals.reduce((total, meal) => {
      const mealTargetCalories = meal.target_calories || 0;
      const mealNutrition = {
        calories: mealTargetCalories,
        protein: Math.round((mealTargetCalories * 0.4) / 4), // 40% protein, 4 cal/g
        carbs: Math.round((mealTargetCalories * 0.4) / 4),   // 40% carbs, 4 cal/g
        fat: Math.round((mealTargetCalories * 0.2) / 9)     // 20% fat, 9 cal/g
      };
      
      return {
        calories: total.calories + mealNutrition.calories,
        protein: total.protein + mealNutrition.protein,
        carbs: total.carbs + mealNutrition.carbs,
        fat: total.fat + mealNutrition.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const actual = dayPlan.meals.reduce((total, meal) => {
      const mealActualCalories = meal.actual_calories || meal.target_calories || 0; // Use actual, fallback to target
      const mealNutrition = {
        calories: mealActualCalories,
        protein: Math.round((mealActualCalories * 0.4) / 4),
        carbs: Math.round((mealActualCalories * 0.4) / 4),
        fat: Math.round((mealActualCalories * 0.2) / 9)
      };
      
      return {
        calories: total.calories + mealNutrition.calories,
        protein: total.protein + mealNutrition.protein,
        carbs: total.carbs + mealNutrition.carbs,
        fat: total.fat + mealNutrition.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return { target, actual };
  };


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

  if (!profile || !mealPlan) {
    return (
      <div className="min-h-screen bg-[#005A8D] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Meal Plan Available</h2>
          <p className="mb-6">You need to generate a meal plan first to view daily meals.</p>
          <Button 
            onClick={() => navigate(createPageUrl("MealPlan"))}
            className="bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl px-6 py-3"
          >
            Generate Meal Plan
          </Button>
        </div>
      </div>
    );
  }

  const currentDay = mealPlan.daily_plans?.[currentDayIndex];
  if (!currentDay) {
    return (
      <div className="min-h-screen bg-[#005A8D] flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Day Not Found</h2>
          <p className="mb-6">This day is not available in your current meal plan. Please check your meal plan settings.</p>
          <Button 
            onClick={() => navigate(createPageUrl("MealPlan"))}
            className="bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl px-6 py-3"
          >
            Back to Meal Plan
          </Button>
        </div>
      </div>
    );
  }

  const currentDate = addDays(parseISO(mealPlan.week_start_date), currentDayIndex);
  const dayNutrition = getDayNutrition(currentDay);

  return (
    <div className="min-h-screen bg-[#005A8D] flex flex-col">
      <header className="bg-[#005A8D] text-white px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="w-full max-w-4xl mx-auto grid grid-cols-3 items-center">
          <div className="justify-self-start">
            <Button
              variant="ghost" 
              size="icon"
              onClick={() => navigate(createPageUrl("MealPlan"))}
              className="text-white hover:bg-white/20 rounded-lg"
              title="Back to Weekly View"
            >
              <ArrowLeft className="w-7 h-7" />
            </Button>
          </div>
          
          <div className="text-center justify-self-center">
            <h1 className="text-xl font-bold tracking-wider">
              {weekDays[currentDayIndex].toUpperCase()}
            </h1>
            <p className="text-sm opacity-90">
              {format(currentDate, 'MMMM d, yyyy')}
            </p>
          </div>

          <div className="justify-self-end">
            <Button
              variant="ghost" 
              size="icon"
              onClick={() => navigate(createPageUrl("GroceryList"))}
              className="text-white hover:bg-white/20 rounded-lg"
              title="Shopping List"
            >
              <ShoppingCart className="w-7 h-7" />
            </Button>
          </div>
        </div>
      </header>

      {/* Fixed Day Navigation */}
      <div className="bg-[#005A8D] px-4 pb-4 sticky top-[72px] z-20">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => currentDayIndex > 0 && setCurrentDayIndex(prev => prev - 1)}
              disabled={currentDayIndex === 0}
              className="text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <div className="flex gap-2">
              {weekDays.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setCurrentDayIndex(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    index === currentDayIndex 
                      ? 'bg-[#6BBD4F] text-white' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {day.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => currentDayIndex < 6 && setCurrentDayIndex(prev => prev + 1)}
              disabled={currentDayIndex === 6}
              className="text-white hover:bg-white/20 disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      <main 
        className="flex-1 px-4 pb-4 overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={closeContextMenu}
      >
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {Array.isArray(currentDay?.meals) && currentDay.meals.map((meal, index) => {
            const adherenceKey = `${currentDay.day}-${meal.meal_type}`;
            const adherenceStatus = adherenceData[adherenceKey] || 'pending';
            const isFollowed = adherenceStatus === 'followed';

            return (
              <div 
                key={index} 
                className="overflow-hidden rounded-xl relative group transform transition-all duration-300 hover:scale-[1.02] shadow-xl"
                onContextMenu={(e) => handleMealRightClick(e, meal, currentDayIndex)}
                onTouchStart={(e) => {
                  const timer = setTimeout(() => {
                    handleMealLongPress(meal, currentDayIndex);
                    setTouchStart(null);
                    setTouchEnd(null);
                  }, 800);

                  const cleanup = () => {
                    clearTimeout(timer);
                  };

                  e.currentTarget.addEventListener('touchend', cleanup, { once: true });
                  e.currentTarget.addEventListener('touchmove', cleanup, { once: true });
                }}
              >
                <div className="h-64 md:h-48 relative bg-gray-900 rounded-xl overflow-hidden">
                  <img
                    src={getMealImage(meal.meal_type, currentDayIndex)}
                    alt={getMealTitle(meal.meal_type)}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  
                  {/* Enhanced overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/30 to-teal-900/30"></div>

                  {/* Top Controls - Three Icons */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {/* Adherence Toggle */}
                      <Button
                        size="sm"
                        className={`text-white rounded-full backdrop-blur-sm border border-white/30 transition-all text-xs font-semibold h-8 px-3 flex items-center gap-1.5 ${
                          isFollowed 
                            ? 'bg-green-500/80 border-green-400 hover:bg-green-600/80' 
                            : 'bg-black/30 hover:bg-white/20'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAdherence(currentDay.day, meal.meal_type, adherenceStatus);
                        }}
                        title={isFollowed ? 'Mark as not followed' : 'Track this meal'}
                      >
                        {isFollowed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Logged</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="w-4 h-4" />
                            <span>Track</span>
                          </>
                        )}
                      </Button>

                      {/* Favorites Heart */}
                      {meal.recipe_data?.id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`text-white hover:text-white hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/30 transition-all ${
                            favorites.includes(meal.recipe_data.id) 
                              ? 'bg-pink-500/80 border-pink-400' 
                              : 'bg-black/30'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(meal.recipe_data.id, meal.recipe_name);
                          }}
                          title={favorites.includes(meal.recipe_data.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-5 h-5 ${
                            favorites.includes(meal.recipe_data.id) 
                              ? 'fill-white text-white' 
                              : 'text-white'
                          }`} />
                        </Button>
                      )}
                    </div>

                    {/* Menu Options */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:text-white hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/30 bg-black/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMealRightClick(e, meal, currentDayIndex);
                      }}
                      title="More options"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </Button>
                  </div>

                  {/* Meal content */}
                  <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
                    <div className="flex-1 pr-4">
                        <h3 className="text-xl sm:text-2xl font-bold tracking-wide mb-1 drop-shadow-lg">
                            {getMealTitle(meal.meal_type)}
                        </h3>
                        <p className="text-xs sm:text-sm opacity-90 font-medium tracking-wide">
                            {meal.recipe_name || 'Tap to customize'}
                            {!meal.recipe_data?.id && meal.recipe_name && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-yellow-500/80 text-white font-semibold">Custom</span>
                            )}
                        </p>
                    </div>
                    
                    <div className="bg-white/95 backdrop-blur-md text-cyan-800 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-xl border border-white/50 text-center flex-shrink-0">
                      <div className="text-base sm:text-lg font-black">{meal.actual_calories || meal.total_calories}</div>
                      <div className="text-xs font-semibold opacity-80 -mt-1">calories</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Enhanced Daily Total Card */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-cyan-50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/50">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Daily Nutrition</h3>
            
            {/* Target vs Actual Split */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Target Column */}
              <div className="text-center">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="text-sm font-bold text-blue-800 mb-2">TARGET</h4>
                  <p className="text-2xl font-black text-blue-600 mb-1">
                    {dayNutrition.target.calories}
                  </p>
                  <p className="text-xs font-semibold text-blue-600 mb-3">CALORIES</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="font-bold text-green-600">{dayNutrition.target.carbs}g</p>
                      <p className="text-gray-600">Carbs</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-600">{dayNutrition.target.protein}g</p>
                      <p className="text-gray-600">Protein</p>
                    </div>
                    <div>
                      <p className="font-bold text-yellow-600">{dayNutrition.target.fat}g</p>
                      <p className="text-gray-600">Fat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actual Column */}
              <div className="text-center">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="text-sm font-bold text-green-800 mb-2">ACTUAL</h4>
                  <p className="text-2xl font-black text-green-600 mb-1">
                    {dayNutrition.actual.calories}
                  </p>
                  <p className="text-xs font-semibold text-green-600 mb-3">CALORIES</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="font-bold text-green-600">{dayNutrition.actual.carbs}g</p>
                      <p className="text-gray-600">Carbs</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-600">{dayNutrition.actual.protein}g</p>
                      <p className="text-gray-600">Protein</p>
                    </div>
                    <div>
                      <p className="font-bold text-yellow-600">{dayNutrition.actual.fat}g</p>
                      <p className="text-gray-600">Fat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-2 text-center">
                Daily Progress: {dayNutrition.actual.calories} / {profile?.daily_calorie_target} cal
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-500"
                  style={{ 
                    width: `${Math.min(((dayNutrition.actual.calories) / (profile?.daily_calorie_target || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Context Menu */}
      {contextMenu.show && (
        <MealContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          meal={contextMenu.meal}
          onClose={closeContextMenu}
          onReplaceRandom={() => { /* TODO: Implement replace random */ closeContextMenu(); }}
          onReplaceSearch={() => { /* TODO: Implement replace search */ closeContextMenu(); }}
          onCheatMeal={() => handleCheatMeal(contextMenu.meal)}
          onToggleAdherence={() => { 
            if (contextMenu.meal && contextMenu.dayIndex !== null) {
              const dayString = weekDays[contextMenu.dayIndex]; // Get day string from index
              const adherenceKey = `${dayString}-${contextMenu.meal.meal_type}`;
              const currentStatus = adherenceData[adherenceKey] || 'pending';
              toggleAdherence(dayString, contextMenu.meal.meal_type, currentStatus);
            }
            closeContextMenu(); 
          }}
          onFavorite={() => { // Wire up onFavorite to toggleFavorite if recipe_data.id exists
            if (contextMenu.meal?.recipe_data?.id) {
              toggleFavorite(contextMenu.meal.recipe_data.id, contextMenu.meal.recipe_name);
            }
            closeContextMenu();
          }}
        />
      )}

      {/* Cheat Meal Dialog */}
      {showCheatMealDialog && (
        <CheatMealDialog
          meal={selectedMealForCheat}
          onClose={() => {
            setShowCheatMealDialog(false);
            setSelectedMealForCheat(null);
          }}
        />
      )}
    </div>
  );
}
