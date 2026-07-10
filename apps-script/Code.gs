/**
 * Leave Tracker – data web app
 * ----------------------------------------------------------------------------
 * Paste this into the Apps Script editor of your (private) leave sheet:
 *   In the sheet: Extensions → Apps Script → replace everything with this file.
 *
 * Then deploy it:
 *   Deploy → New deployment → type "Web app"
 *     • Execute as:      Me
 *     • Who has access:  Anyone
 *   → Deploy → copy the "/exec" Web app URL.
 *
 * Put that URL in Vercel as the environment variable  VITE_SHEET_API_URL,
 * then redeploy the Vercel project.
 *
 * Your sheet stays PRIVATE — it is never shared publicly. This script runs as
 * you and returns the rows as JSON to the dashboard.
 * ----------------------------------------------------------------------------
 */

// The tab (worksheet) to read. Leave as "" to use the first tab.
var SHEET_NAME = "Sheet1";

function doGet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
    if (!sheet) {
      return json_({ error: 'Tab "' + SHEET_NAME + '" not found.' });
    }

    var values = sheet.getDataRange().getDisplayValues();
    if (values.length < 2) {
      return json_({ records: [] });
    }

    var headers = values.shift();
    var records = values.map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) {
        if (h) obj[String(h).trim()] = row[i];
      });
      return obj;
    });

    return json_({ records: records });
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
