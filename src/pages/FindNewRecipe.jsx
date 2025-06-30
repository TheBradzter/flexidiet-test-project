import React from 'react';
import RecipeInspiration from "../components/recipes/RecipeInspiration";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FindNewRecipePage() {
  const navigate = useNavigate();

  const handleImportFromInspiration = (url) => {
    // Navigate to recipes page with import mode and preselected URL
    navigate(createPageUrl(`Recipes?import=true&url=${encodeURIComponent(url)}`));
  };

  return (
    <div className="min-h-screen py-8 px-4 text-white" style={{ backgroundColor: '#005A8D' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Find New Recipes</h1>
          <p className="text-cyan-200 mt-1">Discover and import recipes from popular cooking websites</p>
        </div>

        <RecipeInspiration onImportUrl={handleImportFromInspiration} />
      </div>
    </div>
  );
}