-- Ensure status column exists in animal_rescues table
ALTER TABLE animal_rescues 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Update any existing records without proper status
-- If found_at is NULL, they should be Active, otherwise Resolved
UPDATE animal_rescues 
SET status = CASE 
    WHEN found_at IS NOT NULL THEN 'Resolved'
    ELSE 'Active'
END
WHERE status IS NULL OR status NOT IN ('Active', 'Resolved');

-- Add constraint to ensure valid status values
ALTER TABLE animal_rescues 
DROP CONSTRAINT IF EXISTS animal_rescues_status_check;

ALTER TABLE animal_rescues 
ADD CONSTRAINT animal_rescues_status_check 
CHECK (status IN ('Active', 'Resolved'));

-- Set default for new records
ALTER TABLE animal_rescues 
ALTER COLUMN status SET DEFAULT 'Active';

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_animal_rescues_status ON animal_rescues(status);

-- Add comment
COMMENT ON COLUMN animal_rescues.status IS 'Current status of the rescue: Active (needs rescue) or Resolved (rescued)';
