import Layout from "./Layout.jsx";

import Setup from "./Setup";

import MealPlan from "./MealPlan";

import DailyPlan from "./DailyPlan";

import AdminSetup from "./AdminSetup";

import Recipes from "./Recipes";

import GroceryList from "./GroceryList";

import AdminCreateRecipe from "./AdminCreateRecipe";

import FindNewRecipe from "./FindNewRecipe";

import SuccessTracker from "./SuccessTracker";

import UserSettings from "./UserSettings";

import Profile from "./Profile";

import Landing from "./Landing";

import Admin from "./Admin";

import Nutritionist from "./Nutritionist";

import TestDashboard from "./TestDashboard";

import EightWeekChallenge from "./EightWeekChallenge";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Setup: Setup,
    
    MealPlan: MealPlan,
    
    DailyPlan: DailyPlan,
    
    AdminSetup: AdminSetup,
    
    Recipes: Recipes,
    
    GroceryList: GroceryList,
    
    AdminCreateRecipe: AdminCreateRecipe,
    
    FindNewRecipe: FindNewRecipe,
    
    SuccessTracker: SuccessTracker,
    
    UserSettings: UserSettings,
    
    Profile: Profile,
    
    Landing: Landing,
    
    Admin: Admin,
    
    Nutritionist: Nutritionist,
    
    TestDashboard: TestDashboard,
    
    EightWeekChallenge: EightWeekChallenge,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Setup />} />
                
                
                <Route path="/Setup" element={<Setup />} />
                
                <Route path="/MealPlan" element={<MealPlan />} />
                
                <Route path="/DailyPlan" element={<DailyPlan />} />
                
                <Route path="/AdminSetup" element={<AdminSetup />} />
                
                <Route path="/Recipes" element={<Recipes />} />
                
                <Route path="/GroceryList" element={<GroceryList />} />
                
                <Route path="/AdminCreateRecipe" element={<AdminCreateRecipe />} />
                
                <Route path="/FindNewRecipe" element={<FindNewRecipe />} />
                
                <Route path="/SuccessTracker" element={<SuccessTracker />} />
                
                <Route path="/UserSettings" element={<UserSettings />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/Nutritionist" element={<Nutritionist />} />
                
                <Route path="/TestDashboard" element={<TestDashboard />} />
                
                <Route path="/EightWeekChallenge" element={<EightWeekChallenge />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}