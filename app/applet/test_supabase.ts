import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nzkrhyjfxwxlmbmqtgnv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3JoeWpmeHdsbWJtcXRnbnYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODU3OTQyNiwiZXhwIjoyMDE0MTU1NDI2fQ.DummySignatureReplaceMe"; // I'll use the one from .env

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase.from("peserta").select("*").limit(1);
  console.log("SELECT returned:", data, error);

  const { data: d2, error: e2 } = await supabase.from("peserta").insert({
    nama: "test"
  });
  console.log("INSERT returned:", d2, e2);
}
test();
