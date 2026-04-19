# ChargeNet Security Guide

## Key Rotation Procedures

### 1. Rotate Supabase Anon Key

When to rotate:
- Anon key exposed in public repo
- Suspected unauthorized access
- Regular rotation (every 90 days)

Steps:
1. Go to Supabase Dashboard
   → Project Settings → API
2. Click "Roll" next to anon/public key
3. Copy the NEW anon key
4. Update .env:
   VITE_SUPABASE_URL=same-url
   VITE_SUPABASE_ANON_KEY=NEW-KEY-HERE
5. Update server/.env if used there
6. Redeploy your frontend
7. Old key is immediately invalidated
8. Test login/signup still works

Warning: Rolling the anon key will immediately break any app still using the old key. Do during low-traffic hours.

---

### 2. Rotate Supabase Service Role Key

The service role key has FULL database access. Treat it like a root password.

When to rotate:
- Key exposed anywhere (URGENT)
- Team member leaves
- Regular rotation (every 90 days)

Steps:
1. Go to Supabase Dashboard
   → Project Settings → API
2. Click "Roll" next to service_role key
3. Copy the NEW service role key
4. Update server/.env:
   SUPABASE_SERVICE_KEY=NEW-KEY-HERE
5. Restart your Express server:
   cd server && npm start
6. Test admin operations still work
7. Old key is immediately invalidated

Warning: This breaks your server immediately. Have new key ready before rolling.
Do this during maintenance window.

---

### 3. Rotate Razorpay API Keys

When to rotate:
- Key exposed in code/logs
- Suspected fraud
- Team member with access leaves

Steps:
1. Go to Razorpay Dashboard
   → Settings → API Keys
2. Click "Regenerate Test/Live Key"
3. Download the new key pair
4. Update server/.env:
   RAZORPAY_KEY_ID=rzp_test_NEW-KEY
   RAZORPAY_KEY_SECRET=NEW-SECRET
5. Update frontend .env:
   VITE_RAZORPAY_KEY_ID=rzp_test_NEW-KEY
6. Restart server
7. Test a payment flow
8. Old keys stop working immediately

Warning: Any in-flight payments using old keys will fail. Notify users if needed.
Always rotate during low-traffic period.

---

### 4. After Any Key Rotation

Always do these steps after rotating:

□ Update .env files locally
□ Update environment variables on hosting platform (Vercel/Railway/etc)
□ Restart all server instances
□ Clear any cached tokens
□ Test critical user flows:
  - Login/signup
  - Station listing
  - Booking flow
  - Payment (if Razorpay rotated)
□ Monitor error logs for 30 mins
□ Update password manager/team vault

---

### 5. Security Checklist

□ .env files are in .gitignore
□ .env files NOT committed to git
□ Service key only in server, never frontend
□ Anon key is OK for frontend (by design)
□ Keys rotated every 90 days
□ Team access reviewed monthly
□ Supabase RLS policies enabled
□ Rate limiting enabled on API
□ Helmet.js security headers active

---

### 6. Emergency: Key Exposed in Public Repo

If a secret key was committed to git:

IMMEDIATE STEPS (do in under 5 minutes):
1. Rotate the key immediately (steps above)
2. New key is live before old one matters
3. Then clean git history:
   pip install git-filter-repo
   git filter-repo --path .env --invert-paths
   git push origin --force --all
4. GitHub will also scan and alert you
5. Check Supabase logs for unauthorized use
6. Check Razorpay logs for unauthorized charges
