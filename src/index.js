const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.get('/fbActions', (req, res) => {res.render('fbActions.js')});
app.get('/getSheetData', (req, res) => {res.render('getSheetData.js')});

app.listen(port, () => {console.log(`App listening on port ${port}`)})

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
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    const EMAIL = process.env.EMAIL || "";
    const PASSWORD = process.env.PASSWORD || "";

    if (!EMAIL || !PASSWORD) {
      throw new Error("Please provide correct email and password");
    }

    console.log("logging in...");

    await page.setViewport({ width: 1200, height: 800 });
    await login(page, EMAIL, PASSWORD);

    console.log("fetching sheet data...");

    const allPostsData = await getSheetData();

    for (const postData of allPostsData) {
      const { postUrl, groupNames } = postData;

      for (const groupName of groupNames) {
        console.log("Going to url", postUrl);
        await page.goto(postUrl);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        console.log("Sharing...");
        await clickShareButton(page);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await clickGroupButton(page);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await selectGroup(page, groupName);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await clickPostButton(page);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        console.log(`${postUrl} Posted to ${groupName}`);
      }
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  } finally {
    await browser.close();
    console.log("Browser closed");
  }
}
