# 📋 Camp Request System - Complete Setup Guide

## Overview

This guide will help you set up the camp request and approval system in Supabase, allowing:

- **Public users** to submit camp requests
- **Admin users** to review, approve, or reject requests
- **Automatic camp creation** from approved requests

---

## 🗄️ Step 1: Set Up Database Tables

### A. Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project: `imwsvbyqivsfyomrkppa`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **+ New Query**

### B. Run Camp Requests Table Setup

Copy and paste the entire contents of `camp-requests-setup.sql` into the SQL Editor and click **RUN**.

This creates:

- ✅ `camp_requests` table with all required fields
- ✅ Indexes for performance (status, district, date)
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp triggers

**Expected result:** You should see "Success. No rows returned" (this is normal for CREATE statements)

### C. Verify Tables Exist

1. Go to **Table Editor** in the left sidebar
2. You should see both tables:
   - `camps` (should already exist)
   - `camp_requests` (newly created)

---

## 🔐 Step 2: Verify Admin User Setup

### Your existing user_profiles table structure:

```sql
-- You already have this table with:
-- id (references auth.users)
-- email, full_name, phone
-- role (default 'admin')
```

### Check if you have an admin user:

Go to **SQL Editor** and run:

```sql
SELECT
    up.id,
    up.email,
    up.full_name,
    up.role
FROM user_profiles up
WHERE up.role = 'admin';
```

### If NO admin users exist, add one:

**Option A: Promote existing user to admin**

```sql
-- Check existing users
SELECT id, email, full_name FROM user_profiles;

-- Promote a user to admin
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**Option B: Create new admin user**

1. Go to **Authentication** → **Users** → **Add User**
2. Email: `admin@disaster.lk`
3. Password: `Admin@123456`
4. Auto Confirm User: ✅ Enable
5. Click **Create User**
6. The user_profiles table should auto-populate (if you have a trigger)
7. If not, run:

```sql
-- Get the new user's ID
SELECT id, email FROM auth.users WHERE email = 'admin@disaster.lk';

