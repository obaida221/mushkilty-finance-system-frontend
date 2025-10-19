# Expenses API Documentation

This document describes the expenses endpoints, DTOs, validation rules, example requests/responses, and frontend integration notes for the expense management system.

Base path: `/expenses`
Auth: Bearer JWT required. All endpoints are protected by `JwtAuthGuard` and `PermissionsGuard`.

---

## Overview

The Expenses API manages organizational expenses including salaries, marketing costs, equipment purchases, and other operational expenses. Expenses can be categorized by type and linked to specific projects.

**Key Features:**
- Track expenses by category (salary, marketing, equipment, other)
- Link expenses to project types (online, onsite, kids, ielts)
- Multi-currency support (USD/IQD)
- Beneficiary tracking for payroll and vendor payments
- Expense analytics and reporting

---

## Endpoints

### POST /expenses
Create a new expense record.

**Permissions:** `expenses:create`

**Request Body (CreateExpenseDto):**
- `user_id` (number, required) — ID of the user recording the expense
- `beneficiary` (string, required, max 255) — Person/company receiving the payment
- `project_type` (string, optional) — `online`, `onsite`, `kids`, or `ielts`
- `category` (string, optional) — `salary`, `marketing`, `equipment`, or `other`
- `description` (string, optional) — Additional details about the expense
- `amount` (number, required) — Expense amount
- `currency` (string, optional) — `USD` or `IQD` (default: IQD)
- `expense_date` (ISO date string, required) — Date of the expense

**Example Request (Salary Payment):**

```json
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 2,
  "beneficiary": "Ahmed Ali - Trainer",
  "project_type": "online",
  "category": "salary",
  "description": "Monthly salary payment for January 2024",
  "amount": 500000,
  "currency": "IQD",
  "expense_date": "2024-01-15T10:00:00Z"
}
```

**Example Request (Marketing Expense):**

```json
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 2,
  "beneficiary": "Facebook Ads",
  "project_type": "kids",
  "category": "marketing",
  "description": "Social media advertising campaign",
  "amount": 200000,
  "currency": "IQD",
  "expense_date": "2024-01-10T09:00:00Z"
}
```

**Example Request (Equipment Purchase):**

```json
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 2,
  "beneficiary": "Tech Store",
  "category": "equipment",
  "description": "New projector for classroom",
  "amount": 350000,
  "currency": "IQD",
  "expense_date": "2024-01-05T14:30:00Z"
}
```

**Success Response (201):**

