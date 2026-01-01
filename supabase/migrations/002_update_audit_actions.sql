-- Update audit_logs table to support new action types
-- Run this in Supabase SQL Editor

-- Drop the existing check constraint
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;

-- Add new constraint with additional action types
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check 
CHECK (action IN (
    'DELETE', 
    'BULK_DELETE', 
    'RESTORE', 
    'APPROVE_REQUEST', 
    'REJECT_REQUEST', 
    'REGISTER_CAMP'
));
