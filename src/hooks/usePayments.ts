import { useState, useEffect, useCallback } from "react";
import { paymentsAPI } from "../api";
import type { Payment } from "../types/payment";
import { useStudents } from "./useStudents";

export type PaymentStatus = 'completed' | 'returned' | 'pending' | 'refunded';

export type CreatePaymentDto = {
  user_id: number;
  enrollment_id?: number | null;
  payment_method_id: number;
  payer?: string | null;
  amount: number;
  currency?: "IQD" | "USD";
  type?: "full" | "installment";
  status?: PaymentStatus;
  paid_at?: string;
  note?: string | null;
  payment_proof?: string;
};

interface UsePaymentsState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

interface UsePaymentsReturn extends UsePaymentsState {
  fetchPayments: () => Promise<void>;
  createPayment: (data: CreatePaymentDto) => Promise<Payment>;
  updatePayment: (id: number, data: Partial<CreatePaymentDto>) => Promise<Payment>;
  deletePayment: (id: number) => Promise<void>;
  getPaymentById: (id: number) => Promise<Payment>;
  getPaymentsByStudent: (studentId: number) => Payment[];
  refreshPayments: () => void;
}

export const updatePayment = async (id: number, data: Partial<CreatePaymentDto>) => {
  try {
    const response = await paymentsAPI.update(id, data);
    return response.data;
  } catch (error) {
    // console.error("Failed to update payment:", error);
    throw error;
  }
};

export const usePayments = (): UsePaymentsReturn => {
  const [state, setState] = useState<UsePaymentsState>({
    payments: [],
    loading: false,
    error: null,
  });

  // Fetch all payments
  const fetchPayments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await paymentsAPI.getAll();
      setState(prev => ({ ...prev, payments: res.data, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to fetch payments",
        loading: false,
      }));
    }
  }, []);

  const { updateStudentStatusBasedOnPayment } = useStudents();
  
  // Create payment
  const createPayment = useCallback(async (data: CreatePaymentDto): Promise<Payment> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await paymentsAPI.create(data);
      const newPayment = res.data;
      
      // تحديث حالة الطالب إلى "مقبول" عند دفع الرسوم
      if (data.enrollment_id && data.status === "completed") {
        // الحصول على معرف الطالب من التسجيل
        const payment = await getPaymentById(newPayment.id);
        if (payment.enrollment?.student?.id) {
          await updateStudentStatusBasedOnPayment(payment.enrollment.student.id);
        }
      }
      
      setState(prev => ({
        ...prev,
        payments: [newPayment, ...prev.payments],
        loading: false,
      }));
      return newPayment;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to create payment",
        loading: false,
      }));
      throw error;
    }
  }, [updateStudentStatusBasedOnPayment]);

  // Update payment
  const updatePayment = useCallback(async (id: number, data: Partial<CreatePaymentDto>): Promise<Payment> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await paymentsAPI.update(id, data);
      const updatedPayment = res.data;
      setState(prev => ({
        ...prev,
        payments: prev.payments.map(p => (p.id === id ? updatedPayment : p)),
        loading: false,
      }));
      return updatedPayment;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to update payment",
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Delete payment
  const deletePayment = useCallback(async (id: number): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await paymentsAPI.delete(id);
      setState(prev => ({
        ...prev,
        payments: prev.payments.filter(p => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to delete payment",
        loading: false,
      }));
      throw error;
    }
  }, []);

  // Get payment by ID
  const getPaymentById = useCallback(async (id: number): Promise<Payment> => {
    try {
      const res = await paymentsAPI.getById(id);
      return res.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to fetch payment");
    }
  }, []);

  // Get payments by student (enrollment_id)
  const getPaymentsByStudent = useCallback((studentId: number): Payment[] => {
    return state.payments.filter(p => p.enrollment_id === studentId);
  }, [state.payments]);

  // Refresh payments
  const refreshPayments = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    ...state,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentById,
    getPaymentsByStudent,
    refreshPayments,
  };
};

export default usePayments;
