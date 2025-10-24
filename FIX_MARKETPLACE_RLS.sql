-- ============================================
-- FIX MARKETPLACE RLS POLICIES
-- ============================================
-- This script fixes the issue where admins cannot see inactive marketplace posts
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Drop all existing policies on marketplace_posts
DROP POLICY IF EXISTS "Users can view own marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Users can view active marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Public can view active marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Admins can view all marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Users can insert own marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Users can update own marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Users can delete own marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Admins can update all marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Admins can delete all marketplace_posts" ON marketplace_posts;
DROP POLICY IF EXISTS "Admins can insert marketplace_posts" ON marketplace_posts;

-- 2. Create new comprehensive policies

-- Allow admins to view ALL marketplace posts (including inactive ones)
CREATE POLICY "Admins can view all marketplace_posts"
  ON marketplace_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Allow users to view their own marketplace posts (all statuses)
CREATE POLICY "Users can view own marketplace_posts"
  ON marketplace_posts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow public/authenticated users to view only ACTIVE marketplace posts from others
CREATE POLICY "Users can view active marketplace_posts"
  ON marketplace_posts FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    AND user_id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Allow users to insert their own marketplace posts
CREATE POLICY "Users can insert own marketplace_posts"
  ON marketplace_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own marketplace posts
CREATE POLICY "Users can update own marketplace_posts"
  ON marketplace_posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to delete their own marketplace posts
CREATE POLICY "Users can delete own marketplace_posts"
  ON marketplace_posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to update any marketplace post
CREATE POLICY "Admins can update all marketplace_posts"
  ON marketplace_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Allow admins to delete any marketplace post
CREATE POLICY "Admins can delete all marketplace_posts"
  ON marketplace_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Allow admins to insert marketplace posts
CREATE POLICY "Admins can insert marketplace_posts"
  ON marketplace_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- 3. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'marketplace_posts'
ORDER BY policyname;

-- ============================================
-- DONE!
-- ============================================
-- After running this script:
-- - Admins can see ALL marketplace posts (active and inactive)
-- - Users can see their own posts (all statuses)
-- - Users can only see ACTIVE posts from other users
-- ============================================
