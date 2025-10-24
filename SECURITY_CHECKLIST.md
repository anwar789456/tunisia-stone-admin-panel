# Security Checklist ✅

Use this checklist before pushing to GitHub and deploying to Vercel.

## 🔐 Environment Variables

- [x] All sensitive data is in `.env.local`
- [x] `.env.local` is listed in `.gitignore`
- [x] `.env.example` created with placeholder values
- [x] No hardcoded Supabase URLs in code
- [x] No hardcoded API keys in code
- [x] No hardcoded email addresses in code

## 📁 Git Configuration

- [x] `.gitignore` includes `.env*`
- [x] `.gitignore` allows `.env.example`
- [x] `.gitignore` includes `node_modules/`
- [x] `.gitignore` includes `.next/`
- [x] `.gitignore` includes `.vercel/`

## 🔒 Authentication & Authorization

- [x] Admin authentication is enabled in `src/lib/auth.ts`
- [x] Login page checks `is_admin = true`
- [x] Dashboard layout redirects non-admins
- [x] All admin checks are server-side (not client-side)

## 🗄️ Database Security

- [x] RLS (Row Level Security) is enabled on all tables
- [x] Admin policy allows viewing all marketplace posts
- [x] User policies restrict access appropriately
- [x] At least one admin user exists in database
- [x] Service role key is server-side only

## 📝 Code Review

Run these commands to check for hardcoded secrets:

```bash
# Check for Supabase URLs
grep -r "supabase.co" src/

# Check for JWT tokens
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" src/

# Check for email addresses
grep -r "@gmail.com" src/
grep -r "@" src/ | grep -v "import" | grep -v "export"
```

All should return **no results** (or only comments/documentation).

## 🚀 Pre-Deployment

- [ ] Run `npm run build` locally to check for errors
- [ ] Test admin login with admin account
- [ ] Test admin login with non-admin account (should fail)
- [ ] Verify all pages load correctly
- [ ] Check browser console for errors

## 📤 GitHub Push

- [ ] Create **private** repository on GitHub
- [ ] Review files to be committed: `git status`
- [ ] Verify `.env.local` is NOT in the list
- [ ] Commit and push to GitHub

## ☁️ Vercel Deployment

- [ ] Import project from GitHub
- [ ] Add all environment variables in Vercel dashboard
- [ ] Deploy and wait for build to complete
- [ ] Test deployed site at Vercel URL
- [ ] Verify admin login works
- [ ] Check all features work correctly

## 🔍 Post-Deployment Verification

- [ ] Admin can log in
- [ ] Non-admin cannot access admin panel
- [ ] All marketplace posts visible (active and inactive)
- [ ] User profiles load correctly
- [ ] No console errors in browser
- [ ] No build errors in Vercel logs

## 🛡️ Additional Security (Optional)

- [ ] Enable Vercel Deployment Protection
- [ ] Set up custom domain with HTTPS
- [ ] Configure CORS if needed
- [ ] Set up monitoring/alerts
- [ ] Enable Vercel Analytics

## ⚠️ Critical Reminders

### NEVER commit these files:
- `.env.local`
- `.env`
- `.env.production`
- Any file containing actual API keys

### NEVER hardcode:
- Supabase URLs
- API keys
- JWT tokens
- Email addresses (except in SQL setup files)
- Passwords

### ALWAYS:
- Use environment variables for secrets
- Keep `.gitignore` up to date
- Test locally before deploying
- Use private GitHub repositories for sensitive projects
- Enable RLS on all Supabase tables

## 📞 If Something Goes Wrong

### Exposed Secrets on GitHub

1. **Immediately rotate the keys**:
   - Go to Supabase Dashboard → Settings → API
   - Generate new keys
   - Update `.env.local` and Vercel environment variables

2. **Remove from Git history**:
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   # Or create a new repository and migrate code
   ```

3. **Update all deployments** with new keys

### Can't Access Admin Panel

1. Check Vercel logs for errors
2. Verify environment variables in Vercel
3. Check Supabase RLS policies
4. Ensure admin user exists in database

### Build Failures

1. Check Vercel build logs
2. Run `npm run build` locally
3. Fix TypeScript/ESLint errors
4. Verify all dependencies are installed

---

## ✅ Final Check

Before going live, confirm:

1. ✅ No secrets in GitHub repository
2. ✅ All environment variables in Vercel
3. ✅ Admin authentication working
4. ✅ RLS policies configured
5. ✅ At least one admin user in database
6. ✅ Site is accessible and functional
7. ✅ No errors in browser console
8. ✅ No errors in Vercel logs

**You're ready to deploy! 🚀**
