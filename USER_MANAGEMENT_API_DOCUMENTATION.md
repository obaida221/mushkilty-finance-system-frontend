# User Management API Documentation

## Overview

The Mushkilty Finance System provides comprehensive user management with Role-Based Access Control (RBAC). This includes user creation, role management, and permission assignment.

## Base Configuration

- **Base URL**: `http://localhost:3001`
- **Authentication**: Bearer Token (JWT) required for all endpoints
- **Required Header**: `Authorization: Bearer <token>`

---

## User Management Endpoints

### 1. Get All Users

**Endpoint**: `GET /users`

**Required Permission**: `users:read`

**Description**: Retrieve all users in the system with their roles.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Success Response** (200):
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role_id": 1,
    "role": {
      "id": 1,
      "name": "admin",
      "description": "Full access"
    },
    "created_at": "2025-10-09T10:30:00.000Z",
    "updated_at": "2025-10-09T10:30:00.000Z"
  },
  {
    "id": 2,
    "email": "user@example.com",
    "name": "Regular User",
    "role_id": 2,
    "role": {
      "id": 2,
      "name": "viewer",
      "description": "Read-only access"
    },
    "created_at": "2025-10-09T11:00:00.000Z",
    "updated_at": "2025-10-09T11:00:00.000Z"
  }
]
```

---

### 2. Get User by ID

**Endpoint**: `GET /users/:id`

**Required Permission**: `users:read`

**Description**: Retrieve a specific user by their ID.

**Parameters**:
- `id` (path): User ID

**Success Response** (200):
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin User",
  "role_id": 1,
  "role": {
    "id": 1,
    "name": "admin",
    "description": "Full access"
  },
  "created_at": "2025-10-09T10:30:00.000Z",
  "updated_at": "2025-10-09T10:30:00.000Z"
}
```

---

### 3. Create User

**Endpoint**: `POST /users`

**Required Permission**: `users:create`

**Description**: Create a new user in the system.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecurePass123",
  "role_id": 2
}
```

**Alternative with pre-hashed password**:
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "password_hash": "$2b$10$...",
  "role_id": 2
}
```

**Validation Rules**:
- `email`: Must be valid email format
- `name`: Optional string
- `password`: Minimum 6 characters (will be hashed automatically)
- `password_hash`: Alternative to password (already hashed)
- `role_id`: Must be valid role ID

**Success Response** (201):
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "name": "New User",
  "role_id": 2,
  "role": {
    "id": 2,
    "name": "viewer",
    "description": "Read-only access"
  },
  "created_at": "2025-10-09T12:00:00.000Z",
  "updated_at": "2025-10-09T12:00:00.000Z"
}
```

---

### 4. Update User

**Endpoint**: `PUT /users/:id`

**Required Permission**: `users:update`

**Description**: Update an existing user's information.

**Parameters**:
- `id` (path): User ID to update

**Request Body** (all fields optional):
```json
{
  "email": "updated@example.com",
  "name": "Updated Name",
  "password": "NewPassword123",
  "role_id": 3
}
```

**Success Response** (200):
```json
{
  "id": 3,
  "email": "updated@example.com",
  "name": "Updated Name",
  "role_id": 3,
  "role": {
    "id": 3,
    "name": "accountant",
    "description": "Manage transactions and reports"
  },
  "created_at": "2025-10-09T12:00:00.000Z",
  "updated_at": "2025-10-09T12:30:00.000Z"
}
```

---

### 5. Delete User

**Endpoint**: `DELETE /users/:id`

**Required Permission**: `users:delete`

**Description**: Delete a user from the system.

**Parameters**:
- `id` (path): User ID to delete

**Success Response** (200):
```json
{
  "message": "User deleted successfully"
}
```

---

## Role Management Endpoints

### 1. Get All Roles

**Endpoint**: `GET /roles`

**Required Permission**: `roles:read`

**Description**: Retrieve all roles in the system.

**Success Response** (200):
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Full access",
    "users": [],
    "rolePermissions": [
      {
        "permission": {
          "id": 1,
          "name": "users:create",
          "description": "Create new users"
        }
      }
    ]
  }
]
```

