-- Add missing fields to camps table to match camp_requests structure
-- This ensures approved camp requests can be fully migrated to camps table

-- Add ds_division column for administrative division tracking
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS ds_division TEXT;

-- Add nearby_landmark for better location identification
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS nearby_landmark TEXT;

-- Add village_area for detailed location information
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS village_area TEXT;

-- Add special_needs to track special circumstances
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS special_needs TEXT;

-- Add email for additional contact method
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add notes/additional information field
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add source tracking (whether from request or direct admin registration)
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'admin_direct' 
CHECK (source IN ('admin_direct', 'public_request'));

-- Add reference to original request if created from camp_request
ALTER TABLE camps 
ADD COLUMN IF NOT EXISTS source_request_id UUID 
REFERENCES camp_requests(id) ON DELETE SET NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_camps_ds_division ON camps(ds_division);
CREATE INDEX IF NOT EXISTS idx_camps_village_area ON camps(village_area);
CREATE INDEX IF NOT EXISTS idx_camps_source ON camps(source);

-- Add comments for documentation
COMMENT ON COLUMN camps.ds_division IS 'Divisional Secretariat Division for administrative tracking';
COMMENT ON COLUMN camps.nearby_landmark IS 'Nearby landmark for easier location identification';
COMMENT ON COLUMN camps.village_area IS 'Village or area name where camp is located';
COMMENT ON COLUMN camps.special_needs IS 'Special facilities/services: children, elderly, disabled, injured, pregnant women, medical';
COMMENT ON COLUMN camps.contact_email IS 'Email contact for camp coordinator';
COMMENT ON COLUMN camps.additional_notes IS 'Additional information about the camp';
COMMENT ON COLUMN camps.source IS 'How camp was registered: admin_direct or public_request';
COMMENT ON COLUMN camps.source_request_id IS 'Reference to original camp_request if applicable';
