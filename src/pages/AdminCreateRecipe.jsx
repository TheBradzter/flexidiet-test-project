
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, PenTool, Shield } from "lucide-react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RecipeImporter from "../components/foods/RecipeImporter";
import ManualRecipeForm from "../components/foods/ManualRecipeForm";
import RecipeInspiration from "../components/recipes/RecipeInspiration";

export default function AdminCreateRecipePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMethod, setActiveMethod] = useState(null);
  const navigate = useNavigate();
  const [preselectedUrl, setPreselectedUrl] = useState('');

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleRecipeAdded = () => {
    navigate(createPageUrl("AdminRecipes"));
  };

  const handleImportFromInspiration = (url) => {
    setActiveMethod('import');
    // We'll pass the URL to the RecipeImporter component
    setPreselectedUrl(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyan-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cyan-800 flex items-center justify-center p-4">
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

  if (activeMethod === 'import') {
    return (
      <div className="min-h-screen bg-cyan-800 py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Import Recipe from Web
            </h1>
            <Button
              onClick={() => setActiveMethod(null)}
              variant="outline"
              className="bg-white text-cyan-800 hover:bg-cyan-50"
            >
              Back to Options
            </Button>
          </div>
          <RecipeImporter 
            onRecipeAdded={handleRecipeAdded} 
            preselectedUrl={preselectedUrl}
          />
        </div>
      </div>
    );
  }

  if (activeMethod === 'manual') {
    return (
      <div className="min-h-screen bg-cyan-800 py-8 px-4 text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8" />
              Create Recipe Manually
            </h1>
            <Button
              onClick={() => setActiveMethod(null)}
              variant="outline"
              className="bg-white text-cyan-800 hover:bg-cyan-50"
            >
              Back to Options
            </Button>
          </div>
          <ManualRecipeForm 
            onRecipeAdded={handleRecipeAdded}
            onCancel={() => setActiveMethod(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-800 py-8 px-4 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Create New Recipe
          </h1>
          <p className="text-cyan-200 mt-1">Choose how you'd like to add a new recipe</p>
        </div>

        {/* Recipe Inspiration Section */}
        <RecipeInspiration onImportUrl={handleImportFromInspiration} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card 
            className="glass-card shadow-xl border-0 bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setActiveMethod('import')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Import from Web</h3>
              <p className="text-gray-600 mb-6">
                Paste a recipe URL and let AI extract the ingredients and instructions automatically.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ Quick and easy</p>
                <p>⚠️ May need manual correction</p>
                <p>✓ Works best with popular recipe sites</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="glass-card shadow-xl border-0 bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setActiveMethod('manual')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create Manually</h3>
              <p className="text-gray-600 mb-6">
                Enter all recipe details manually for complete control and accuracy.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>✓ 100% accurate</p>
                <p>✓ Full control over details</p>
                <p>⏱️ Takes more time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card shadow-lg border-0 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Recommendation for Accuracy</h3>
            <p className="text-yellow-700">
              For the most accurate recipes, especially for nutrition calculations, we recommend using the <strong>Manual Entry</strong> method. 
              This ensures all ingredients and quantities are exactly as you intend them to be.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
