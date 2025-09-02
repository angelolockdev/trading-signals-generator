/*
# [SECURITY] Set Function Search Path
This migration addresses a security warning by explicitly setting the `search_path` for the `handle_updated_at` function. This prevents potential search path hijacking attacks.

## Query Description: 
This operation modifies an existing database function to enhance security. It is a non-destructive change and has no impact on existing data. It ensures that the function only looks for objects within the `public` schema, which is a security best practice.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Function modified: `public.handle_updated_at()`

## Security Implications:
- RLS Status: [No Change]
- Policy Changes: [No]
- Auth Requirements: [None]
- Fixes: Addresses the "[WARN] Function Search Path Mutable" security advisory.

## Performance Impact:
- Indexes: [No Change]
- Triggers: [No Change]
- Estimated Impact: [None]
*/

ALTER FUNCTION public.handle_updated_at() SET search_path = public;
