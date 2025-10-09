# Dashboard Permission Update

## Summary

Updated the dashboard permission from `view_dashboard` to `dashboard:read` to match the backend implementation.

## Files Updated

### 1. **DashboardLayout.tsx**
```typescript
// Before
{ text: "لوحة التحكم", icon: <Dashboard />, path: "/", permission: "view_dashboard" }

// After  
{ text: "لوحة التحكم", icon: <Dashboard />, path: "/", permission: "dashboard:read" }
```

### 2. **DashboardPage.tsx**
```typescript
// Before
<ProtectedRoute requiredPermission="view_dashboard" showAccessDenied={true}>

// After
<ProtectedRoute requiredPermission="dashboard:read" showAccessDenied={true}>
```

### 3. **Documentation Updates**
- Updated all references in `DASHBOARD_AUTH_INTEGRATION.md`
- Changed permission examples and troubleshooting guides
- Updated testing instructions

## Backend Compatibility

The frontend now uses the correct permission name `dashboard:read` that matches the backend API implementation. This ensures:

- ✅ **Menu filtering** works correctly with backend permissions
- ✅ **Route protection** validates against correct permission
- ✅ **API access** aligns with backend authorization
- ✅ **Documentation** reflects actual implementation

## Testing

To test the permission change:

1. **Backend Setup**: Ensure users have `dashboard:read` permission in their roles
2. **Frontend Test**: Users with `dashboard:read` should see dashboard menu and access
3. **Negative Test**: Users without `dashboard:read` should see access denied page

The permission system is now fully aligned between frontend and backend!