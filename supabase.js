import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tpxzsnbczdhslqhsfjmq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRweHpzbmJjemRoc2xxaHNmam1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjcyOTAsImV4cCI6MjA2NjYwMzI5MH0.wbqpk4saJ8d0CyDW1QjJOSpFf_DZ7QyQd2Dk2qMrvvE";

export const supabase = createClient(supabaseUrl, supabaseKey);
