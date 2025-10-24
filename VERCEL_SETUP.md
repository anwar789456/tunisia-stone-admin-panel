# Quick Vercel Setup Guide

## 🚀 5-Minute Deployment

### Before You Start

Run the security check:
```bash
npm run security-check
```

If all checks pass, proceed with deployment.

---

## Step 1: Push to GitHub (2 minutes)

```bash
# Initialize Git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Admin panel"

# Create a new PRIVATE repository on GitHub
# Then add remote and push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel (3 minutes)

### 2.1 Import Project
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"

### 2.2 Add Environment Variables

**CRITICAL**: Add these 3 environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL
```
Value: Copy from your `.env.local` file
Environment: ✅ Production ✅ Preview ✅ Development

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: Copy from your `.env.local` file
Environment: ✅ Production ✅ Preview ✅ Development

```env
SUPABASE_SERVICE_ROLE_KEY
```
Value: Copy from your `.env.local` file
Environment: ✅ Production ✅ Preview ✅ Development

### 2.3 Deploy
Click "Deploy" and wait 2-3 minutes.

---

## Step 3: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Go to `/admin/login`
3. Log in with your admin credentials
4. Verify everything works

---

## 📋 Environment Variables Quick Copy

Open your `.env.local` and copy these values to Vercel:

| Variable Name | Where to Find |
|--------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Line 1 of `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Line 3 of `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Line 6 of `.env.local` |

---

## 🔧 Vercel Dashboard Navigation

**To add environment variables:**
1. Go to your project in Vercel
2. Click "Settings" (top menu)
3. Click "Environment Variables" (left sidebar)
4. Add each variable with the "Add" button

**To redeploy:**
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## ⚠️ Common Issues

### Issue: Build fails with "Missing environment variables"
**Solution**: Add all 3 environment variables in Vercel dashboard

### Issue: Can't log in after deployment
**Solution**: 
1. Check environment variables are correct
2. Verify you have an admin user in Supabase:
   ```sql
   UPDATE profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
   ```

### Issue: "Access denied" when logging in
**Solution**: Make sure your user has `is_admin = TRUE` in the database

---

## 🎯 Success Checklist

After deployment, verify:

- [ ] Site loads at Vercel URL
- [ ] Can access `/admin/login`
- [ ] Can log in with admin account
- [ ] Non-admin accounts are rejected
- [ ] All pages load correctly
- [ ] No console errors

---

## 🔄 Future Updates

To deploy changes:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically deploy the changes.

---

## 🔐 Security Reminder

✅ **Your `.env.local` is NOT on GitHub** (protected by `.gitignore`)
✅ **Environment variables are in Vercel** (secure)
✅ **Admin authentication is enabled**
✅ **RLS policies protect your database**

Your admin panel is secure! 🎉