-- Insert into user_profiles (replace 'user-id-here')
INSERT INTO user_profiles (id, email, full_name, role)
VALUES ('user-id-here', 'admin@disaster.lk', 'System Administrator', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## 🧪 Step 3: Test the Complete Workflow

### 1️⃣ **Public Submits Camp Request**

1. Open your app: `http://localhost:5174`
2. Click **"Report Disaster"** or go to `/request-camp`
3. Fill out the form:
   - Reporter Name: `John Doe`
   - Phone: `0771234567`
   - Location: `Colombo Fort, Near Railway Station`
   - District: `Colombo`
   - Approximate People: `150`
   - Urgent Needs: Check `Shelter`, `Food & Water`, `Medical Services`
   - Disaster Type: `Flood`
   - Description: `Heavy flooding in the area, many families displaced`
4. Click **Submit**

**Expected:** ✅ Success message, request saved to database

### 2️⃣ **Verify Request in Database**

Go to **Supabase Table Editor** → `camp_requests`:

- You should see your new request with `status = pending`

### 3️⃣ **Admin Login**

1. In your app, look for **"Admin Portal"** link (top-right corner of home page)
2. Or navigate to: `/login`
3. Login with admin credentials:
   - Email: `admin@disaster.lk` (or your admin email)
   - Password: Your admin password

**Expected:** ✅ Redirect to Admin Dashboard (`/admin`)

### 4️⃣ **Review Camp Request**

1. On Admin Dashboard, click **"Review Camp Requests"** card
2. Or navigate to: `/camp-requests-review`

**You should see:**

- 📋 List of pending requests
- Request details (location, district, people affected, needs)
- Reporter contact information
- Two buttons: **"Approve & Create Camp"** and **"Reject"**

### 5️⃣ **Approve Request & Create Camp**

1. Click **"✅ Approve & Create Camp"** button
2. You'll be redirected to `/camp-management` with pre-filled data:

   - Camp Name: `[District] Relief Camp - [Location]`
   - District: Pre-filled from request
   - Capacity: Pre-filled from request
   - Needs: Pre-filled from request
   - Contact Person: Reporter's info
   - Notes: Shows request origin

3. **Complete the form** (add any additional details):

   - Camp Type: `Relief Camp`
   - Current Occupancy: `0`
   - Contact Person Role: Edit if needed
   - Facilities: Add checkboxes
   - Supplies: Update quantities
   - Photos: Add URLs if available
   - Opened Date: Set date

4. Click **"Register Camp"**

**Expected:**

- ✅ Camp created in `camps` table
- ✅ Request status updated to `approved`
- ✅ Request linked to camp via `camp_id`
- ✅ Redirect to `/camps` page
- ✅ New camp visible in the camps list

### 6️⃣ **Test Rejection (Optional)**

1. Submit another camp request (step 1)
2. Go to Admin → Review Camp Requests
3. Click **"❌ Reject"** button
4. Enter rejection reason: `Duplicate request for same location`
5. Click **"Confirm Rejection"**

**Expected:**

- ✅ Request status updated to `rejected`
- ✅ Rejection reason saved
- ✅ Request removed from pending list

---

## 🔍 Step 4: Verify Database Changes

### Check camp_requests table:

```sql
SELECT
    id,
    reporter_name,
    location,
    status,
    camp_id,
    requested_at,
    reviewed_at
FROM camp_requests
ORDER BY requested_at DESC;
```

**You should see:**

- Approved requests with `camp_id` populated
- Rejected requests with `status = rejected`

### Check camps table:

```sql
SELECT
    id,
    camp_name,
    district,
    capacity,
    status,
    verified,
    created_from_request
FROM camps
ORDER BY created_at DESC;
```

**You should see:**

- New camp with `verified = true`
- `created_from_request` matches the request ID

---

## 🎯 Step 5: Test Real-time Updates

### Test real-time functionality:

1. **Open two browser windows:**

   - Window 1: Camp requests review page (admin) - `/camp-requests-review`
   - Window 2: Public request form - `/request-camp`

2. **In Window 2:** Submit a new camp request

3. **In Window 1:** Watch the review page

   - **Expected:** ✅ New request appears instantly without refresh!

4. **Test camp list updates:**
   - Window 1: Open `/camps` page
   - Window 2: Admin approves a request and creates camp
   - **Expected:** ✅ New camp appears on Window 1 instantly!

---

## 📊 Understanding the Database Structure

### `camp_requests` table fields:

| Field                | Type        | Purpose                              |
| -------------------- | ----------- | ------------------------------------ |
| `id`                 | BIGSERIAL   | Auto-generated unique ID             |
| `reporter_name`      | TEXT        | Person submitting request            |
| `reporter_phone`     | TEXT        | Contact number                       |
| `reporter_email`     | TEXT        | Email (optional)                     |
| `location`           | TEXT        | Specific location description        |
| `district`           | TEXT        | Sri Lankan district                  |
| `approximate_people` | INTEGER     | Number of people affected            |
| `urgent_needs`       | TEXT[]      | Array of needs (shelter, food, etc.) |
| `disaster_type`      | TEXT        | flood, earthquake, landslide, etc.   |
| `description`        | TEXT        | Situation description                |
| `additional_info`    | TEXT        | Extra details (optional)             |
| `status`             | TEXT        | pending / approved / rejected        |
| `requested_at`       | TIMESTAMPTZ | Submission timestamp                 |
| `reviewed_at`        | TIMESTAMPTZ | Review timestamp                     |
| `reviewed_by`        | UUID        | Admin user who reviewed              |
| `camp_id`            | BIGINT      | Links to created camp (if approved)  |
| `rejection_reason`   | TEXT        | Reason if rejected                   |

### Row Level Security (RLS) Policies:

✅ **INSERT**: Anyone (public can submit requests)
✅ **SELECT**: Anyone (transparency - all can view)
✅ **UPDATE**: Admins only (for approval/rejection)

---

## 🚨 Troubleshooting

### Problem: "No admin user found" error

**Solution:**

```sql
-- Check if you have admin users
SELECT id, email, role FROM user_profiles WHERE role = 'admin';

-- If none, promote an existing user
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, role FROM user_profiles WHERE role = 'admin';
```

### Problem: "Permission denied for table camp_requests"

**Solution:** RLS policies not set up correctly

```sql
-- Ensure RLS is enabled
ALTER TABLE camp_requests ENABLE ROW LEVEL SECURITY;

-- Re-run the policies from camp-requests-setup.sql
```

### Problem: Camp requests not appearing in review page

**Check:**

1. Open browser console (F12)
2. Check for errors
3. Verify in Supabase Table Editor that requests exist
4. Check status is `pending`

**Debug query:**

```sql
SELECT * FROM camp_requests WHERE status = 'pending';
```

### Problem: Real-time updates not working

**Solution:**

1. Check Supabase project settings → API → Realtime is enabled
2. Verify your app is subscribed:
   - Check browser console for subscription messages
   - Should see: "Subscribed to camp_requests_changes"

---

## ✅ Verification Checklist

- [ ] `camp_requests` table created in Supabase
- [ ] Indexes created (check Table Editor → Indexes tab)
- [ ] RLS policies enabled (check Table Editor → Policies tab)
- [ ] Admin user exists with `role = 'admin'` in user_profiles
- [ ] Can submit camp request from public form
- [ ] Request appears in database with `status = pending`
- [ ] Can login as admin
- [ ] Can see pending requests in admin review page
- [ ] Can approve request → redirects to camp form
- [ ] Can create camp from approved request
- [ ] Camp appears in camps list
- [ ] Request status updates to `approved` in database
- [ ] Request `camp_id` links to created camp
- [ ] Can reject request with reason
- [ ] Real-time updates work (new requests appear without refresh)

---

## 🎓 Admin Portal Features

### Available at `/admin` (Admin Dashboard):

1. **Register New Camp** → `/camp-management`

   - Direct camp registration by authorities
   - Full control over all camp details

2. **Review Camp Requests** → `/camp-requests-review`

   - See all public requests
   - Approve or reject with reasons
   - Pre-fill camp form from approved requests

3. **Manage Existing Camps** → `/camps` (coming soon)
   - Update camp details
   - Close camps
   - Update supplies and occupancy

### Admin Workflow:

```
Public Request → Pending Queue → Admin Review
                                     ↓
                          ┌──────────┴──────────┐
                      APPROVE                REJECT
                          ↓                     ↓
                  Pre-fill Camp Form    Save Rejection Reason
                          ↓                     ↓
                  Create Camp          Notify Requester
                          ↓
                  Link Request to Camp
```

---

## 📝 Next Steps

After completing setup:

1. **Test the full workflow** (Steps 3-5 above)
2. **Create backup admin accounts** (in case of password issues)
3. **Document your admin credentials** securely
4. **Test on your hosted deployment** (not just localhost)
5. **Consider adding email notifications** (future enhancement)

---

## 💡 Tips

- **Admin Password Reset:** Go to Supabase → Authentication → Users → Click user → Reset Password
- **View Logs:** Supabase → Logs → Real-time logs to debug issues
- **Test Data:** Use the bulk test data feature to create sample requests
- **Production:** Change admin password before deploying!

---

**Need Help?** Check the browser console (F12) for error messages, or inspect the Supabase logs.
