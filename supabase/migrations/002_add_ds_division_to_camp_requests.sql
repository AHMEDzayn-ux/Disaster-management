-- =====================================================
-- ADD DS_DIVISION COLUMN TO CAMP_REQUESTS TABLE
-- Migration to add ds_division column if it doesn't exist
-- =====================================================

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS camp_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Camp details
    camp_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    estimated_capacity INTEGER NOT NULL,
    
    -- Location details
    address TEXT NOT NULL,
    nearby_landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Facilities and reason
    facilities_needed TEXT[], -- Array of needed facilities
    reason TEXT NOT NULL,
    
    -- Requester info
    requester_name VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(20) NOT NULL,
    requester_email VARCHAR(255),
    additional_notes TEXT,
    
    -- Status management
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT
);

-- Add ds_division column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'camp_requests' 
        AND column_name = 'ds_division'
    ) THEN
        ALTER TABLE camp_requests 
        ADD COLUMN ds_division VARCHAR(100);
        
        RAISE NOTICE 'Added ds_division column to camp_requests table';
    ELSE
        RAISE NOTICE 'ds_division column already exists in camp_requests table';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_camp_requests_status ON camp_requests(status);
CREATE INDEX IF NOT EXISTS idx_camp_requests_created_at ON camp_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_camp_requests_district ON camp_requests(district);

-- Enable Row Level Security
ALTER TABLE camp_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit camp requests" ON camp_requests;
DROP POLICY IF EXISTS "Public can view pending requests" ON camp_requests;
DROP POLICY IF EXISTS "Admins have full access to camp_requests" ON camp_requests;

-- Recreate RLS Policies

-- Public can INSERT new camp requests (no auth required)
CREATE POLICY "Anyone can submit camp requests"
ON camp_requests FOR INSERT
TO public
WITH CHECK (true);

-- Public can READ their own pending requests
CREATE POLICY "Public can view pending requests"
ON camp_requests FOR SELECT
TO public
USING (true);

-- Authenticated admins can do everything
CREATE POLICY "Admins have full access to camp_requests"
ON camp_requests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_camp_requests_updated_at ON camp_requests;
CREATE TRIGGER update_camp_requests_updated_at
    BEFORE UPDATE ON camp_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT ON camp_requests TO anon;
GRANT ALL ON camp_requests TO authenticated;

COMMENT ON COLUMN camp_requests.ds_division IS 'Divisional Secretariat Division / Administrative area within the district';