```json
{
  "id": 234,
  "user_id": 2,
  "beneficiary": "Ahmed Ali - Trainer",
  "project_type": "online",
  "category": "salary",
  "description": "Monthly salary payment for January 2024",
  "amount": 500000,
  "currency": "IQD",
  "expense_date": "2024-01-15T10:00:00.000Z",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z",
  "user": {
    "id": 2,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

**Validation Rules:**
- `user_id` must be an integer
- `beneficiary` is required and max 255 characters
- `amount` must be a number (positive)
- `currency` only accepts `USD` or `IQD`
- `project_type` only accepts `online`, `onsite`, `kids`, `ielts`
- `category` only accepts `salary`, `marketing`, `equipment`, `other`
- `expense_date` must be valid ISO 8601 date string

**Error Responses:**
- `400 Bad Request` — Validation errors:
  ```json
  {
    "statusCode": 400,
    "message": [
      "user_id must be an integer number",
      "beneficiary should not be empty",
      "beneficiary must be a string",
      "beneficiary must be shorter than or equal to 255 characters",
      "category must be one of the following values: salary, marketing, equipment, other",
      "expense_date must be a valid ISO 8601 date string"
    ],
    "error": "Bad Request"
  }
  ```
- `401 Unauthorized` — Missing/invalid token
- `403 Forbidden` — User lacks `expenses:create` permission

---

### GET /expenses
Get all expenses with relations.

**Permissions:** `expenses:read`

**Response (200):**

Returns array of Expense objects with `user` relation included. Results are ordered by `created_at DESC` (newest first).

```json
[
  {
    "id": 234,
    "user_id": 2,
    "beneficiary": "Ahmed Ali - Trainer",
    "project_type": "online",
    "category": "salary",
    "description": "Monthly salary payment",
    "amount": 500000,
    "currency": "IQD",
    "expense_date": "2024-01-15T10:00:00.000Z",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "user": {
      "id": 2,
      "name": "Admin User"
    }
  },
  {
    "id": 233,
    "user_id": 2,
    "beneficiary": "Facebook Ads",
    "project_type": "kids",
    "category": "marketing",
    "description": "Social media campaign",
    "amount": 200000,
    "currency": "IQD",
    "expense_date": "2024-01-10T09:00:00.000Z",
    "created_at": "2024-01-10T09:00:00.000Z",
    "updated_at": "2024-01-10T09:00:00.000Z",
    "user": {
      "id": 2,
      "name": "Admin User"
    }
  }
]
```

---

### GET /expenses/:id
Get a single expense by ID.

**Permissions:** `expenses:read`

**Path Parameters:**
- `id` (number) — Expense ID

**Success Response (200):**

```json
{
  "id": 234,
  "user_id": 2,
  "beneficiary": "Ahmed Ali - Trainer",
  "project_type": "online",
  "category": "salary",
  "description": "Monthly salary payment for January 2024",
  "amount": 500000,
  "currency": "IQD",
  "expense_date": "2024-01-15T10:00:00.000Z",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z",
  "user": {
    "id": 2,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

**Error Responses:**
- `404 Not Found` — Expense doesn't exist
- `403 Forbidden` — Lacks permission

---

### PATCH /expenses/:id
Update an existing expense.

**Permissions:** `expenses:update`

**Path Parameters:**
- `id` (number) — Expense ID

**Request Body:** Partial<CreateExpenseDto> (all fields optional)

**Example Request:**

```json
PATCH /expenses/234
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 550000,
  "description": "Monthly salary payment - adjusted amount",
  "category": "salary"
}
```

**Success Response (200):** Returns updated expense object

**Error Responses:**
- `400 Bad Request` — Validation failure
- `404 Not Found` — Expense doesn't exist
- `403 Forbidden` — Lacks permission

---

### DELETE /expenses/:id
Delete an expense record.

**Permissions:** `expenses:delete`

**Path Parameters:**
- `id` (number) — Expense ID

**Success Response (200):** Void (no content)

**Error Responses:**
- `404 Not Found` — Expense doesn't exist
- `403 Forbidden` — Lacks permission

**Warning:** Deleting expenses may affect financial reports and accounting. Consider soft deletes or status flags in production.

---

## DTOs

### CreateExpenseDto

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `user_id` | number | ✅ | @IsInt() | User recording the expense |
| `beneficiary` | string | ✅ | @IsNotEmpty(), @MaxLength(255) | Payment recipient |
| `project_type` | string | ❌ | @IsIn(['online','onsite','kids','ielts']), @IsOptional() | Project category |
| `category` | string | ❌ | @IsIn(['salary','marketing','equipment','other']), @IsOptional() | Expense type |
| `description` | string | ❌ | @IsString(), @IsOptional() | Additional details |
| `amount` | number | ✅ | @IsNumber() | Expense amount |
| `currency` | string | ❌ | @IsIn(['USD','IQD']), @IsOptional() | Currency code |
| `expense_date` | Date | ✅ | @IsDateString() | Date of expense |

### UpdateExpenseDto
Partial type of `CreateExpenseDto` — all fields are optional.

---

## Frontend Integration

### TypeScript Interface

```typescript
export type ProjectType = 'online' | 'onsite' | 'kids' | 'ielts';
export type ExpenseCategory = 'salary' | 'marketing' | 'equipment' | 'other';
export type Currency = 'USD' | 'IQD';

interface User {
  id: number;
  name: string;
  email?: string;
}

export interface Expense {
  id: number;
  user_id: number;
  beneficiary: string;
  project_type?: ProjectType | null;
  category?: ExpenseCategory | null;
  description?: string | null;
  amount: number;
  currency: Currency;
  expense_date: string; // ISO date string
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
}
```

### React Hooks (using React Query)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Expense } from '../types/expense';

const EXPENSES_KEY = ['expenses'];

// Get all expenses
export function useExpenses() {
  return useQuery<Expense[], Error>(EXPENSES_KEY, async () => {
    const { data } = await api.get<Expense[]>('/expenses');
    return data;
  });
}

// Get single expense
export function useExpense(id: number) {
  return useQuery<Expense, Error>(
    ['expense', id],
    async () => {
      const { data } = await api.get<Expense>(`/expenses/${id}`);
      return data;
    },
    { enabled: Boolean(id) }
  );
}

// Create expense
export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation<Expense, any, Partial<Expense>>(
    async (payload) => {
      const { data } = await api.post<Expense>('/expenses', payload);
      return data;
    },
    {
      onSuccess: () => qc.invalidateQueries(EXPENSES_KEY),
    }
  );
}

// Update expense
export function useUpdateExpense(id: number) {
  const qc = useQueryClient();
  return useMutation<Expense, any, Partial<Expense>>(
    async (payload) => {
      const { data } = await api.patch<Expense>(`/expenses/${id}`, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(EXPENSES_KEY);
        qc.invalidateQueries(['expense', id]);
      },
    }
  );
}

// Delete expense
export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation<void, any, number>(
    async (id) => {
      await api.delete(`/expenses/${id}`);
    },
    {
      onSuccess: () => qc.invalidateQueries(EXPENSES_KEY),
    }
  );
}
```

### Example Component: Expense Form

```tsx
import React, { useState } from 'react';
import { useCreateExpense } from '../hooks/useExpenses';

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const create = useCreateExpense();
  const [formData, setFormData] = useState({
    beneficiary: '',
    project_type: '' as any,
    category: '' as any,
    description: '',
    amount: '',
    currency: 'IQD' as const,
    expense_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.beneficiary || !formData.amount) {
      alert('Beneficiary and amount are required');
      return;
    }

    try {
      await create.mutateAsync({
        user_id: Number(localStorage.getItem('user_id')), // Get from auth context
        beneficiary: formData.beneficiary,
        project_type: formData.project_type || undefined,
        category: formData.category || undefined,
        description: formData.description || undefined,
        amount: Number(formData.amount),
        currency: formData.currency,
        expense_date: new Date(formData.expense_date).toISOString(),
      });
      
      // Reset form
      setFormData({
        beneficiary: '',
        project_type: '',
        category: '',
        description: '',
        amount: '',
        currency: 'IQD',
        expense_date: new Date().toISOString().split('T')[0],
      });
      
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create expense';
      alert(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Beneficiary *
        <input
          value={formData.beneficiary}
          onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
          maxLength={255}
          required
          placeholder="Ahmed Ali - Trainer"
        />
      </label>

      <label>
        Project Type
        <select
          value={formData.project_type}
          onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
        >
          <option value="">-- Select --</option>
          <option value="online">Online</option>
          <option value="onsite">Onsite</option>
          <option value="kids">Kids</option>
          <option value="ielts">IELTS</option>
        </select>
      </label>

      <label>
        Category
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">-- Select --</option>
          <option value="salary">Salary</option>
          <option value="marketing">Marketing</option>
          <option value="equipment">Equipment</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>
        Amount *
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
          placeholder="500000"
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
        Expense Date *
        <input
          type="date"
          value={formData.expense_date}
          onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional details..."
        />
      </label>

      <button type="submit" disabled={create.isLoading}>
        {create.isLoading ? 'Saving...' : 'Save Expense'}
      </button>
    </form>
  );
}
```

### Example Component: Expenses List

```tsx
import React from 'react';
import { useExpenses, useDeleteExpense } from '../hooks/useExpenses';

export function ExpensesList() {
  const { data: expenses, isLoading, error } = useExpenses();
  const deleteMutation = useDeleteExpense();

  if (isLoading) return <div>Loading expenses...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Expenses</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Beneficiary</th>
            <th>Category</th>
            <th>Project</th>
            <th>Amount</th>
            <th>Recorded By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses?.map((expense) => (
            <tr key={expense.id}>
              <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
              <td>{expense.beneficiary}</td>
              <td>{expense.category || '—'}</td>
              <td>{expense.project_type || '—'}</td>
              <td>
                {expense.amount.toLocaleString()} {expense.currency}
              </td>
              <td>{expense.user?.name || '—'}</td>
              <td>
                <button
                  onClick={() => {
                    if (!confirm('Delete this expense?')) return;
                    deleteMutation.mutate(expense.id);
                  }}
                  disabled={deleteMutation.isLoading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Common Validation Errors & Fixes

| Error Message | Cause | Fix |
|--------------|-------|-----|
| `user_id must be an integer number` | Missing or string type | Get from auth context: `Number(currentUser.id)` |
| `beneficiary should not be empty` | Empty string or missing | Provide recipient name |
| `beneficiary must be shorter than or equal to 255 characters` | String too long | Truncate to 255 chars |
| `category must be one of the following values: salary, marketing, equipment, other` | Invalid category | Use only allowed values |
| `project_type must be one of the following values: online, onsite, kids, ielts` | Invalid project type | Use only allowed values |
| `expense_date must be a valid ISO 8601 date string` | Invalid date format | Use `new Date().toISOString()` or `YYYY-MM-DD` |
| `property note should not exist` | Using wrong field name | Backend uses `description`, not `note` |

---

## Business Logic Notes

### Expense Categories
- **Salary:** Employee/trainer payments, payroll expenses
- **Marketing:** Advertising, promotions, social media campaigns
- **Equipment:** Hardware, furniture, classroom materials
- **Other:** Miscellaneous operational expenses

### Project Type Classification
Link expenses to specific business units:
- **online:** Online courses and digital operations
- **onsite:** In-person classes and physical locations
- **kids:** Children's programs and activities
- **ielts:** IELTS test preparation courses

### Multi-Currency Handling
- All amounts stored as decimal(12,2)
- Support for IQD (Iraqi Dinar) and USD (US Dollar)
- Frontend should handle currency conversion if needed
- Generate separate reports per currency

### Date Handling
- `expense_date`: When the expense occurred (required)
- `created_at`: When the record was created (automatic)
- `updated_at`: When the record was last modified (automatic)

---

## Analytics & Dashboard Methods

The expense service includes analytics methods (not exposed as REST endpoints but available internally):

- `getTotalByDateRange(startDate, endDate)` — Sum of expenses in date range
- `getTotalByMonth(year, month)` — Monthly expense total
- `getExpenseChartData(months)` — Expense trend data for charts
- `getCategoryBreakdown(year)` — Expenses grouped by category for a year
- `getRecentExpenses(limit)` — Latest N expenses

These can be exposed as additional endpoints if needed for dashboard features.

---

## Security Considerations

1. **Permission-based access:** All endpoints require specific permissions
2. **User tracking:** `user_id` records who created/modified expenses
3. **Audit trail:** `created_at` and `updated_at` timestamps are automatic
4. **Financial data:** Consider encryption at rest for sensitive expense data
5. **Authorization:** Ensure users can only modify expenses they're authorized for

---

## Frontend Field Mapping Reference

**⚠️ Important:** Backend field names differ from typical frontend conventions:

| Frontend (Wrong) | Backend (Correct) | Notes |
|-----------------|-------------------|-------|
| `note` | `description` | Backend uses `description` for expense details |
| `date` | `expense_date` | Must be ISO date string |
| `type` | `category` | Use `category` field with enum values |

---

End of Expenses API Documentation.
