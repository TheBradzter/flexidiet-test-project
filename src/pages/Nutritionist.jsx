import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Construction } from 'lucide-react';

export default function NutritionistPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#005A8D]">
        <Card className="max-w-xl w-full bg-white shadow-xl text-center">
            <CardHeader>
                <div className="mx-auto w-20 h-20 bg-[#6BBD4F] rounded-full flex items-center justify-center mb-4">
                    <Stethoscope className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Nutritionist Portal
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <Construction className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Coming Soon!</h3>
                <p className="text-gray-600">
                    We are building a dedicated portal for nutritionists to manage clients, create custom meal plans, and track progress. Stay tuned for updates!
                </p>
            </CardContent>
        </Card>
    </div>
  );
}