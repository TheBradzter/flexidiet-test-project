import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { AppSettings } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Settings, Crown, Users, DollarSign } from "lucide-react";

export default function AdminSettingsTab() {
    const [appSettings, setAppSettings] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [csrResult, setCsrResult] = useState(null);
    const [generatingCSR, setGeneratingCSR] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const settings = await AppSettings.list();
            if (settings.length > 0) {
                setAppSettings(settings[0]);
            } else {
                const defaultSettings = {
                    premium_enabled_globally: true,
                    allow_free_recipe_import: false,
                    free_trial_days: 7,
                    monthly_price: 4.99,
                    daily_reminders_enabled: true
                };
                const created = await AppSettings.create(defaultSettings);
                setAppSettings(created);
            }

            const users = await User.list();
            setAllUsers(users);

        } catch (error) {
            console.error("Error loading admin data:", error);
        }
        setLoading(false);
    };

    const updateAppSettings = async (updates) => {
        setSaving(true);
        try {
            const updated = await AppSettings.update(appSettings.id, updates);
            setAppSettings(updated);
        } catch (error) {
            console.error("Error updating settings:", error);
            alert("Failed to update settings");
        }
        setSaving(false);
    };

    const toggleUserPremium = async (userId, currentStatus) => {
        try {
            await User.update(userId, { 
                admin_granted_premium: !currentStatus,
                subscription_tier: !currentStatus ? 'premium' : 'free'
            });
            loadData();
        } catch (error) {
            console.error("Error updating user premium:", error);
            alert("Failed to update user premium status");
        }
    };

    const generateCSR = async () => {
        setGeneratingCSR(true);
        try {
            const { generateSSLCSR } = await import("@/api/functions");
            const response = await generateSSLCSR();
            setCsrResult(response.data);
        } catch (error) {
            console.error("Error generating CSR:", error);
            alert("Failed to generate CSR. Please try again.");
        }
        setGeneratingCSR(false);
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        );
    }

    return (
        <div className="space-y-8 text-gray-900">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-cyan-800" />
                        SSL Certificate Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Domain: flexidiet.co.nz</h4>
                        <p className="text-blue-700 text-sm mb-4">
                            Generate a Certificate Signing Request (CSR) and its corresponding Private Key. You will need both to install your SSL certificate.
                        </p>
                        
                        <Button 
                            onClick={generateCSR}
                            disabled={generatingCSR}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {generatingCSR ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Generating CSR...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Generate CSR for flexidiet.co.nz
                                </>
                            )}
                        </Button>
                    </div>

                    {csrResult && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-800 mb-3">✅ CSR and Private Key Generated Successfully!</h4>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-green-800 font-semibold">Instructions:</Label>
                                    <ul className="list-disc list-inside text-green-700 text-sm mt-2 space-y-1">
                                        {csrResult.instructions?.map((instruction, index) => (
                                            <li key={index}>{instruction}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <Label className="text-green-800 font-semibold">Certificate Signing Request (CSR):</Label>
                                    <div className="mt-2 relative">
                                        <textarea 
                                            readOnly 
                                            value={csrResult.csr}
                                            className="w-full h-40 p-3 border border-green-300 rounded bg-white text-xs font-mono resize-none"
                                        />
                                        <Button 
                                            size="sm"
                                            onClick={() => navigator.clipboard.writeText(csrResult.csr)}
                                            className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                                        >
                                            Copy CSR
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-green-800 font-semibold">Private Key:</Label>
                                    <div className="mt-2 relative">
                                        <textarea 
                                            readOnly 
                                            value={csrResult.privateKey}
                                            className="w-full h-40 p-3 border border-green-300 rounded bg-white text-xs font-mono resize-none"
                                        />
                                        <Button 
                                            size="sm"
                                            onClick={() => navigator.clipboard.writeText(csrResult.privateKey)}
                                            className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                                        >
                                            Copy Private Key
                                        </Button>
                                    </div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                    <p className="text-yellow-800 text-sm font-semibold">⚠️ Important:</p>
                                    <p className="text-yellow-700 text-sm">
                                        Keep the private key extremely secure! It is crucial for installing your SSL certificate. 
                                        Anyone with this key can decrypt your website's traffic. Do not share it publicly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-6 h-6 text-cyan-800" />
                        Subscription Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <Label className="text-base font-semibold">
                                    Premium Enabled Globally
                                </Label>
                                <p className="text-sm text-gray-600">
                                    Enable premium features for all users (testing mode)
                                </p>
                            </div>
                            <Switch
                                checked={appSettings?.premium_enabled_globally || false}
                                onCheckedChange={(checked) => updateAppSettings({ premium_enabled_globally: checked })}
                                disabled={saving}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <Label className="text-base font-semibold">
                                    Free Recipe Import
                                </Label>
                                <p className="text-sm text-gray-600">
                                    Allow free users to import recipes temporarily
                                </p>
                            </div>
                            <Switch
                                checked={appSettings?.allow_free_recipe_import || false}
                                onCheckedChange={(checked) => updateAppSettings({ allow_free_recipe_import: checked })}
                                disabled={saving}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                                <Label className="text-base font-semibold">
                                    Daily Reminder Emails
                                </Label>
                                <p className="text-sm text-gray-600">
                                    Send daily adherence reminder emails to users
                                </p>
                            </div>
                            <Switch
                                checked={appSettings?.daily_reminders_enabled || false}
                                onCheckedChange={(checked) => updateAppSettings({ daily_reminders_enabled: checked })}
                                disabled={saving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Free Trial Days
                            </Label>
                            <Input
                                type="number"
                                value={appSettings?.free_trial_days || 7}
                                onChange={(e) => updateAppSettings({ free_trial_days: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base font-semibold">
                                Monthly Price ($)
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={appSettings?.monthly_price || 4.99}
                                onChange={(e) => updateAppSettings({ monthly_price: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-cyan-800" />
                        User Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {allUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-semibold">{user.full_name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {user.role === 'admin' && (
                                                <Badge className="bg-red-500 text-white">Admin</Badge>
                                            )}
                                            {user.subscription_tier === 'premium' && (
                                                <Badge className="bg-amber-500 text-white">
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    Premium
                                                </Badge>
                                            )}
                                            {user.admin_granted_premium && (
                                                <Badge className="bg-blue-500 text-white">Admin Granted</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {user.role !== 'admin' && (
                                    <Button
                                        variant={user.admin_granted_premium ? "destructive" : "default"}
                                        size="sm"
                                        onClick={() => toggleUserPremium(user.id, user.admin_granted_premium)}
                                        className="ml-4"
                                    >
                                        {user.admin_granted_premium ? 'Remove Premium' : 'Grant Premium'}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}