-- Update camp_requests table to support new public form structure
-- This adds urgency_level and ensures proper handling of new fields

-- Add urgency_level column
ALTER TABLE camp_requests 
ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'medium' 
CHECK (urgency_level IN ('low', 'medium', 'high', 'critical'));

-- Add special_needs column for better data organization
ALTER TABLE camp_requests 
ADD COLUMN IF NOT EXISTS special_needs TEXT;

-- Add village_area column (previously stored in address)
ALTER TABLE camp_requests 
ADD COLUMN IF NOT EXISTS village_area TEXT;

-- Create index for urgency filtering
CREATE INDEX IF NOT EXISTS idx_camp_requests_urgency ON camp_requests(urgency_level);

-- Add comments for documentation
COMMENT ON COLUMN camp_requests.urgency_level IS 'Urgency: low (1-2 days), medium (24h), high (12h), critical (immediate)';
COMMENT ON COLUMN camp_requests.special_needs IS 'Special circumstances: children, elderly, disabled, injured, pregnant women, medical conditions';
COMMENT ON COLUMN camp_requests.village_area IS 'Village or area name where camp is needed';

-- Update existing records to have default urgency
UPDATE camp_requests 
SET urgency_level = 'medium' 
WHERE urgency_level IS NULL;
