import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuklvgdfsarceywqjyrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1a2x2Z2Rmc2FyY2V5d3FqeXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NTUwNDAsImV4cCI6MjA1MjEzMTA0MH0.uCu0XPK-u4UtFGNyaTupktIId-2YYDBNQcdbcyYJRAM';

export const supabase = createClient(supabaseUrl, supabaseKey); 