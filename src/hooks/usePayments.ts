// src/pages/usePayments.ts
import { useState, useEffect } from "react";
import paymentsAPI from "../api/paymentsAPI";

export const usePayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (data: any) => {
    try {
      const response = await paymentsAPI.create(data);
      setPayments(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      throw err;
    }
  };

  const updatePayment = async (id: number, data: any) => {
    try {
      const response = await paymentsAPI.update(id, data);
      setPayments(prev => prev.map(p => p.id === id ? response.data : p));
      return response.data;
    } catch (err: any) {
      throw err;
    }
  };

  const deletePayment = async (id: number) => {
    try {
      await paymentsAPI.delete(id);
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
  };
};
