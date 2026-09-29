import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uuagrhbdgyvopezoakia.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1YWdyaGJkZ3l2b3Blem9ha2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTA1MjcsImV4cCI6MjA5MjQ2NjUyN30.JaoX421xZ-kIdz_Z6LwFHXxtwVSYa5ICdGvGRCR2Yt8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
