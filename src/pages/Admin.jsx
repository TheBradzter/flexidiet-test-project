import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ChefHat, Database, Settings } from 'lucide-react';
import AdminRecipesTab from '../components/admin/AdminRecipesTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import FoodDatabaseTab from '../components/admin/FoodDatabaseTab';

export default function AdminPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await User.me();
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to fetch user", error);
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#005A8D]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                </div>
            </div>
        );
    }

    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#005A8D]">
                <Card className="max-w-md w-full bg-white shadow-xl">
                    <CardContent className="p-8 text-center">
                        <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You need admin privileges to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen py-8 px-4 bg-[#005A8D]">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="text-white">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8" />
                        Admin Panel
                    </h1>
                    <p className="text-cyan-200 mt-1">Manage application data and settings</p>
                </div>
                
                <Tabs defaultValue="recipes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-white/10 p-2 h-auto rounded-xl">
                        <TabsTrigger value="recipes" className="flex items-center gap-2 text-white/90 transition-colors data-[state=active]:text-white data-[state=active]:bg-[#6BBD4F] hover:text-white hover:bg-white/10 rounded-lg h-12">
                            <ChefHat className="w-5 h-5"/>
                            Recipes
                        </TabsTrigger>
                        <TabsTrigger value="database" className="flex items-center gap-2 text-white/90 transition-colors data-[state=active]:text-white data-[state=active]:bg-[#6BBD4F] hover:text-white hover:bg-white/10 rounded-lg h-12">
                            <Database className="w-5 h-5"/>
                            Food Database
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2 text-white/90 transition-colors data-[state=active]:text-white data-[state=active]:bg-[#6BBD4F] hover:text-white hover:bg-white/10 rounded-lg h-12">
                            <Settings className="w-5 h-5"/>
                            App Settings
                        </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-6 bg-gray-50 text-gray-900 p-6 rounded-2xl shadow-inner">
                        <TabsContent value="recipes">
                            <AdminRecipesTab />
                        </TabsContent>
                        <TabsContent value="database">
                            <FoodDatabaseTab />
                        </TabsContent>
                        <TabsContent value="settings">
                            <AdminSettingsTab />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}