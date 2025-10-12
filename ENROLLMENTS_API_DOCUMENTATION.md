# Enrollments API Documentation

This document describes the enrollments endpoints, DTOs, validation rules, example requests/responses, and quick frontend integration notes.

Base path: `/enrollments`
Auth: Bearer JWT required. Requests are protected by `JwtAuthGuard` and `PermissionsGuard`.

---

## Endpoints

### POST /enrollments
Create a new enrollment.

Permissions: `enrollments:create`

Request body (CreateEnrollmentDto):
- `student_id` (number, required)
- `batch_id` (number, required)
- `discount_code` (string, optional)
- `user_id` (number, required) — the operator creating the enrollment
- `total_price` (number, optional)
- `currency` (string, optional) — `USD` or `IQD`
- `enrolled_at` (ISO date string, optional)
- `status` (string, optional) — one of `pending`, `accepted`, `dropped`, `completed`
- `notes` (string, optional)

Example request:

```json
POST /enrollments
Authorization: Bearer <token>
{
  "student_id": 12,
  "batch_id": 5,
  "user_id": 2,
  "total_price": 200000,
  "currency": "IQD",
  "status": "pending"
}
```

Success response (201): returns the created Enrollment object (with relations `student`, `batch`, `batch.course` if requested by server):

```json
{
  "id": 101,
  "student_id": 12,
  "batch_id": 5,
  "user_id": 2,
  "total_price": 200000,
  "currency": "IQD",
  "status": "pending",
  "enrolled_at": "2024-01-15T10:00:00.000Z",
  "created_at": "2024-01-15T10:00:00.000Z",
  "updated_at": "2024-01-15T10:00:00.000Z",
  "student": { "id": 12, "name": "Ali" },
  "batch": { "id": 5, "name": "English A1 - Morning", "course": { "id": 3, "name": "English 101" }}
}
```

Errors:
- 400 Bad Request — validation failure, response may contain `{ message: [ ... ] }`
- 401 Unauthorized — missing/invalid token
- 403 Forbidden — lacking `enrollments:create` permission

---

### GET /enrollments
Get all enrollments.

Permissions: `enrollments:read`

Response (200): array of Enrollment objects (includes relations `student`, `batch`, `batch.course`).

---

### GET /enrollments/:id
Get enrollment by id.

Permissions: `enrollments:read`

Responses:
- 200 — enrollment object
- 404 — not found

---

### PATCH /enrollments/:id
Update an enrollment.

Permissions: `enrollments:update`

Body: Partial of CreateEnrollmentDto (see above)

Responses:
- 200 — updated enrollment
- 404 — not found
- 400 — validation

---

### DELETE /enrollments/:id
Delete an enrollment.

Permissions: `enrollments:delete`

Responses:
- 200 — deleted (void)
- 404 — not found

---

## DTOs

CreateEnrollmentDto (validation annotations):
- `student_id`: @IsInt()
- `batch_id`: @IsInt()
- `discount_code`: @IsOptional(), @IsString(), @MaxLength(100)
- `user_id`: @IsInt()
- `total_price`: @IsOptional(), @IsNumber()
- `currency`: @IsOptional(), @IsString(), @IsIn(['USD','IQD'])
- `enrolled_at`: @IsOptional(), @IsDateString()
- `status`: @IsOptional(), @IsString(), @IsIn(['pending','accepted','dropped','completed'])
- `notes`: @IsOptional(), @IsString()

---

## Frontend integration quick notes

- Use `Authorization: Bearer <token>` header.
- On create, prefer creating the enrollment with `status: 'pending'` and then run payment flow (if applicable) before updating status to `accepted`.
- Handle validation errors by checking `err.response.data.message` (may be array) and display to the user.
- To avoid duplicate enrollments for the same student/batch, perform a lightweight client-side check against the enrollment list or ask backend to add uniqueness validation.
- Example hooks and usage are available in the project docs (see root-level docs or use `useEnrollments` / `useCreateEnrollment` in the frontend).

---

## Useful server-side fields returned
- `student` relation: object
- `batch` relation: includes `course` relation in `batch.course`


---

End of Enrollments API doc.
