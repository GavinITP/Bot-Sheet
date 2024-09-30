const puppeteer = require("puppeteer");
const dotenv = require("dotenv");

const {
  login,
  clickShareButton,
  clickGroupButton,
  searchForGroup,
  selectGroup,
  clickPostButton,
} = require("./helpers/fbActions");
const { getSheetData } = require("./helpers/getSheetData");

const start = performance.now();

dotenv.config();
run();

async function run() {
  console.log("Start Bot");

  // Launch Puppeteer browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Handle dialogs like alerts, confirms, prompts
  page.on("dialog", async (dialog) => {
    console.log(`Dialog detected: ${dialog.message()}`);
    await dialog.accept(); // Automatically accept the pop-up
  });

  try {
    const EMAIL = process.env.EMAIL || "";
    const PASSWORD = process.env.PASSWORD || "";

    if (!EMAIL || !PASSWORD) {
      throw new Error("Please provide correct email and password.");
    }

    console.log("Logging In...");
    await page.setViewport({ width: 1200, height: 800 });
    await login(page, EMAIL, PASSWORD);

    console.log("Fetching Google Sheet Data...");
    const allPostsData = await getSheetData();

    for (const postData of allPostsData) {
      const { postUrl, groupNames } = postData;

      for (const groupName of groupNames) {
        try {
          console.log("Navigating to URL:", postUrl);
          await page.goto(postUrl);
          await delay(3000);

          console.log("Clicking Share Button...");
          await clickShareButton(page);
          await delay(3000);

          console.log("Clicking Group Button...");
          await clickGroupButton(page);
          await delay(3000);

          console.log("Searching For Group...");
          await searchForGroup(page, groupName);
          await delay(3000);

          console.log("Selecting Group...");
          await selectGroup(page, groupName);
          await delay(3000);

          console.log("Sharing");
          await clickPostButton(page);
          await delay(3000);

          console.log(`Successfully shared to ${groupName}\n`);
        } catch (err) {
          console.error(`Error sharing to group ${groupName}: ${err.message}`);
        } finally {
          console.log("====================\n");
        }
      }
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log("Browser closed");
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const end = performance.now();
const executionTime = (end - start) / 1000;
console.log(`Execution time: ${executionTime.toFixed(2)} seconds`);
