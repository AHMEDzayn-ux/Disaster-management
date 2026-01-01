-- Create camp_requests table for public camp registration requests
CREATE TABLE IF NOT EXISTS camp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT NOT NULL,
    reporter_email TEXT,
    location TEXT NOT NULL,
    district TEXT NOT NULL,
    approximate_people INTEGER NOT NULL,
    urgent_needs TEXT[] DEFAULT '{}',
    disaster_type TEXT NOT NULL,
    description TEXT NOT NULL,
    additional_info TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    camp_id UUID REFERENCES camps(id),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_camp_requests_status ON camp_requests(status);
CREATE INDEX idx_camp_requests_district ON camp_requests(district);
CREATE INDEX idx_camp_requests_requested_at ON camp_requests(requested_at DESC);

-- Enable RLS
ALTER TABLE camp_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for camp_requests
-- Anyone can insert a camp request (public can submit)
CREATE POLICY "Anyone can submit camp requests"
    ON camp_requests
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Everyone can read camp requests (for transparency)
CREATE POLICY "Anyone can view camp requests"
    ON camp_requests
    FOR SELECT
    TO public
    USING (true);

-- Only admins can update camp requests (for review/approval)
CREATE POLICY "Admins can update camp requests"
    ON camp_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_camp_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER camp_requests_updated_at_trigger
    BEFORE UPDATE ON camp_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_camp_requests_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON camp_requests TO anon;
GRANT ALL ON camp_requests TO authenticated;
