# Admin Authentication Security

## Overview
This document describes the security measures implemented to ensure only users with `is_admin = TRUE` can access the admin panel.

## Security Layers

### 1. Login Page Verification
**File**: `src/app/admin/login/page.tsx`

When a user attempts to log in:
1. Credentials are verified via Supabase authentication
2. The user's profile is fetched from the database
3. The `is_admin` field is checked
4. If `is_admin !== true`, the user is immediately signed out and shown an error message
5. Only users with `is_admin = true` are redirected to the dashboard

### 2. Layout-Level Protection
**File**: `src/app/admin/dashboard/layout.tsx`

Every page in the admin dashboard is protected by the layout:
1. The `getAdminProfile()` function is called on every page load
2. This function checks if the user is authenticated AND has `is_admin = true`
3. If either check fails, the user is redirected to `/admin/login`
4. This prevents direct URL access to admin pages

### 3. Server-Side Profile Check
**File**: `src/lib/auth.ts`

The `getAdminProfile()` function provides server-side verification:
```typescript
export async function getAdminProfile() {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only return profile if user is an admin
  if (profile?.is_admin !== true) return null
  return profile
}
```

## How It Works

### Login Flow
1. User enters email and password
2. Supabase authenticates the credentials
3. System checks `profiles.is_admin` for the user
4. If `is_admin = false` or `null`:
   - User is signed out
   - Error message: "Accès refusé. Privilèges administrateur requis."
5. If `is_admin = true`:
   - User is redirected to `/admin/dashboard`

### Page Access Flow
1. User navigates to any `/admin/dashboard/*` page
2. Layout calls `getAdminProfile()`
3. Function checks:
   - Is user authenticated? (via `getUser()`)
   - Does user have `is_admin = true`? (via database query)
4. If either check fails:
   - User is redirected to `/admin/login`
5. If both checks pass:
   - Page content is rendered

## Database Requirements

### Required Column
The `profiles` table must have an `is_admin` column:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
```

### Setting Admin Users
To grant admin access to a user:
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'admin@example.com';
```

### Verifying Admin Users
To check which users have admin access:
```sql
SELECT id, email, nom, prenom, is_admin 
FROM profiles 
WHERE is_admin = TRUE;
```

## Security Benefits

1. **Multi-Layer Protection**: Authentication is checked at multiple points (login, layout, server functions)
2. **Server-Side Verification**: All checks happen on the server, preventing client-side bypasses
3. **Automatic Redirect**: Non-admin users are automatically redirected away from admin pages
4. **Session Termination**: Failed admin checks result in immediate sign-out
5. **Database-Driven**: Admin status is stored in the database, not in JWT tokens or client storage

## Testing

### Test Non-Admin Access
1. Create a user account without admin privileges
2. Attempt to log in at `/admin/login`
3. Expected: Error message and login failure

### Test Admin Access
1. Set a user's `is_admin = TRUE` in the database
2. Log in at `/admin/login`
3. Expected: Successful login and redirect to dashboard

### Test Direct URL Access
1. Log in as a non-admin user (or not logged in)
2. Try to navigate directly to `/admin/dashboard`
3. Expected: Automatic redirect to `/admin/login`

## Important Notes

- The `is_admin` field must be set manually in the database
- There is no self-service way for users to become admins
- Admin status persists across sessions
- Removing `is_admin = TRUE` will immediately revoke admin access on next page load
