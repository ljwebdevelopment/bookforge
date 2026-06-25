-- Grant schema usage
grant usage on schema public to anon, authenticated;

-- Grant table permissions for all app tables
-- (required for PostgREST API access; RLS policies still enforce row-level restrictions)
grant all on table owner to anon, authenticated;
grant all on table projects to anon, authenticated;
grant all on table project_settings to anon, authenticated;
grant all on table chapters to anon, authenticated;
grant all on table chapter_sections to anon, authenticated;
grant all on table outlines to anon, authenticated;
grant all on table notes to anon, authenticated;
grant all on table research to anon, authenticated;
grant all on table writing_guidelines to anon, authenticated;
grant all on table timeline to anon, authenticated;
grant all on table knowledge_base to anon, authenticated;
grant all on table ai_memory to anon, authenticated;
grant all on table ai_suggestions to anon, authenticated;
grant all on table generated_sections to anon, authenticated;
grant all on table versions to anon, authenticated;
grant all on table activity_log to anon, authenticated;

-- Grant sequence usage (needed for any serial/identity columns)
grant usage, select on all sequences in schema public to anon, authenticated;
