-- 1. DROP ALL DEPENDENT POLICIES FIRST

-- Groups
DROP POLICY IF EXISTS "groups_select_policy" ON groups;
DROP POLICY IF EXISTS "groups_update_policy" ON groups;
DROP POLICY IF EXISTS "groups_delete_policy" ON groups;
DROP POLICY IF EXISTS "groups_insert_policy" ON groups;
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can update groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can delete groups they belong to" ON groups;

-- Members
DROP POLICY IF EXISTS "members_select_policy" ON members;
DROP POLICY IF EXISTS "members_update_policy" ON members;
DROP POLICY IF EXISTS "members_delete_policy" ON members;
DROP POLICY IF EXISTS "members_insert_policy" ON members;
DROP POLICY IF EXISTS "Users can view members" ON members;
DROP POLICY IF EXISTS "Users can add members" ON members;

-- Expenses
DROP POLICY IF EXISTS "expenses_select_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_update_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_delete_policy" ON expenses;


-- 2. NOW DROP THE FUNCTION
DROP FUNCTION IF EXISTS public.is_member_of(uuid);


-- 3. RE-CREATE FUNCTION
CREATE OR REPLACE FUNCTION public.is_member_of(_group_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.members
    WHERE group_id = _group_id
    AND user_id = (select auth.uid())
  );
END;
$$;


-- 4. RE-CREATE POLICIES

-- Groups
CREATE POLICY "groups_select_policy" ON groups FOR SELECT TO authenticated
USING (
  created_by = auth.uid() OR
  is_member_of(id)
);

CREATE POLICY "groups_insert_policy" ON groups FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "groups_update_policy" ON groups FOR UPDATE TO authenticated
USING (
  created_by = auth.uid() OR
  is_member_of(id)
) WITH CHECK (true);

CREATE POLICY "groups_delete_policy" ON groups FOR DELETE TO authenticated
USING (
  created_by = auth.uid() OR
  is_member_of(id)
);

-- Members
CREATE POLICY "members_select_policy" ON members FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  is_member_of(group_id)
);

CREATE POLICY "members_insert_policy" ON members FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "members_update_policy" ON members FOR UPDATE TO authenticated
USING (
  user_id = auth.uid() OR
  is_member_of(group_id)
) WITH CHECK (true);

CREATE POLICY "members_delete_policy" ON members FOR DELETE TO authenticated
USING (
  user_id = auth.uid() OR
  is_member_of(group_id)
);

-- Expenses
CREATE POLICY "expenses_select_policy" ON expenses FOR SELECT TO authenticated
USING (
  is_member_of(group_id)
);

CREATE POLICY "expenses_insert_policy" ON expenses FOR INSERT TO authenticated
WITH CHECK (
  is_member_of(group_id)
);

CREATE POLICY "expenses_update_policy" ON expenses FOR UPDATE TO authenticated
USING (
  is_member_of(group_id)
) WITH CHECK (true);

CREATE POLICY "expenses_delete_policy" ON expenses FOR DELETE TO authenticated
USING (
  is_member_of(group_id)
);
