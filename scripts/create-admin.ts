import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = "https://lypqrmbgdabiyfnjbion.supabase.co";
  const key =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cHFybWJnZGFiaXlmbmpiaW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQxNDYsImV4cCI6MjA5NDIxMDE0Nn0.hfJq1uNFA6Df2ZWKJfueztbwUqxZGgIF8BN_AM827HI";
  const supabase = createClient(url, key);
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "pk2026@email.com",
      password: "mdti@2026",
    });
    console.log("Auth result:", { authData, authError });
    if (authData.user) {
      console.log("User created! UID:", authData.user.id);
      // Let's try to add them to admin role via insert if possible
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .insert([{ user_id: authData.user.id, role: "admin" }]);
      console.log("Role insert:", { roleData, roleError });
    }
  } catch (e) {
    console.error("Caught exception:", e);
  }
}
run();
