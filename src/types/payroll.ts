export interface Payroll {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  period_start: string; 
  period_end: string;   
  paid_at?: string | null;  
  note?: string | null;
  created_at: string; 
  updated_at: string;
}

export interface PayrollFormData {
  user_id: number;
  amount: number;
  currency?: 'IQD' | 'USD';   
  period_start: string;  
  period_end: string;   
  paid_at?: string | null; 
  note?: string;
}

export interface CreatePayrollDto {
  user_id: number;
  amount: number;
  currency: 'IQD' | 'USD';
  period_start: string;
  period_end: string;
  paid_at?: string | null;
  note?: string;
}

export interface UpdatePayrollDto extends Partial<CreatePayrollDto> {}