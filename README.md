# Stones Tunisia - Admin Panel

A secure admin dashboard built with Next.js 15, TypeScript, Tailwind CSS, and Supabase for managing platform users and content.

## Features

- ✅ **Secure Authentication** - Admin-only access with Supabase Auth
- ✅ **User Management** - List, view, search, and edit user profiles
- ✅ **Activity Monitoring** - View user posts, stock items, and demands
- ✅ **Modern UI** - Clean, responsive design with Tailwind CSS
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Protected Routes** - Middleware-based authentication
- ✅ **Ready for Production** - Deploy to Vercel in minutes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database/Auth**: Supabase
- **Icons**: Lucide React
- **Deployment**: Vercel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Set Up Database

1. Open your Supabase project SQL Editor
2. Copy and run the SQL from `DATABASE_SETUP.sql`
3. **Important**: Update the email in the SQL to set your admin user:

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your-admin-email@example.com';
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the admin login page.

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── login/              # Admin login page
│   │   └── dashboard/          # Protected admin area
│   │       ├── page.tsx        # Dashboard home
│   │       ├── layout.tsx      # Admin layout with nav
│   │       └── users/          # User management
│   │           ├── page.tsx    # Users list
│   │           └── [id]/       # User detail/edit
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Redirects to admin
├── components/
│   └── admin/
│       ├── AdminNav.tsx        # Navigation bar
│       ├── SearchUsers.tsx     # User search component
│       └── UserEditForm.tsx    # User edit form
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── auth.ts                 # Auth helpers
│   └── types.ts                # TypeScript types
└── middleware.ts               # Route protection
```

## Usage

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. You'll be redirected to the dashboard

### Managing Users

- **View All Users**: Navigate to Users from the dashboard
- **Search Users**: Use the search bar to filter by name, email, or company
- **Edit User**: Click "View Details" on any user to edit their profile
- **Update Profile**: Modify user information and click "Save Changes"

### Security

- All admin routes are protected by middleware
- Only users with `is_admin = true` can access the admin panel
- Non-admin users are automatically redirected to login
- RLS policies ensure data security at the database level

## Database Schema

The admin panel works with these tables:

- `profiles` - User profiles (with `is_admin` column)
- `marketplace_posts` - User marketplace listings
- `stock_marbre` - Marble stock inventory
- `postdemands` - Post demand requests

## 🔐 Security & Deployment

### Before Deploying

**Run the security check:**
```bash
npm run security-check
```

This verifies:
- ✅ No hardcoded secrets in code
- ✅ Environment variables properly configured
- ✅ `.gitignore` is set up correctly

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

**Quick Setup (5 minutes):**
1. Run `npm run security-check` to verify security
2. Push your code to GitHub (create a **private** repository)
3. Import the repository in Vercel
4. Add environment variables in Vercel dashboard
5. Deploy!

**📚 Detailed Guides:**
- **Quick Start**: See `VERCEL_SETUP.md` for 5-minute deployment
- **Complete Guide**: See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Security Checklist**: See `SECURITY_CHECKLIST.md` before deploying

**Important**: Make sure to add all environment variables from `.env.local` to your Vercel project settings.

## Environment Variables for Production

In your Vercel dashboard, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Can't log in as admin

Make sure you've run the database setup SQL and set `is_admin = TRUE` for your user:

```sql
SELECT id, email, is_admin FROM profiles WHERE email = 'your-email@example.com';
```

### Middleware errors

Ensure your `.env.local` file has all required Supabase credentials.

### Build errors

Clear Next.js cache and reinstall dependencies:

```bash
rm -rf .next node_modules
npm install
npm run dev
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
