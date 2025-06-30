
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Activity, Briefcase, Globe } from "lucide-react";

export default function BasicInfoStep({ formData, setFormData, onNext, onBack, isIsolated, hasExistingProfile }) {
  const countries = [
    { code: 'US', name: 'United States', system: 'imperial' },
    { code: 'GB', name: 'United Kingdom', system: 'metric' },
    { code: 'CA', name: 'Canada', system: 'metric' },
    { code: 'AU', name: 'Australia', system: 'metric' },
    { code: 'NZ', name: 'New Zealand', system: 'metric' },
    { code: 'IE', name: 'Ireland', system: 'metric' },
    { code: 'ZA', name: 'South Africa', system: 'metric' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCountryChange = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    setFormData(prev => ({
        ...prev,
        country: countryCode,
        measurement_system: country.system
    }));
  };

  const isValid = formData.height_cm && formData.weight_kg && formData.age && formData.gender && 
                 formData.exercise_sessions_per_week !== undefined && formData.job_type && formData.country;

  return (
    <Card className="glass-card shadow-2xl border-0 max-w-2xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#6BBD4F] to-[#5aa03f] rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-charcoal">Tell us about yourself</CardTitle>
        <p className="text-gray-600 mt-2">We'll use this to calculate your personalized calorie needs</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2 md:col-span-2">
            <Label htmlFor="country" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Country
            </Label>
            <Select value={formData.country || ''} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="height" className="text-sm font-semibold text-gray-700">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="170"
              value={formData.height_cm || ''}
              onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value))}
              className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={formData.weight_kg || ''}
              onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value))}
              className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-semibold text-gray-700">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="30"
              value={formData.age || ''}
              onChange={(e) => handleInputChange('age', parseFloat(e.target.value))}
              className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
            <Select value={formData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
              <SelectTrigger className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-lime-600" />
            <h3 className="text-lg font-semibold text-charcoal">Activity Level</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="exercise" className="text-sm font-semibold text-gray-700">Exercise sessions per week</Label>
            <Select value={formData.exercise_sessions_per_week?.toString() || ''} onValueChange={(value) => handleInputChange('exercise_sessions_per_week', parseInt(value))}>
              <SelectTrigger className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (No exercise)</SelectItem>
                <SelectItem value="1">1-2 sessions</SelectItem>
                <SelectItem value="3">3-4 sessions</SelectItem>
                <SelectItem value="5">5-6 sessions</SelectItem>
                <SelectItem value="7">Daily exercise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job type
            </Label>
            <Select value={formData.job_type || ''} onValueChange={(value) => handleInputChange('job_type', value)}>
              <SelectTrigger className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                <SelectItem value="physical">Physical job</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          {isIsolated && (
            <Button onClick={onBack} variant="outline" className="w-full sm:flex-1 h-14 text-lg font-semibold border-2 border-gray-200 hover:border-[#6BBD4F] hover:bg-green-50 rounded-xl">
              Cancel
            </Button>
          )}
          <Button 
            onClick={onNext}
            disabled={!isValid}
            className="w-full sm:flex-1 h-14 text-lg font-semibold bg-[#6BBD4F] hover:bg-[#5aa03f] text-white rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIsolated ? 'Save Changes' : 'Continue to Goals'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
