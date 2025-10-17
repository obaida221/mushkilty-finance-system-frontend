// src/hooks/useExpenses.ts
import { useState, useEffect, useCallback } from "react";
import expensesAPI from "../api/expensesAPI";
import type { Expense, Currency } from "../types/financial";

export type CreateExpenseDto = {
  user_id: number;
  beneficiary: string;
  description?: string;
  amount: number;
  currency?: Currency;
  expense_date: string; // ISO date string
};

interface UseExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
}

interface UseExpensesReturn extends UseExpensesState {
  fetchExpenses: () => Promise<void>;
  createExpense: (data: CreateExpenseDto) => Promise<Expense>;
  updateExpense: (id: number, data: Partial<CreateExpenseDto>) => Promise<Expense>;
  deleteExpense: (id: number) => Promise<void>;
  getExpenseById: (id: number) => Promise<Expense>;
  refreshExpenses: () => void;
}

export const useExpenses = (): UseExpensesReturn => {
  const [state, setState] = useState<UseExpensesState>({
    expenses: [],
    loading: false,
    error: null,
  });

  // Fetch all expenses
  const fetchExpenses = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await expensesAPI.getAll();
      setState(prev => ({ ...prev, expenses: response.data, loading: false }));
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch expenses";
      setState(prev => ({
        ...prev,
        error: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        loading: false,
      }));
    }
  }, []);

  // Create new expense
  const createExpense = useCallback(async (data: CreateExpenseDto): Promise<Expense> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await expensesAPI.create(data);
      const newExpense = response.data;
      setState(prev => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
        loading: false,
      }));
      return newExpense;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to create expense";
      setState(prev => ({
        ...prev,
        error: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        loading: false,
      }));
      throw err;
    }
  }, []);

  // Update existing expense
  const updateExpense = useCallback(async (id: number, data: Partial<CreateExpenseDto>): Promise<Expense> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await expensesAPI.update(id, data);
      const updatedExpense = response.data;
      setState(prev => ({
        ...prev,
        expenses: prev.expenses.map(e => (e.id === id ? updatedExpense : e)),
        loading: false,
      }));
      return updatedExpense;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to update expense";
      setState(prev => ({
        ...prev,
        error: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        loading: false,
      }));
      throw err;
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await expensesAPI.delete(id);
      setState(prev => ({
        ...prev,
        expenses: prev.expenses.filter(exp => exp.id !== id),
        loading: false,
      }));
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete expense";
      setState(prev => ({
        ...prev,
        error: Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg,
        loading: false,
      }));
      throw err;
    }
  }, []);

  // Get expense by ID
  const getExpenseById = useCallback(async (id: number): Promise<Expense> => {
    try {
      const response = await expensesAPI.getById(id);
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch expense";
      throw new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  }, []);

  // Refresh expenses
  const refreshExpenses = useCallback(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    ...state,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    refreshExpenses,
  };
};

export default useExpenses;
