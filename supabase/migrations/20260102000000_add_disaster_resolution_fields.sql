-- Migration: Add resolution tracking fields to disasters table
-- These columns track when and by whom a disaster was resolved

-- Add resolved_at timestamp to track when disaster was marked as resolved
ALTER TABLE disasters 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITHOUT TIME ZONE;

-- Add resolved_by to track who/which team resolved the disaster
ALTER TABLE disasters 
ADD COLUMN IF NOT EXISTS resolved_by TEXT;

-- Add responder_notes for additional resolution details
ALTER TABLE disasters 
ADD COLUMN IF NOT EXISTS responder_notes TEXT;

-- Create index for filtering resolved disasters
CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasters(status);
CREATE INDEX IF NOT EXISTS idx_disasters_resolved_at ON disasters(resolved_at) WHERE resolved_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN disasters.resolved_at IS 'Timestamp when the disaster was marked as resolved';
COMMENT ON COLUMN disasters.resolved_by IS 'Name of team/organization/person who resolved the disaster';
COMMENT ON COLUMN disasters.responder_notes IS 'Additional notes from responders about the resolution';
