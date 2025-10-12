# Courses API Documentation

This document provides comprehensive API documentation for the course management system, designed for frontend developers to integrate course functionality into their applications.

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

All course endpoints require JWT authentication. Include the authorization header in all requests:

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
| POST | `/courses` | Create new course | `courses:create` |
| GET | `/courses` | Get all courses | `courses:read` |
| GET | `/courses/:id` | Get specific course | `courses:read` |
| PATCH | `/courses/:id` | Update course | `courses:update` |
| DELETE | `/courses/:id` | Delete course | `courses:delete` |

## API Endpoints

### 1. Create Course

Create a new course with specified details.

**Endpoint:** `POST /courses`

**Request Body:**
```json
{
  "user_id": 1,
  "name": "English Language Course - Beginner",
  "project_type": "online",
  "description": "Comprehensive English course for beginners covering basic grammar, vocabulary, and conversation skills"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "English Language Course - Beginner",
  "project_type": "online",
  "description": "Comprehensive English course for beginners covering basic grammar, vocabulary, and conversation skills",
  "created_at": "2024-10-11T12:00:00.000Z",
  "updated_at": "2024-10-11T12:00:00.000Z",
  "user": {
    "id": 1,
    "name": "Dr. Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "role": {
      "id": 2,
      "name": "teacher",
      "description": "Course instructor"
    }
  },
  "batches": []
}
```

### 2. Get All Courses

Retrieve all courses with related teacher and batch information.

**Endpoint:** `GET /courses`

**Success Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "English Language Course - Beginner",
    "project_type": "online",
    "description": "Comprehensive English course for beginners",
    "created_at": "2024-10-11T12:00:00.000Z",
    "updated_at": "2024-10-11T12:00:00.000Z",
    "user": {
      "id": 1,
      "name": "Dr. Sarah Ahmed",
      "email": "sarah.ahmed@example.com",
      "role": {
        "id": 2,
        "name": "teacher",
        "description": "Course instructor"
      }
    },
    "batches": [
      {
        "id": 1,
        "name": "Beginner Batch A",
        "start_date": "2024-11-01",
        "end_date": "2024-12-31",
        "max_students": 20,
        "current_students": 15
      }
    ]
  },
  {
    "id": 2,
    "user_id": 2,
    "name": "IELTS Preparation Course",
    "project_type": "ielts",
    "description": "Intensive IELTS preparation for academic and general training",
    "created_at": "2024-10-11T13:00:00.000Z",
    "updated_at": "2024-10-11T13:00:00.000Z",
    "user": {
      "id": 2,
      "name": "Prof. Ahmed Hassan",
      "email": "ahmed.hassan@example.com",
      "role": {
        "id": 2,
        "name": "teacher",
        "description": "Course instructor"
      }
    },
    "batches": [
      {
        "id": 2,
        "name": "IELTS Evening Batch",
        "start_date": "2024-11-15",
        "end_date": "2025-02-15",
        "max_students": 15,
        "current_students": 8
      }
    ]
  }
]
```

### 3. Get Course by ID

Retrieve a specific course by its ID with complete details.

**Endpoint:** `GET /courses/:id`

**Parameters:**
- `id` (number): The course ID

**Success Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "English Language Course - Beginner",
  "project_type": "online",
  "description": "Comprehensive English course for beginners covering basic grammar, vocabulary, and conversation skills",
  "created_at": "2024-10-11T12:00:00.000Z",
  "updated_at": "2024-10-11T12:00:00.000Z",
  "user": {
    "id": 1,
    "name": "Dr. Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "role": {
      "id": 2,
      "name": "teacher",
      "description": "Course instructor"
    }
  },
  "batches": [
    {
      "id": 1,
      "name": "Beginner Batch A",
      "start_date": "2024-11-01",
      "end_date": "2024-12-31",
      "max_students": 20,
      "current_students": 15,
      "schedule": "Monday, Wednesday, Friday 6:00-8:00 PM",
      "status": "active"
    }
  ]
}
```

### 4. Update Course

Update an existing course.

**Endpoint:** `PATCH /courses/:id`

**Parameters:**
- `id` (number): The course ID

**Request Body (all fields optional):**
```json
{
  "name": "English Language Course - Intermediate",
  "project_type": "onsite",
  "description": "Updated comprehensive English course for intermediate level students"
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "English Language Course - Intermediate",
  "project_type": "onsite",
  "description": "Updated comprehensive English course for intermediate level students",
  "created_at": "2024-10-11T12:00:00.000Z",
  "updated_at": "2024-10-11T12:30:00.000Z",
  "user": {
    "id": 1,
    "name": "Dr. Sarah Ahmed",
    "email": "sarah.ahmed@example.com",
    "role": {
      "id": 2,
      "name": "teacher",
      "description": "Course instructor"
    }
  },
  "batches": [
    {
      "id": 1,
      "name": "Beginner Batch A",
      "start_date": "2024-11-01",
      "end_date": "2024-12-31",
      "max_students": 20,
      "current_students": 15
    }
  ]
}
```

### 5. Delete Course

Delete a course permanently.

**Endpoint:** `DELETE /courses/:id`

**Parameters:**
- `id` (number): The course ID

**Success Response (200):**
```json
{
  "message": "Course deleted successfully",
  "id": 1
}
```

## Data Models

### Course Model

```typescript
interface Course {
  id: number;
  user_id: number;                 // Teacher/instructor ID
  name: string;                    // Course name
  project_type?: string;           // 'online' | 'onsite' | 'kids' | 'ielts'
  description?: string;            // Course description
  created_at: Date;                // Creation timestamp
  updated_at: Date;                // Last update timestamp
  user?: User;                     // Teacher/instructor details
  batches?: Batch[];               // Associated batches
}
```

