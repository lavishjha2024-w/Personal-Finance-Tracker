import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Portfolio from './components/Portfolio/Portfolio';
import ExpenseTracker from './components/ExpenseTracker/ExpenseTracker';
import AssetFlowchart from './components/AssetFlowchart/AssetFlowchart';
import SmartInsights from './components/SmartInsights/SmartInsights';
import Goals from './components/Goals/Goals';
import Analytics from './components/Analytics/Analytics';
import Investments from './components/Investments/Investments';
import Gamification from './components/Gamification/Gamification';
import Help from './components/Help/Help';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import OnboardingTour from './components/Onboarding/OnboardingTour';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

const MainLayout = () => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <OnboardingProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="/" element={
                    <>
                      <OnboardingTour />
                      <Dashboard />
                    </>
                  } />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/expenses" element={<ExpenseTracker />} />
                  <Route path="/flowchart" element={<AssetFlowchart />} />
                  <Route path="/insights" element={<SmartInsights />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/investments" element={<Investments />} />
                  <Route path="/gamification" element={<Gamification />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/help" element={<Help />} />
                </Route>
              </Routes>
            </Router>
          </OnboardingProvider>
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
