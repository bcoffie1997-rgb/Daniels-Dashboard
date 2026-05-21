import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
const consoleMessages = [];

page.on("pageerror", (err) => {
  errors.push({ msg: err.message, stack: err.stack });
});
page.on("console", (msg) => {
  if (msg.type() === "error" || msg.type() === "warning") {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  }
});

try {
  await page.goto(process.argv[2] ?? "http://localhost:3001/", {
    waitUntil: "networkidle",
    timeout: 15000,
  });
  await page.waitForTimeout(1500);
} catch (e) {
  console.log("Navigation error:", e.message);
}

const body = await page.evaluate(() => document.body.innerText.slice(0, 600));

console.log("===PAGE ERRORS===");
errors.forEach((e) =>
  console.log(e.msg + "\n" + (e.stack || "").split("\n").slice(0, 8).join("\n")),
);
console.log("\n===CONSOLE===");
consoleMessages.forEach((m) => console.log(`[${m.type}] ${m.text}`));
console.log("\n===VISIBLE BODY===");
console.log(body);

await browser.close();
