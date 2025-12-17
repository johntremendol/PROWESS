-- PROWESS Authentication & Data Migration Script

-- 1. Schema Updates: Enable RLS and Link Members to Auth Users

-- Enable RLS on tables if not already enabled
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Add user_id and email columns to members table
-- This allows linking a member profile to an authenticated user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'user_id') THEN
        ALTER TABLE members ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'email') THEN
        ALTER TABLE members ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. RLS Policies

-- GROUPS: 
-- Users can see groups where they are a member (via the members table link)
CREATE POLICY "Users can view groups they belong to" 
ON groups FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.group_id = groups.id 
        AND members.user_id = auth.uid()
    )
);

-- Users can insert groups (initially they become the owner/creator via member creation)
-- For now, allow authenticated users to create groups. 
-- The logic in the app creates the group AND the member record.
CREATE POLICY "Users can create groups" 
ON groups FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- API needs to perform update? Assume yes if member.
CREATE POLICY "Users can update groups they belong to" 
ON groups FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.group_id = groups.id 
        AND members.user_id = auth.uid()
    )
);

-- Delete?
CREATE POLICY "Users can delete groups they belong to" 
ON groups FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.group_id = groups.id 
        AND members.user_id = auth.uid()
    )
);


-- MEMBERS:
-- Users can view members in groups they belong to OR their own member profile
CREATE POLICY "Users can view members of their groups" 
ON members FOR SELECT 
USING (
    -- Access own profile
    user_id = auth.uid()
    OR 
    -- Access members of shared groups
    EXISTS (
        SELECT 1 FROM members AS m2 
        WHERE m2.group_id = members.group_id 
        AND m2.user_id = auth.uid()
    )
);

-- Allow inserting members (adding people to groups)
CREATE POLICY "Users can add members to their groups" 
ON members FOR INSERT 
TO authenticated 
WITH CHECK (
    -- If adding self (creation flow)
    user_id = auth.uid()
    OR
    -- If adding others to a group I am in
    EXISTS (
        SELECT 1 FROM members AS m2 
        WHERE m2.group_id = members.group_id 
        AND m2.user_id = auth.uid()
    )
);

-- Allow updating members (e.g. linking a user_id)
CREATE POLICY "Users can update members in their groups" 
ON members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM members AS m2 
        WHERE m2.group_id = members.group_id 
        AND m2.user_id = auth.uid()
    )
);


-- EXPENSES:
-- Users can view expenses in groups they belong to
CREATE POLICY "Users can view expenses in their groups" 
ON expenses FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.group_id = expenses.group_id 
        AND members.user_id = auth.uid()
    )
);

-- Insert
CREATE POLICY "Users can add expenses to their groups" 
ON expenses FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.group_id = expenses.group_id 
        AND members.user_id = auth.uid()
    )
);

-- Update
CREATE POLICY "Users can update expenses in their groups" 
ON expenses FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.group_id = expenses.group_id 
        AND members.user_id = auth.uid()
    )
);

-- Delete
CREATE POLICY "Users can delete expenses in their groups" 
ON expenses FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM members 
        WHERE members.group_id = expenses.group_id 
        AND members.user_id = auth.uid()
    )
);


-- 3. MIGRATION LOGIC (Run this AFTER you have logged in via the App)
-- This assumes you are the FIRST user to run this and claims ALL existing 'orphan' data.

-- !!! REPLACE 'YOUR_USER_ID_HERE' WITH YOUR ACTUAL UUID FROM AUTH.USERS !!!
-- You get this UUID by looking at the URL in Supabase Auth or calling auth.uid() if running in context.
-- Since this is a manual run script payload, I will wrap it in a function you can call.

CREATE OR REPLACE FUNCTION migrate_prowess_data(target_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get UUID from email
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_email;
    END IF;

    -- Update all members named "John" (or similar/creator) to be this user?
    -- OR, simpler strategy for single-user dev to prod: 
    -- Find the 'creator' member in each group. 
    -- Heuristic: For now, claim ALL members named 'John' or 'Admin' OR just the first member created per group?
    
    -- Let's claim ALL members that match the name "John" (Case insensitive)
    -- AND update their user_id.
    
    UPDATE members 
    SET user_id = target_user_id, email = target_email
    WHERE user_id IS NULL 
    AND name ILIKE '%John%'; -- Customize this based on your actual local name used

    -- Alternatively, since this is a private app moving to auth, maybe we want to claim ALL orphan groups?
    -- But groups don't have user_id, members do.
    -- So we need to be a member of every group to see it.
    
    -- Safety Fallback: Ensure the user is added to ALL existing groups if they aren't already represented?
    -- This is tricky. Let's stick to claiming the named profile.
    
    RAISE NOTICE 'Migration completed for user %', target_email;
END $$;
