alter table users
  add column if not exists job_title text,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists avatar_color text not null default '#8863b7';
