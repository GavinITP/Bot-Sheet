const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines in private key
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const botFrequency = process.env.BOT_FREQUENCY;
const mainTab = "Repost Master";

// For Testing Purpose
// getSheetData();

async function getSheetData() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${mainTab}!A2:Z`,
    });

    let allGroupTabs = {};
    let allPostsData = [];

    const rows = res.data.values;

    for (const row of rows) {
      const postUrl = row[2];
      const groupTabs = row.slice(4);
      const frequency = row[1];

      if (frequency !== botFrequency) continue;
      if (postUrl.trim().length === 0) continue;

      for (const tab of groupTabs) {
        if (tab.trim().length === 0 || tab.trim() === "-") continue;

        if (!allGroupTabs[tab]) {
          const groupNames = await getGroupNamesFromTabName(spreadsheetId, tab);
          allGroupTabs[tab] = groupNames;
        }

        const newPost = { postUrl, groupNames: allGroupTabs[tab] };
        const exists = allPostsData.some(
          (post) =>
            post.postUrl === newPost.postUrl &&
            JSON.stringify(post.groupNames) ===
              JSON.stringify(newPost.groupNames)
        );

        if (!exists) {
          allPostsData.push(newPost);
        }
      }
    }

    // For Testing Purpose
    // console.log("allPostsData", allPostsData);

    return allPostsData;
  } catch (err) {
    console.error("Error fetching data from Google Sheets:", err.message);
  }
}

async function getGroupNamesFromTabName(spreadsheetId, tab) {
  const tabRes = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: `'${tab}'!A3:Z`,
  });

  const tabRows = tabRes.data.values;
  const tabColumns = transpose(tabRows);
  let groupNames = tabColumns[0];
  groupNames = groupNames.map((name) => name.trim());

  return groupNames;
}

function transpose(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

module.exports = { getSheetData };
