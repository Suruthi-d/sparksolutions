# Spark Solutions Website

## Updating content (via GitHub: open file > pencil icon > edit > Commit)
Keep quotes `"` and commas `,` intact. A GitHub Pages rebuild takes about a minute.
- `js/site-config.js` brand, email, social links, WhatsApp number, SEO, and the Apps Script `endpoint`.
- `js/services.js` copy a `{...}` block to add; delete it to remove; move it to reorder; `enabled:false` to hide.
- `js/offers.js` dates are `YYYY-MM-DD`. Shown only if `active:true` and today is between start and expiry. No live offers = ticker and section hide. `ticker` is the scrolling text.
- `js/projects.js` add real projects; set `example:false`.

## Setup
1. **GitHub**: create a repo, upload all files (not `backend/` secrets; there are none), Settings > Pages > Deploy from branch `main` / root.
2. **Google Sheet**: create a blank sheet, copy its ID from the URL (`/d/<ID>/edit`). The script creates the `Leads` tab and headers.
3. **Apps Script**: Extensions > Apps Script, paste `backend/Code.gs`. Project Settings > Script Properties: add `SHEET_ID`, `WA_TO` = `919363387887`.
4. **Deploy**: Deploy > New deployment > Web app > Execute as *Me*, access *Anyone*. Copy the `/exec` URL into `endpoint` in `js/site-config.js`. Re-deploy a *new version* after every script change.
5. **WhatsApp Cloud API** (optional): in Meta for Developers create a WhatsApp app, get the Phone Number ID and a permanent token, create and get approved a template with 11 body variables (ID, name, phone, email, business, category, location, services, challenge, budget, time) laid out like the required message. Add `WA_TOKEN`, `WA_PHONE_ID`, `WA_TEMPLATE` to Script Properties. Until then, "WhatsApp Status" in the sheet says "Not configured". Don't treat notifications as working until you've tested one end to end.
6. **Fallback**: the site's WhatsApp buttons use click-to-chat links with pre-filled text. The visitor, not the site, must press Send.

## Testing checklist
- [ ] Site loads on GitHub Pages and on mobile
- [ ] Ticker scrolls, pauses on hover, links to the offer; hides when offers are expired
- [ ] Edit `services.js`; change appears
- [ ] Empty/invalid form is blocked; honeypot and consent work
- [ ] Business Owner submit: new sheet row, ID shown, WhatsApp Status filled
- [ ] Exploring submit: row saved, no WhatsApp
- [ ] Break WhatsApp token: lead still saved, status "Failed"
- [ ] Double submit is rejected
