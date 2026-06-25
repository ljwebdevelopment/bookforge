-- Enable RLS on all tables
alter table owner enable row level security;
alter table projects enable row level security;
alter table project_settings enable row level security;
alter table chapters enable row level security;
alter table chapter_sections enable row level security;
alter table outlines enable row level security;
alter table notes enable row level security;
alter table research enable row level security;
alter table writing_guidelines enable row level security;
alter table timeline enable row level security;
alter table knowledge_base enable row level security;
alter table ai_memory enable row level security;
alter table ai_suggestions enable row level security;
alter table generated_sections enable row level security;
alter table versions enable row level security;
alter table activity_log enable row level security;

-- Owner table: only the authenticated user can access their own row
create policy "owner_self" on owner
  for all using (id = auth.uid());

-- Owner can insert their own record on first login
create policy "owner_insert" on owner
  for insert with check (id = auth.uid());

-- Projects: owner_id must match the owner table
create policy "owner_only_projects" on projects
  for all using (
    owner_id = (select id from owner where id = auth.uid())
  );

-- Helper: get owner's project IDs
-- All other tables use this pattern to check ownership
create policy "owner_only_project_settings" on project_settings
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_chapters" on chapters
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_chapter_sections" on chapter_sections
  for all using (
    chapter_id in (
      select id from chapters where project_id in (
        select id from projects where owner_id = auth.uid()
      )
    )
  );

create policy "owner_only_outlines" on outlines
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_notes" on notes
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_research" on research
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_writing_guidelines" on writing_guidelines
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_timeline" on timeline
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_knowledge_base" on knowledge_base
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_ai_memory" on ai_memory
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_ai_suggestions" on ai_suggestions
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_generated_sections" on generated_sections
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_versions" on versions
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );

create policy "owner_only_activity_log" on activity_log
  for all using (
    project_id in (select id from projects where owner_id = auth.uid())
  );
