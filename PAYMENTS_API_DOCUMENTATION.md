# Payments API Documentation

This document describes the payments endpoints, DTOs, validation rules, example requests/responses, and frontend integration notes for the payment management system.

Base path: `/payments`
Auth: Bearer JWT required. All endpoints are protected by `JwtAuthGuard` and `PermissionsGuard`.

---

## Overview

The Payments API manages financial transactions, including student enrollment payments, installments, and general income tracking. Payments can be linked to enrollments or recorded as standalone transactions.

**Key Features:**
- Link payments to enrollments for student fee tracking
- Support for installment and full payment types
- Multiple payment methods (cash, card, transfer, bank)
- Payment proof upload capability
- Revenue tracking and analytics
- Multi-currency support (USD/IQD)

---

## Endpoints

### POST /payments
Create a new payment record.

**Permissions:** `payments:create`

**Request Body (CreatePaymentDto):**
- `payment_method_id` (number, required) — ID of the payment method used
- `user_id` (number, required) — ID of the user recording the payment
- `enrollment_id` (number, optional) — Link to enrollment (if student payment)
- `payer` (string, optional, max 255) — Payer name (required if no enrollment_id)
- `note` (string, optional) — Additional payment notes
- `amount` (number, required) — Payment amount
- `currency` (string, optional) — `USD` or `IQD` (default: IQD)
- `type` (string, optional) — `installment` or `full`
- `paid_at` (ISO date string, optional) — Payment date (defaults to now)
- `payment_proof` (string, optional) — URL/path to payment proof image

**Example Request (Enrollment Payment):**

```json
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_method_id": 1,
  "user_id": 2,
  "enrollment_id": 45,
  "amount": 500000,
  "currency": "IQD",
  "type": "installment",
  "note": "First installment - English A1 course",
  "paid_at": "2024-01-15T10:30:00Z",
  "payment_proof": "https://storage.example.com/receipts/payment_123.jpg"
}
```

**Example Request (Non-Enrollment Payment):**

```json
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_method_id": 2,
  "user_id": 2,
  "payer": "QAF LAB",
  "amount": 1000000,
  "currency": "IQD",
  "note": "Corporate training payment",
  "paid_at": "2024-01-15T14:00:00Z"
}
```

**Success Response (201):**

```json
{
  "id": 156,
  "payment_method_id": 1,
  "user_id": 2,
  "enrollment_id": 45,
  "payer": null,
  "note": "First installment - English A1 course",
  "amount": 500000,
  "currency": "IQD",
  "type": "installment",
  "paid_at": "2024-01-15T10:30:00.000Z",
  "payment_proof": "https://storage.example.com/receipts/payment_123.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "paymentMethod": {
    "id": 1,
    "name": "cash"
  },
  "enrollment": {
    "id": 45,
    "student": {
      "id": 12,
      "name": "Ahmed Ali"
    }
  }
}
```

**Validation Rules:**
- Either `enrollment_id` OR `payer` should be provided (business logic)
- `amount` must be a positive number
- `currency` only accepts `USD` or `IQD`
- `type` only accepts `installment` or `full`
- `paid_at` must be valid ISO 8601 date string

**Error Responses:**
- `400 Bad Request` — Validation errors:
  ```json
  {
    "statusCode": 400,
    "message": [
      "payment_method_id must be an integer number",
      "amount must be a number conforming to the specified constraints"
    ],
    "error": "Bad Request"
  }
  ```
- `401 Unauthorized` — Missing/invalid token
- `403 Forbidden` — User lacks `payments:create` permission

---

### GET /payments
Get all payments with relations.

**Permissions:** `payments:read`

**Response (200):**

Returns array of Payment objects with relations:
- `paymentMethod` — Payment method details
- `enrollment` — Enrollment details (if linked)
- `enrollment.student` — Student details (if enrollment exists)

```json
[
  {
    "id": 156,
    "payment_method_id": 1,
    "user_id": 2,
    "enrollment_id": 45,
    "amount": 500000,
    "currency": "IQD",
    "type": "installment",
    "paid_at": "2024-01-15T10:30:00.000Z",
    "paymentMethod": {
      "id": 1,
      "name": "cash"
    },
    "enrollment": {
      "id": 45,
      "student": {
        "id": 12,
        "name": "Ahmed Ali"
      }
    }
  },
  {
    "id": 155,
    "payment_method_id": 2,
    "user_id": 3,
    "enrollment_id": null,
    "payer": "QAF LAB",
    "amount": 1000000,
    "currency": "IQD",
    "paid_at": "2024-01-14T09:00:00.000Z",
    "paymentMethod": {
      "id": 2,
      "name": "transfer"
    },
    "enrollment": null
  }
]
```

**Note:** Results are ordered by `created_at DESC` (newest first).

---

### GET /payments/:id
Get a single payment by ID.

**Permissions:** `payments:read`

**Path Parameters:**
- `id` (number) — Payment ID

**Success Response (200):**

