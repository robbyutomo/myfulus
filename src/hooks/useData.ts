"use client";

import { useEffect } from "react";
import { useAppStore, CACHE_DURATION } from "@/store/useAppStore";

interface UseDataOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

// Dashboard
export function useDashboard(options?: UseDataOptions) {
  const { dashboard, lastFetch, setDashboard } = useAppStore();
  const { enabled = true } = options || {};

  useEffect(() => {
    if (!enabled) return;
    if (dashboard && Date.now() - lastFetch.dashboard < CACHE_DURATION) return;

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setDashboard(data))
      .catch(console.error);
  }, [enabled, dashboard, lastFetch.dashboard, setDashboard]);

  return dashboard;
}

// Transactions
export function useTransactions(options?: UseDataOptions) {
  const { transactions, lastFetch, setTransactions } = useAppStore();
  const { enabled = true } = options || {};

  useEffect(() => {
    if (!enabled) return;
    if (transactions.length > 0 && Date.now() - lastFetch.transactions < CACHE_DURATION) return;

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch(console.error);
  }, [enabled, transactions.length, lastFetch.transactions, setTransactions]);

  return transactions;
}

// Budgets
export function useBudgets(month: number, year: number, options?: UseDataOptions) {
  const { budgets, lastFetch, setBudgets } = useAppStore();
  const { enabled = true } = options || {};
  const key = `${month}-${year}`;

  useEffect(() => {
    if (!enabled) return;
    if (budgets.length > 0 && lastFetch.budgets === key) return;

    fetch(`/api/budgets?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => setBudgets(key, data.budgets || []))
      .catch(console.error);
  }, [enabled, month, year, key, budgets.length, lastFetch.budgets, setBudgets]);

  return budgets;
}

// Savings
export function useSavings(options?: UseDataOptions) {
  const { savings, lastFetch, setSavings } = useAppStore();
  const { enabled = true } = options || {};

  useEffect(() => {
    if (!enabled) return;
    if (savings.length > 0 && Date.now() - lastFetch.savings < CACHE_DURATION) return;

    fetch("/api/savings")
      .then((res) => res.json())
      .then((data) => setSavings(data.savingsGoals || []))
      .catch(console.error);
  }, [enabled, savings.length, lastFetch.savings, setSavings]);

  return savings;
}

// Categories
export function useCategories(options?: UseDataOptions) {
  const { categories, lastFetch, setCategories } = useAppStore();
  const { enabled = true } = options || {};

  useEffect(() => {
    if (!enabled) return;
    if (categories.length > 0 && Date.now() - lastFetch.categories < CACHE_DURATION) return;

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, [enabled, categories.length, lastFetch.categories, setCategories]);

  return categories;
}
