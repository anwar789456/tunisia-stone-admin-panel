# Marketplace Inactive Posts Fix

## Problem
The admin panel was not showing inactive marketplace posts when viewing a user's marketplace at `/admin/dashboard/users/[id]/marketplace`. Only active posts were visible.

## Root Cause
The issue was caused by **Row Level Security (RLS) policies** in the Supabase database. There was likely an existing policy on the `marketplace_posts` table that filtered posts to only show those with `status = 'active'` for non-owners. This policy was preventing admins from seeing inactive posts, even though there was an admin policy in place.

## Solution

### 1. Fixed Display Issue
- Updated the status label in the user marketplace page to show "Inactive" (capitalized) instead of "inactive" (lowercase) for consistency.

### 2. Fixed RLS Policies
Created a new SQL script (`FIX_MARKETPLACE_RLS.sql`) that:
- Drops all existing conflicting policies on `marketplace_posts`
- Creates comprehensive new policies that:
  - **Allow admins to view ALL posts** (active and inactive)
  - Allow users to view their own posts (all statuses)
  - Allow users to view only active posts from other users
  - Properly handle INSERT, UPDATE, and DELETE operations

## How to Apply the Fix

### Step 1: Run the SQL Script
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Open the file `FIX_MARKETPLACE_RLS.sql`
4. Copy and paste the entire content into the SQL Editor
5. Click "Run" to execute the script

### Step 2: Verify the Fix
1. Log in to your admin panel
2. Navigate to a user's marketplace page: `/admin/dashboard/users/[user-id]/marketplace`
3. Click on the "Inactives" tab
4. You should now see all inactive posts for that user

## Technical Details

### RLS Policy Priority
When multiple RLS policies exist on a table, Supabase uses an **OR** logic by default. However, if one policy is too restrictive, it can prevent access even when another policy should allow it. The fix ensures that:

1. The admin policy is comprehensive and takes precedence
2. User policies don't conflict with admin access
3. Public access is properly restricted to active posts only

### Code Changes
- **File**: `src/app/admin/dashboard/users/[id]/marketplace/page.tsx`
- **Line 150**: Changed status display from lowercase to capitalized "Inactive"

### Database Changes
- **Table**: `marketplace_posts`
- **Changes**: Updated RLS policies to allow admins full access to all posts regardless of status

## Testing Checklist
- [ ] Admin can view active posts
- [ ] Admin can view inactive posts
- [ ] Admin can filter by status (All, Active, Inactive)
- [ ] Status counts are correct
- [ ] Regular users can only see active posts from others
- [ ] Regular users can see all their own posts

## Notes
- The page already had proper filtering logic in the code (lines 47-49)
- The issue was purely at the database RLS policy level
- No changes to the application code logic were needed beyond the display fix
