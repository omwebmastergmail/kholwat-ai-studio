import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || "";
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(url, key);

async function seed() {
  console.log("Seeding to Supabase..." + url);
  const { data, error } = await supabase.from("sumber_donasi").select("id").limit(1);
  if (error) {
    console.error("Error accessing table:", error.message);
    return;
  }

  const { error: insErr } = await supabase
    .from("sumber_donasi")
    .upsert([{ nama: "BANDUNG", urutan: 1 }]);

  if (insErr) {
    console.error("Error inserting:", insErr.message);
  } else {
    console.log("Successfully inserted a test row!");
  }
}

seed();
