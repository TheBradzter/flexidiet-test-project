import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Shield } from 'lucide-react';

export default function RecipeCard({ recipe, onClick }) {
  return (
    <Card 
      className="glass-card shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden cursor-pointer"
      onClick={() => onClick && onClick(recipe)}
    >
      <div className="relative">
        <img 
          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80'}
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
        <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold drop-shadow-lg">
          {recipe.name}
        </h3>
        {!recipe.is_public && (
          <Badge className="absolute top-3 right-3 bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            Private
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-gray-600 h-10 overflow-hidden">
          {recipe.description}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-700 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-lime-600" />
            <span>{recipe.cook_time || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-lime-600" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}