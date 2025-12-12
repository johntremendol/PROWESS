-- Add split_between column to expenses table to support subset splitting
-- This column stores a JSON array of member IDs who share the expense.

ALTER TABLE expenses 
ADD COLUMN split_between JSONB;

-- Example of what the data will look like:
-- split_between: ["member_id_1", "member_id_2"]
