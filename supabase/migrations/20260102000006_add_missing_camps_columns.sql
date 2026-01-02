-- Add missing columns to camps table to match AdminRegisterCamp form
-- These columns are being set by the form but don't exist in the database yet

ALTER TABLE public.camps
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS latitude numeric(10, 8),
ADD COLUMN IF NOT EXISTS longitude numeric(11, 8),
ADD COLUMN IF NOT EXISTS managed_by text,
ADD COLUMN IF NOT EXISTS needs jsonb DEFAULT '[]'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN public.camps.district IS 'District where the camp is located (for easier querying and filtering)';
COMMENT ON COLUMN public.camps.address IS 'Full address of the camp (also stored in location jsonb for backward compatibility)';
COMMENT ON COLUMN public.camps.latitude IS 'Latitude coordinate (also stored in location jsonb for backward compatibility)';
COMMENT ON COLUMN public.camps.longitude IS 'Longitude coordinate (also stored in location jsonb for backward compatibility)';
COMMENT ON COLUMN public.camps.managed_by IS 'Name of the person managing/in-charge of the camp';
COMMENT ON COLUMN public.camps.needs IS 'Array of current needs/requirements of the camp (e.g., ["Food", "Water", "Medical"])';

-- Create index on district for faster filtering
CREATE INDEX IF NOT EXISTS idx_camps_district ON public.camps(district);

-- Create index on needs using GIN for array containment queries
CREATE INDEX IF NOT EXISTS idx_camps_needs ON public.camps USING GIN(needs);

-- Create index on latitude/longitude for geospatial queries (if needed in future)
CREATE INDEX IF NOT EXISTS idx_camps_location ON public.camps(latitude, longitude);
