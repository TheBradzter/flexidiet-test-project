
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { UserProfile } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Target, Calendar, Apple, CheckCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, false = not auth, true = auth
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const user = await User.me();
      if (user) {
        setIsAuthenticated(true);
        // SECURITY: Check if user has completed profile setup
        const profiles = await UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0) {
          // User has profile, redirect to meal plan
          navigate(createPageUrl("MealPlan"));
          return;
        } else {
          // User needs to complete setup wizard
          navigate(createPageUrl("Setup"));
          return;
        }
      }
    } catch (error) {
      // User not authenticated, show landing page
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const handleGetStarted = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Show loading spinner while checking auth
  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#005A8D' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if authenticated (will redirect)
  if (isAuthenticated === true) {
    return null;
  }

  // Show enhanced landing page for non-authenticated users
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#005A8D' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="bg-white rounded-2xl p-6 shadow-2xl mb-8 inline-block">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d4388cd35_Flexidiet_Logo_transparent.png" 
                alt="FlexiDiet Logo" 
                className="h-16 sm:h-20 w-auto mx-auto"
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Build Your Own <span className="text-[#6BBD4F]">Meal Plan</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Personalized nutrition that fits your lifestyle, preferences, and goals
            </p>
            <Button 
              onClick={handleGetStarted}
              className="h-16 px-8 text-xl font-semibold bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-xl"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need for Meal Planning Success
            </h2>
            <p className="text-xl text-white/80">
              From personalized plans to smart shopping lists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#6BBD4F] rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized Plans</h3>
                <p className="text-gray-600">Custom meal plans based on your goals, preferences, and dietary needs</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#6BBD4F] rounded-full flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Recipe Library</h3>
                <p className="text-gray-600">Access hundreds of healthy recipes or import your own favorites</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#6BBD4F] rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Weekly Planning</h3>
                <p className="text-gray-600">Organize your meals by day with flexible scheduling options</p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#6BBD4F] rounded-full flex items-center justify-center">
                  <Apple className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Shopping</h3>
                <p className="text-gray-600">Automated grocery lists with price comparison and organization</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Eating Habits?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands who have simplified their meal planning with FlexiDiet
          </p>
          <Button 
            onClick={handleGetStarted}
            className="h-16 px-8 text-xl font-semibold bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-xl"
          >
            Start Your Free Plan
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
