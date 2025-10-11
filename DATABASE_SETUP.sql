-- ============================================
-- ADMIN PANEL DATABASE SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create an index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- 3. Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 5. Create RLS policies for profiles
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- 6. Create admin policies for marketplace_posts
DROP POLICY IF EXISTS "Admins can view all marketplace_posts" ON marketplace_posts;
CREATE POLICY "Admins can view all marketplace_posts"
  ON marketplace_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- 7. Create admin policies for stock_marbre
DROP POLICY IF EXISTS "Admins can view all stock_marbre" ON stock_marbre;
CREATE POLICY "Admins can view all stock_marbre"
  ON stock_marbre FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- 8. Create admin policies for postdemands
DROP POLICY IF EXISTS "Admins can view all postdemands" ON postdemands;
CREATE POLICY "Admins can view all postdemands"
  ON postdemands FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- ============================================
-- IMPORTANT: Set your admin user
-- ============================================
-- Replace 'your-admin-email@example.com' with your actual admin email
-- This should be the email you'll use to log into the admin panel

UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'hayderbenaissa@gmail.com';

-- Verify the admin user was set correctly
SELECT id, email, nom, prenom, is_admin 
FROM profiles 
WHERE is_admin = TRUE;

-- ============================================
-- DONE!
-- ============================================
-- Your admin panel is now ready to use.
-- Make sure to:
-- 1. Update the email in the UPDATE statement above
-- 2. Configure your .env.local file with Supabase credentials
-- 3. Run: npm run dev
-- 4. Visit: http://localhost:3000/admin/login
-- ============================================
