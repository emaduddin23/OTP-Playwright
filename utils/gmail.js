const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const fs = require('fs').promises;
const path = require('path');

// 1. Paths & Scopes
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Authenticates the Google API.
 * It reads the saved token.json if it exists. 
 * If not, it opens the browser for login and creates token.json.
 */
async function authorize() {
  try {
    // Try to load the existing token
    const content = await fs.readFile(TOKEN_PATH, 'utf8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    // If no token exists, open a browser window for Google Login
    const client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });

    // Extract secrets from credentials.json
    const keysContent = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(keysContent);
    const key = keys.installed || keys.web;

    // Save the new token details into token.json for future runs
    await fs.writeFile(TOKEN_PATH, JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
      access_token: client.credentials.access_token,
      expiry_date: client.credentials.expiry_date,
    }));

    return client;
  }
}

/**
 * Nirdisto ekta email address e kono notun email asche kina seta khuje ber korbe
 */
async function getLatestEmail(toEmail) {
  // Prothome google er sathe connect koro
  const authClient = await authorize();
  const gmail = google.gmail({ version: 'v1', auth: authClient });

  // 30 bar loop ghurbe (karon email aste ektu somoy lagte pare)
  for (let i = 0; i < 30; i++) {
    
    // Gmail ke bolo amader oi nirdisto email address e last 5 min e kono email asche kina khujte
    const searchOptions = {
      userId: 'me',
      q: `to:${toEmail} newer_than:5m`,
      maxResults: 1, // Shudhu latest 1 ta email dekhabe
    };
    
    const result = await gmail.users.messages.list(searchOptions);

    // Jodi kono email ashe tahole list er bhitor thakbe
    const emailList = result.data.messages;
    
    if (emailList && emailList.length > 0) {
      // Paoa gela prothom email er ID ta nao
      const emailId = emailList[0].id;
      
      // Sei ID diye pura email ta server theke niye asho
      const fullEmail = await gmail.users.messages.get({
        userId: 'me',
        id: emailId,
        format: 'full', // 'full' mane email er shob kicu anbe
      });

      // Pura email ta return koro
      return fullEmail.data;
    }

    // Jodi ekhono email na ashe, tahole 2 second wait kore abar check korbe
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 1 minute par hoye geleo email na asle error dibe
  throw new Error(`Email not received for ${toEmail} within 60 seconds.`);
}

/**
 * Ei function ta gmail er kothin (encoded) data theke normal text/HTML ber kore anbe
 */
function getEmailBody(message) {
  const payload = message.payload;

  // Case 1: Jodi email e kono attachment (chobi, file) na thake (simple email)
  if (!payload.parts && payload.body.data) {
    const encodedText = payload.body.data; // Eta encoded obosthay thake

    // Decode kore normal text ba HTML e convert koro
    const normalText = Buffer.from(encodedText, 'base64url').toString('utf8');

    return normalText;
  }

  // Case 2: Jodi email e attachment thake, tahole "parts" er bhitor theke HTML khujte hobe
  const parts = payload.parts || [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Shudhumatro 'text/html' part ta khuje nibo
    if (part.mimeType === 'text/html' && part.body.data) {
      const encodedText = part.body.data;

      // Decode kore return koro
      const normalText = Buffer.from(encodedText, 'base64url').toString('utf8');
      return normalText;
    }
  }

  // Kichu na paile faka string return korbe
  return '';
}

module.exports = {
  getLatestEmail,
  getEmailBody,
};