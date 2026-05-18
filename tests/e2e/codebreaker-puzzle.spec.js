import { test, expect } from "@playwright/test";

const SVC_URL = "https://appadaycreator.github.io/codebreaker-puzzle/";
const SVC_NAME = "コードブレイカー";

test.describe("コードブレイカー - E2Eテスト", () => {

  test("ページ基本: タイトル・h1・canonical", async ({ page }) => {
    await page.goto(SVC_URL);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(15);
    expect(title.toLowerCase()).toMatch(/暗号/i);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("codebreaker-puzzle");
    const h1 = await page.locator("h1").first();
    await expect(h1).toBeVisible();
    console.log("✅ 基本確認OK | タイトル:", title.substring(0, 50));
  });

  test("アフィリエイト: Amazonタグが正しい", async ({ page }) => {
    await page.goto(SVC_URL);
    const content = await page.content();
    if (content.includes("amazon.co.jp")) {
      expect(content).toContain("appadaycrea0f-22");
      expect(content).not.toContain("appadaycreator-22");
      console.log("✅ Amazonタグ確認OK");
    } else {
      console.log("⏭ Amazonリンクなし（スキップ）");
    }
  });

  test("SEO: sitemap.xml・robots.txt が存在する", async ({ page }) => {
    const sitemapResp = await page.request.get("https://appadaycreator.github.io/codebreaker-puzzle/sitemap.xml");
    expect([200, 301, 302]).toContain(sitemapResp.status());
    const robotsResp = await page.request.get("https://appadaycreator.github.io/codebreaker-puzzle/robots.txt");
    expect([200, 301, 302]).toContain(robotsResp.status());
    console.log("✅ sitemap・robots確認OK");
  });

  test("GTM: トラッキングコードが設置されている", async ({ page }) => {
    await page.goto(SVC_URL);
    const content = await page.content();
    expect(content).toContain("GTM-TXQGZRF9");
    console.log("✅ GTM確認OK");
  });

  test("モバイル: 375px幅で正常表示", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(SVC_URL);
    await expect(page.locator("body")).toBeVisible();
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
    console.log("✅ モバイル表示確認OK");
  });

  test("プライバシー・利用規約: ページが存在する", async ({ page }) => {
    const privResp = await page.request.get("https://appadaycreator.github.io/codebreaker-puzzle/privacy-policy.html");
    const termsResp = await page.request.get("https://appadaycreator.github.io/codebreaker-puzzle/terms.html");
    expect([200, 301, 302]).toContain(privResp.status());
    expect([200, 301, 302]).toContain(termsResp.status());
    console.log("✅ プライバシー・利用規約確認OK");
  });

});
