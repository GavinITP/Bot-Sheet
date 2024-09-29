const puppeteer = require("puppeteer");
const dotenv = require("dotenv");

const {
  login,
  clickShareButton,
  clickGroupButton,
  selectGroup,
  clickPostButton,
} = require("./helpers/fbActions");
const { getSheetData } = require("./helpers/getSheetData");

dotenv.config();
run();

async function run() {
  console.log("Start Bot");

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
        console.log("Navigating to URL:", postUrl);
        await page.goto(postUrl);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Clicking Share Button...");
        await clickShareButton(page);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Clicking Group Button...");
        await clickGroupButton(page);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Selecting Group...");
        await selectGroup(page, groupName);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Sharing");
        await clickPostButton(page);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log(`Successfully share to ${groupName}\n`);
        console.log("====================\n");
      }
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log("Browser closed");
  }
}
