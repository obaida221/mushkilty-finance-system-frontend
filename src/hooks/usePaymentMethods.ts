import { useState, useEffect, useCallback } from "react";
import { paymentMethodsAPI } from "../api/paymentMethodsAPI";
import type { PaymentMethod, PaymentMethodFormData } from "../types/paymentMethods";

interface UsePaymentMethodsState {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
}

interface UsePaymentMethodsReturn extends UsePaymentMethodsState {
  fetchPaymentMethods: () => Promise<void>;
  createPaymentMethod: (data: PaymentMethodFormData) => Promise<PaymentMethod>;
  updatePaymentMethod: (id: number, data: PaymentMethodFormData) => Promise<PaymentMethod>;
  deletePaymentMethod: (id: number) => Promise<void>;
  getPaymentMethodById: (id: number) => Promise<PaymentMethod>;
  refreshPaymentMethods: () => void;
}

export const usePaymentMethods = (): UsePaymentMethodsReturn => {
  const [state, setState] = useState<UsePaymentMethodsState>({
    paymentMethods: [],
    loading: false,
    error: null,
  });

  // Fetch all payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await paymentMethodsAPI.getAll();
      setState(prev => ({ 
        ...prev, 
        paymentMethods: response.data, 
        loading: false 
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || "فشل في تحميل وسائل الدفع",
        loading: false,
      }));
    }
  }, []);

  // Create payment method
  const createPaymentMethod = useCallback(async (data: PaymentMethodFormData): Promise<PaymentMethod> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await paymentMethodsAPI.create(data);
      const newPaymentMethod = response.data;
      setState(prev => ({
        ...prev,
        paymentMethods: [newPaymentMethod, ...prev.paymentMethods],
        loading: false,
      }));
      return newPaymentMethod;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || "فشل في إنشاء طريقة الدفع",
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Update payment method
  const updatePaymentMethod = useCallback(async (id: number, data: PaymentMethodFormData): Promise<PaymentMethod> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await paymentMethodsAPI.update(id, data);
      const updatedPaymentMethod = response.data;
      setState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map(pm => 
          pm.id === id ? updatedPaymentMethod : pm
        ),
        loading: false,
      }));
      return updatedPaymentMethod;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || "فشل في تحديث طريقة الدفع",
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Delete payment method
  const deletePaymentMethod = useCallback(async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await paymentMethodsAPI.delete(id);
      setState(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter(pm => pm.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || "فشل في حذف طريقة الدفع",
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Get payment method by ID
  const getPaymentMethodById = useCallback(async (id: number): Promise<PaymentMethod> => {
    try {
      const response = await paymentMethodsAPI.getById(id);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "فشل في جلب طريقة الدفع");
    }
  }, []);

  // Refresh payment methods
  const refreshPaymentMethods = useCallback(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Load data on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    ...state,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethodById,
    refreshPaymentMethods,
  };
};

export default usePaymentMethods;