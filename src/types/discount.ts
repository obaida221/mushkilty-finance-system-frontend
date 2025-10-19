export interface DiscountCode {
  id: number;
  code: string;
  name: string;
  purpose: string;
  amount?: number;
  currency: string;
  percent?: number;
  usage_limit?: number;
  used_count: number;
  valid_from?: string;
  valid_to?: string;
  active: boolean;
  user_id: number;
  user: { id: number; name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface DiscountFormData {
  code: string;
  name: string;
  purpose: string;
  amount?: number | null;
  currency?: string | null;
  percent?: number | null;
  usage_limit?: number;
  valid_from?: string | null;
  valid_to?: string | null;
  active: boolean;
}
