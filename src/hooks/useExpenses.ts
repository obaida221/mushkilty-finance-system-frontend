// src/hooks/useExpenses.ts
import { useState, useEffect } from "react";
import expensesAPI from "../api/expensesAPI";

export interface Expense {
  id: number;
  userId?: number;
  user?: { id: number; name: string };
  amount: number;
  category?: string;
  date: string;        
  note?: string;
  createdAt: string;   
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expensesAPI.getAll();

      const formatted: Expense[] = response.data.map((exp: any) => ({
        id: Number(exp.id),
        userId: exp.userId,
        user: exp.user,
        amount: exp.amount,
        category: exp.category,
        date: exp.expense_date,
        note: exp.note,
        createdAt: exp.created_at,
      }));

      setExpenses(formatted);
    } catch (err: any) {
      setError(err.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  // Create new expense
  const createExpense = async (data: Partial<Expense>) => {
    try {
      const response = await expensesAPI.create(data);
      const exp: Expense = {
        id: Number(response.data.id),
        userId: response.data.userId,
        user: response.data.user,
        amount: response.data.amount,
        category: response.data.category,
        date: response.data.expense_date,
        note: response.data.note,
        createdAt: response.data.created_at,
      };
      setExpenses(prev => [...prev, exp]);
      return exp;
    } catch (err: any) {
      throw err;
    }
  };

  // Update existing expense
  const updateExpense = async (id: number, data: Partial<Expense>) => {
    try {
      const response = await expensesAPI.update(id, data);
      const exp: Expense = {
        id: Number(response.data.id),
        userId: response.data.userId,
        user: response.data.user,
        amount: response.data.amount,
        category: response.data.category,
        date: response.data.expense_date,
        note: response.data.note,
        createdAt: response.data.created_at,
      };
      setExpenses(prev => prev.map(e => (e.id === id ? exp : e)));
      return exp;
    } catch (err: any) {
      throw err;
    }
  };

  // Delete expense
  const deleteExpense = async (id: number) => {
    try {
      await expensesAPI.delete(id);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
};
