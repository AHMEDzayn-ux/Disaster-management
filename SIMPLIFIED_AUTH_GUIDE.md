# Simplified Admin-Only Authentication

## Overview

The authentication system has been simplified to provide admin-only access. Public users can access all pages without authentication, while a single admin portal is protected behind a subtle login link.

## User Flow

### Public Users (No Authentication Required)

- Access homepage at `/` (RoleSelection)
- Navigate to Reporter Dashboard (`/report`)
- Navigate to Responder Dashboard (`/respond`)
- View all camps, reports, missing persons, etc.
- **No login/registration required**

### Admin Users (Authentication Required)

- Click "Admin Portal" link in top-right corner of homepage
- Login with admin credentials at `/admin/login`
- Access Admin Dashboard at `/admin`
- Manage camps (create, update, delete)
- Logout returns to homepage

## Authentication Setup

### 1. Supabase Configuration

```sql
-- Run in Supabase SQL Editor
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow users to view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);
```

### 2. Create Admin Account

```sql
-- In Supabase Auth > Users, create user:
-- Email: admin@disaster.lk
-- Password: admin123

-- Then insert profile:
INSERT INTO user_profiles (id, email, full_name, role)
VALUES (
    'YOUR_SUPABASE_USER_ID',
    'admin@disaster.lk',
    'System Admin',
    'admin'
);
```

### 3. Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## File Structure

### Auth Components

- `src/contexts/AuthContext.jsx` - Auth state management
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/pages/Login.jsx` - Admin login page
- `src/pages/AdminDashboard.jsx` - Admin control panel

### Key Features

#### AuthContext

- Provides authentication state across app
- Functions: `signIn()`, `signOut()`
- Hooks: `useAuth()` to access current user

#### ProtectedRoute

- Wraps `/admin` and `/camp-management` routes
- Redirects to `/admin/login` if not authenticated
- Checks for admin role

#### Login Page

- Simple email/password form
- Test button for quick admin login
- Redirects to `/admin` on success

#### Admin Dashboard

- Logout button in header
- Links to Register Camp and Manage Camps
- Simple, focused interface

## Routes

### Public Routes (No Auth)

```jsx
<Route index element={<RoleSelection />} />
<Route path="report" element={<ReportDashboard />} />
<Route path="respond" element={<RespondDashboard />} />
<Route path="camps" element={<Camps />} />
<Route path="camp/:id" element={<CampDetail />} />
<Route path="disasters" element={<DisasterReports />} />
<Route path="missing" element={<MissingPersons />} />
// ... all other pages
```

### Protected Routes (Admin Only)

```jsx
<Route path="admin/login" element={<Login />} />
<Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
<Route path="camp-management" element={<ProtectedRoute allowedRoles={['admin']}><CampManagement /></ProtectedRoute>} />
```

## Testing

### Local Development

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173`
3. Click "Admin Portal" in top-right
4. Login with `admin@disaster.lk` / `admin123`
5. Test camp management features
6. Logout and verify redirect to homepage

### Admin Credentials

- **Email:** admin@disaster.lk
- **Password:** admin123

## Security Notes

### Row Level Security (RLS)

- Users can only view/update their own profile
- Camp creation restricted to authenticated users
- Add more policies as needed:

```sql
-- Example: Only admins can create camps
CREATE POLICY "Admins can insert camps"
    ON camps FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### Production Checklist

- [ ] Change admin password from `admin123`
- [ ] Enable 2FA for admin account
- [ ] Set up RLS policies for all tables
- [ ] Configure Supabase email templates
- [ ] Add password reset functionality
- [ ] Monitor auth logs in Supabase dashboard

## Admin Portal Link

The admin link appears in the top-right corner of the homepage:

```jsx
// In RoleSelection.jsx
<Link
  to="/admin/login"
  className="fixed top-4 right-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
>
  Admin Portal →
</Link>
```

Styling: Subtle, small text that doesn't interfere with main UI but is accessible to administrators.

## Deployment

When deploying:

1. Ensure Supabase project is in production mode
2. Update environment variables in hosting platform
3. Create admin account in production Supabase
4. Test login flow before going live
5. Monitor authentication errors in Supabase logs

## Future Enhancements

If needed in future:

- Add more admin users (create manually in Supabase)
- Add password reset functionality
- Add email verification
- Add activity logging
- Add 2FA for enhanced security
