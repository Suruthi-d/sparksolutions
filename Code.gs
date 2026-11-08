/**
 * Spark Solutions backend (Google Apps Script Web App).
 * Script Properties (Project Settings > Script Properties):
 *   SHEET_ID     - ID of your Google Sheet
 *   WA_TO        - 919363387887
 *   WA_TOKEN, WA_PHONE_ID, WA_TEMPLATE - WhatsApp Cloud API (optional until configured)
 * Never put these values in GitHub.
 */
const HEADERS = ["Enquiry ID","Date","Name","Phone","Email","Business Name","Category","Location","Enquiry Type","Services","Business Challenge","Budget","Message","Consent","Lead Status","Lead Source","WhatsApp Status"];

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return out({ ok: false, error: "spam" });
    const type = d.enquiryType === "Business Owner" ? "Business Owner" : "Exploring";
    const err = validate(d, type); if (err) return out({ ok: false, error: err });

    const props = PropertiesService.getScriptProperties();
    const sheet = getSheet(props.getProperty("SHEET_ID"));
    const cache = CacheService.getScriptCache();
    if (d.token && cache.get("t_" + d.token)) return out({ ok: false, error: "Duplicate submission" });
    if (d.token) cache.put("t_" + d.token, "1", 3600);

    const id = "SPK-" + Utilities.formatDate(new Date(), "Asia/Kolkata", "yyMMdd") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const when = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a");
    sheet.appendRow([id, when, d.name, "'" + (d.phone || ""), d.email, d.businessName || "", d.category || "", d.location || "", type,
      d.services || "", d.challenge || "", d.budget || "", d.message || "", "Yes", "New", "Website",
      type === "Business Owner" ? "Pending" : "Not applicable"]);   // lead saved FIRST
    const rowNum = sheet.getLastRow();

    if (type === "Business Owner") {                               // never for "Exploring"
      let status;
      try { status = sendWhatsApp(props, d, id, when); } catch (ex) { status = "Failed: " + String(ex).slice(0, 150); }
      sheet.getRange(rowNum, HEADERS.indexOf("WhatsApp Status") + 1).setValue(status);
    }
    return out({ ok: true, id: id });
  } catch (ex) { return out({ ok: false, error: "Server error" }); }
  finally { lock.releaseLock(); }
}

function validate(d, type) {
  const need = type === "Business Owner" ? ["name","phone","email","businessName","category","location","challenge"] : ["name","email","message"];
  for (const k of need) if (!d[k] || !String(d[k]).trim()) return "Missing " + k;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return "Invalid email";
  if (d.phone && !/^\+?[0-9]{10,13}$/.test(String(d.phone).replace(/[\s-]/g, ""))) return "Invalid phone";
  if (d.consent !== "Yes") return "Consent required";
  return null;
}

function sendWhatsApp(props, d, id, when) {
  const token = props.getProperty("WA_TOKEN"), pid = props.getProperty("WA_PHONE_ID"), tpl = props.getProperty("WA_TEMPLATE");
  if (!token || !pid || !tpl) return "Not configured";
  const to = props.getProperty("WA_TO") || "919363387887";
  const vals = [id, d.name, d.phone, d.email, d.businessName, d.category, d.location, d.services, d.challenge, d.budget || "Not given", when]
    .map(v => String(v || "-").replace(/[\r\n\t]+/g, " ").slice(0, 200));
  const body = { messaging_product: "whatsapp", to: to, type: "template",
    template: { name: tpl, language: { code: "en" }, components: [{ type: "body", parameters: vals.map(v => ({ type: "text", text: v })) }] } };
  const res = UrlFetchApp.fetch("https://graph.facebook.com/v20.0/" + pid + "/messages", {
    method: "post", contentType: "application/json", headers: { Authorization: "Bearer " + token },
    payload: JSON.stringify(body), muteHttpExceptions: true });
  return res.getResponseCode() < 300 ? "Sent" : "Failed: " + res.getContentText().slice(0, 150);
}

function getSheet(id) {
  const ss = SpreadsheetApp.openById(id); const s = ss.getSheetByName("Leads") || ss.insertSheet("Leads");
  if (s.getLastRow() === 0) { s.appendRow(HEADERS); s.setFrozenRows(1); }
  return s;
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
