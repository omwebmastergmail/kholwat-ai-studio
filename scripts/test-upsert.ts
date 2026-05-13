import { createClient } from "@supabase/supabase-js";

async function run() {
  const url = "https://lypqrmbgdabiyfnjbion.supabase.co";
  const key =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cHFybWJnZGFiaXlmbmpiaW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQxNDYsImV4cCI6MjA5NDIxMDE0Nn0.hfJq1uNFA6Df2ZWKJfueztbwUqxZGgIF8BN_AM827HI";
  const supabase = createClient(url, key);
  try {
    const seed = ["BANDUNG", "BATANG"];
    const payload = seed.map((n, i) => ({ nama: n, urutan: i + 1 }));
    console.log("Upserting payload...");
    const { data, error, status, statusText } = await supabase
      .from("sumber_donasi")
      .upsert(payload, { onConflict: "nama" });
    console.log("Result:", { status, statusText, error });
  } catch (e) {
    console.error("Caught exception:", e);
  }
}
run();
