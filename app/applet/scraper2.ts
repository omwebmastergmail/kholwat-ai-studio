import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.goto('https://infokholwat2026.lovable.app/', { waitUntil: 'networkidle0' });
        
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('Laporan')) {
                await btn.click();
                break;
            }
        }
        await new Promise(r => setTimeout(r, 2000));
        
        const tabs = await page.$$('button[role="tab"]');
        for (const tab of tabs) {
             const text = await page.evaluate(el => el.textContent, tab);
             if (text && text.includes('Seksi')) {
                 await tab.click();
                 break;
             }
        }
        
        await new Promise(r => setTimeout(r, 2000));
        const html = await page.content();
        console.log(html);
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
