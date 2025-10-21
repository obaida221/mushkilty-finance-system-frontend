import type { Role } from './auth';
import type { BaseEntity } from './common';

export interface User extends BaseEntity {
  name: string;
  email: string;
  role_id?: number;
  role?: Role;
}
