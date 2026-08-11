# Security Fix: User Management Authentication

## Overview
This document describes the security fix applied to prevent unauthenticated user account creation, modification, and privilege escalation attacks.

## Vulnerability Summary
The `/api/db` endpoint previously allowed unauthenticated POST requests to perform user management operations including:
- `createUser` - Create new user accounts with arbitrary roles (including Super Admin)
- `updateUser` - Modify existing user accounts, including password hashes and roles
- `deleteUser` - Delete user accounts

These operations were accessible without any server-side authentication or authorization checks, allowing attackers to:
1. Create verified Super Admin accounts with chosen passwords
2. Reset existing user passwords and elevate their roles
3. Take over any account in the system

## Fix Applied

### 1. Blocked User Management in `/api/db` (src/app/api/db/route.ts)
The `createUser`, `updateUser`, and `deleteUser` actions now return a 403 Forbidden error with a clear message:
```
"User management operations are not permitted through this endpoint"
```

### 2. Created Authenticated Admin Endpoint (src/app/api/admin/users/route.ts)
A new dedicated endpoint for user management operations that:
- Requires authentication (placeholder implementation included)
- Validates admin permissions
- Prevents role escalation beyond the admin's own permissions
- Prevents self-deletion
- Validates all input fields

### 3. Updated Client-Side Service (src/services/supabase.ts)
Updated the `SupabaseService` methods to:
- Call the new `/api/admin/users` endpoint instead of `/api/db`
- Handle authentication errors gracefully
- Continue with localStorage-only operations when server-side auth is not available

## What Still Needs to Be Done

### Implement Server-Side Authentication
The `/api/admin/users/route.ts` file contains a placeholder `authenticateAdmin()` function that needs to be implemented. Options include:

#### Option 1: JWT-based Authentication
```typescript
import { verify } from 'jsonwebtoken';

async function authenticateAdmin(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { authenticated: false, error: "Missing authorization header" };
  }
  
  const token = authHeader.substring(7);
  try {
    const user = verify(token, process.env.JWT_SECRET!) as any;
    if (!["Super Admin", "Owner"].includes(user.role)) {
      return { authenticated: false, error: "Insufficient permissions" };
    }
    return { authenticated: true, user };
  } catch (e) {
    return { authenticated: false, error: "Invalid token" };
  }
}
```

#### Option 2: Session Cookie Authentication
```typescript
import { cookies } from 'next/headers';

async function authenticateAdmin(request: Request) {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  
  if (!sessionId) {
    return { authenticated: false, error: "No session found" };
  }
  
  const session = await getSessionFromDatabase(sessionId);
  if (!session || session.expired) {
    return { authenticated: false, error: "Invalid or expired session" };
  }
  
  if (!["Super Admin", "Owner"].includes(session.user.role)) {
    return { authenticated: false, error: "Insufficient permissions" };
  }
  
  return { authenticated: true, user: session.user };
}
```

#### Option 3: API Key Authentication (for service-to-service)
```typescript
async function authenticateAdmin(request: Request) {
  const apiKey = request.headers.get("X-API-Key");
  
  if (!apiKey) {
    return { authenticated: false, error: "Missing API key" };
  }
  
  const validKey = await validateApiKey(apiKey);
  if (!validKey || !validKey.hasAdminPermissions) {
    return { authenticated: false, error: "Invalid API key or insufficient permissions" };
  }
  
  return { authenticated: true, user: validKey.user };
}
```

### Update Login Flow to Issue Tokens/Sessions
The `/api/auth/login/route.ts` should be updated to:
1. Generate a JWT token or create a session after successful authentication
2. Return the token to the client or set a secure HTTP-only cookie
3. Include the user's role and permissions in the token/session

Example for JWT:
```typescript
import { sign } from 'jsonwebtoken';

// In the login route after password verification:
const token = sign(
  { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    name: user.name 
  },
  process.env.JWT_SECRET!,
  { expiresIn: '24h' }
);

return NextResponse.json({ 
  success: true, 
  user: safeUser,
  token // Return this to the client
});
```

### Update Client-Side to Send Authentication
Update the client-side code to include the authentication token in requests:

```typescript
// Store token after login
localStorage.setItem('auth_token', token);

// Include in requests
const response = await fetch("/api/admin/users", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: JSON.stringify({ action: "createUser", payload: newUser })
});
```

## Testing the Fix

### Verify the Vulnerability is Blocked
Try to create a Super Admin account without authentication:
```bash
curl -X POST http://localhost:3000/api/db \
  -H "Content-Type: application/json" \
  -d '{
    "action": "createUser",
    "payload": {
      "id": "attacker-admin",
      "email": "attacker@evil.com",
      "name": "Attacker",
      "passwordHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      "role": "Super Admin",
      "isVerified": true
    }
  }'
```

Expected response:
```json
{
  "success": false,
  "error": "User management operations are not permitted through this endpoint"
}
```

### Verify Legitimate Signup Still Works
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123",
    "name": "New User"
  }'
```

This should still work and create a customer account with `isVerified: false`.

## Security Considerations

1. **Defense in Depth**: Even with authentication implemented, consider adding:
   - Rate limiting on user management endpoints
   - Audit logging for all user management operations
   - Email notifications when accounts are created/modified
   - Multi-factor authentication for admin operations

2. **Principle of Least Privilege**: 
   - Regular users should never be able to modify their own role
   - Only Owners should be able to create Super Admin accounts
   - Consider separating user creation from role assignment

3. **Input Validation**:
   - The new endpoint validates roles and prevents escalation
   - Consider adding email format validation
   - Validate password complexity requirements

4. **Secure Password Storage**:
   - Ensure passwords are hashed with a strong algorithm (bcrypt, argon2)
   - The current SHA-256 implementation should be upgraded to bcrypt

## References
- OWASP Top 10: A01:2021 – Broken Access Control
- OWASP Top 10: A07:2021 – Identification and Authentication Failures
- CWE-306: Missing Authentication for Critical Function
- CWE-269: Improper Privilege Management
