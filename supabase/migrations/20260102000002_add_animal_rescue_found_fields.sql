-- Add found tracking fields to animal_rescues table
ALTER TABLE animal_rescues 
ADD COLUMN IF NOT EXISTS found_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS found_by_contact TEXT,
ADD COLUMN IF NOT EXISTS found_notes TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_animal_rescues_status ON animal_rescues(status);
CREATE INDEX IF NOT EXISTS idx_animal_rescues_found_at ON animal_rescues(found_at);

-- Add comments
COMMENT ON COLUMN animal_rescues.found_at IS 'Timestamp when the animal was rescued';
COMMENT ON COLUMN animal_rescues.found_by_contact IS 'Contact information of the rescuer';
COMMENT ON COLUMN animal_rescues.found_notes IS 'Additional notes about the rescue';