---

### 2. Get Role by ID

**Endpoint**: `GET /roles/:id`

**Required Permission**: `roles:read`

**Description**: Retrieve a specific role by ID.

**Success Response** (200):
```json
{
  "id": 1,
  "name": "admin",
  "description": "Full access",
  "users": [],
  "rolePermissions": [
    {
      "permission": {
        "id": 1,
        "name": "users:create",
        "description": "Create new users"
      }
    }
  ]
}
```

---

### 3. Create Role

**Endpoint**: `POST /roles`

**Required Permission**: `roles:create`

**Description**: Create a new role.

**Request Body**:
```json
{
  "name": "manager",
  "description": "Management role with elevated permissions"
}
```

**Success Response** (201):
```json
{
  "id": 5,
  "name": "manager",
  "description": "Management role with elevated permissions"
}
```

---

### 4. Update Role

**Endpoint**: `PUT /roles/:id`

**Required Permission**: `roles:update`

**Description**: Update an existing role.

**Request Body**:
```json
{
  "name": "senior-manager",
  "description": "Senior management role"
}
```

---

### 5. Get Current User's Permissions

**Endpoint**: `GET /roles/me/permissions`

**Required Permission**: `roles:read`

**Description**: Get permissions for the currently authenticated user's role.

**Success Response** (200):
```json
{
  "role": {
    "id": 1,
    "name": "admin",
    "description": "Full access"
  },
  "permissions": [
    {
      "id": 1,
      "name": "users:create",
      "description": "Create new users"
    },
    {
      "id": 2,
      "name": "users:read",
      "description": "Read user information"
    }
  ]
}
```

---

### 6. Get Role Permissions

**Endpoint**: `GET /roles/:id/permissions`

**Required Permission**: `roles:read`

**Description**: Get all permissions assigned to a specific role.

**Success Response** (200):
```json
{
  "role": {
    "id": 1,
    "name": "admin",
    "description": "Full access"
  },
  "permissions": [
    {
      "id": 1,
      "name": "users:create",
      "description": "Create new users"
    }
  ]
}
```

---

### 7. Assign Multiple Permissions to Role

**Endpoint**: `POST /roles/:id/permissions`

**Required Permission**: `roles:update`

**Description**: Assign multiple permissions to a role.

**Request Body**:
```json
{
  "permissions": ["users:read", "users:create"],
  "permissionIds": [1, 2, 3],
  "replace": false
}
```

**Fields**:
- `permissions`: Array of permission names (optional)
- `permissionIds`: Array of permission IDs (optional)
- `replace`: If true, replaces all existing permissions. If false, adds to existing (default: false)

---

### 8. Assign Single Permission to Role

**Endpoint**: `POST /roles/:roleId/permissions/:permissionId`

**Required Permission**: `roles:update`

**Description**: Assign a single permission to a role.

**Parameters**:
- `roleId` (path): Role ID
- `permissionId` (path): Permission ID

---

### 9. Remove Single Permission from Role

**Endpoint**: `DELETE /roles/:roleId/permissions/:permissionId`

**Required Permission**: `roles:update`

**Description**: Remove a single permission from a role.

---

### 10. Seed Default Roles

**Endpoint**: `POST /roles/seed`

**Required Permission**: `roles:create`

**Description**: Create default roles in the system.

