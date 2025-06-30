
import React, { useState, useEffect } from "react";
import { UserProfile } from "@/api/entities";
import { User } from "@/api/entities";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

import BasicInfoStep from "../components/setup/BasicInfoStep";
import GoalsStep from "../components/setup/GoalsStep";
import DietaryStep from "../components/setup/DietaryStep";
import FoodPreferencesStep from "../components/setup/FoodPreferencesStep";
import MealScheduleStep from "../components/setup/MealScheduleStep";
import CookingPrefsStep from "../components/setup/CookingPrefsStep";
import BuildPlanStep from "../components/setup/BuildPlanStep";

export default function SetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isolatedStepParam = searchParams.get('step');
  
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  
  const isolatedStep = isolatedStepParam ? parseInt(isolatedStepParam, 10) : null;

  useEffect(() => {
    loadCurrentUserAndProfile();
  }, []);

  const loadCurrentUserAndProfile = async () => {
    try {
      // SECURITY: Load current user first
      const currentUser = await User.me();
      setUser(currentUser);
      
      // SECURITY: Only load profiles for current user
      const profiles = await UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        // If we have an isolated step parameter, allow editing
        if (isolatedStepParam) {
          setFormData(profiles[0]);
          setHasExistingProfile(true);
        } else {
          // No isolated step but profile exists - redirect to meal plan
          navigate(createPageUrl("MealPlan"));
          return;
        }
      } else {
        // No profile exists - this is a new user, show the wizard
        setHasExistingProfile(false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Handle cases where user is not authenticated
      navigate(createPageUrl("Landing"));
    }
    setCheckingProfile(false);
  };
  
  const calculateAndSetCalories = (data) => {
    const { height_cm, weight_kg, age, gender, exercise_sessions_per_week, job_type, goal } = data;
    if (!height_cm || !weight_kg || !age || !gender || !goal) return data;
    
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    } else {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }

    let activityMultiplier = 1.2;
    if (exercise_sessions_per_week >= 1 && exercise_sessions_per_week <= 2) activityMultiplier = 1.375;
    else if (exercise_sessions_per_week >= 3 && exercise_sessions_per_week <= 4) activityMultiplier = 1.55;
    else if (exercise_sessions_per_week >= 5) activityMultiplier = 1.725;
    
    if (job_type === 'physical') activityMultiplier += 0.2;

    let tdee = bmr * activityMultiplier;

    if (goal === 'lose_weight') tdee -= 500;
    else if (goal === 'build_muscle') tdee += 300;
    
    return { ...data, daily_calorie_target: Math.round(tdee) };
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated. Please log in.");
      }
      
      let finalData = calculateAndSetCalories(formData);
      // Ensure the profile is associated with the current user's email
      finalData = { ...finalData, created_by: user.email }; 
      
      // SECURITY: Only look for profiles created by current user
      const existingProfiles = await UserProfile.filter({ created_by: user.email });
      
      if (existingProfiles.length > 0) {
        await UserProfile.update(existingProfiles[0].id, finalData);
      } else {
        await UserProfile.create(finalData);
      }
      return true; // Indicate success
    } catch (error) {
      console.error("Error saving profile:", error);
      // It's good practice to inform the user if saving fails.
      alert("There was an error saving your profile. Please try again.");
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  // New handler for the final step in the multi-step flow
  const handleFinalStepSaveAndRedirect = async () => {
    const success = await saveProfile();
    if (success) {
        navigate(createPageUrl("MealPlan"));
    }
  };

  const steps = [
    { component: BasicInfoStep, title: "Basic Information" },
    { component: GoalsStep, title: "Your Goals" },
    { component: DietaryStep, title: "Dietary Requirements" },
    { component: FoodPreferencesStep, title: "Food Preferences" },
    { component: MealScheduleStep, title: "Meal Schedule" },
    { component: CookingPrefsStep, title: "Cooking Preferences" },
    { component: BuildPlanStep, title: "Build Your Plan" }
  ];

  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#005A8D' }}>
        <div className="w-full max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#005A8D' }}>
        <div className="w-full max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white font-medium">
              {hasExistingProfile ? "Updating your profile..." : "Setting up your profile..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isolatedStep && isolatedStep > 0 && isolatedStep <= steps.length) {
    const IsolatedStepComponent = steps[isolatedStep - 1].component;

    // This new handler saves the profile and then navigates away.
    const handleIsolatedSaveAndRedirect = async () => {
      await saveProfile();
      navigate(createPageUrl("MealPlan"));
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#005A8D' }}>
        <div className="w-full max-w-4xl">
           <div className="mb-8">
            <h1 className="text-2xl font-bold text-white text-center">
              Edit {steps[isolatedStep - 1].title}
            </h1>
          </div>
          <IsolatedStepComponent
            formData={formData}
            setFormData={setFormData}
            onNext={handleIsolatedSaveAndRedirect}
            onBack={() => navigate(createPageUrl("MealPlan"))}
            isIsolated={true}
            hasExistingProfile={hasExistingProfile}
          />
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#005A8D' }}>
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">
              {hasExistingProfile ? "Update Profile" : "Profile Setup"}
            </h1>
            <span className="text-sm font-medium text-cyan-200">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          
          <div className="w-full bg-cyan-900 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <CurrentStepComponent
          formData={formData}
          setFormData={setFormData}
          onNext={currentStep === steps.length ? handleFinalStepSaveAndRedirect : nextStep}
          onBack={prevStep}
          isIsolated={false}
          hasExistingProfile={hasExistingProfile}
        />
      </div>
    </div>
  );
}
