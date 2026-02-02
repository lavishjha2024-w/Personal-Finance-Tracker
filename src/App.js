import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <Router>
          <div className="app">
            <Sidebar />
            <div className="main-content">
              <Header />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/expenses" element={<ExpenseTracker />} />
                <Route path="/flowchart" element={<AssetFlowchart />} />
                <Route path="/insights" element={<SmartInsights />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/gamification" element={<Gamification />} />
              </Routes>
            </div>
          </div>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;

