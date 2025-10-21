import type { BaseEntity } from './common';
import type { User } from './user';
import type { Payment } from './payment';

export interface PaymentMethod extends BaseEntity {
  name: string;
  method_number?: string;
  description: string;
  is_valid: boolean;
  user_id: number;
  user?: User;
  payments?: Payment[];
}

export interface PaymentMethodFormData {
  name: string;
  method_number?: string;
  description: string;
  is_valid: boolean;
}