# Authentication Integration

This document explains the authentication system setup for the Mushkilty Finance System frontend.

## Overview

The authentication system is now properly integrated with the backend API based on the provided documentation. Here's what has been implemented:

## Backend URL Configuration

- **Backend URL**: `http://localhost:3001`
- **API Documentation**: `http://localhost:3001/api` (Swagger UI)

## Files Structure

```
src/
├── api/
│   ├── index.ts          # API exports
│   ├── authAPI.ts        # Auth API with axios
│   └── [other APIs...]   # Other API files
├── services/
│   ├── index.ts          # Services exports
│   └── authService.ts    # Standalone auth service
├── context/
│   └── AuthContext.tsx   # React context for auth
├── components/
│   └── ProtectedRoute.tsx # Route protection component
├── types/
│   └── index.ts          # Updated with backend types
└── config/
    └── axios.ts          # Updated with correct URL
```

## Key Features Implemented

### 1. Authentication Service (`/src/services/authService.ts`)
- Standalone authentication service
- Handles login, register, profile fetching
- Token management
- Permission checking
- Automatic logout on 401 errors

### 2. Auth API (`/src/api/authAPI.ts`)
- Axios-based API calls
- Proper error handling
- Type-safe requests

### 3. Auth Context (`/src/context/AuthContext.tsx`)
- React context for authentication state
- Hooks for easy usage (`useAuth`, `usePermission`)
- Loading states management

### 4. Protected Routes (`/src/components/ProtectedRoute.tsx`)
- Route protection based on authentication
- Permission-based access control
- Loading and error states

### 5. Updated Types (`/src/types/index.ts`)
- Backend-compatible type definitions
- Based on API documentation
- JWT token structure

## Usage Examples

### Basic Authentication
```tsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) return <div>Please login</div>;

  return <div>Welcome {user.name}</div>;
};
```

### Permission Checking
```tsx
import { usePermission } from '../context/AuthContext';

const AdminComponent = () => {
  const { hasPermission } = usePermission();

  if (!hasPermission('admin_access')) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel</div>;
};
```

### Protected Routes
```tsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route 
  path="/admin" 
  element={
    <ProtectedRoute requiredPermission="admin_access">
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

### API Calls
```tsx
import { authAPI } from '../api';

// Login
const loginUser = async () => {
  try {
    const response = await authAPI.login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log(response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Get profile
const getProfile = async () => {
  try {
    const user = await authAPI.getProfile();
    console.log(user);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};
```

## Backend Endpoints Used

1. **POST /auth/login**
   - Request: `{ email, password }`
   - Response: `{ access_token, user }`

2. **POST /auth/register**
   - Request: `{ email, name, password, role_id }`
   - Response: `User object`

3. **GET /auth/profile**
   - Headers: `Authorization: Bearer <token>`
   - Response: `User object with role and permissions`

## Token Management

- Tokens are stored in `localStorage` with key `authToken`
- User data is stored in `localStorage` with key `user`
- Automatic token injection in API requests
- Automatic logout on token expiration (401 errors)

## Error Handling

- Network errors are properly caught and displayed
- 401 errors trigger automatic logout
- 403 errors show permission denied messages
- Validation errors are displayed in forms

## Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Automatic token cleanup on logout
- Permission checking before UI rendering
- Secure token storage

## Next Steps

1. Install axios if not already installed: `npm install axios`
2. Start the backend server on `http://localhost:3001`
3. Test the authentication flow
4. Add more API endpoints as needed
5. Implement additional permission checks

## Notes

- The LoginPage has been updated to use email instead of username
- Demo credentials updated to match backend format
- All API calls now point to `http://localhost:3001`
- Error handling improved for better UX