import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Food', type: 'expense', color: '#FF6B6B' },
    { id: 2, name: 'Transport', type: 'expense', color: '#4ECDC4' },
    { id: 3, name: 'Shopping', type: 'expense', color: '#95E1D3' },
    { id: 4, name: 'Bills', type: 'expense', color: '#F38181' },
    { id: 5, name: 'Entertainment', type: 'expense', color: '#AA96DA' },
    { id: 6, name: 'Salary', type: 'income', color: '#6BCB77' },
    { id: 7, name: 'Freelance', type: 'income', color: '#4D96FF' },
    { id: 8, name: 'Investment Returns', type: 'income', color: '#9B59B6' },
  ]);
  const [learnedMappings, setLearnedMappings] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAssets = localStorage.getItem('assets');
    const savedTransactions = localStorage.getItem('transactions');
    const savedGoals = localStorage.getItem('goals');
    const savedMappings = localStorage.getItem('learnedMappings');

    if (savedAssets) setAssets(JSON.parse(savedAssets));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedMappings) setLearnedMappings(JSON.parse(savedMappings));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('learnedMappings', JSON.stringify(learnedMappings));
  }, [learnedMappings]);

  const addAsset = (asset) => {
    setAssets([...assets, { ...asset, id: Date.now() }]);
  };

  const updateAsset = (id, updates) => {
    setAssets(assets.map(asset => asset.id === id ? { ...asset, ...updates } : asset));
  };

  const deleteAsset = (id) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const addTransaction = (transaction) => {
    const category = autoCategorize(transaction);
    setTransactions([{ ...transaction, id: Date.now(), category: category.name }, ...transactions]);
  };

  const updateTransaction = (id, updates) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
    
    // Learn from manual categorization
    if (updates.category && updates.merchant) {
      setLearnedMappings({
        ...learnedMappings,
        [updates.merchant.toLowerCase()]: updates.category
      });
    }
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const autoCategorize = (transaction) => {
    const merchant = transaction.merchant?.toLowerCase() || '';
    
    // Check learned mappings first
    if (learnedMappings[merchant]) {
      return categories.find(c => c.name === learnedMappings[merchant]) || categories[0];
    }

    // Auto-detect based on merchant name
    const merchantLower = merchant.toLowerCase();
    if (merchantLower.includes('zomato') || merchantLower.includes('swiggy') || merchantLower.includes('food')) {
      return categories.find(c => c.name === 'Food') || categories[0];
    }
    if (merchantLower.includes('uber') || merchantLower.includes('ola') || merchantLower.includes('petrol')) {
      return categories.find(c => c.name === 'Transport') || categories[0];
    }
    if (merchantLower.includes('netflix') || merchantLower.includes('spotify') || merchantLower.includes('prime')) {
      return categories.find(c => c.name === 'Entertainment') || categories[0];
    }

    return categories[0];
  };

  const addGoal = (goal) => {
    setGoals([...goals, { ...goal, id: Date.now(), progress: 0 }]);
  };

  const updateGoal = (id, updates) => {
    setGoals(goals.map(goal => goal.id === id ? { ...goal, ...updates } : goal));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const value = {
    assets,
    transactions,
    goals,
    categories,
    learnedMappings,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    autoCategorize,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

