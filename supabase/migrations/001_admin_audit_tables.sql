-- =====================================================
-- ADMIN & AUDIT TABLES FOR SECURE DELETION
-- =====================================================
-- This migration creates:
-- 1. admin_users - Whitelist of authorized admin emails
-- 2. audit_logs - Complete audit trail for all deletions
-- =====================================================

-- =====================================================
-- 1. ADMIN USERS TABLE
-- =====================================================
-- Only users in this table can perform delete operations
-- This is verified SERVER-SIDE in the Edge Function

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- RLS for admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only super_admins can view/modify admin_users table
-- Regular authenticated users cannot see this table
CREATE POLICY "super_admin_full_access_admin_users"
ON admin_users FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.user_id = auth.uid() 
        AND au.role = 'super_admin'
        AND au.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.user_id = auth.uid() 
        AND au.role = 'super_admin'
        AND au.is_active = true
    )
);

-- =====================================================
-- 2. AUDIT LOGS TABLE
-- =====================================================
-- Immutable log of all sensitive operations
-- NO DELETE policy - logs are permanent

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who performed the action
    admin_id UUID NOT NULL,
    admin_email TEXT NOT NULL,
    
    -- What was done
    action TEXT NOT NULL CHECK (action IN ('DELETE', 'BULK_DELETE', 'RESTORE')),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    
    -- Snapshot of deleted data (for potential recovery)
    record_snapshot JSONB NOT NULL,
    
    -- Why (optional reason)
    reason TEXT,
    
    -- When
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Request metadata
    ip_address TEXT,
    user_agent TEXT
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON audit_logs(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);

-- RLS for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can only INSERT and SELECT audit logs (NO UPDATE, NO DELETE)
CREATE POLICY "admin_insert_audit_logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.user_id = auth.uid() 
        AND au.is_active = true
    )
);

CREATE POLICY "admin_read_audit_logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users au 
        WHERE au.user_id = auth.uid() 
        AND au.is_active = true
    )
);

-- NO UPDATE policy - audit logs are immutable
-- NO DELETE policy - audit logs are permanent

-- =====================================================
-- 3. HELPER FUNCTION: Check if user is admin
-- =====================================================
-- Used by Edge Functions to verify admin status

CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE user_id = check_user_id 
        AND is_active = true
    );
END;
$$;

-- =====================================================
-- 4. HELPER FUNCTION: Get admin role
-- =====================================================

CREATE OR REPLACE FUNCTION get_admin_role(check_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_role TEXT;
BEGIN
    SELECT role INTO admin_role
    FROM admin_users 
    WHERE user_id = check_user_id 
    AND is_active = true;
    
    RETURN admin_role;
END;
$$;

-- =====================================================
-- 5. INSERT INITIAL SUPER ADMIN
-- =====================================================
-- IMPORTANT: Replace with your actual admin email after running
-- You can also insert via Supabase Dashboard

-- Example (uncomment and modify):
-- INSERT INTO admin_users (email, role, is_active)
-- VALUES ('your-admin@email.com', 'super_admin', true);

-- =====================================================
-- 6. UPDATE TRIGGER for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION: Check tables were created
-- =====================================================
-- Run this to verify:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('admin_users', 'audit_logs');
