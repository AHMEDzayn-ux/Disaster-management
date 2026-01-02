-- Ensure status column exists in missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Update any existing records without proper status
-- If found_at is NULL, they should be Active, otherwise Resolved
UPDATE missing_persons 
SET status = CASE 
    WHEN found_at IS NOT NULL THEN 'Resolved'
    ELSE 'Active'
END
WHERE status IS NULL OR status NOT IN ('Active', 'Resolved');

-- Add constraint to ensure valid status values
ALTER TABLE missing_persons 
DROP CONSTRAINT IF EXISTS missing_persons_status_check;

ALTER TABLE missing_persons 
ADD CONSTRAINT missing_persons_status_check 
CHECK (status IN ('Active', 'Resolved'));

-- Set default for new records
ALTER TABLE missing_persons 
ALTER COLUMN status SET DEFAULT 'Active';

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_missing_persons_status ON missing_persons(status);

-- Add comment
COMMENT ON COLUMN missing_persons.status IS 'Current status: Active (still missing) or Resolved (found)';
