# Authentication API Documentation

## Overview

The Mushkilty Finance System uses JWT-based authentication with Role-Based Access Control (RBAC). This documentation provides comprehensive details for frontend integration.

## Base Configuration

- **Base URL**: `http://localhost:3001`
- **API Documentation**: `http://localhost:3001/api` (Swagger UI)
- **Authentication Type**: Bearer Token (JWT)
- **Token Header**: `Authorization: Bearer <token>`

## Authentication Endpoints

### 1. User Registration

**Endpoint**: `POST /auth/register`

**Description**: Register a new user in the system.

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123",
  "role_id": 1
}
```

**Request Validation**:
- `email`: Must be a valid email format
- `name`: Required string
- `password`: Minimum 6 characters
- `role_id`: Required number (role must exist in system)

**Success Response** (201):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role_id": 1,
  "role": {
    "id": 1,
    "name": "student",
    "description": "Student role"
  },
  "created_at": "2025-10-09T10:30:00.000Z",
  "updated_at": "2025-10-09T10:30:00.000Z"
}
```

**Error Responses**:
- `409 Conflict`: User with this email already exists
- `400 Bad Request`: Validation errors

---

### 2. User Login

**Endpoint**: `POST /auth/login`

**Description**: Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Request Validation**:
- `email`: Must be a valid email format
- `password`: Minimum 6 characters

**Success Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": {
      "id": 1,
      "name": "student",
      "description": "Student role"
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Validation errors

---

### 3. Get User Profile

**Endpoint**: `GET /auth/profile`

**Description**: Retrieve current authenticated user's profile.

**Headers Required**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role_id": 1,
  "role": {
    "id": 1,
    "name": "student",
    "description": "Student role",
    "rolePermissions": [
      {
        "permission": {
          "id": 1,
          "name": "view_courses",
          "description": "Can view courses"
        }
      }
    ]
  },
  "created_at": "2025-10-09T10:30:00.000Z",
  "updated_at": "2025-10-09T10:30:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `401 Unauthorized`: User not found

---

## JWT Token Structure

The JWT token contains the following payload:

```json
{
  "sub": 1,           // User ID
  "email": "user@example.com",
  "role_id": 1,       // User's role ID
  "iat": 1728468600,  // Issued at
  "exp": 1728555000   // Expires at
}
```

## Frontend Integration Guide

### 1. Setting Up Authentication

```javascript
// Auth service example
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.token = localStorage.getItem('authToken');
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.token = data.access_token;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }
}
```

### 2. Making Authenticated Requests

```javascript
// API service with authentication
class ApiService {
  constructor(authService) {
    this.authService = authService;
    this.baseURL = 'http://localhost:3001';
  }

  async request(endpoint, options = {}) {
    const token = this.authService.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (response.status === 401) {
      this.authService.logout();
      // Redirect to login page
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  }
}
```

### 3. React Hook Example

```javascript
// useAuth hook for React
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('authToken', data.access_token);
        return data;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Role-Based Access Control (RBAC)

### Understanding Roles and Permissions

The system implements RBAC where:
- Users are assigned to **Roles**
- Roles have **Permissions**
- API endpoints can require specific permissions

### Checking User Permissions

When making API calls to protected endpoints, you may receive:
- `200 OK`: User has required permissions
- `403 Forbidden`: User lacks required permissions
- `401 Unauthorized`: Invalid or missing authentication

### Frontend Permission Checking

```javascript
// Helper function to check if user has permission
function hasPermission(user, permissionName) {
  if (!user || !user.role || !user.role.rolePermissions) {
    return false;
  }

  return user.role.rolePermissions.some(
    rp => rp.permission.name === permissionName
  );
}

// Usage in React component
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      {hasPermission(user, 'view_financial_reports') && (
        <FinancialReports />
      )}
      
      {hasPermission(user, 'manage_students') && (
        <StudentManagement />
      )}
    </div>
  );
};
```

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data/validation errors
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": ["email must be a valid email", "password must be longer than 6 characters"],
  "error": "Bad Request"
}
```

## Security Best Practices

### Frontend Implementation

1. **Token Storage**: Store JWT tokens in localStorage or secure httpOnly cookies
2. **Token Refresh**: Implement token refresh mechanism before expiration
3. **Route Protection**: Protect routes based on authentication status
4. **Permission Checks**: Verify permissions before showing UI elements
5. **Secure Requests**: Always use HTTPS in production
6. **Logout Cleanup**: Clear all stored data on logout

### Example Route Protection

```javascript
// Protected route component
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <div>Access Denied</div>;
  }

  return children;
};

// Usage
<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredPermission="admin_access">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## Testing API Endpoints

### Using curl

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin@123"}'

# Get Profile (replace <token> with actual JWT)
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer <token>"

# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "new@example.com", "name": "New User", "password": "Password123", "role_id": 1}'
```

### Using Postman

1. Create a new collection for "Mushkilty Auth API"
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3001`
   - `token`: `{{token}}` (will be set dynamically)
3. For login request, add a test script to save the token:
   ```javascript
   pm.test("Login successful", function () {
       pm.response.to.have.status(200);
       const responseJson = pm.response.json();
       pm.environment.set("token", responseJson.access_token);
   });
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows your frontend origin
2. **Token Expiration**: Implement token refresh or redirect to login
3. **Permission Denied**: Check user role and permissions in database
4. **Network Errors**: Verify backend is running on correct port

### Debug Information

Enable debug mode by checking:
- Network tab in browser dev tools
- Backend console logs
- JWT token payload using [jwt.io](https://jwt.io)

---

*Last updated: October 9, 2025*
*Version: 1.0.0*