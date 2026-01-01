# 🔐 Supabase Authentication Setup Guide

## Step 1: Create Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'public' CHECK (role IN ('public', 'responder', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()));

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON public.user_profiles
FOR SELECT
USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy: Allow inserts for new users (signup)
CREATE POLICY "Allow profile creation"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

## Step 2: Create Test Users

Run this SQL to create test accounts:

```sql
-- Insert test user profiles (after creating auth users via Supabase Dashboard or API)
-- You'll need to create these users in Supabase Auth first, then insert profiles

-- Example profile inserts (replace UUIDs with actual auth.users IDs):
INSERT INTO public.user_profiles (id, email, full_name, phone, role) VALUES
('ADMIN_USER_UUID', 'admin@disaster.lk', 'Admin User', '0771111111', 'admin'),
('RESPONDER_USER_UUID', 'responder@disaster.lk', 'Responder User', '0772222222', 'responder'),
('PUBLIC_USER_UUID', 'public@disaster.lk', 'Public User', '0773333333', 'public');
```

## Step 3: Create Auth Users via Supabase Dashboard

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click **"Add User"**
3. Create these test accounts:

### Admin Account

- Email: `admin@disaster.lk`
- Password: `admin123`
- Auto Confirm: **Yes**

### Responder Account

- Email: `responder@disaster.lk`
- Password: `responder123`
- Auto Confirm: **Yes**

### Public Account

- Email: `public@disaster.lk`
- Password: `public123`
- Auto Confirm: **Yes**

4. After creating each user, note their **UUID** from the users table
5. Update the INSERT statement above with the correct UUIDs

## Step 4: Add RLS Policies to Existing Tables

Apply these policies to your existing tables for role-based access:

```sql
-- Camps table: Only responders and admins can create
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view camps"
ON public.camps
FOR SELECT
USING (true);

CREATE POLICY "Responders can create camps"
ON public.camps
FOR INSERT
WITH CHECK (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('responder', 'admin')
);

CREATE POLICY "Responders can update camps"
ON public.camps
FOR UPDATE
USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('responder', 'admin')
);

-- Missing persons: Anyone can create (public reporting)
ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view missing persons"
ON public.missing_persons
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create reports"
ON public.missing_persons
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responders can update missing persons"
ON public.missing_persons
FOR UPDATE
USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('responder', 'admin')
);

-- Disaster reports: Anyone can create
ALTER TABLE public.disaster_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view disaster reports"
ON public.disaster_reports
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create disaster reports"
ON public.disaster_reports
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Responders can update disaster reports"
ON public.disaster_reports
FOR UPDATE
USING (
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('responder', 'admin')
);
```

## Step 5: Enable Email Auth in Supabase

1. Go to **Authentication > Providers** in Supabase Dashboard
2. Enable **Email** provider
3. Configure email templates (optional)
4. For testing, disable **Email Confirmations** temporarily

## Architecture Summary

### Roles:

- **👤 public**: Can report disasters and missing persons
- **🤝 responder**: Can manage camps, update all reports, coordinate rescue
- **👑 admin**: Full access including user role management

### Access Control:

- **Public Pages**: No auth required (home, disaster reports list, missing persons list)
- **Reporter Pages**: Requires authentication (create reports)
- **Responder Pages**: Requires 'responder' or 'admin' role (camp management)
- **Admin Pages**: Requires 'admin' role (user management)

### Security:

- Row Level Security (RLS) enforces permissions at database level
- Client-side route guards prevent unauthorized access
- Roles stored in `user_profiles` table
- Supabase Auth handles token management

## Test Credentials

After setup, use these to test:

| Role      | Email                 | Password     |
| --------- | --------------------- | ------------ |
| Admin     | admin@disaster.lk     | admin123     |
| Responder | responder@disaster.lk | responder123 |
| Public    | public@disaster.lk    | public123    |

## Next Steps

1. Update your App.jsx to wrap routes with ProtectedRoute
2. Add role checks to camp creation forms
3. Show/hide UI elements based on user role
4. Test all permission scenarios
