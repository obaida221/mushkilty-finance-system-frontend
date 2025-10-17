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
  id: string
  studentId: string
  student?: {
    id: string
    fullName: string
    email: string
    phone: string
    courseId: string | null
    enrollmentDate: string | null
    status: "active" | "inactive" | "graduated"
    totalPaid: number
    totalDue: number
    discountId: string | null
    createdAt: string
  }
  amount: number
  reason: string
  transactionId: string
  transaction?: Transaction
  date: string
  approvedBy: string
  createdAt: string
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
  id: string
  teacherId: string
  teacher?: {
    id: string
    fullName: string
    email: string
    phone: string
    specialization: string
    salary: number
    status: "active" | "inactive"
    createdAt: string
  }
  amount: number
  bonus: number
  deductions: number
  netAmount: number
  month: string
  year: number
  transactionId: string
  transaction?: Transaction
  status: "pending" | "paid"
  paidDate: string | null
  createdAt: string
}