-- Add found tracking fields to missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN IF NOT EXISTS found_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS found_by_contact TEXT,
ADD COLUMN IF NOT EXISTS found_notes TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_missing_persons_status ON missing_persons(status);
CREATE INDEX IF NOT EXISTS idx_missing_persons_found_at ON missing_persons(found_at);

-- Add comments
COMMENT ON COLUMN missing_persons.found_at IS 'Timestamp when the person was marked as found';
COMMENT ON COLUMN missing_persons.found_by_contact IS 'Contact information of the person who found them';
COMMENT ON COLUMN missing_persons.found_notes IS 'Additional notes about finding the person';
