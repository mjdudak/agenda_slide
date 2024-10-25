/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = "834541846101-2h8gmig7ahk7of9i5clorqvvnq49ihpr.apps.googleusercontent.com";
const API_KEY = "AIzaSyDe68DoWe22bbqIWLC_L4I2nyeWgz-17ww";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;


// Select the noteable divs/spans
const date_dow = document.getElementById('id-date-dow');
const date_month = document.getElementById('id-date-month');
const date_day = document.getElementById('id-date-day');
const aye_text = document.getElementById('id-aye-text');
const agenda_text = document.getElementById('id-agenda-text');
const qod_text = document.getElementById('id-qod-text');
const hw_text = document.getElementById('id-hw-text');
const announcements_text = document.getElementById('id-announcements-text');
const twa_text = document.getElementById('id-twa-text');

let date = new Date();
let prev_date = new Date();
let next_date = new Date();
/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    handleAuthClick()
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    await setBoxes(date);
  };
  tokenClient.requestAccessToken({ prompt: '' });
  /*if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }*/
}

function goBack() {
  setBoxes(prev_date);
}

function goForward() {
  setBoxes(next_date); 
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
async function setBoxes(todays_date_obj) {
  let response;
  try {
    // Fetch first 10 files
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '1NV0VTRif2iZJ6zp3W2NfB4DT177XCr4J3BSMcUle1Cc',
      range: 'AP!A2:J',
    });
  } catch (err) {
    console.log(err.message);
    return;
  } 
  let todays_date = todays_date_obj.toLocaleDateString();
  let todays_row;
  todays_row = response.result.values.filter((row) => {
    return row[0] == todays_date;
  })[0];
  if (!(todays_row)) { 
    date.setDate(date.getDate() - 1);
    return setBoxes(date);
  }
  let todays_index = response.result.values.indexOf(todays_row);
  date_dow.innerHTML = todays_row[3];
  date_month.innerHTML = todays_row[1];
  date_day.innerHTML = todays_row[2];
  aye_text.innerHTML = (todays_row[7] ? todays_row[7] : '');
  agenda_text.innerHTML = (todays_row[5] ? todays_row[5] : '');
  qod_text.innerHTML = (todays_row[4] ? todays_row[4] : '');
  hw_text.innerHTML = (todays_row[8] ? todays_row[8]: '');
  announcements_text.innerHTML = (todays_row[9] ? todays_row[9]: '');
  twa_text.innerHTML = ""
  for (let i = todays_index+1; i<=todays_index+5; i++){
    let row = response.result.values[i];
    let dow = row[3];
    let short_agenda = row[6];
    if (short_agenda) {
      twa_text.innerHTML = twa_text.innerHTML + '<div class="twa-day"><u>' + dow + '</u>: ' + short_agenda + '</div>';
    }
  }
  prev_date = new Date(response.result.values[todays_index-1][0]);
  next_date = new Date(response.result.values[todays_index+1][0]);
}