```json
{
  "id": 156,
  "payment_method_id": 1,
  "user_id": 2,
  "enrollment_id": 45,
  "payer": null,
  "note": "First installment",
  "amount": 500000,
  "currency": "IQD",
  "type": "installment",
  "paid_at": "2024-01-15T10:30:00.000Z",
  "payment_proof": "https://storage.example.com/receipts/payment_123.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "paymentMethod": {
    "id": 1,
    "name": "cash"
  },
  "enrollment": {
    "id": 45,
    "student": {
      "id": 12,
      "name": "Ahmed Ali"
    }
  }
}
```

**Error Responses:**
- `404 Not Found` — Payment doesn't exist
- `403 Forbidden` — Lacks permission

---

### PATCH /payments/:id
Update an existing payment.

**Permissions:** `payments:update`

**Path Parameters:**
- `id` (number) — Payment ID

**Request Body:** Partial<CreatePaymentDto> (all fields optional)

**Example Request:**

```json
PATCH /payments/156
Authorization: Bearer <token>

{
  "amount": 550000,
  "note": "First installment - updated amount",
  "payment_proof": "https://storage.example.com/receipts/payment_123_v2.jpg"
}
```

**Success Response (200):** Returns updated payment object

**Error Responses:**
- `400 Bad Request` — Validation failure
- `404 Not Found` — Payment doesn't exist
- `403 Forbidden` — Lacks permission

---

### DELETE /payments/:id
Delete a payment record.

**Permissions:** `payments:delete`

**Path Parameters:**
- `id` (number) — Payment ID

**Success Response (200):** Void (no content)

**Error Responses:**
- `404 Not Found` — Payment doesn't exist
- `403 Forbidden` — Lacks permission

**Warning:** Deleting payments may affect financial reports and refund tracking. Consider soft deletes or status flags in production.

---

## DTOs

### CreatePaymentDto

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `payment_method_id` | number | ✅ | @IsInt() | Payment method reference |
| `user_id` | number | ✅ | @IsInt() | User recording the payment |
| `enrollment_id` | number | ❌ | @IsInt(), @IsOptional() | Link to enrollment |
| `payer` | string | ❌ | @MaxLength(255), @IsOptional() | Payer name (if no enrollment) |
| `note` | string | ❌ | @IsString(), @IsOptional() | Additional notes |
| `amount` | number | ✅ | @IsNumber() | Payment amount |
| `currency` | string | ❌ | @IsIn(['USD','IQD']), @IsOptional() | Currency code |
| `type` | string | ❌ | @IsIn(['installment','full']), @IsOptional() | Payment type |
| `paid_at` | Date | ❌ | @IsDateString(), @IsOptional() | Payment timestamp |
| `payment_proof` | string | ❌ | @IsString(), @IsOptional() | Proof image URL |

### UpdatePaymentDto
Partial type of `CreatePaymentDto` — all fields are optional.

---

## Frontend Integration

### TypeScript Interface

```typescript
export type PaymentType = 'installment' | 'full';
export type Currency = 'USD' | 'IQD';

interface PaymentMethod {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
}

interface Enrollment {
  id: number;
  student?: Student;
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
  enrollment?: Enrollment;
  refunds?: Refund[];
}
```

### React Hooks (using React Query)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Payment } from '../types/payment';

const PAYMENTS_KEY = ['payments'];

// Get all payments
export function usePayments() {
  return useQuery<Payment[], Error>(PAYMENTS_KEY, async () => {
    const { data } = await api.get<Payment[]>('/payments');
    return data;
  });
}

// Get single payment
export function usePayment(id: number) {
  return useQuery<Payment, Error>(
    ['payment', id],
    async () => {
      const { data } = await api.get<Payment>(`/payments/${id}`);
      return data;
    },
    { enabled: Boolean(id) }
  );
}

// Create payment
export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation<Payment, any, Partial<Payment>>(
    async (payload) => {
      const { data } = await api.post<Payment>('/payments', payload);
      return data;
    },
    {
      onSuccess: () => qc.invalidateQueries(PAYMENTS_KEY),
    }
  );
}

// Update payment
export function useUpdatePayment(id: number) {
  const qc = useQueryClient();
  return useMutation<Payment, any, Partial<Payment>>(
    async (payload) => {
      const { data } = await api.patch<Payment>(`/payments/${id}`, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(PAYMENTS_KEY);
        qc.invalidateQueries(['payment', id]);
      },
    }
  );
}

// Delete payment
export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation<void, any, number>(
    async (id) => {
      await api.delete(`/payments/${id}`);
    },
    {
      onSuccess: () => qc.invalidateQueries(PAYMENTS_KEY),
    }
  );
}
```

### Example Component: Payment Form

```tsx
import React, { useState } from 'react';
import { useCreatePayment } from '../hooks/usePayments';

