async function login(page, email, password) {
  await page.goto("https://web.facebook.com");
  await page.type("#email", email);
  await page.type("#pass", password);
  await page.click('button[name="login"]');
  await page.waitForNavigation();
}

async function clickShareButton(page) {
  await page.evaluate(async () => {
    const spans = Array.from(document.querySelectorAll("span"));

    const shareButton = spans.find(
      (span) => span.textContent.trim() === "Share"
    );

    if (!shareButton) {
      throw new Error("Share button not found");
    }

    shareButton.click();
  });
}

async function clickGroupButton(page) {
  await page.evaluate(async () => {
    const spans = document.querySelectorAll("span");

    const groupButton = Array.from(spans).find(
      (span) => span.textContent === "Group"
    );

    if (!groupButton) {
      throw new Error("Share to group button not found");
    }

    groupButton.click();
  });
}

async function searchForGroup(page, text) {
  await page.waitForSelector('input[placeholder="Search for groups"]');
  await page.type('input[placeholder="Search for groups"]', text);
}

async function selectGroup(page, groupName) {
  await page.evaluate(async (groupName) => {
    const spanElements = document.querySelectorAll("span");
    const group = Array.from(spanElements).find(
      (span) => span.textContent === groupName
    );

    if (!group) {
      console.log("group", group);
      throw new Error("Group not found");
    }

    group.scrollIntoView({ block: "nearest" });
    group.click();
  }, groupName);
}

async function clickPostButton(page) {
  await page.evaluate(async () => {
    const spanElements = document.querySelectorAll("span");
    const postButton = Array.from(spanElements).find(
      (div) => div.textContent === "Post"
    );
    if (!postButton) {
      throw new Error("Post button not found");
    }

    postButton.click();
  });
}

module.exports = {
  login,
  clickShareButton,
  clickGroupButton,
  searchForGroup,
  selectGroup,
  clickPostButton,
};
