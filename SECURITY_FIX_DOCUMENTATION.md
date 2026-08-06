# Security Fix: Authentication for /api/db Endpoint

## Summary
This patch mitigates unauthenticated arbitrary user-record deletion via public /api/db deleteUser action by implementing server-side authentication and authorization checks.

## Changes Made

### 1. Created Authentication Helper (`src/lib/auth-helpers.ts`)
- Added `authenticateRequest()` function to validate user credentials from request headers
- Added `isAdmin()` function to check if a user has admin/staff privileges
- Added `canModifyUser()` function to check if a user can modify a specific user record
- Supports two authentication methods:
  - `x-user-id` header for session-based auth
  - `x-user-email` and `x-user-password` headers for basic auth

### 2. Secured API Route (`src/app/api/db/route.ts`)
- **GET endpoint**: Now requires authentication and admin privileges
  - Prevents unauthenticated user enumeration
  - Returns 401 if not authenticated
  - Returns 403 if not an admin
  
- **POST endpoint**: Now requires authentication for all operations
  - All requests must include valid authentication headers
  - Sensitive operations (deleteUser, updateUser, createUser, etc.) require admin privileges
  - Returns 401 if not authenticated
  - Returns 403 if insufficient permissions
  - Returns 400 for invalid actions or missing required parameters

### 3. Updated Client Service (`src/services/supabase.ts`)
- Added `getAuthHeaders()` private method to automatically include authentication headers
- Updated critical methods to use authenticated requests:
  - `syncWithServer()` - GET /api/db with auth headers
  - `deleteUser()` - Requires admin auth
  - `removeStaff()` - Requires admin auth
  - `addStaff()` - Requires admin auth
  - `updateStaff()` - Requires admin auth
  - `addTicketComment()` - Requires admin auth

## Security Impact

### Before
- Any unauthenticated user could:
  - Enumerate all users via GET /api/db
  - Delete arbitrary user records via POST /api/db with action="deleteUser"
  - Modify user records via POST /api/db with action="updateUser"
  - Create new users via POST /api/db with action="createUser"

### After
- All /api/db operations require authentication
- Sensitive operations (user management) require admin privileges
- User enumeration is prevented by requiring admin access for GET requests
- Proper authorization checks ensure only admins can perform destructive operations

## Authentication Flow

1. Client stores user session in localStorage after login
2. Client includes `x-user-id` header in API requests
3. Server validates the user ID against the database
4. Server checks if user has required permissions (admin for sensitive operations)
5. Server processes request only if authentication and authorization succeed

## Testing Recommendations

1. **Test unauthenticated access**:
   ```bash
   curl -X GET http://localhost:3000/api/db
   # Should return 401 Unauthorized
   
   curl -X POST http://localhost:3000/api/db \
     -H "Content-Type: application/json" \
     -d '{"action":"deleteUser","payload":{"id":"test-id"}}'
   # Should return 401 Unauthorized
   ```

2. **Test authenticated non-admin access**:
   ```bash
   curl -X POST http://localhost:3000/api/db \
     -H "Content-Type: application/json" \
     -H "x-user-id: customer-user-id" \
     -d '{"action":"deleteUser","payload":{"id":"test-id"}}'
   # Should return 403 Forbidden
   ```

3. **Test authenticated admin access**:
   ```bash
   curl -X POST http://localhost:3000/api/db \
     -H "Content-Type: application/json" \
     -H "x-user-id: admin-user-id" \
     -d '{"action":"deleteUser","payload":{"id":"test-id"}}'
   # Should succeed if admin user exists
   ```

## Notes

- The authentication mechanism uses headers rather than cookies/sessions for simplicity
- In production, consider implementing:
  - JWT tokens for better security
  - Rate limiting to prevent brute force attacks
  - Audit logging for all user management operations
  - CSRF protection if using cookie-based sessions
  - Additional validation for user IDs and payloads
