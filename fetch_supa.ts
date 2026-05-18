async function run() {
  try {
    const res = await fetch("https://nzkrhyjfxwxlmbmqtgnv.supabase.co/rest/v1/sumber_donasi", {
      headers: { "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56a3JoeWpmeHdsbWJtcXRnbnYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODU3OTQyNiwiZXhwIjoyMDE0MTU1NDI2fQ.DummySignatureReplaceMe" }
    });
    console.log(res.status, await res.text());
  } catch (e) {
    console.error(e);
  }
}
run();
