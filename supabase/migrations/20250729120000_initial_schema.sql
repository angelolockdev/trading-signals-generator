/*
# Initial Schema Setup
This migration sets up the initial database schema for the trading signals application. It includes the main `signals` table for storing all trading signal data, a function and trigger to automatically manage `updated_at` timestamps, and initial Row Level Security (RLS) policies.

## Query Description: This operation creates a new table `public.signals` and related database objects. It is a non-destructive operation as it only adds new structures. No existing data will be affected.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (by dropping the created objects)

## Structure Details:
- Table `public.signals`: Stores all signal information.
- Function `public.handle_updated_at()`: A utility function to update timestamps.
- Trigger `on_signals_update`: Automatically updates the `updated_at` field on row modification.

## Security Implications:
- RLS Status: Enabled on `public.signals`.
- Policy Changes: Yes, new policies are created.
- Auth Requirements: Policies are currently public, allowing all users (including anonymous) to perform actions. This is intended for initial setup without user authentication and should be restricted later.

## Performance Impact:
- Indexes: A primary key index is created on the `id` column.
- Triggers: An `UPDATE` trigger is added to the `signals` table, which has a negligible performance impact.
- Estimated Impact: Low.
*/

-- 1. Create signals table
create table public.signals (
  id uuid not null default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  symbol text not null default 'XAUUSD',
  action text not null,
  entry_from numeric,
  entry_to numeric,
  stop_loss numeric,
  take_profit_1 numeric,
  take_profit_2 numeric,
  take_profit_3 numeric,
  notes text,
  status text not null default 'draft',
  is_draft boolean not null default true,
  pnl numeric,
  pnl_percentage numeric,
  current_price numeric
);

-- 2. Add comments to the table and columns
comment on table public.signals is 'Stores trading signals for XAU/USD.';
comment on column public.signals.is_draft is 'If true, the signal is a draft and not active.';
comment on column public.signals.status is 'The current status of the signal (draft, active, sl_hit, tp1_hit, etc.).';

-- 3. Create a function to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 4. Create a trigger to call the function before any update
create trigger on_signals_update
  before update on public.signals
  for each row execute procedure public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
alter table public.signals enable row level security;

-- 6. Create RLS policies
-- For now, allow public access as there is no user authentication.
-- This should be updated to use `auth.uid()` when authentication is added.
create policy "Public signals are viewable by everyone."
  on public.signals for select
  using ( true );

create policy "Anyone can insert signals."
  on public.signals for insert
  with check ( true );

create policy "Anyone can update signals."
  on public.signals for update
  using ( true );

create policy "Anyone can delete signals."
  on public.signals for delete
  using ( true );
