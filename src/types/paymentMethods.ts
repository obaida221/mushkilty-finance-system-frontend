export interface PaymentMethod {
  id: number;
  name: string;
  method_number?: string;
  description: string;
  is_valid: boolean;
  user_id: number;
  user: { name: string; email: string; id: number };
  payments: any[];
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodFormData {
  name: string;
  method_number?: string;
  description: string;
  is_valid: boolean;
}