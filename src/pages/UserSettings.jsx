import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, Bell, Settings, Save } from 'lucide-react';

export default function UserSettingsPage() {
    const [user, setUser] = useState(null);
    const [emailPrefs, setEmailPrefs] = useState({
        daily_adherence_reminders: true,
        weekly_progress_summary: true,
        meal_plan_tips: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            // Set email preferences from user data or defaults
            const prefs = currentUser.email_preferences || {
                daily_adherence_reminders: true,
                weekly_progress_summary: true,
                meal_plan_tips: true
            };
            setEmailPrefs(prefs);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await User.updateMyUserData({
                email_preferences: emailPrefs
            });
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
        }
        setSaving(false);
    };

    const handlePreferenceChange = (key, value) => {
        setEmailPrefs(prev => ({
            ...prev,
            [key]: value
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyan-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white font-medium">Loading your settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cyan-800 py-8 px-4 text-white">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8" />
                        Account Settings
                    </h1>
                    <p className="text-cyan-200 mt-1">Manage your account preferences and notifications</p>
                </div>

                <Card className="glass-card shadow-lg border-0 bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Mail className="w-6 h-6 text-cyan-800" />
                            Email Notifications
                        </CardTitle>
                        <p className="text-gray-600">Choose which emails you'd like to receive from FlexiDiet</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Daily Adherence Reminders
                                </Label>
                                <p className="text-sm text-gray-600 mt-1">
                                    Get a gentle reminder each evening to log how you stuck to your meal plan
                                </p>
                            </div>
                            <Switch
                                checked={emailPrefs.daily_adherence_reminders}
                                onCheckedChange={(checked) => handlePreferenceChange('daily_adherence_reminders', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <Label className="text-base font-semibold text-gray-900">
                                    Weekly Progress Summary
                                </Label>
                                <p className="text-sm text-gray-600 mt-1">
                                    Receive a weekly summary of your meal plan adherence and progress
                                </p>
                            </div>
                            <Switch
                                checked={emailPrefs.weekly_progress_summary}
                                onCheckedChange={(checked) => handlePreferenceChange('weekly_progress_summary', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                                <Label className="text-base font-semibold text-gray-900">
                                    Meal Planning Tips & Recipes
                                </Label>
                                <p className="text-sm text-gray-600 mt-1">
                                    Get helpful tips, new recipes, and meal planning advice
                                </p>
                            </div>
                            <Switch
                                checked={emailPrefs.meal_plan_tips}
                                onCheckedChange={(checked) => handlePreferenceChange('meal_plan_tips', checked)}
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full h-12 bg-lime-500 hover:bg-lime-600 text-white font-semibold rounded-xl"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card shadow-lg border-0 bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900">
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                                <p className="text-lg text-gray-900">{user?.full_name || 'Not provided'}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-semibold text-gray-700">Email</Label>
                                <p className="text-lg text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-semibold text-gray-700">Account Type</Label>
                                <p className="text-lg text-gray-900 capitalize">{user?.subscription_tier || 'free'}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-semibold text-gray-700">Member Since</Label>
                                <p className="text-lg text-gray-900">
                                    {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}