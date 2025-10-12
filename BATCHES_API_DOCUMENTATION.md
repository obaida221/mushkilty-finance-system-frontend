# Batches API Documentation

This document describes the batches endpoints, DTOs, validation rules, example requests/responses, and frontend integration notes.

Base path: `/batches`
Auth: Bearer JWT required. Requests are protected by `JwtAuthGuard` and `PermissionsGuard`.

---

## Endpoints

### POST /batches
Create a new batch.

Permissions: `batches:create`

Request body (CreateBatchDto):
- `course_id` (number, required)
- `trainer_id` (number, required)
- `name` (string, required, max 255)
- `description` (string, optional)
- `level` (string, optional) — `A1`, `A2`, `B1`, `B2`, `C1`
- `location` (string, optional)
- `start_date` (ISO date string, optional)
- `end_date` (ISO date string, optional)
- `schedule` (string, optional)
- `capacity` (number, optional)
- `status` (string, optional) — `open`, `closed`, `full`
- `actual_price` (number, optional)

Example request:

```json
POST /batches
Authorization: Bearer <token>
{
  "course_id": 3,
  "trainer_id": 7,
  "name": "English A1 - Morning",
  "start_date": "2024-01-15",
  "capacity": 20,
  "actual_price": 250000
}
```

Success response (201): the created Batch object (may include `course` and `trainer` relations depending on server behaviour).

Errors:
- 400 Bad Request — validation failure
- 401 Unauthorized
- 403 Forbidden — lacking `batches:create` permission

---

### GET /batches
Get all batches.

Permissions: `batches:read`

Response (200): array of Batch objects (may include relations `course`, `trainer`, `enrollments`).

Query params (not implemented server-side by default): consider client-side filtering by `course_id`, `status`, `trainer_id`.

---

### GET /batches/:id
Get a batch by id.

Permissions: `batches:read`

Responses:
- 200 — batch
- 404 — not found

---

### PATCH /batches/:id
Update a batch.

Permissions: `batches:update`

Body: Partial<CreateBatchDto>

Responses:
- 200 — updated batch
- 404 — not found
- 400 — validation

---

### DELETE /batches/:id
Delete a batch.

Permissions: `batches:delete`

Notes:
- If enrollments exist for a batch, deletion may fail due to FK constraints. The server should return a clear error; if not, the global exception filter was updated to provide better logs.

Responses:
- 200 — deleted
- 400/500 — if FK constraint triggered or server error
- 404 — not found

---

## DTOs

CreateBatchDto (validation annotations):
- `course_id`: @IsInt()
- `trainer_id`: @IsInt()
- `name`: @IsString(), @IsNotEmpty(), @MaxLength(255)
- `description`: @IsOptional(), @IsString()
- `level`: @IsOptional(), @IsString(), @IsIn(['A1','A2','B1','B2','C1'])
- `location`: @IsOptional(), @IsString(), @MaxLength(255)
- `start_date`: @IsOptional(), @IsDateString()
- `end_date`: @IsOptional(), @IsDateString()
- `schedule`: @IsOptional(), @IsString()
- `capacity`: @IsOptional(), @IsInt()
- `status`: @IsOptional(), @IsString(), @IsIn(['open','closed','full'])
- `actual_price`: @IsOptional(), @IsNumber()

---

## Frontend integration quick notes

- Creating a batch is usually an admin/trainer operation.
- When deleting a batch, confirm with the user and display the number of enrollments affected (fetch enrollments count before delete if needed).
- For listing, fetch `/batches` and show `course.name` if `course` relation exists.
- Use optimistic UI for small edits, but be careful for deletes that affect child records.

### Example React hooks usage (short)

Use the `useEnrollments`/`useCreateEnrollment` hooks from the project docs for enrollment flows. For batches, implement similar hooks:

- `useBatches()` — GET `/batches`
- `useCreateBatch()` — POST `/batches`
- `useUpdateBatch(id)` — PATCH `/batches/:id`
- `useDeleteBatch()` — DELETE `/batches/:id`

---

End of Batches API doc.
