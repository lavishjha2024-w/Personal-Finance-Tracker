import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories] = useState([
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
  const [isHydrated, setIsHydrated] = useState(false);
  const storagePrefix = user?.id ? `pft:${user.id}` : null;

  // Load user-scoped data from localStorage whenever authenticated user changes.
  useEffect(() => {
    setIsHydrated(false);

    if (!storagePrefix) {
      setAssets([]);
      setTransactions([]);
      setGoals([]);
      setLearnedMappings({});
      setIsHydrated(true);
      return;
    }

    const savedAssets = localStorage.getItem(`${storagePrefix}:assets`);
    const savedTransactions = localStorage.getItem(`${storagePrefix}:transactions`);
    const savedGoals = localStorage.getItem(`${storagePrefix}:goals`);
    const savedMappings = localStorage.getItem(`${storagePrefix}:learnedMappings`);

    setAssets(savedAssets ? JSON.parse(savedAssets) : []);
    setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
    setGoals(savedGoals ? JSON.parse(savedGoals) : []);
    setLearnedMappings(savedMappings ? JSON.parse(savedMappings) : {});
    setIsHydrated(true);
  }, [storagePrefix]);

  // Save user-scoped data only after hydration is complete.
  useEffect(() => {
    if (!storagePrefix || !isHydrated) return;
    localStorage.setItem(`${storagePrefix}:assets`, JSON.stringify(assets));
  }, [assets, storagePrefix, isHydrated]);

  useEffect(() => {
    if (!storagePrefix || !isHydrated) return;
    localStorage.setItem(`${storagePrefix}:transactions`, JSON.stringify(transactions));
  }, [transactions, storagePrefix, isHydrated]);

  useEffect(() => {
    if (!storagePrefix || !isHydrated) return;
    localStorage.setItem(`${storagePrefix}:goals`, JSON.stringify(goals));
  }, [goals, storagePrefix, isHydrated]);

  useEffect(() => {
    if (!storagePrefix || !isHydrated) return;
    localStorage.setItem(`${storagePrefix}:learnedMappings`, JSON.stringify(learnedMappings));
  }, [learnedMappings, storagePrefix, isHydrated]);

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
    // Only auto-categorize if the user didn't provide a category
    const category = transaction.category ? transaction.category : autoCategorize(transaction).name;
    setTransactions([{ ...transaction, id: Date.now(), category: category }, ...transactions]);
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