**Success Response** (201):
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Full access"
  },
  {
    "id": 2,
    "name": "accountant",
    "description": "Manage transactions and reports"
  },
  {
    "id": 3,
    "name": "approver",
    "description": "Approve high-value transactions"
  },
  {
    "id": 4,
    "name": "viewer",
    "description": "Read-only access"
  }
]
```

---

## Permission Management Endpoints

### 1. Get All Permissions

**Endpoint**: `GET /permissions`

**Required Permission**: `permissions:read`

**Description**: Retrieve all available permissions in the system.

**Success Response** (200):
```json
[
  {
    "id": 1,
    "name": "users:create",
    "description": "Create new users"
  },
  {
    "id": 2,
    "name": "users:read",
    "description": "Read user information"
  },
  {
    "id": 3,
    "name": "users:update",
    "description": "Update user information"
  }
]
```

---

### 2. Create Permission

**Endpoint**: `POST /permissions`

**Required Permission**: `permissions:create`

**Description**: Create a new permission.

**Request Body**:
```json
{
  "name": "custom:action",
  "description": "Custom permission description"
}
```

---

### 3. Seed Default Permissions

**Endpoint**: `POST /permissions/seed`

**Required Permission**: `permissions:update`

**Description**: Create all default permissions for the system.

**Success Response** (201):
```json
{
  "created": 45
}
```

**Default Permissions Created**:
- **Users & Auth**: `users:create`, `users:read`, `users:update`, `users:delete`
- **Roles**: `roles:create`, `roles:read`, `roles:update`, `roles:delete`
- **Permissions**: `permissions:create`, `permissions:read`, `permissions:update`, `permissions:delete`
- **Students**: `students:create`, `students:read`, `students:update`, `students:delete`, `students:search`
- **Courses**: `courses:create`, `courses:read`, `courses:update`, `courses:delete`, `courses:search`
- **Batches**: `batches:create`, `batches:read`, `batches:update`, `batches:delete`, `batches:search`
- **Enrollments**: `enrollments:create`, `enrollments:read`, `enrollments:update`, `enrollments:delete`, `enrollments:search`
- **Discount Codes**: `discount-codes:create`, `discount-codes:read`, `discount-codes:update`, `discount-codes:delete`, `discount-codes:validate`, `discount-codes:search`
- **Payment Methods**: `payment-methods:create`, `payment-methods:read`, `payment-methods:update`, `payment-methods:delete`, `payment-methods:search`
- **Payments**: `payments:create`, `payments:read`, `payments:update`, `payments:delete`, `payments:search`, `payments:reports`
- **Refunds**: `refunds:create`, `refunds:read`, `refunds:update`, `refunds:delete`, `refunds:search`, `refunds:reports`
- **Expenses**: `expenses:create`, `expenses:read`, `expenses:update`, `expenses:delete`, `expenses:search`, `expenses:reports`
- **Payroll**: `payroll:create`, `payroll:read`, `payroll:update`, `payroll:delete`, `payroll:search`, `payroll:reports`
- **System**: `bootstrap:seed`, `system:admin`

---

## Frontend Integration Examples

### 1. User Management Service

```javascript
class UserManagementService {
  constructor(apiService) {
    this.api = apiService;
  }

  // Get all users
  async getAllUsers() {
    return await this.api.request('/users');
  }

  // Get user by ID
  async getUser(id) {
    return await this.api.request(`/users/${id}`);
  }

