-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Owner table (single user)
create table owner (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references owner(id) on delete cascade,
  title text not null,
  subtitle text,
  genre text,
  status text not null default 'draft' check (status in ('draft','in_progress','complete','published')),
  cover_image text,
  target_word_count int default 80000,
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  template text not null default 'blank',
  word_count int not null default 0,
  last_edited_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Project settings (1:1)
create table project_settings (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null unique references projects(id) on delete cascade,
  default_voice text,
  ai_model text not null default 'claude-sonnet-4-6',
  created_at timestamptz default now()
);

-- Chapters
create table chapters (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null default 'Chapter 1',
  "order" int not null default 0,
  content jsonb,
  word_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chapter sections
create table chapter_sections (
  id uuid primary key default uuid_generate_v4(),
  chapter_id uuid not null references chapters(id) on delete cascade,
  title text not null,
  "order" int not null default 0,
  content jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Outlines (adjacency list)
create table outlines (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  level int not null default 1,
  "order" int not null default 0,
  parent_id uuid references outlines(id) on delete cascade,
  completion_status text not null default 'not_started'
    check (completion_status in ('not_started','in_progress','complete')),
  notes text,
  linked_chapter_id uuid references chapters(id) on delete set null,
  created_at timestamptz default now()
);

-- Notes
create table notes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text,
  content text,
  tags text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Research
create table research (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null check (type in ('pdf','image','screenshot','link','quote','note')),
  title text,
  content text,
  url text,
  file_url text,
  created_at timestamptz default now()
);

-- Writing guidelines
create table writing_guidelines (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null unique references projects(id) on delete cascade,
  guidelines text not null default '',
  updated_at timestamptz default now()
);

-- Timeline
create table timeline (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  date text,
  title text not null,
  description text,
  "order" int not null default 0,
  created_at timestamptz default now()
);

-- Knowledge base / Story Bible
create table knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null check (type in ('person','place','event','organization','argument','quote','theme','other')),
  name text not null,
  description text,
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI Memory (per-project, one row per memory_type)
create table ai_memory (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  memory_type text not null check (memory_type in (
    'outline','summary','voice','rules','characters',
    'timeline','themes','research','accepted_edits','rejected_edits'
  )),
  content text not null,
  updated_at timestamptz default now(),
  unique (project_id, memory_type)
);

-- AI Suggestions
create table ai_suggestions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  problem text not null,
  explanation text,
  suggestion text,
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected','ignored')),
  created_at timestamptz default now()
);

-- Generated sections (Draft Generator output)
create table generated_sections (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  outline_id uuid references outlines(id) on delete set null,
  content text not null,
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected','edited')),
  created_at timestamptz default now()
);

-- Version history
create table versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  content jsonb not null,
  word_count int not null default 0,
  label text,
  created_at timestamptz default now()
);

-- Activity log
create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  action text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index on projects (owner_id, last_edited_at desc);
create index on projects (owner_id, is_favorite) where is_favorite = true;
create index on projects (owner_id, is_archived);
create index on chapters (project_id, "order");
create index on outlines (project_id, parent_id, "order");
create index on notes (project_id, created_at desc);
create index on research (project_id, type);
create index on ai_memory (project_id, memory_type);
create index on versions (chapter_id, created_at desc);
create index on activity_log (project_id, created_at desc);
create index on knowledge_base (project_id, type);

-- Full text search
create index on chapters using gin (to_tsvector('english', coalesce(content::text, '')));
create index on notes using gin (to_tsvector('english', coalesce(content, '')));
create index on knowledge_base using gin (to_tsvector('english', coalesce(name || ' ' || coalesce(description, ''), '')));
