/***************************************************
 * MASTER CONFIG
 ***************************************************/
const TIMEZONE = "GMT+5:30";

const SHEETS = {
  ACTIVATIONS: "Sheet1",
  REGISTRATIONS: "Form Responses",
  REQUIREMENTS: "Requirements",
  GIFT_MASTER: "Sheet1",
  GIFT_SUBMISSIONS: "Sheet2",
  TARGET: "Target",
  FOS: "FOS"
};

const SPREADSHEETS = {
  REGISTRATION: "1nsSpRM4OtMur4YBTsF5TUd35D-CArRy9mKTDxsfNNUk",
  REQUIREMENT: "1vP9dElDbDzMMm5b43jS31JDIG0a5FBn3MlbsE-Hxfys",
  GIFT: "1YqMHnd6CSwTlXmdNTh327rOILxQs-Jwq0AOvVL0iFYU",
  ACTIVATION: "1de9MQaGXk0gM4gaO-hoCFHHgv1uuCnPutjzBNAvjSSw",
  PRICE: "12z48-52PTOa7ZPdB9Lm8J74LoPmH_P6373Xugj_N62Q"
};

const PRICE_SHEETS = {
  MIPP: "Mobile",
  ECO: "ECO",
  TABLET: "Tablet",
  TV: "Tv"
};

/***************************************************
 * ROUTING
 ***************************************************/
function doGet(e) {

  const page = e?.parameter?.p || "index";

  try {

    return HtmlService
      .createTemplateFromFile(page)
      .evaluate()
      .setTitle("Activation System")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag(
        "viewport",
        "width=device-width, initial-scale=1"
      );

  } catch (err) {

    return HtmlService.createHtmlOutput(`
      <h2>Page Not Found</h2>
      <p>${page}.html missing</p>
    `);

  }
}

function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

function getScriptURL() {
  return ScriptApp.getService().getUrl();
}

/***************************************************
 * UTILITIES
 ***************************************************/
function logError(functionName, error) {
  console.error(functionName + " => " + error.toString());
}

function formatDate(dateObj, format = "dd-MM-yyyy HH:mm") {

  if (!(dateObj instanceof Date)) return dateObj;

  return Utilities.formatDate(
    dateObj,
    TIMEZONE,
    format
  );
}

function convertToDirectDownload(url) {

  if (!url) return "";

  if (
    typeof url !== "string" ||
    !url.includes("drive.google.com")
  ) {
    return url;
  }

  const match = url.match(/[-\w]{25,}/);

  return match
    ? "https://drive.google.com/uc?export=download&id=" + match[0]
    : url;
}

function isSameDate(d1, d2) {

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function defaultStats() {

  return {
    totalCount: 0,
    lastMonthCount: 0,
    growthPercent: 0,
    outletActive: 0,
    totalRetailers: 0,
    trend: []
  };
}

/***************************************************
 * ACCESS TEST
 ***************************************************/
function testAccess() {

  SpreadsheetApp.openById(SPREADSHEETS.ACTIVATION);
  SpreadsheetApp.openById(SPREADSHEETS.REGISTRATION);
  SpreadsheetApp.openById(SPREADSHEETS.REQUIREMENT);
  SpreadsheetApp.openById(SPREADSHEETS.GIFT);
  SpreadsheetApp.openById(SPREADSHEETS.PRICE);

  return "ACCESS OK";
}

/***************************************************
 * REQUIREMENTS
 ***************************************************/
function getRequirementData() {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.REQUIREMENT
    );

    const sheet = ss.getSheetByName(
      SHEETS.REQUIREMENTS
    );

    if (!sheet) {
      return {
        rows: [],
        headers: [],
        totalCount: 0
      };
    }

    const data = sheet.getDataRange().getValues();

    if (data.length < 1) {
      return {
        rows: [],
        headers: [],
        totalCount: 0
      };
    }

    const headers = data[0];

    const rows = data
      .slice(1)
      .map((row, index) => {

        const obj = {};

        obj._sheetRow = index + 2;

        headers.forEach((header, i) => {

          let val = row[i];

          if (val instanceof Date) {
            val = formatDate(val);
          }

          obj[header] =
            val === "" || val === null
              ? "-"
              : val;
        });

        return obj;

      })
      .reverse();

    return {
      rows,
      headers,
      totalCount: rows.length,
      loginTime: formatDate(
        new Date(),
        "hh:mm a"
      )
    };

  } catch (e) {

    logError("getRequirementData", e);

    return {
      rows: [],
      headers: [],
      totalCount: 0
    };
  }
}

function processRequirement(data) {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.REQUIREMENT
    );

    const sheet = ss.getSheetByName(
      SHEETS.REQUIREMENTS
    );

    const rowData = [
      new Date(),
      data.retailerName || "",
      data.redmi14c_4_64 || 0,
      data.redmi14c_4_128 || 0,
      data.redmi14c_6_128 || 0,
      data.note14_6_128 || 0,
      data.note14_8_128 || 0,
      data.note14_8_256 || 0,
      data.note14pro_8_128 || 0,
      data.note14pro_8_256 || 0,
      data.note14proPlus_8_256 || 0,
      data.note14pro_12_512 || 0
    ];

    sheet.appendRow(rowData);

    return "SUCCESS";

  } catch (e) {

    logError("processRequirement", e);

    return "ERROR";
  }
}

