async function run() {
  const url = "https://lypqrmbgdabiyfnjbion.supabase.co/rest/v1/";
  try {
    const res = await fetch(url, {
      method: "OPTIONS",
      headers: {
        Origin: "https://ais-dev-t6td7bskt2ae6jubz56mgi-87344600628.asia-east1.run.app",
        "Access-Control-Request-Method": "GET",
      },
    });
    console.log("Status:", res.status);
    console.log("Headers:");
    res.headers.forEach((val, key) => console.log(key, ":", val));
  } catch (e) {
    console.error("error", e);
  }
}
run();