### Create Course DTO

```typescript
interface CreateCourseDto {
  user_id: number;                 // Required: Teacher/instructor ID
  name: string;                    // Required: Course name (max 255 chars)
  project_type?: string;           // Optional: 'online' | 'onsite' | 'kids' | 'ielts'
  description?: string;            // Optional: Course description
}
```

### Course Types

- **online**: Online courses conducted via video platforms
- **onsite**: In-person courses at physical locations
- **kids**: Specialized courses for children
- **ielts**: IELTS preparation courses

## Frontend Integration Examples

### React Service Class

```typescript
class CourseService {
  private baseURL = 'http://localhost:3001';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createCourse(data: CreateCourseDto): Promise<Course> {
    const response = await fetch(`${this.baseURL}/courses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create course: ${response.statusText}`);
    }

    return response.json();
  }

  async getAllCourses(): Promise<Course[]> {
    const response = await fetch(`${this.baseURL}/courses`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }

    return response.json();
  }

  async getCourse(id: number): Promise<Course> {
    const response = await fetch(`${this.baseURL}/courses/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch course: ${response.statusText}`);
    }

    return response.json();
  }

  async updateCourse(id: number, data: Partial<CreateCourseDto>): Promise<Course> {
    const response = await fetch(`${this.baseURL}/courses/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update course: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteCourse(id: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete course: ${response.statusText}`);
    }
  }

  async getCoursesByType(type: string): Promise<Course[]> {
    const courses = await this.getAllCourses();
    return courses.filter(course => course.project_type === type);
  }

  async getCoursesByTeacher(userId: number): Promise<Course[]> {
    const courses = await this.getAllCourses();
    return courses.filter(course => course.user_id === userId);
  }
}

export const courseService = new CourseService();
```

### React Hook for Courses

```typescript
import { useState, useEffect } from 'react';
import { courseService } from './CourseService';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const coursesData = await courseService.getAllCourses();
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (data: CreateCourseDto) => {
    try {
      setLoading(true);
      setError(null);
      const newCourse = await courseService.createCourse(data);
      setCourses(prev => [newCourse, ...prev]);
      return newCourse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id: number, data: Partial<CreateCourseDto>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCourse = await courseService.updateCourse(id, data);
      setCourses(prev => prev.map(course => course.id === id ? updatedCourse : course));
      return updatedCourse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await courseService.deleteCourse(id);
      setCourses(prev => prev.filter(course => course.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByType = (type: string) => {
    return courses.filter(course => course.project_type === type);
  };

  const getCoursesByTeacher = (userId: number) => {
    return courses.filter(course => course.user_id === userId);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByType,
    getCoursesByTeacher,
  };
}
```

### React Component Example

```typescript
import React, { useState } from 'react';
import { useCourses } from './useCourses';

export function CourseManager() {
  const {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByType,
  } = useCourses();

  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const courseTypes = [
    { value: 'all', label: 'All Courses' },
    { value: 'online', label: 'Online Courses' },
    { value: 'onsite', label: 'Onsite Courses' },
    { value: 'kids', label: 'Kids Courses' },
    { value: 'ielts', label: 'IELTS Courses' },
  ];

  const filteredCourses = selectedType === 'all' 
    ? courses 
    : getCoursesByType(selectedType);

  const handleCreateCourse = async (formData: CreateCourseDto) => {
    try {
      await createCourse(formData);
      setShowCreateForm(false);
      alert('Course created successfully!');
    } catch (err) {
      alert('Failed to create course');
    }
  };

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="course-manager">
      <div className="course-header">
        <h2>Course Management</h2>
        <button onClick={() => setShowCreateForm(true)}>
          Create New Course
        </button>
      </div>

      {/* Filter Section */}
      <div className="course-filters">
        <label>Filter by type:</label>
        <select 
          value={selectedType} 
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {courseTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.map((course) => (
          <div key={course.id} className="course-card">
            <div className="course-header">
              <h3>{course.name}</h3>
              <span className={`course-type ${course.project_type}`}>
                {course.project_type}
              </span>
            </div>
            
            <div className="course-details">
              <p><strong>Teacher:</strong> {course.user?.name}</p>
              <p><strong>Batches:</strong> {course.batches?.length || 0}</p>
              <p className="course-description">{course.description}</p>
            </div>

            <div className="course-actions">
              <button onClick={() => updateCourse(course.id, { name: `${course.name} (Updated)` })}>
                Edit
              </button>
              <button 
                onClick={() => deleteCourse(course.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="empty-state">
          <p>No courses found for the selected filter.</p>
        </div>
      )}
    </div>
  );
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "user_id must be a number"],
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
  "message": "Course not found",
  "error": "Not Found"
}
```

## Best Practices

### 1. Course Creation
- Validate teacher exists before assigning to course
- Ensure course names are descriptive and unique
- Set appropriate project_type for filtering

### 2. Data Management
- Cache courses data for better performance
- Implement search functionality for large course lists
- Use optimistic updates for better UX

### 3. User Experience
- Show teacher information with courses
- Display batch information and enrollment status
- Implement course type filtering and sorting

### 4. Security
- Validate permissions before course operations
- Only allow teachers to edit their own courses
- Implement proper error handling and logging

### 5. Performance
- Paginate courses list for large datasets
- Implement lazy loading for course details
- Use debounced search for real-time filtering

This documentation provides a complete reference for integrating course management functionality into your frontend application. For additional support or questions, please refer to the API's Swagger documentation at `http://localhost:3001/api`.