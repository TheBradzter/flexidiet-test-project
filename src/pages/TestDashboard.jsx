/**
 * Test Dashboard - Admin page for running security and functionality tests
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Wrench, Database, AlertTriangle } from "lucide-react";
import SecurityTests from "../components/testing/SecurityTests";
import FunctionalityTests from "../components/testing/FunctionalityTests";

export default function TestDashboard() {
  const [activeTab, setActiveTab] = useState('security');

  const tabs = [
    { id: 'security', label: 'Security Tests', icon: Shield },
    { id: 'functionality', label: 'Functionality Tests', icon: Wrench },
    { id: 'database', label: 'Database Status', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Dashboard</h1>
          <p className="text-gray-600">Monitor app security, functionality, and data integrity</p>
        </div>

        {/* Critical Security Alert */}
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3 text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-semibold">Critical Security Notice</h3>
              <p className="text-sm mt-1">
                User data crossover vulnerability has been identified and patched. 
                All database queries now properly filtered by user authentication.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Security Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityTests />
              </CardContent>
            </Card>
          )}

          {activeTab === 'functionality' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  Functionality Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FunctionalityTests />
              </CardContent>
            </Card>
          )}

          {activeTab === 'database' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">Food Database Import Status</h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Last NZ Food Files import status unknown. Please check import logs.
                    </p>
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      Check Import Status
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">USDA Food Database</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      USDA foods need to be tagged with country="United States" for proper filtering.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Update USDA Country Tags
                    </Button>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Data Integrity</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total Foods:</span>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                      <div>
                        <span className="font-medium">Total Recipes:</span>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                      <div>
                        <span className="font-medium">NZ Foods:</span>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                      <div>
                        <span className="font-medium">US Foods:</span>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}