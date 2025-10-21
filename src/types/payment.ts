import { User } from "./auth"
import type { BaseEntity, Currency } from "./common"

export type PaymentStatus = 'completed' | 'returned' | 'pending';
export type PaymentType = 'installment' | 'full';

export interface PaymentMethod extends BaseEntity {
  name: string;
  method_number?: string | null;
  description?: string | null;
  is_valid: boolean;
  user_id: number;
  user?: User;
}

export interface Payment extends BaseEntity {
  user_id: number;
  enrollment_id?: number | null;
  payment_method_id: number;

  payer?: string | null;
  amount: number;
  currency: Currency;
  type?: PaymentType | null;
  status?: PaymentStatus;

  note?: string | null;
  paid_at: string;
  payment_proof?: string | null;

  user?: User;

  enrollment?: {
    id: number;
    student: {
      id: number;
      full_name: string;
      age?: number | null;
      dob?: string | null;
      education_level?: string;
      gender?: string;
      phone: string;
      city: string;
      area?: string;
      course_type?: any;
      previous_course?: string;
      is_returning: boolean;
      status: string;
      created_at: string;
      updated_at: string;
    };
    batch_id: number;
    discount_code?: string;
    total_price: string;
    currency: string;
    enrolled_at: string;
    status: string;
    notes: string;
    created_at: string;
    updated_at: string;
  } | null;

  paymentMethod?: PaymentMethod;

  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  user_id: number;
  enrollment_id?: number | null;
  payment_method_id: number;

  payer?: string | null;
  amount: number;
  currency: Currency;
  type?: PaymentType | null;
  status?: PaymentStatus;
  note?: string | null;
  paid_at: string;
  payment_proof?: string | null;
}
