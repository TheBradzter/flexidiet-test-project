import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ChefHat, CookingPot, Utensils, UserPlus, Drumstick, Clock, Calendar, Heart, Zap, Microwave, Ban } from 'lucide-react';

export default function CookingPrefsStep({ formData, setFormData, onNext, onBack, isIsolated = false }) {
  const proteinPowderBrands = [
    "Optimum Nutrition Gold Standard Whey",
    "Optimum Nutrition Isolate Whey", 
    "Dymatize ISO100 Whey Protein Isolate",
    "BSN Syntha-6 Whey Protein",
    "MuscleTech Nitro-Tech Whey Protein",
    "Cellucor COR-Performance Whey",
    "Quest Nutrition Whey Protein",
    "Isopure Zero Carb Whey Protein",
    "Garden of Life Raw Organic Protein",
    "Vega Sport Protein (Plant-based)",
    "Orgain Organic Plant Based Protein",
    "NOW Sports Whey Protein Isolate",
    "Universal Nutrition Ultra Whey Pro",
    "MusclePharm Combat Protein",
    "Mammoth Supplements Whey Protein"
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHouseholdChange = (index, field, value) => {
    const updated = [...(formData.household_members || [])];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, household_members: updated }));
  };

  const addHouseholdMember = () => {
    const updated = [...(formData.household_members || []), { type: 'adult', name: '' }];
    setFormData(prev => ({ ...prev, household_members: updated }));
  };
  
  const removeHouseholdMember = (index) => {
    const updated = (formData.household_members || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, household_members: updated }));
  };

  const handleTakeawayDayToggle = (day) => {
    const current = formData.scheduled_takeaway_days || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    setFormData(prev => ({ ...prev, scheduled_takeaway_days: updated }));
  };

  const handleTimingPreferenceChange = (value) => {
    setFormData(prev => ({ ...prev, timing_preference: value }));
  };

  const handlePrepTimeChange = (meal, time) => {
    setFormData(prev => ({
      ...prev,
      prep_time_preferences: {
        ...prev.prep_time_preferences,
        [meal]: time
      }
    }));
  };

  const handlePartnerSharingToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      share_meals_with_partner: checked,
      partner_email: checked ? prev.partner_email || '' : ''
    }));
  };

  const handlePartnerEmailChange = (email) => {
    setFormData(prev => ({
      ...prev,
      partner_email: email
    }));
  };

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const timeOptions = ['5 mins', '10 mins', '15 mins', '30 mins', '45 mins', '1 hour', '1+ hours'];

  return (
    <Card className="glass-card shadow-2xl border-0 max-w-4xl mx-auto">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#6BBD4F] to-[#5aa03f] rounded-full flex items-center justify-center">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-charcoal">Cooking & Meal Preferences</CardTitle>
        <p className="text-gray-600 mt-2">Help us personalize your meal planning experience</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Cooking Skill */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <CookingPot className="w-5 h-5"/>
            Cooking Preference
          </Label>
          <RadioGroup 
            value={formData.cooking_skill || 'beginner'} 
            onValueChange={(value) => handleInputChange('cooking_skill', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="no_cook" id="no_cook" />
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" />
                <Label htmlFor="no_cook" className="font-medium cursor-pointer flex-1">
                  No Cook - Ready meals, takeaways, minimal prep only
                </Label>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="microwave_only" id="microwave_only" />
              <div className="flex items-center gap-2">
                <Microwave className="w-4 h-4 text-blue-500" />
                <Label htmlFor="microwave_only" className="font-medium cursor-pointer flex-1">
                  Microwave Only - Quick heating and simple microwave meals
                </Label>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="beginner" id="beginner" />
              <div className="flex items-center gap-2">
                <CookingPot className="w-4 h-4 text-green-500" />
                <Label htmlFor="beginner" className="font-medium cursor-pointer flex-1">
                  Beginner - Simple recipes with basic cooking
                </Label>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-500" />
                <Label htmlFor="intermediate" className="font-medium cursor-pointer flex-1">
                  Intermediate - Comfortable with most cooking techniques
                </Label>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="advanced" id="advanced" />
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-purple-500" />
                <Label htmlFor="advanced" className="font-medium cursor-pointer flex-1">
                  Advanced - Love complex cooking and experimenting
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Partner Sharing Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-pink-50">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Connect my account to my partner for shared dinners and leftover calculation logic
            </Label>
            <Switch 
              checked={formData.share_meals_with_partner || false} 
              onCheckedChange={handlePartnerSharingToggle} 
            />
          </div>
          
          {formData.share_meals_with_partner && (
            <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border">
              <div className="space-y-2">
                <Label className="text-gray-700">Partner's Email Address</Label>
                <Input 
                  type="email"
                  placeholder="partner@example.com" 
                  value={formData.partner_email || ''} 
                  onChange={(e) => handlePartnerEmailChange(e.target.value)} 
                  className="h-10"
                />
                <p className="text-sm text-gray-600">
                  Your partner will need to have a FlexiDiet account with this email address. 
                  Once connected, you'll share dinner meal plans and leftover calculations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Meal Variety Preference */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Utensils className="w-5 h-5"/>
            Meal Variety Preference
          </Label>
          <RadioGroup 
            value={formData.meal_variety_preference || 'variety'} 
            onValueChange={(value) => handleInputChange('meal_variety_preference', value)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="variety" id="variety" />
              <Label htmlFor="variety" className="font-medium cursor-pointer flex-1">
                I like variety - different meals each day
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="same_daily" id="same_daily" />
              <Label htmlFor="same_daily" className="font-medium cursor-pointer flex-1">
                I prefer eating the same thing every day (simple routine)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Takeaways Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <Label className="text-lg font-semibold text-gray-700">Takeaway Preferences</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>How many takeaways per week?</Label>
              <Select 
                value={formData.takeaway_frequency_per_week?.toString() || '0'} 
                onValueChange={(value) => handleInputChange('takeaway_frequency_per_week', parseInt(value))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None - I cook everything</SelectItem>
                  <SelectItem value="1">1 per week</SelectItem>
                  <SelectItem value="2">2 per week</SelectItem>
                  <SelectItem value="3">3 per week</SelectItem>
                  <SelectItem value="4">4 per week</SelectItem>
                  <SelectItem value="5">5 per week</SelectItem>
                  <SelectItem value="6">6 per week</SelectItem>
                  <SelectItem value="7">Daily takeaways</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.takeaway_frequency_per_week > 0 && (
              <div className="space-y-2">
                <Label>Preferred takeaway days (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {weekDays.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`takeaway-${day}`}
                        checked={formData.scheduled_takeaway_days?.includes(day) || false}
                        onCheckedChange={() => handleTakeawayDayToggle(day)}
                      />
                      <Label htmlFor={`takeaway-${day}`} className="text-sm capitalize cursor-pointer">
                        {day}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meal Prep Timing */}
        <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
          <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-5 h-5"/>
            How much time do you have for cooking?
          </Label>
          
          <RadioGroup 
            value={formData.timing_preference || 'apply_all'} 
            onValueChange={handleTimingPreferenceChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
              <RadioGroupItem value="apply_all" id="apply_all" />
              <Label htmlFor="apply_all" className="font-medium cursor-pointer flex-1 text-gray-700">
                Apply same time limits to all meals
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
              <RadioGroupItem value="customize_days" id="customize_days" />
              <Label htmlFor="customize_days" className="font-medium cursor-pointer flex-1 text-gray-700">
                Different time limits for different days
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-white">
              <RadioGroupItem value="meal_prep" id="meal_prep" />
              <Label htmlFor="meal_prep" className="font-medium cursor-pointer flex-1 text-gray-700">
                I meal prep in batches
              </Label>
            </div>
          </RadioGroup>

          {formData.timing_preference === 'apply_all' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {mealTypes.map(meal => (
                <div key={meal} className="space-y-2">
                  <Label className="capitalize text-gray-700">{meal} prep time</Label>
                  <Select 
                    value={formData.prep_time_preferences?.[meal] || ''} 
                    onValueChange={(value) => handlePrepTimeChange(meal, value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          {formData.timing_preference === 'meal_prep' && (
            <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-gray-800">Meal Prep Schedule</h4>
              
              <div className="space-y-2">
                <Label className="text-gray-700">How many times per week do you meal prep?</Label>
                <Select 
                  value={formData.meal_prep_frequency || ''} 
                  onValueChange={(value) => handleInputChange('meal_prep_frequency', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once per week</SelectItem>
                    <SelectItem value="twice">Twice per week</SelectItem>
                    <SelectItem value="three_times">Three times per week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-gray-700">When do you meal prep?</Label>
                {(formData.meal_prep_sessions || []).map((session, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select 
                      value={session.day} 
                      onValueChange={(value) => {
                        const updated = [...(formData.meal_prep_sessions || [])];
                        updated[index] = { ...updated[index], day: value };
                        setFormData(prev => ({ ...prev, meal_prep_sessions: updated }));
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map(day => (
                          <SelectItem key={day} value={day} className="capitalize">{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={session.meal_type || ''} 
                      onValueChange={(value) => {
                        const updated = [...(formData.meal_prep_sessions || [])];
                        updated[index] = { ...updated[index], meal_type: value };
                        setFormData(prev => ({ ...prev, meal_prep_sessions: updated }));
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Which meal to prep" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="all">All meals</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        const updated = (formData.meal_prep_sessions || []).filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, meal_prep_sessions: updated }));
                      }}
                    >
                      X
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const updated = [...(formData.meal_prep_sessions || []), { day: '', meal_type: '' }];
                    setFormData(prev => ({ ...prev, meal_prep_sessions: updated }));
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Add Prep Session
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Household Members */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <UserPlus className="w-5 h-5"/>
            Who are you cooking for?
          </Label>
          {(formData.household_members || []).map((member, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Select value={member.type} onValueChange={(val) => handleHouseholdChange(index, 'type', val)}>
                <SelectTrigger className="w-32">
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder={member.type === 'child' ? 'e.g., Child' : 'e.g., Partner'} 
                value={member.name} 
                onChange={(e) => handleHouseholdChange(index, 'name', e.target.value)} 
                className="flex-1"
              />
              <Button variant="destructive" onClick={() => removeHouseholdMember(index)}>
                X
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addHouseholdMember}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
          
          {formData.household_members?.length > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Checkbox
                id="exclude_family"
                checked={formData.exclude_family_from_leftovers || false}
                onCheckedChange={(checked) => handleInputChange('exclude_family_from_leftovers', checked)}
              />
              <Label htmlFor="exclude_family" className="text-sm cursor-pointer text-gray-700">
                I'm cooking for one (exclude family from leftover calculations)
              </Label>
            </div>
          )}
        </div>

        {/* Leftovers */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-lg font-semibold text-gray-700">Use Leftovers for Next Day?</Label>
            <p className="text-sm text-gray-600">Plan meals that can be reused the following day</p>
          </div>
          <Switch 
            checked={formData.utilize_leftovers !== false} 
            onCheckedChange={(checked) => handleInputChange('utilize_leftovers', checked)} 
          />
        </div>

        {/* Protein Supplements Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-lime-600" />
            <h3 className="text-lg font-semibold text-charcoal">Protein Supplements</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="uses-protein"
                checked={formData.uses_protein_powder || false}
                onCheckedChange={(checked) => handleInputChange('uses_protein_powder', checked)}
                className="data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500"
              />
              <Label htmlFor="uses-protein" className="text-sm font-semibold text-gray-700">
                I use protein powder supplements
              </Label>
            </div>

            {formData.uses_protein_powder && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="protein-brand" className="text-sm font-semibold text-gray-700">
                    Preferred Protein Powder Brand
                  </Label>
                  <Select 
                    value={formData.preferred_protein_powder || ''} 
                    onValueChange={(value) => handleInputChange('preferred_protein_powder', value)}
                  >
                    <SelectTrigger className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl">
                      <SelectValue placeholder="Select your preferred brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {proteinPowderBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shakes-per-day" className="text-sm font-semibold text-gray-700">
                    Shakes per day
                  </Label>
                  <Select 
                    value={formData.protein_shakes_per_day?.toString() || '1'} 
                    onValueChange={(value) => handleInputChange('protein_shakes_per_day', parseInt(value))}
                  >
                    <SelectTrigger className="h-12 text-lg border-2 border-gray-100 focus:border-lime-500 rounded-xl">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 shake</SelectItem>
                      <SelectItem value="2">2 shakes</SelectItem>
                      <SelectItem value="3">3 shakes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button onClick={onBack} variant="outline" className="w-full sm:flex-1 h-14 text-lg font-semibold rounded-xl">
            Back
          </Button>
          <Button onClick={onNext} className="w-full sm:flex-1 h-14 text-lg font-semibold bg-lime-500 hover:bg-lime-600 text-white rounded-xl">
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}