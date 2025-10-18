// Transaction Types
export interface Transaction {
  id: string
  type: "payment" | "expense" | "refund" | "payroll"
  amount: number
  description: string
  date: string
  referenceId: string | null // Links to payment, expense, refund, or payroll
  createdBy: string
  createdAt: string
}

// Payment Types
export type PaymentType = 'installment' | 'full';
export type PaymentStatus = 'completed' | 'returned' | 'pending';
export type Currency = 'USD' | 'IQD';

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface Payment {
  id: number;
  payment_method_id: number;
  user_id: number;
  enrollment_id?: number | null;
  payer?: string | null;
  note?: string | null;
  amount: number;
  currency: Currency;
  type?: PaymentType | null;
  status?: PaymentStatus;
  paid_at: string; // ISO date string
  payment_proof?: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  paymentMethod?: PaymentMethod;
  enrollment?: {
    id: number;
    batch_name?: string;
    student?: {
      id: number;
      name?: string;
      fullName?: string;
      email?: string;
      phone?: string;
    };
  };
  user?: {
    id: number;
    name: string;
  };
  refunds?: Refund[];
}

// Expense Types
export interface Expense {
  id: number;
  user_id: number;
  beneficiary: string;
  description?: string | null;
  amount: number;
  currency: Currency;
  expense_date: string; // ISO date string
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

// Refund Types
export interface Refund {
  id: number;
  payment_id: number;
  reason?: string | null;
  refunded_at?: string | null; // ISO date string
  created_at: string;
  updated_at: string;
  
  // Relations
  payment?: {
    id: number;
    amount: number;
    currency: Currency;
    type?: PaymentType | null;
    paid_at: string;
    payer?: string | null;
    enrollment?: {
      id: number;
      batch_name?: string;
      student?: {
        id: number;
        name?: string;
        fullName?: string;
        phone?: string;
        email?: string;
      };
    } | null;
  };
}

// Discount Types
export interface Discount {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  description: string
  startDate: string
  endDate: string
  usageCount: number
  maxUsage: number | null
  isActive: boolean
  createdAt: string
}

// Payroll Types
export interface Payroll {
  id: number;
  user_id: number;
  amount: number;
  currency: Currency;
  period_start: string; // Date in YYYY-MM-DD format
  period_end: string;   // Date in YYYY-MM-DD format
  paid_at: string | null; // ISO date string or null if unpaid
  note?: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
}