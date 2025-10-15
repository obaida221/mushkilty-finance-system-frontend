import api from '../config/axios';

// Define extended payment method interface with user info
export interface PaymentMethodWithUser {
  id: number;
  name: string;
  method_number?: string;
  description: string;
  is_valid: boolean;
  is_active: boolean;
  user_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  payments: any[];
  created_at: string;
  updated_at: string;
}

// paymentMethods API (guest access for viewing, admin access for CRUD)
export const paymentMethodsAPI = {
  getAll: () => api.get<PaymentMethodWithUser[]>('/payment-methods'),
  getById: (id: number) => api.get<PaymentMethodWithUser>(`/payment-methods/${id}`),
  create: (paymentMethodData: any) => api.post<PaymentMethodWithUser>('/payment-methods', paymentMethodData),
  update: (id: number, paymentMethodData: any) => api.patch<PaymentMethodWithUser>(`/payment-methods/${id}`, paymentMethodData),
  delete: (id: number) => api.delete(`/payment-methods/${id}`),
};

export default paymentMethodsAPI;