# Deployment Guide - Vercel

This guide will help you securely deploy your admin panel to Vercel.

## 🔒 Security Checklist

Before pushing to GitHub and deploying, ensure:

- [x] All sensitive data is in `.env.local` (NOT committed to Git)
- [x] `.gitignore` includes `.env*` files
- [x] `.env.example` is created with placeholder values
- [x] No hardcoded API keys or secrets in the codebase
- [x] Admin authentication is enabled (`is_admin = true` check)
- [x] RLS policies are properly configured in Supabase

## 📋 Pre-Deployment Steps

### 1. Verify Environment Variables

Your `.env.local` should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important**: These values are in `.env.local` which is **NOT** committed to Git.

### 2. Check .gitignore

Verify that `.gitignore` includes:
```
.env*
!.env.example
```

This ensures:
- All `.env` files are ignored
- Only `.env.example` (with placeholder values) is committed

### 3. Review Code for Hardcoded Secrets

Run these checks:
```bash
# Search for potential hardcoded secrets
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" src/
grep -r "supabase.co" src/
grep -r "@gmail.com" src/
```

All should return no results (secrets should only be in `.env.local`).

## 🚀 Deployment Steps

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Admin panel"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Create a **private** repository (recommended)
   - Do NOT initialize with README (you already have one)

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**:
   Click "Environment Variables" and add these **three** variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |

   **Where to find these values**:
   - Copy them from your local `.env.local` file
   - Or get them from: Supabase Dashboard → Project Settings → API

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (2-3 minutes)
   - Your site will be live at `https://your-project-name.vercel.app`

### Step 3: Configure Domain (Optional)

1. In Vercel, go to your project → Settings → Domains
2. Add your custom domain
3. Follow Vercel's instructions to update your DNS records

## 🔐 Post-Deployment Security

### 1. Set Admin User in Database

Make sure you have at least one admin user:

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-admin-email@example.com';
```

### 2. Verify RLS Policies

Run the SQL script to ensure admins can view all marketplace posts:

```sql
-- In Supabase SQL Editor
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
```

### 3. Test the Deployment

1. Visit your Vercel URL
2. Go to `/admin/login`
3. Try logging in with a non-admin account (should fail)
4. Log in with an admin account (should succeed)
5. Verify all features work correctly

### 4. Enable Vercel Authentication (Optional)

For extra security, you can add Vercel's password protection:

1. Go to your project in Vercel
2. Settings → Deployment Protection
3. Enable "Vercel Authentication"
4. Set a password

This adds an extra layer before users even reach your login page.

## 🔄 Continuous Deployment

After initial deployment, any push to your GitHub repository will automatically trigger a new deployment on Vercel.

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
# Vercel will automatically deploy the changes
```

## 🛠️ Environment Variables Management

### Adding New Environment Variables

1. Add to `.env.local` for local development
2. Add to `.env.example` with placeholder value
3. Add to Vercel dashboard (Settings → Environment Variables)
4. Redeploy if needed

### Updating Environment Variables

1. In Vercel: Settings → Environment Variables
2. Edit the variable
3. Redeploy your project for changes to take effect

## 🚨 Troubleshooting

### Build Fails on Vercel

**Check build logs** in Vercel dashboard for specific errors.

Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Can't Access Admin Panel

1. Verify environment variables are set in Vercel
2. Check Supabase RLS policies
3. Ensure at least one user has `is_admin = TRUE`
4. Check browser console for errors

### Database Connection Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check Supabase project is not paused
4. Verify RLS policies allow admin access

## 📝 Important Notes

### What's Safe to Commit to GitHub

✅ **Safe**:
- All source code
- `.env.example` (with placeholder values)
- Documentation files
- Configuration files (without secrets)

❌ **Never Commit**:
- `.env.local`
- `.env`
- `.env.production`
- Any file with actual API keys or secrets
- `node_modules/`

### Environment Variables Explained

- **`NEXT_PUBLIC_SUPABASE_URL`**: Your Supabase project URL (safe to expose)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Public anon key (safe to expose, has RLS restrictions)
- **`SUPABASE_SERVICE_ROLE_KEY`**: Service role key (NEVER expose in browser, server-only)

The `NEXT_PUBLIC_` prefix means the variable is exposed to the browser. The service role key does NOT have this prefix, so it remains server-side only.

## 🎉 Success!

Your admin panel is now securely deployed on Vercel with:
- ✅ Private GitHub repository
- ✅ Environment variables properly configured
- ✅ No secrets in the codebase
- ✅ Admin authentication enabled
- ✅ Automatic deployments on push

Access your admin panel at: `https://your-project-name.vercel.app/admin/login`
