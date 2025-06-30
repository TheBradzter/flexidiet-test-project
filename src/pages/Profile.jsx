
import React, { useState, useEffect } from 'react';
import { UserProfile } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserIcon, Settings, Edit3, Calendar, Target, Utensils, Clock, ChefHat, Users, Bell, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = React.useState('preferences');

  useEffect(() => {
    loadUserAndProfile();
  }, []);

  const loadUserAndProfile = async () => {
    try {
      // SECURITY: Load current user first
      const currentUser = await User.me();
      setUser(currentUser);
      
      // SECURITY: Only load profiles for current user
      const profiles = await UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      } else {
        // No profile exists - redirect to setup wizard
        navigate(createPageUrl("Setup"));
        return; // Stop further execution in this component
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // If error occurs (e.g., user not logged in, API error), redirect to Landing page
      navigate(createPageUrl("Landing"));
      return; // Stop further execution in this component
    }
    setLoading(false); // Set loading to false once data is fetched or redirected
  };

  const preferenceItems = [
    { title: "Basic Info", description: "Height, weight, age, activity level", icon: UserIcon, step: 1 },
    { title: "Goals", description: "Fitness objectives & targets", icon: Target, step: 2 },
    { title: "Dietary Requirements", description: "Restrictions & preferences", icon: Utensils, step: 3 },
    { title: "Food Preferences", description: "Liked & disliked foods", icon: Edit3, step: 4 },
    { title: "Meal Schedule", description: "Daily meal timing", icon: Calendar, step: 5 },
    { title: "Cooking Preferences", description: "Skill level & time preferences", icon: ChefHat, step: 6 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#005A8D' }}>
        <p className="text-white text-lg">Loading profile...</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Card className="glass-card shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Account Status</h3>
                    <p className="text-gray-600">Active Premium Member</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Member Since</h3>
                    <p className="text-gray-600">January 2024</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Meal Plans Created</h3>
                    <p className="text-gray-600">12 plans</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Recipes Saved</h3>
                    <p className="text-gray-600">24 recipes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'preferences':
        return (
          <Card className="glass-card shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Meal Planning Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {preferenceItems.map((item) => (
                  <Link to={createPageUrl(`Setup?step=${item.step}`)} key={item.title}>
                    <Card className="hover:shadow-lg hover:border-lime-500 border-2 border-transparent transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-lime-100 text-lime-600 rounded-lg flex items-center justify-center">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card className="glass-card shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Daily Meal Reminders</h3>
                    <p className="text-sm text-gray-600">Get notified about your daily meal plan</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Weekly Progress</h3>
                    <p className="text-sm text-gray-600">Weekly summary of your adherence</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">New Recipe Suggestions</h3>
                    <p className="text-sm text-gray-600">Get notified about new recipes</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'account':
        return (
          <Card className="glass-card shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Subscription</h3>
                    <p className="text-sm text-gray-600">Manage your premium subscription</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy Settings</h3>
                    <p className="text-sm text-gray-600">Control your data and privacy</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Export Data</h3>
                    <p className="text-sm text-gray-600">Download your meal plans and recipes</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 text-white" style={{ backgroundColor: '#005A8D' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserIcon className="w-8 h-8" />
            Profile
          </h1>
          <p className="text-cyan-200 mt-1">Manage your account and meal planning preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-[#005A8D] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'preferences'
                  ? 'bg-[#005A8D] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('preferences')}
            >
              <UserIcon className="w-4 h-4 inline mr-2" />
              Preferences
            </button>
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'notifications'
                  ? 'bg-[#005A8D] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Notifications
            </button>
            <button
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'account'
                  ? 'bg-[#005A8D] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('account')}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Account
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
