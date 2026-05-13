import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://lypqrmbgdabiyfnjbion.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cHFybWJnZGFiaXlmbmpiaW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQxNDYsImV4cCI6MjA5NDIxMDE0Nn0.hfJq1uNFA6Df2ZWKJfueztbwUqxZGgIF8BN_AM827HI",
);
async function run() {
  const { data: auth, error: loginErr } = await supabase.auth.signInWithPassword({
    email: "pk2026@email.com",
    password: "mdti@2026",
  });
  if (loginErr) return console.error("Login failed:", loginErr);

  const { data, error } = await supabase
    .from("user_roles")
    .insert([{ user_id: auth.user.id, role: "admin" }]);
  console.log("Role Admin insert:", error ? error.message : "Success!");
}
run();
