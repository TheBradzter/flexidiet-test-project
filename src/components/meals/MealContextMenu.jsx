
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Search, 
  Pizza, 
  CheckCircle, 
  Heart,
  X
} from 'lucide-react';

export default function MealContextMenu({ 
  x, 
  y, 
  meal, 
  onClose, 
  onReplaceRandom, 
  onReplaceSearch, 
  onCheatMeal, 
  onToggleAdherence, 
  onFavorite 
}) {
  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <Card 
        className="absolute bg-white shadow-2xl border-0 rounded-xl overflow-hidden min-w-[200px]"
        style={{ 
          left: Math.min(x, window.innerWidth - 220), 
          top: Math.min(y, window.innerHeight - 300) 
        }}
        onClick={handleClick}
      >
        <CardContent className="p-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-left font-normal hover:bg-blue-50"
              onClick={onReplaceRandom}
            >
              <RefreshCw className="w-4 h-4 mr-3 text-blue-600" />
              Replace with Random
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-left font-normal hover:bg-green-50"
              onClick={onReplaceSearch}
            >
              <Search className="w-4 h-4 mr-3 text-green-600" />
              Replace - Search
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-left font-normal hover:bg-orange-50"
              onClick={onCheatMeal}
            >
              <Pizza className="w-4 h-4 mr-3 text-orange-600" />
              Cheat Meal
            </Button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-left font-normal hover:bg-purple-50"
              onClick={onToggleAdherence}
            >
              <CheckCircle className="w-4 h-4 mr-3 text-purple-600" />
              Track Adherence
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 text-left font-normal hover:bg-pink-50"
              onClick={onFavorite}
            >
              <Heart className="w-4 h-4 mr-3 text-pink-600" />
              Add to Favorites
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
