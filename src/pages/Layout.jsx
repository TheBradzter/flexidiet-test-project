

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Calendar, ChefHat, ShoppingCart, Compass, ClipboardCheck, Utensils, Shield, Stethoscope, Trophy } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "My Meal Plan",
    url: createPageUrl("MealPlan"),
    icon: Utensils,
  },
  {
    title: "Daily View", 
    url: createPageUrl("DailyPlan"),
    icon: Calendar,
  },
  {
    title: "Success Tracker",
    url: createPageUrl("SuccessTracker"),
    icon: ClipboardCheck,
  },
  {
    title: "My Recipes",
    url: createPageUrl("Recipes"),
    icon: ChefHat,
  },
  {
    title: "Find New Recipe",
    url: createPageUrl("FindNewRecipe"),
    icon: Compass,
  },
  {
    title: "Grocery List",
    url: createPageUrl("GroceryList"),
    icon: ShoppingCart,
  },
  {
    title: "8 Week Challenge",
    url: createPageUrl("EightWeekChallenge"),
    icon: Trophy,
  },
  {
    title: "Nutritionist",
    url: createPageUrl("Nutritionist"),
    icon: Stethoscope,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
  {
    title: "Admin",
    url: createPageUrl("Admin"),
    icon: Shield,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#005A8D' }}>
        <Sidebar className="border-r" style={{ borderColor: '#004B74', backgroundColor: '#005A8D' }}>
          <SidebarHeader className="border-b p-4 sm:p-6 flex flex-col justify-center items-center" style={{ borderColor: '#004B74', backgroundColor: '#005A8D' }}>
            <Link to={createPageUrl("MealPlan")} className="w-full">
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg mb-2 sm:mb-3 w-full max-w-[200px] flex justify-center mx-auto cursor-pointer hover:shadow-xl transition-shadow">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d4388cd35_Flexidiet_Logo_transparent.png" 
                  alt="FlexiDiet Logo" 
                  className="h-8 sm:h-10 w-auto object-contain"
                />
              </div>
            </Link>
            <h2 className="text-white text-xs sm:text-sm font-semibold text-center leading-tight">
              Build Your Own Meal Plan
            </h2>
          </SidebarHeader>
          
          <SidebarContent className="p-4" style={{ backgroundColor: '#005A8D' }}>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-300 rounded-xl mb-2 font-medium ${
                          location.pathname === item.url 
                            ? 'shadow-sm' 
                            : 'text-white'
                        }`}
                        style={{ 
                          backgroundColor: location.pathname === item.url ? '#6BBD4F' : 'transparent',
                          color: 'white'
                        }}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-800">
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-6" style={{ borderColor: '#004B74', backgroundColor: '#005A8D' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#004B74' }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">Your Profile</p>
                <p className="text-xs truncate text-white/70">Personalized nutrition</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b px-4 sm:px-6 py-3 sm:py-4 md:hidden" style={{ backgroundColor: '#005A8D', borderColor: '#004B74' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SidebarTrigger className="p-2 rounded-lg transition-colors duration-200 text-white mr-3 hover:bg-blue-800">
                  <div className="flex flex-col space-y-1">
                    <div className="w-5 h-0.5 bg-white rounded"></div>
                    <div className="w-5 h-0.5 bg-white rounded"></div>
                    <div className="w-5 h-0.5 bg-white rounded"></div>
                  </div>
                </SidebarTrigger>
                <span className="text-white text-sm font-medium">Menu</span>
              </div>
              
              <div className="text-center flex-1">
                <div className="bg-white rounded-lg px-3 py-2 shadow-md mb-1 inline-block max-w-[150px]">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d4388cd35_Flexidiet_Logo_transparent.png" 
                    alt="FlexiDiet Logo" 
                    className="h-6 w-auto object-contain mx-auto"
                  />
                </div>
                <p className="text-white text-xs font-medium text-center">Build Your Own Meal Plan</p>
              </div>
              
              <div className="w-16 flex items-center justify-end">
                {currentPageName === 'MealPlan' && (
                  <Link to={createPageUrl("GroceryList")} title="Shopping List" className="p-2">
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </Link>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto" style={{ backgroundColor: '#005A8D' }}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

