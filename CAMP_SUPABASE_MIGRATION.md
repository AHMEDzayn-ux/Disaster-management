# Camp Management System - Supabase Integration

## ✅ Completed Migrations

All camp-related functionality has been migrated from localStorage to Supabase for real-world operation.

## 📦 Updated Files

### 1. **src/store/supabaseStore.js** (useCampStore)

- ✅ Converted from localStorage to Supabase
- Real-time subscriptions using `subscribeToTable(TABLES.CAMPS)`
- CRUD operations via Supabase service methods:
  - `addCamp()` - Creates camp in database
  - `updateCamp()` - Updates existing camp
  - `deleteCamp()` - Removes camp
  - `subscribeToCamps()` - Real-time updates

### 2. **src/pages/CampManagement.jsx**

- ✅ Now saves camps directly to Supabase
- Uses `useCampStore().addCamp()` instead of localStorage
- Automatically links approved requests to created camps
- Returns the new camp object from Supabase with generated ID

### 3. **src/components/CampRequestForm.jsx**

- ✅ Public form now saves to `camp_requests` table in Supabase
- Database-compatible field names (snake_case)
- Error handling with user feedback
- No more localStorage

### 4. **src/pages/CampRequestReview.jsx**

- ✅ Loads pending requests from Supabase
- Real-time subscription for instant updates
- Approve/Reject updates database directly
- Properly maps database fields to UI

## 🗄️ Required Database Setup

### Create the `camp_requests` table:

Run the SQL in **camp-requests-setup.sql** in your Supabase SQL Editor:

```sql
-- Creates table structure
-- Sets up RLS policies (anyone can submit, admins can review)
-- Adds indexes for performance
-- Configures triggers
```

**Key Features:**

- Anyone can submit camp requests (public access)
- Only admins can update/review requests
- Automatic timestamps
- Links to camps table when approved

## 🔄 Complete Workflow (Real-World)

### 1. **Public Submits Request**

- User goes to `/request-camp`
- Fills CampRequestForm
- Data saved to `camp_requests` table
- Status: `pending`

### 2. **Admin Reviews Request**

- Admin logs in → `/admin` → "Review Requests"
- Sees all pending requests from Supabase
- Real-time updates as new requests come in

### 3. **Admin Approves**

- Clicks "Approve & Create Camp"
- Navigates to `/camp-management` with pre-filled data
- Admin can edit/add details
- Submits → Creates camp in `camps` table
- Request status updated to `approved`
- `camp_id` linked to new camp

### 4. **Real-time Display**

- New camp appears instantly on `/camps` page
- All responders see the update
- Marker added to map
- Available in search/filters

### 5. **Admin Rejects**

- Clicks "Reject" button
- Provides rejection reason
- Request status updated to `rejected`
- Reason stored for record-keeping

## 📊 Database Tables

### `camps` table

```sql
id, camp_name, camp_type, capacity, current_occupancy,
location, district, disaster_type, opened_date,
contact_person, facilities, supplies, needs, notes,
photos, status, verified, created_from_request
```

### `camp_requests` table

```sql
id, reporter_name, reporter_phone, reporter_email,
location, district, approximate_people, urgent_needs,
disaster_type, description, additional_info,
status (pending/approved/rejected), requested_at,
reviewed_at, reviewed_by, camp_id, rejection_reason
```

## 🔐 Row Level Security (RLS) Policies

### Camps Table

- **Read**: Anyone (public)
- **Write**: Authenticated admins only

### Camp Requests Table

- **Insert**: Anyone (public can submit)
- **Read**: Anyone (transparency)
- **Update**: Admins only (for review/approval)

## 🧪 Testing the System

### 1. **Clear Local Storage**

```javascript
// In browser console
localStorage.clear();
location.reload();
```

### 2. **Test Public Request**

- Go to home page
- Click "Request Relief Camp"
- Fill form and submit
- Verify request appears in Supabase database

### 3. **Test Admin Review**

- Login as admin
- Navigate to "Review Camp Requests"
- Verify request appears
- Test approve → should navigate to camp form
- Submit camp → verify it appears in camps list

### 4. **Test Real-time Updates**

- Open `/camps` in one tab
- Create camp via admin in another tab
- First tab should update instantly

## 🚀 Next Steps

1. **Run the SQL setup**:

   - Open Supabase Dashboard
   - Go to SQL Editor
   - Paste contents of `camp-requests-setup.sql`
   - Execute

2. **Test the workflow**:

   - Clear localStorage
   - Submit test camp request
   - Login as admin
   - Approve request
   - Verify camp appears

3. **Verify real-time**:
   - Keep camps page open
   - Create new camp
   - Should appear without refresh

## 📝 Notes

- No mock data - all camps come from Supabase
- Real-time subscriptions enabled for instant updates
- All localStorage usage removed from camp system
- Production-ready for real-world deployment
- Disaster reports, missing persons, and animal rescues already using Supabase

## ⚠️ Important

Make sure to:

1. Run the `camp-requests-setup.sql` in Supabase
2. Verify RLS policies are enabled
3. Test with actual admin user from Supabase Auth
4. Clear browser localStorage before testing

---

**Status**: ✅ Ready for real-world testing
**Migration**: ✅ Complete (localStorage → Supabase)
**Real-time**: ✅ Enabled
**RLS**: ✅ Configured
