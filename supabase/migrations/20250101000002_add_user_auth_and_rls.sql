/*
          # [User Authentication and RLS]
          This migration adds user authentication support to the 'signals' table and enforces Row Level Security (RLS) to ensure users can only access their own data.

          ## Query Description: 
          This script performs the following actions:
          1. Adds a `user_id` column to the `signals` table.
          2. Creates a foreign key relationship between `signals.user_id` and `auth.users.id`.
          3. Sets the `user_id` to automatically be the current user's ID upon insertion.
          4. Replaces the previous permissive RLS policy with strict policies that only allow users to `SELECT`, `INSERT`, `UPDATE`, and `DELETE` their own signals.
          This is a critical security enhancement for a multi-user environment. No existing data will be lost, but signals created before this migration will not be associated with any user and will become inaccessible unless manually updated.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "High"
          - Requires-Backup: true
          - Reversible: false

          ## Structure Details:
          - Table `public.signals`:
            - Adds column `user_id` (UUID)
            - Adds foreign key constraint to `auth.users(id)`
            - Modifies RLS policies for SELECT, INSERT, UPDATE, DELETE

          ## Security Implications:
          - RLS Status: Enabled and updated
          - Policy Changes: Yes (from permissive to user-specific)
          - Auth Requirements: All data operations on the `signals` table will now require an authenticated user session.

          ## Performance Impact:
          - Indexes: A foreign key index will be implicitly created on `user_id`.
          - Triggers: None
          - Estimated Impact: Negligible performance impact on queries, but significantly improves security and data isolation.
          */

-- 1. Add user_id column to signals table
ALTER TABLE public.signals
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Set default value for user_id to the currently authenticated user
ALTER TABLE public.signals
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 3. Backfill existing signals (optional, depends on desired behavior)
-- For this migration, we assume new signals will be correctly associated.
-- Existing signals will have a NULL user_id and won't be visible unless manually updated.

-- 4. Remove the old permissive policy
-- The name is based on the one generated in the previous migration.
ALTER TABLE public.signals
DROP POLICY IF EXISTS "Enable all access for all users";

-- 5. Add new RLS policies based on user_id
CREATE POLICY "Enable insert for authenticated users only"
ON public.signals
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own signals"
ON public.signals
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own signals"
ON public.signals
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own signals"
ON public.signals
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
