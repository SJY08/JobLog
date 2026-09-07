-- JobLog 서버 DB 스키마
-- Supabase 프로젝트의 SQL Editor에서 그대로 실행하면 됩니다.

create extension if not exists pgcrypto;

create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    google_sub text unique not null,
    name text not null,
    email text not null,
    school text not null default '대덕소프트웨어마이스터고등학교',
    initial text not null,
    created_at timestamptz not null default now()
);

create table if not exists applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users (id) on delete cascade,
    platform text not null default '',
    company text not null,
    region jsonb,
    position text not null,
    applied_at date not null,
    viewed boolean not null default false,
    viewed_at timestamptz,
    posting_status text not null,
    apply_status text not null,
    link text not null default '',
    memo text not null default '',
    updated_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);
create index if not exists applications_user_id_idx on applications (user_id);

create table if not exists stored_files (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users (id) on delete cascade,
    kind text not null,
    label text not null,
    file_name text not null,
    mime_type text not null,
    size integer not null,
    storage_path text not null,
    uploaded_at timestamptz not null default now()
);
create index if not exists stored_files_user_id_idx on stored_files (user_id);

create table if not exists cover_letters (
    user_id uuid primary key references users (id) on delete cascade,
    applicant_name text not null default '',
    target_company text not null default '',
    target_position text not null default '',
    sections jsonb not null default '[]',
    updated_at timestamptz not null default now()
);
