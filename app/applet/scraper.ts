import puppeteer from "puppeteer";

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.goto("https://infokholwat2026.lovable.app/", { waitUntil: "networkidle0" });

    let found = false;
    const buttons = await page.$$("button");
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes("Laporan")) {
        await btn.click();
        found = true;
        break;
      }
    }

    if (!found) {
      console.log("Could not find Laporan Keuangan tab button.");
    }

    await new Promise((r) => setTimeout(r, 2000));
    const html = await page.content();
    console.log(html);
    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();
