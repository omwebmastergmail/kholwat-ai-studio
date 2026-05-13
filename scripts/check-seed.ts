import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://lypqrmbgdabiyfnjbion.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cHFybWJnZGFiaXlmbmpiaW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQxNDYsImV4cCI6MjA5NDIxMDE0Nn0.hfJq1uNFA6Df2ZWKJfueztbwUqxZGgIF8BN_AM827HI",
);
supabase
  .from("sumber_donasi")
  .select("*")
  .then(({ data }) => console.log(data));