export function PaymentForm({ onSuccess }: { onSuccess?: () => void }) {
  const create = useCreatePayment();
  const [formData, setFormData] = useState({
    payment_method_id: 1,
    enrollment_id: '',
    payer: '',
    amount: '',
    currency: 'IQD' as const,
    type: 'installment' as const,
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await create.mutateAsync({
        payment_method_id: Number(formData.payment_method_id),
        user_id: Number(localStorage.getItem('user_id')), // Get from auth context
        enrollment_id: formData.enrollment_id ? Number(formData.enrollment_id) : undefined,
        payer: formData.payer || undefined,
        amount: Number(formData.amount),
        currency: formData.currency,
        type: formData.type,
        note: formData.note || undefined,
        paid_at: new Date().toISOString(),
      });
      
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create payment';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Payment Method ID
        <input
          type="number"
          value={formData.payment_method_id}
          onChange={(e) => setFormData({ ...formData, payment_method_id: Number(e.target.value) })}
          required
        />
      </label>

      <label>
        Enrollment ID (optional)
        <input
          type="number"
          value={formData.enrollment_id}
          onChange={(e) => setFormData({ ...formData, enrollment_id: e.target.value })}
        />
      </label>

      <label>
        Payer Name (if no enrollment)
        <input
          value={formData.payer}
          onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
          maxLength={255}
        />
      </label>

      <label>
        Amount
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </label>

      <label>
        Currency
        <select
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
        >
          <option value="IQD">IQD</option>
          <option value="USD">USD</option>
        </select>
      </label>

      <label>
        Type
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
        >
          <option value="installment">Installment</option>
          <option value="full">Full Payment</option>
        </select>
      </label>

      <label>
        Note
        <textarea
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />
      </label>

      <button type="submit" disabled={create.isLoading}>
        {create.isLoading ? 'Processing...' : 'Record Payment'}
      </button>
    </form>
  );
}
```

### Example Component: Payments List

```tsx
import React from 'react';
import { usePayments } from '../hooks/usePayments';

export function PaymentsList() {
  const { data: payments, isLoading, error } = usePayments();

  if (isLoading) return <div>Loading payments...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Payments</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Payer/Student</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Type</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments?.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.id}</td>
              <td>
                {payment.enrollment?.student?.name || payment.payer || '—'}
              </td>
              <td>
                {payment.amount.toLocaleString()} {payment.currency}
              </td>
              <td>{payment.paymentMethod?.name || '—'}</td>
              <td>{payment.type || '—'}</td>
              <td>{new Date(payment.paid_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Business Logic Notes

### Payment Proof Upload
The `payment_proof` field accepts a URL/path string. For file uploads:
1. Upload image to your storage service (S3, Cloudinary, etc.)
2. Get the public URL
3. Include URL in the `payment_proof` field

### Enrollment vs. Standalone Payments
- **Enrollment payments:** Set `enrollment_id`, leave `payer` null/empty
- **Standalone payments:** Set `payer` name, leave `enrollment_id` null/empty
- Business rule: At least one should be provided for tracking purposes

### Installment Tracking
To track multiple installments for one enrollment:
1. Create multiple payment records with same `enrollment_id`
2. Set `type: 'installment'` for partial payments
3. Set `type: 'full'` when enrollment is paid in full
4. Query all payments for an enrollment to calculate total paid

### Multi-Currency Handling
- All amounts stored as decimal(12,2)
- Frontend should handle currency conversion if needed
- Filter/group by currency in reports to avoid mixing currencies

---

## Common Validation Errors & Fixes

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `payment_method_id must be an integer number` | Sending string or missing | Convert to number: `Number(value)` |
| `user_id must be an integer number` | Missing or wrong type | Get from auth context, convert to number |
| `amount must be a number conforming to the specified constraints` | String or negative number | Convert to number, ensure positive |
| `currency must be one of the following values: USD, IQD` | Invalid currency code | Use only 'USD' or 'IQD' |
| `type must be one of the following values: installment, full` | Invalid type | Use only 'installment' or 'full' |
| `paid_at must be a valid ISO 8601 date string` | Invalid date format | Use `new Date().toISOString()` or 'YYYY-MM-DD' |

---

## Analytics & Dashboard Methods

The payment service includes several analytics methods (not exposed as REST endpoints but used internally):

- `getTotalByDateRange(startDate, endDate)` — Sum of payments in date range
- `getTotalByMonth(year, month)` — Monthly revenue total
- `getRevenueChartData(months)` — Revenue trend data for charts
- `getPaymentMethodDistribution(months)` — Breakdown by payment method
- `getRecentPayments(limit)` — Latest N payments

These can be exposed as additional endpoints if needed for dashboard features.

---

## Security Considerations

1. **Permission-based access:** All endpoints require specific permissions
2. **User tracking:** `user_id` records who created/modified payments
3. **Audit trail:** `created_at` and `updated_at` timestamps are automatic
4. **Payment proof:** Validate image URLs and implement proper storage security
5. **Financial data:** Consider encryption at rest for sensitive payment data

---

End of Payments API Documentation.
