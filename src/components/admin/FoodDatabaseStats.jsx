import React, { useState, useEffect } from "react";
import { Food } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Flag, TrendingUp, Package } from "lucide-react";

export default function FoodDatabaseStats() {
  const [stats, setStats] = useState({
    total: 0,
    byCountry: {},
    bySource: {},
    byCategory: {},
    recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const allFoods = await Food.list('-created_date', 1000); // Get recent 1000 for stats
      
      const stats = {
        total: allFoods.length,
        byCountry: {},
        bySource: {},
        byCategory: {},
        recent: allFoods.slice(0, 10) // Most recent 10
      };

      // Count by country
      allFoods.forEach(food => {
        const country = food.country || 'Unknown';
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
      });

      // Count by data source
      allFoods.forEach(food => {
        const source = food.data_source || 'unknown';
        stats.bySource[source] = (stats.bySource[source] || 0) + 1;
      });

      // Count by category
      allFoods.forEach(food => {
        const category = food.category || 'unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      setStats(stats);
    } catch (error) {
      console.error("Error loading food stats:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Foods</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.byCountry).length}</p>
                <p className="text-sm text-gray-600">Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(stats.bySource).length}</p>
                <p className="text-sm text-gray-600">Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Country */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flag className="w-5 h-5" />
              By Country
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.byCountry)
              .sort(([,a], [,b]) => b - a)
              .map(([country, count]) => (
                <div key={country} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Badge variant="outline">{country}</Badge>
                  <span className="font-semibold">{count.toLocaleString()}</span>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* By Data Source */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              By Data Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.bySource)
              .sort(([,a], [,b]) => b - a)
              .map(([source, count]) => (
                <div key={source} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Badge variant="outline" className="capitalize">
                    {source.replace('_', ' ')}
                  </Badge>
                  <span className="font-semibold">{count.toLocaleString()}</span>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.byCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Badge variant="outline" className="capitalize">
                    {category.replace('_', ' ')}
                  </Badge>
                  <span className="font-semibold">{count.toLocaleString()}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Additions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Additions (Last 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recent.map((food) => (
              <div key={food.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{food.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" size="sm">{food.category?.replace('_', ' ')}</Badge>
                    {food.country && (
                      <Badge variant="outline" size="sm">{food.country}</Badge>
                    )}
                    <Badge variant="outline" size="sm">{food.data_source?.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>{Math.round(food.calories_per_100g)} cal/100g</p>
                  <p>{new Date(food.created_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}