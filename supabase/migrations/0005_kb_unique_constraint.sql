-- Add unique constraint so knowledge_base upsert can deduplicate by (project, name, type)
alter table knowledge_base
  add constraint knowledge_base_project_name_type_unique
  unique (project_id, name, type);
