import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuklvgdfsarceywqjyrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1a2x2Z2Rmc2FyY2V5d3FqeXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NTUwNDAsImV4cCI6MjA1MjEzMTA0MH0.uCu0XPK-u4UtFGNyaTupktIId-2YYDBNQcdbcyYJRAM';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Estrutura da tabela tasks:
/*
create table tasks (
  id bigint generated by default as identity primary key,
  task_id text not null,
  page_title text not null,
  profile_id text not null,
  status text not null,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(task_id, page_title, profile_id)
);

create index idx_tasks_page_title on tasks(page_title);
create index idx_tasks_task_id on tasks(task_id);
create index idx_tasks_profile_id on tasks(profile_id);
*/ 