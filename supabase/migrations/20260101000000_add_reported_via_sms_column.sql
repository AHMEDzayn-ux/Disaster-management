-- Migration: Add reported_via_sms column to report tables
-- This column tracks reports submitted via the SMS gateway

-- Add reported_via_sms to disasters table
ALTER TABLE disasters 
ADD COLUMN IF NOT EXISTS reported_via_sms BOOLEAN DEFAULT FALSE;

-- Add reported_via_sms to missing_persons table
ALTER TABLE missing_persons 
ADD COLUMN IF NOT EXISTS reported_via_sms BOOLEAN DEFAULT FALSE;

-- Add reported_via_sms to animal_rescues table
ALTER TABLE animal_rescues 
ADD COLUMN IF NOT EXISTS reported_via_sms BOOLEAN DEFAULT FALSE;

-- Add sender_phone column to track SMS sender (useful for confirmation SMS)
ALTER TABLE disasters 
ADD COLUMN IF NOT EXISTS sms_sender_phone TEXT;

ALTER TABLE missing_persons 
ADD COLUMN IF NOT EXISTS sms_sender_phone TEXT;

ALTER TABLE animal_rescues 
ADD COLUMN IF NOT EXISTS sms_sender_phone TEXT;

-- Create index for filtering SMS reports
CREATE INDEX IF NOT EXISTS idx_disasters_reported_via_sms ON disasters(reported_via_sms) WHERE reported_via_sms = TRUE;
CREATE INDEX IF NOT EXISTS idx_missing_persons_reported_via_sms ON missing_persons(reported_via_sms) WHERE reported_via_sms = TRUE;
CREATE INDEX IF NOT EXISTS idx_animal_rescues_reported_via_sms ON animal_rescues(reported_via_sms) WHERE reported_via_sms = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN disasters.reported_via_sms IS 'True if this report was submitted via SMS gateway';
COMMENT ON COLUMN missing_persons.reported_via_sms IS 'True if this report was submitted via SMS gateway';
COMMENT ON COLUMN animal_rescues.reported_via_sms IS 'True if this report was submitted via SMS gateway';
COMMENT ON COLUMN disasters.sms_sender_phone IS 'Phone number of SMS sender for confirmation messages';
COMMENT ON COLUMN missing_persons.sms_sender_phone IS 'Phone number of SMS sender for confirmation messages';
COMMENT ON COLUMN animal_rescues.sms_sender_phone IS 'Phone number of SMS sender for confirmation messages';
