-- Chạy SQL này trong Supabase SQL Editor

-- Bảng lưu lời chúc
create table if not exists bride_blessings (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Ẩn danh',
  message text not null,
  created_at timestamptz not null default now()
);

-- Bảng lưu xác nhận tham dự
create table if not exists bride_rsvp (
  id uuid primary key default gen_random_uuid(),
  name text,
  attending boolean not null,
  attendee_count integer not null default 1,
  created_at timestamptz not null default now()
);

-- Cho phép insert và select công khai (hoặc chỉ dùng service role key)
-- Nếu dùng service role key thì không cần RLS
alter table bride_blessings enable row level security;
alter table bride_rsvp enable row level security;
