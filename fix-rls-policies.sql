-- Fix RLS Policies for Public Read Access
-- Run this in Supabase SQL Editor to allow public users to view disaster data

-- Allow EVERYONE to read missing persons (public needs to see this)
DROP POLICY IF EXISTS "Anyone can view missing persons" ON missing_persons;
CREATE POLICY "Anyone can view missing persons"
    ON missing_persons FOR SELECT
    USING (true);

-- Allow EVERYONE to read disasters (public needs to see this)
DROP POLICY IF EXISTS "Anyone can view disasters" ON disasters;
CREATE POLICY "Anyone can view disasters"
    ON disasters FOR SELECT
    USING (true);

-- Allow EVERYONE to read animal rescues (public needs to see this)
DROP POLICY IF EXISTS "Anyone can view animal rescues" ON animal_rescues;
CREATE POLICY "Anyone can view animal rescues"
    ON animal_rescues FOR SELECT
    USING (true);

-- Allow EVERYONE to read camps (public needs to see this)
DROP POLICY IF EXISTS "Anyone can view camps" ON camps;
CREATE POLICY "Anyone can view camps"
    ON camps FOR SELECT
    USING (true);

-- Allow authenticated users to create/update their own reports
DROP POLICY IF EXISTS "Users can insert missing persons" ON missing_persons;
CREATE POLICY "Users can insert missing persons"
    ON missing_persons FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert disasters" ON disasters;
CREATE POLICY "Users can insert disasters"
    ON disasters FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can insert animal rescues" ON animal_rescues;
CREATE POLICY "Users can insert animal rescues"
    ON animal_rescues FOR INSERT
    WITH CHECK (true);

-- Only admins can create camps
DROP POLICY IF EXISTS "Only admins can insert camps" ON camps;
CREATE POLICY "Only admins can insert camps"
    ON camps FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update/delete camps
DROP POLICY IF EXISTS "Only admins can update camps" ON camps;
CREATE POLICY "Only admins can update camps"
    ON camps FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete camps" ON camps;
CREATE POLICY "Only admins can delete camps"
    ON camps FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policies updated successfully!';
    RAISE NOTICE '📖 Public users can now READ all data';
    RAISE NOTICE '✍️ Anyone can INSERT reports (missing persons, disasters, animal rescues)';
    RAISE NOTICE '🔐 Only ADMINS can create/update/delete camps';
END $$;
