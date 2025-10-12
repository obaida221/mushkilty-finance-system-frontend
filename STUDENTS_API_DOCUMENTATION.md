# Students API Documentation

This document provides comprehensive API documentation for the student management system, designed for frontend developers to integrate student functionality into their applications.

## Table of Contents
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints Overview](#endpoints-overview)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Frontend Integration Examples](#frontend-integration-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Authentication

All student endpoints require JWT authentication. Include the authorization header in all requests:

```http
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
http://localhost:3001
```

## Endpoints Overview

| Method | Endpoint | Purpose | Required Permission |
|--------|----------|---------|-------------------|
| POST | `/students` | Create new student | `students:create` |
| GET | `/students` | Get all students | `students:read` |
| GET | `/students/:id` | Get specific student | `students:read` |
| PATCH | `/students/:id` | Update student | `students:update` |
| DELETE | `/students/:id` | Delete student | `students:delete` |

## API Endpoints

### 1. Create Student

Create a new student record with personal and academic information.

**Endpoint:** `POST /students`

**Request Body:**
```json
{
  "full_name": "Ahmed Ali Mohammed",
  "age": 25,
  "dob": "1998-01-15",
  "education_level": "Bachelor Degree",
  "gender": "male",
  "phone": "+964 750 123 4567",
  "city": "Baghdad",
  "area": "Karrada",
  "course_type": "online",
  "previous_course": "Completed A1 level at another center",
  "is_returning": false,
  "status": "pending"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "full_name": "Ahmed Ali Mohammed",
  "age": 25,
  "dob": "1998-01-15",
  "education_level": "Bachelor Degree",
  "gender": "male",
  "phone": "+964 750 123 4567",
  "city": "Baghdad",
  "area": "Karrada",
  "course_type": "online",
  "previous_course": "Completed A1 level at another center",
  "is_returning": false,
  "status": "pending",
  "created_at": "2024-10-11T12:00:00.000Z",
  "updated_at": "2024-10-11T12:00:00.000Z",
  "enrollments": []
}
```

### 2. Get All Students

Retrieve all students with their enrollment information.

**Endpoint:** `GET /students`

**Success Response (200):**
```json
[
  {
    "id": 1,
    "full_name": "Ahmed Ali Mohammed",
    "age": 25,
    "dob": "1998-01-15",
    "education_level": "Bachelor Degree",
    "gender": "male",
    "phone": "+964 750 123 4567",
    "city": "Baghdad",
    "area": "Karrada",
    "course_type": "online",
    "previous_course": "Completed A1 level at another center",
    "is_returning": false,
    "status": "accepted",
    "created_at": "2024-10-11T12:00:00.000Z",
    "updated_at": "2024-10-11T12:30:00.000Z",
    "enrollments": [
      {
        "id": 1,
        "enrolled_at": "2024-10-11T12:30:00.000Z",
        "status": "accepted",
        "batch": {
          "id": 1,
          "name": "Beginner Batch A",
          "course": {
            "id": 1,
            "name": "English Language Course - Beginner"
          }
        }
      }
    ]
  },
  {
    "id": 2,
    "full_name": "Fatima Hassan Ali",
    "age": 22,
    "dob": "2001-05-20",
    "education_level": "High School",
    "gender": "female",
    "phone": "+964 771 987 6543",
    "city": "Basra",
    "area": "Ashar",
    "course_type": "ielts",
    "previous_course": null,
    "is_returning": false,
    "status": "tested",
    "created_at": "2024-10-11T13:00:00.000Z",
    "updated_at": "2024-10-11T13:15:00.000Z",
    "enrollments": []
  }
]
```

### 3. Get Student by ID

Retrieve a specific student by their ID with complete details.

**Endpoint:** `GET /students/:id`

**Parameters:**
- `id` (number): The student ID

**Success Response (200):**
```json
{
  "id": 1,
  "full_name": "Ahmed Ali Mohammed",
  "age": 25,
  "dob": "1998-01-15",
  "education_level": "Bachelor Degree",
  "gender": "male",
  "phone": "+964 750 123 4567",
  "city": "Baghdad",
  "area": "Karrada",
  "course_type": "online",
  "previous_course": "Completed A1 level at another center",
  "is_returning": false,
  "status": "accepted",
  "created_at": "2024-10-11T12:00:00.000Z",
  "updated_at": "2024-10-11T12:30:00.000Z",
  "enrollments": [
    {
      "id": 1,
      "enrolled_at": "2024-10-11T12:30:00.000Z",
      "status": "accepted",
      "batch": {
        "id": 1,
        "name": "Beginner Batch A",
        "start_date": "2024-11-01",
        "end_date": "2024-12-31",
        "course": {
          "id": 1,
          "name": "English Language Course - Beginner",
          "project_type": "online"
        }
      }
    }
  ]
}
```

### 4. Update Student

Update an existing student's information.

**Endpoint:** `PATCH /students/:id`

**Parameters:**
- `id` (number): The student ID

**Request Body (all fields optional):**
```json
{
  "status": "accepted",
  "phone": "+964 750 123 9999",
  "city": "Baghdad",
  "area": "Mansour"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "full_name": "Ahmed Ali Mohammed",
  "age": 25,
  "dob": "1998-01-15",
  "education_level": "Bachelor Degree",
  "gender": "male",
  "phone": "+964 750 123 9999",
  "city": "Baghdad",
  "area": "Mansour",
  "course_type": "online",
  "previous_course": "Completed A1 level at another center",
  "is_returning": false,
  "status": "accepted",
  "created_at": "2024-10-11T12:00:00.000Z",
  "updated_at": "2024-10-11T14:00:00.000Z",
  "enrollments": [
    {
      "id": 1,
      "enrolled_at": "2024-10-11T12:30:00.000Z",
      "status": "accepted",
      "batch": {
        "id": 1,
        "name": "Beginner Batch A",
        "course": {
          "id": 1,
          "name": "English Language Course - Beginner"
        }
      }
    }
  ]
}
```

### 5. Delete Student

Delete a student record permanently.

**Endpoint:** `DELETE /students/:id`

**Parameters:**
- `id` (number): The student ID

**Success Response (200):**
```json
{
  "message": "Student deleted successfully",
  "id": 1
}
```

## Data Models

### Student Model

```typescript
interface Student {
  id: number;
  full_name: string;              // Full name
  age?: number;                   // Age in years
  dob?: Date;                     // Date of birth
  education_level?: string;       // Educational background
  gender?: string;                // Gender
  phone: string;                  // Phone number (required)
  city?: string;                  // City of residence
  area?: string;                  // Area/district
  course_type?: string;           // 'online' | 'onsite' | 'kids' | 'ielts'
  previous_course?: string;       // Previous course experience
  is_returning: boolean;          // Returning student flag
  status: string;                 // Application status
  created_at: Date;               // Registration date
  updated_at: Date;               // Last update date
  enrollments?: Enrollment[];     // Course enrollments
}
```

### Create Student DTO

```typescript
interface CreateStudentDto {
  full_name: string;              // Required: Full name (max 255 chars)
  age?: number;                   // Optional: Age in years
  dob?: string;                   // Optional: Date of birth (ISO string)
  education_level?: string;       // Optional: Education level (max 255 chars)
  gender?: string;                // Optional: Gender (max 50 chars)
  phone: string;                  // Required: Phone number (max 50 chars)
  city?: string;                  // Optional: City (max 255 chars)
  area?: string;                  // Optional: Area (max 255 chars)
  course_type?: string;           // Optional: 'online' | 'onsite' | 'kids' | 'ielts'
  previous_course?: string;       // Optional: Previous course info
  is_returning?: boolean;         // Optional: Returning student (default: false)
  status?: string;                // Optional: 'pending' | 'contacted with' | 'tested' | 'accepted' | 'rejected'
}
```

### Student Status Types

- **pending**: Initial application status
- **contacted with**: Student has been contacted
- **tested**: Student has taken placement test
- **accepted**: Student accepted into program
- **rejected**: Application rejected

### Course Types

- **online**: Online courses
- **onsite**: In-person courses
- **kids**: Children's courses
- **ielts**: IELTS preparation courses

## Frontend Integration Examples

### React Service Class

```typescript
class StudentService {
  private baseURL = 'http://localhost:3001';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createStudent(data: CreateStudentDto): Promise<Student> {
    const response = await fetch(`${this.baseURL}/students`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create student: ${response.statusText}`);
    }

    return response.json();
  }

  async getAllStudents(): Promise<Student[]> {
    const response = await fetch(`${this.baseURL}/students`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch students: ${response.statusText}`);
    }

    return response.json();
  }

  async getStudent(id: number): Promise<Student> {
    const response = await fetch(`${this.baseURL}/students/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch student: ${response.statusText}`);
    }

    return response.json();
  }

  async updateStudent(id: number, data: Partial<CreateStudentDto>): Promise<Student> {
    const response = await fetch(`${this.baseURL}/students/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update student: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteStudent(id: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/students/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete student: ${response.statusText}`);
    }
  }

  async getStudentsByStatus(status: string): Promise<Student[]> {
    const students = await this.getAllStudents();
    return students.filter(student => student.status === status);
  }

  async getStudentsByCourseType(courseType: string): Promise<Student[]> {
    const students = await this.getAllStudents();
    return students.filter(student => student.course_type === courseType);
  }

  async getStudentsByCity(city: string): Promise<Student[]> {
    const students = await this.getAllStudents();
    return students.filter(student => student.city?.toLowerCase() === city.toLowerCase());
  }
}

export const studentService = new StudentService();
```

### React Hook for Students

```typescript
import { useState, useEffect } from 'react';
import { studentService } from './StudentService';

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const studentsData = await studentService.getAllStudents();
      setStudents(studentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const createStudent = async (data: CreateStudentDto) => {
    try {
      setLoading(true);
      setError(null);
      const newStudent = await studentService.createStudent(data);
      setStudents(prev => [newStudent, ...prev]);
      return newStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id: number, data: Partial<CreateStudentDto>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedStudent = await studentService.updateStudent(id, data);
      setStudents(prev => prev.map(student => student.id === id ? updatedStudent : student));
      return updatedStudent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await studentService.deleteStudent(id);
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStudentsByStatus = (status: string) => {
    return students.filter(student => student.status === status);
  };

  const getStudentsByCourseType = (courseType: string) => {
    return students.filter(student => student.course_type === courseType);
  };

  const updateStudentStatus = async (id: number, status: string) => {
    return updateStudent(id, { status });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByStatus,
    getStudentsByCourseType,
    updateStudentStatus,
  };
}
```

### React Component Example

```typescript
import React, { useState } from 'react';
import { useStudents } from './useStudents';

export function StudentManager() {
  const {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByStatus,
    updateStudentStatus,
  } = useStudents();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'pending', label: 'Pending' },
    { value: 'contacted with', label: 'Contacted' },
    { value: 'tested', label: 'Tested' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filteredStudents = selectedStatus === 'all' 
    ? students 
    : getStudentsByStatus(selectedStatus);

  const handleCreateStudent = async (formData: CreateStudentDto) => {
    try {
      await createStudent(formData);
      setShowCreateForm(false);
      alert('Student created successfully!');
    } catch (err) {
      alert('Failed to create student');
    }
  };

  const handleStatusChange = async (studentId: number, newStatus: string) => {
    try {
      await updateStudentStatus(studentId, newStatus);
      alert('Student status updated successfully!');
    } catch (err) {
      alert('Failed to update student status');
    }
  };

  if (loading) return <div>Loading students...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="student-manager">
      <div className="student-header">
        <h2>Student Management</h2>
        <button onClick={() => setShowCreateForm(true)}>
          Add New Student
        </button>
      </div>

      {/* Filter Section */}
      <div className="student-filters">
        <label>Filter by status:</label>
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="student-stats">
          <span>Total: {filteredStudents.length}</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Course Type</th>
              <th>Status</th>
              <th>Age</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.full_name}</td>
                <td>{student.phone}</td>
                <td>{student.city || 'N/A'}</td>
                <td>
                  <span className={`course-type ${student.course_type}`}>
                    {student.course_type || 'N/A'}
                  </span>
                </td>
                <td>
                  <select
                    value={student.status}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className={`status-select ${student.status}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted with">Contacted</option>
                    <option value="tested">Tested</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>{student.age || 'N/A'}</td>
                <td>{new Date(student.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => updateStudent(student.id, { 
                      full_name: `${student.full_name} (Updated)` 
                    })}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteStudent(student.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="empty-state">
          <p>No students found for the selected filter.</p>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <StudentCreateForm 
              onSubmit={handleCreateStudent}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Student Create Form Component
function StudentCreateForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    course_type: 'online',
    status: 'pending',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      <h3>Add New Student</h3>
      
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>Phone *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>City</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>Course Type</label>
        <select
          value={formData.course_type}
          onChange={(e) => setFormData({...formData, course_type: e.target.value})}
        >
          <option value="online">Online</option>
          <option value="onsite">Onsite</option>
          <option value="kids">Kids</option>
          <option value="ielts">IELTS</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit">Create Student</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["full_name should not be empty", "phone should not be empty"],
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Student not found",
  "error": "Not Found"
}
```

## Best Practices

### 1. Student Registration
- Collect essential information first (name, phone)
- Make optional fields truly optional
- Validate phone number format

### 2. Status Management
- Use clear status progression: pending → contacted → tested → accepted/rejected
- Track status change history
- Implement automated status updates

### 3. Data Quality
- Normalize phone number formats
- Validate email addresses if collected
- Use consistent city/area naming

### 4. User Experience
- Provide clear status indicators
- Show enrollment history
- Enable bulk status updates

### 5. Search and Filtering
- Implement search by name, phone, or city
- Filter by status, course type, and registration date
- Sort by registration date or last update

### 6. Privacy and Security
- Implement proper access controls
- Log access to student records
- Secure personal information

This documentation provides a complete reference for integrating student management functionality into your frontend application. For additional support or questions, please refer to the API's Swagger documentation at `http://localhost:3001/api`.