-- Pizza Panic schema. Run this once in the Supabase SQL editor (or psql).

create extension if not exists "pgcrypto";

create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_name    text not null,
  customer_phone   text,
  items            jsonb not null default '[]'::jsonb,
  note             text,
  address          text not null,
  status           text not null default 'received'
                     check (status in ('received','oven','transit','delivered','burned')),
  created_at       timestamptz not null default now(),
  status_updated_at timestamptz not null default now(),
  received_by      text,
  oven_by          text,
  delivery_by      text
);

-- The overview always queries a single business day ordered by created_at, so an
-- index on created_at keeps that fast even with millions of historical rows.
create index if not exists orders_created_at_idx on orders (created_at);
