
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminSetupPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
    }
    setLoading(false);
  };

  const makeFlexidietAdmin = async () => {
    setUpdating(true);
    setMessage(null);
    
    try {
      await User.updateMyUserData({ role: 'FlexidietAdmin' });
      setMessage({ type: 'success', text: 'Successfully updated to FlexidietAdmin role!' });
      await loadUser(); // Reload user data
    } catch (error) {
      console.error("Error updating role:", error);
      setMessage({ type: 'error', text: 'Failed to update role: ' + error.message });
    }
    
    setUpdating(false);
  };

  const revertFlexidietAdminRole = async () => {
    setUpdating(true);
    setMessage(null);

    try {
      // Revert to 'user' role as the standard non-admin role in this context
      await User.updateMyUserData({ role: 'user' }); 
      setMessage({ type: 'success', text: 'Successfully reverted to standard user role!' });
      await loadUser(); // Reload user data to reflect change
    } catch (error) {
      console.error("Error reverting role:", error);
      setMessage({ type: 'error', text: 'Failed to revert role: ' + error.message });
    }

    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card shadow-2xl border-0 bg-white">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Setup</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Current User Info:</h3>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Name:</strong> {currentUser?.full_name}</p>
              <p><strong>Current Role:</strong> {currentUser?.role || 'user'}</p>
            </div>

            {currentUser?.role !== 'FlexidietAdmin' ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Admin Access Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    You need FlexidietAdmin role to import USDA foundation foods.
                  </p>
                </div>

                <Button
                  onClick={makeFlexidietAdmin}
                  disabled={updating}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Role...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Make Me FlexidietAdmin
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Admin Access Granted</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  You have FlexidietAdmin privileges. You can now import foundation foods.
                </p>
                <Button
                  onClick={revertFlexidietAdminRole}
                  disabled={updating}
                  className="w-full h-10 mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Reverting Role...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2 transform rotate-180" />
                      Revert to Standard User Role
                    </>
                  )}
                </Button>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
