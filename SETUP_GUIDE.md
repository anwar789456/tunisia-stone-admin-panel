# 🚀 Quick Setup Guide

Follow these steps to get your admin panel running:

## Step 1: Configure Environment Variables

Your `.env.local` file is already created. Fill it with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Click on Settings (gear icon) → API
3. Copy the Project URL and anon/public key
4. Copy the service_role key (keep this secret!)

## Step 2: Set Up Database

1. Open your Supabase project
2. Go to SQL Editor
3. Open the `DATABASE_SETUP.sql` file from this project
4. Copy all the SQL and paste it into the Supabase SQL Editor
5. **IMPORTANT**: Before running, find this line and update it with YOUR email:

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-admin-email@example.com';  -- ← Change this!
```

6. Click "Run" to execute the SQL

## Step 3: Verify Admin User

Run this query in Supabase SQL Editor to confirm your admin user is set:

```sql
SELECT id, email, nom, prenom, is_admin 
FROM profiles 
WHERE is_admin = TRUE;
```

You should see your user with `is_admin = true`.

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Access Admin Panel

1. Open http://localhost:3000
2. You'll be redirected to `/admin/login`
3. Sign in with your admin email and password
4. You should see the admin dashboard!

## 🎉 You're Done!

You can now:
- ✅ View all users
- ✅ Search and filter users
- ✅ Edit user profiles
- ✅ View user activity (posts, stock items)
- ✅ Monitor platform statistics

## 🔒 Security Notes

- Only users with `is_admin = true` can access the admin panel
- All routes under `/admin` are protected by middleware
- Row Level Security (RLS) policies protect your database
- Never commit `.env.local` to version control (it's already in .gitignore)

## 📝 Next Steps

1. **Add more admins**: Run the UPDATE query with different emails
2. **Customize**: Modify components in `src/components/admin/`
3. **Deploy**: Push to GitHub and deploy on Vercel
4. **Extend**: Add more admin features as needed

## ⚠️ Troubleshooting

**Can't log in?**
- Check that `is_admin = true` in your profiles table
- Verify your email/password are correct
- Check browser console for errors

**Middleware errors?**
- Ensure all environment variables are set correctly
- Restart the dev server after changing `.env.local`

**Database errors?**
- Make sure you ran the complete `DATABASE_SETUP.sql`
- Check that RLS policies are enabled
- Verify table names match your schema

## 📚 File Structure

```
✅ src/lib/supabase/        - Supabase clients
✅ src/lib/auth.ts          - Authentication helpers
✅ src/middleware.ts        - Route protection
✅ src/app/admin/login/     - Login page
✅ src/app/admin/dashboard/ - Admin dashboard
✅ src/components/admin/    - Reusable components
```

Need help? Check the main README.md for more details!