function deleteRequirement(rowNumber) {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.REQUIREMENT
    );

    const sheet = ss.getSheetByName(
      SHEETS.REQUIREMENTS
    );

    sheet.deleteRow(Number(rowNumber));

    return "SUCCESS";

  } catch (e) {

    logError("deleteRequirement", e);

    return "ERROR";
  }
}

/***************************************************
 * REGISTRATION
 ***************************************************/
function getRecentSubmissions() {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.REGISTRATION
    );

    const sheet = ss.getSheetByName(
      SHEETS.REGISTRATIONS
    );

    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();

    if (data.length < 2) return [];

    const headers = data[0];

    return data
      .slice(1)
      .map(row => {

        const obj = {};

        headers.forEach((header, i) => {

          let val = row[i];

          if (val instanceof Date) {
            val = formatDate(
              val,
              "dd-MM-yyyy"
            );
          }

          if (
            header.toString()
              .toUpperCase()
              .includes("URL")
          ) {
            val = convertToDirectDownload(val);
          }

          obj[header] = val;

        });

        return obj;

      })
      .reverse();

  } catch (e) {

    logError("getRecentSubmissions", e);

    return [];
  }
}

/***************************************************
 * ACTIVATION
 ***************************************************/
function getStockData() {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.ACTIVATION
    );

    const sheet = ss.getSheetByName(
      SHEETS.ACTIVATIONS
    );

    if (!sheet) return [];

    const values = sheet.getDataRange().getValues();

    return values.map(row =>
      row.map(cell =>
        cell instanceof Date
          ? formatDate(cell, "dd-MM-yyyy")
          : cell
      )
    );

  } catch (e) {

    logError("getStockData", e);

    return [];
  }
}

function processCSVUpload(csvData) {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.ACTIVATION
    );

    let sheet = ss.getSheetByName(
      SHEETS.ACTIVATIONS
    );

    if (!sheet) {
      sheet = ss.insertSheet(
        SHEETS.ACTIVATIONS
      );
    }

    const csvRows = Utilities.parseCsv(csvData);

    if (csvRows.length < 2) {
      return "CSV EMPTY";
    }

    const rows = csvRows.slice(1);

    sheet
      .getRange(
        sheet.getLastRow() + 1,
        1,
        rows.length,
        rows[0].length
      )
      .setValues(rows);

    return "SUCCESS";

  } catch (e) {

    logError("processCSVUpload", e);

    return "ERROR";
  }
}

function processNewActivations(dataRows) {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.ACTIVATION
    );

    const sheet = ss.getSheetByName(
      SHEETS.ACTIVATIONS
    );

    const existingData =
      sheet.getDataRange().getValues();

    const existingIMEIs =
      existingData.map(r =>
        String(r[0]).trim()
      );

    const rowsToAppend = [];

    dataRows.forEach(rowStr => {

      const cols = rowStr.split("\t");

      const imei = cols[0].trim();

      if (
        existingIMEIs.indexOf(imei) === -1
      ) {
        rowsToAppend.push(cols);
      }
    });

    if (rowsToAppend.length > 0) {

      sheet
        .getRange(
          sheet.getLastRow() + 1,
          1,
          rowsToAppend.length,
          rowsToAppend[0].length
        )
        .setValues(rowsToAppend);

      return {
        status: "success",
        count: rowsToAppend.length
      };
    }

    return {
      status: "duplicate"
    };

  } catch (e) {

    logError("processNewActivations", e);

    return {
      status: "error"
    };
  }
}

/***************************************************
 * DASHBOARD
 ***************************************************/
function getDashboardData() {

  try {

    const ss = SpreadsheetApp.openById(
      SPREADSHEETS.ACTIVATION
    );

    const sheet = ss.getSheetByName(
      SHEETS.ACTIVATIONS
    );

    if (!sheet) {
      return {
        rows: [],
        totalCount: 0
      };
    }

    const data = sheet.getDataRange().getValues();

    if (data.length < 2) {
      return {
        rows: [],
        totalCount: 0
      };
    }

    const headers = data[0];

    const rows = data
      .slice(1)
      .map(row => {

        const obj = {};

        headers.forEach((header, i) => {

          let val = row[i];

          let h = String(header).trim();

          let key = h
            .toLowerCase()
            .replace(/\s+/g, "");

          if (h === "IMEI") key = "imei";
          else if (/product/i.test(h)) key = "product";
          else if (/activ/i.test(h)) key = "activated";
          else if (/dms/i.test(h)) key = "dms";
          else if (/retailer/i.test(h)) key = "retailer";

          if (val instanceof Date) {
            val = formatDate(val);
          }

          obj[key] =
            val === "" || val === null
              ? "-"
              : val;

        });

        return obj;

      })
      .reverse();

    return {
      rows,
      totalCount: rows.length,
      loginTime: formatDate(
        new Date(),
        "hh:mm a"
      )
    };

  } catch (e) {

    logError("getDashboardData", e);

    return {
      rows: [],
      totalCount: 0
    };
  }
}
