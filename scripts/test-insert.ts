import { createClient } from "@supabase/supabase-js";

const url = "https://lypqrmbgdabiyfnjbion.supabase.co";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cHFybWJnZGFiaXlmbmpiaW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQxNDYsImV4cCI6MjA5NDIxMDE0Nn0.hfJq1uNFA6Df2ZWKJfueztbwUqxZGgIF8BN_AM827HI";

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
    .from("sumber_donasi")
    .insert([{ nama: "TEST_INSERT_SEED", urutan: 999 }])
    .select();
  console.log({ data, error });
}
run();
