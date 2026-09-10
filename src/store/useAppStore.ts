"use client";

import { create } from "zustand";

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgets: Array<{
    id: string;
    amount: number;
    spent: number;
  }>;
  budgetSummary: {
    totalBudget: number;
    totalSpent: number;
    expenseOutsideBudget: number;
  } | null;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: "income" | "expense";
    description: string;
    date: string;
  }>;
}

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
  category: string;
}

interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface AppStore {
  // Data
  dashboard: DashboardData | null;
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal[];
  categories: Category[];
  
  // Timestamps for cache
  lastFetch: {
    dashboard: number;
    transactions: number;
    budgets: string; // month-year key
    savings: number;
    categories: number;
  };
  
  // Actions
  setDashboard: (data: DashboardData) => void;
  setTransactions: (data: Transaction[]) => void;
  setBudgets: (key: string, data: Budget[]) => void;
  setSavings: (data: SavingsGoal[]) => void;
  setCategories: (data: Category[]) => void;
  invalidateAll: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

export const useAppStore = create<AppStore>((set) => ({
  dashboard: null,
  transactions: [],
  budgets: [],
  savings: [],
  categories: [],
  
  lastFetch: {
    dashboard: 0,
    transactions: 0,
    budgets: "",
    savings: 0,
    categories: 0,
  },
  
  setDashboard: (data) => set((state) => ({
    dashboard: data,
    lastFetch: { ...state.lastFetch, dashboard: Date.now() },
  })),
  
  setTransactions: (data) => set((state) => ({
    transactions: data,
    lastFetch: { ...state.lastFetch, transactions: Date.now() },
  })),
  
  setBudgets: (key, data) => set((state) => ({
    budgets: data,
    lastFetch: { ...state.lastFetch, budgets: key },
  })),
  
  setSavings: (data) => set((state) => ({
    savings: data,
    lastFetch: { ...state.lastFetch, savings: Date.now() },
  })),
  
  setCategories: (data) => set((state) => ({
    categories: data,
    lastFetch: { ...state.lastFetch, categories: Date.now() },
  })),
  
  invalidateAll: () => set({
    dashboard: null,
    transactions: [],
    budgets: [],
    savings: [],
    categories: [],
    lastFetch: {
      dashboard: 0,
      transactions: 0,
      budgets: "",
      savings: 0,
      categories: 0,
    },
  }),
}));

export { CACHE_DURATION };
