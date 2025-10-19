export type PaymentStatus = 'completed' | 'returned' | 'pending';

export interface Payment {
  id: number;
  user_id: number;
  enrollment_id?: number | null;
  payment_method_id: number;

  payer?: string | null;
  amount: number;
  currency: string;
  type?: string | null;
  status?: PaymentStatus;

  note?: string | null;
  paid_at: string;

  user: {
    id: number;
    name: string;
    email: string;
  };

  paymentMethod: {
    id: number;
    name: string;
    method_number?: string | null;
    description?: string | null;
    is_valid: boolean;
  };

  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  user_id: number;
  enrollment_id?: number | null;
  payment_method_id: number;

  payer?: string | null;
  amount: number;
  currency: string;
  type?: string | null;
  status?: PaymentStatus;
  note?: string | null;
  paid_at: string;
}
