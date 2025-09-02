/*
# [Schema Upgrade] Add User Authentication and RLS (Corrected)
This migration adds user authentication capabilities to the `signals` table. It links signals to users and secures the data using Row Level Security (RLS). This script corrects a syntax error in the previous migration attempt.

## Query Description:
This script performs the following actions:
1.  **Adds `user_id` column**: A new column `user_id` is added to the `signals` table to associate each signal with a user.
2.  **Adds Foreign Key**: A foreign key constraint is created, linking `signals.user_id` to `auth.users.id`. This ensures data integrity.
3.  **Removes Old Policy**: The previous permissive policy ("Enable all access for all users") is dropped using the correct syntax.
4.  **Adds New RLS Policies**: New policies are created to ensure that users can only interact with their own signals (SELECT, INSERT, UPDATE, DELETE).

**Safety Note:** This migration alters table structure and security policies. It is not reversible without a manual script. No data will be lost, but existing signals will not be associated with any user (`user_id` will be NULL).

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: false

## Structure Details:
- **Table Modified**: `public.signals`
  - **Column Added**: `user_id` (UUID)
  - **Constraint Added**: Foreign key on `user_id` referencing `auth.users(id)`.
  - **RLS Policies Dropped**: "Enable all access for all users"
  - **RLS Policies Added**:
    - "Users can view their own signals." (SELECT)
    - "Users can insert their own signals." (INSERT)
    - "Users can update their own signals." (UPDATE)
    - "Users can delete their own signals." (DELETE)

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes. Policies are changed from public access to user-specific access.
- Auth Requirements: All API requests to the `signals` table will now require a valid user JWT.

## Performance Impact:
- Indexes: A foreign key index will be automatically created on the `user_id` column, which is beneficial for query performance when filtering signals by user.
- Estimated Impact: Low.
*/

-- 1. Add user_id column to signals table if it doesn't exist
ALTER TABLE public.signals
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Drop the old permissive policy (CORRECTED SYNTAX)
DROP POLICY IF EXISTS "Enable all access for all users" ON public.signals;

-- 3. Create new RLS policies for user-specific access

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own signals." ON public.signals;
DROP POLICY IF EXISTS "Users can insert their own signals." ON public.signals;
DROP POLICY IF EXISTS "Users can update their own signals." ON public.signals;
DROP POLICY IF EXISTS "Users can delete their own signals." ON public.signals;

-- Users can view their own signals
CREATE POLICY "Users can view their own signals."
ON public.signals FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own signals
CREATE POLICY "Users can insert their own signals."
ON public.signals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own signals
CREATE POLICY "Users can update their own signals."
ON public.signals FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own signals
CREATE POLICY "Users can delete their own signals."
ON public.signals FOR DELETE
USING (auth.uid() = user_id);