  // Create new user
  async createUser(userData) {
    return await this.api.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Update user
  async updateUser(id, userData) {
    return await this.api.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Delete user
  async deleteUser(id) {
    return await this.api.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}
```

### 2. Role Management Service

```javascript
class RoleManagementService {
  constructor(apiService) {
    this.api = apiService;
  }

  // Get all roles
  async getAllRoles() {
    return await this.api.request('/roles');
  }

  // Create new role
  async createRole(roleData) {
    return await this.api.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  // Get role permissions
  async getRolePermissions(roleId) {
    return await this.api.request(`/roles/${roleId}/permissions`);
  }

  // Assign permissions to role
  async assignPermissions(roleId, permissions) {
    return await this.api.request(`/roles/${roleId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({
        permissions: permissions,
        replace: false,
      }),
    });
  }

  // Get current user's permissions
  async getCurrentUserPermissions() {
    return await this.api.request('/roles/me/permissions');
  }

  // Seed default roles
  async seedRoles() {
    return await this.api.request('/roles/seed', {
      method: 'POST',
    });
  }
}
```

### 3. Permission Management Service

```javascript
class PermissionManagementService {
  constructor(apiService) {
    this.api = apiService;
  }

  // Get all permissions
  async getAllPermissions() {
    return await this.api.request('/permissions');
  }

  // Create new permission
  async createPermission(permissionData) {
    return await this.api.request('/permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    });
  }

  // Seed default permissions
  async seedPermissions() {
    return await this.api.request('/permissions/seed', {
      method: 'POST',
    });
  }
}
```

### 4. React Component Examples

```jsx
// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const { hasPermission } = useAuth();

  useEffect(() => {
    if (hasPermission('users:read')) {
      loadUsers();
    }
    if (hasPermission('roles:read')) {
      loadRoles();
    }
  }, []);

  const loadUsers = async () => {
    try {
      const userData = await userService.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await userService.createUser(userData);
      loadUsers(); // Refresh list
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      
      {hasPermission('users:create') && (
        <UserCreateForm onSubmit={handleCreateUser} roles={roles} />
      )}
      
      {hasPermission('users:read') && (
        <UserList 
          users={users} 
          canEdit={hasPermission('users:update')}
          canDelete={hasPermission('users:delete')}
        />
      )}
    </div>
  );
};

// Role Assignment Component
const RoleAssignment = ({ userId, currentRoleId }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(currentRoleId);

  const handleRoleChange = async () => {
    try {
      await userService.updateUser(userId, { role_id: selectedRole });
      // Show success message
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  return (
    <div>
      <select 
        value={selectedRole} 
        onChange={(e) => setSelectedRole(e.target.value)}
      >
        {roles.map(role => (
          <option key={role.id} value={role.id}>
            {role.name} - {role.description}
          </option>
        ))}
      </select>
      <button onClick={handleRoleChange}>Update Role</button>
    </div>
  );
};
```

## Permission-Based UI Control

```javascript
// Higher-order component for permission checking
const withPermission = (permission) => (Component) => {
  return (props) => {
    const { hasPermission } = useAuth();
    
    if (!hasPermission(permission)) {
      return <div>Access Denied</div>;
    }
    
    return <Component {...props} />;
  };
};

// Usage
const UserCreateForm = withPermission('users:create')(UserCreateFormComponent);
const UserEditForm = withPermission('users:update')(UserEditFormComponent);

// Conditional rendering based on permissions
const UserActions = ({ user }) => {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('users:update') && (
        <button onClick={() => editUser(user.id)}>Edit</button>
      )}
      
      {hasPermission('users:delete') && (
        <button onClick={() => deleteUser(user.id)}>Delete</button>
      )}
      
      {hasPermission('roles:update') && (
        <RoleAssignment userId={user.id} currentRoleId={user.role_id} />
      )}
    </div>
  );
};
```

## Setup and Initialization

### 1. Initial System Setup

```javascript
// Setup script for new installation
const setupSystem = async () => {
  try {
    // 1. Seed permissions
    await permissionService.seedPermissions();
    console.log('✅ Permissions seeded');
    
    // 2. Seed roles
    await roleService.seedRoles();
    console.log('✅ Roles seeded');
    
    // 3. Assign permissions to admin role
    await roleService.assignPermissions(1, [], true, [1, 2, 3, 4, 5]); // All permission IDs
    console.log('✅ Admin role configured');
    
    // 4. Create initial admin user
    await userService.createUser({
      email: 'admin@example.com',
      name: 'System Administrator',
      password: 'Admin@123',
      role_id: 1, // Admin role
    });
    console.log('✅ Admin user created');
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
};
```

## Error Handling

### Common Error Responses

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions. Required: users:create",
  "error": "Forbidden"
}
```

```json
{
  "statusCode": 400,
  "message": ["email must be a valid email", "role_id must be a number"],
  "error": "Bad Request"
}
```

## Testing with cURL

```bash
# Get all users
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer <token>"

# Create user
curl -X POST http://localhost:3001/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123",
    "role_id": 2
  }'

# Get all roles
curl -X GET http://localhost:3001/roles \
  -H "Authorization: Bearer <token>"

# Assign permissions to role
curl -X POST http://localhost:3001/roles/1/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["users:read", "users:create"],
    "replace": false
  }'
```

---

*Last updated: October 9, 2025*
*Version: 1.0.0*