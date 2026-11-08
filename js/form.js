(function () {
  const form = document.getElementById("lead-form"), status = document.getElementById("form-status");
  const btn = form.querySelector("button[type=submit]");
  const owner = form.querySelectorAll(".owner-only"), explore = form.querySelectorAll(".explore-only");
  function sync() {
    const o = form.enquiryType.value === "Business Owner";
    owner.forEach((e) => { e.hidden = !o; e.querySelectorAll("input,select,textarea").forEach((i) => (i.disabled = !o)); });
    explore.forEach((e) => { e.hidden = o; e.querySelectorAll("input,select,textarea").forEach((i) => (i.disabled = o)); });
  }
  form.querySelectorAll("[name=enquiryType]").forEach((r) => r.addEventListener("change", sync)); sync();

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const phoneOk = (v) => /^\+?[0-9]{10,13}$/.test(v.replace(/[\s-]/g, ""));
  const say = (m, ok) => { status.textContent = m; status.className = ok ? "ok" : "err"; status.scrollIntoView({ block: "center", behavior: "smooth" }); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.website.value) return;                       // honeypot
    const d = Object.fromEntries(new FormData(form).entries()); // disabled fields are skipped
    d.services = [...form.querySelectorAll("[name=services]:checked")].map((c) => c.value).join(", ");
    const isOwner = d.enquiryType === "Business Owner";
    const need = isOwner ? ["name", "phone", "email", "businessName", "category", "location", "challenge"] : ["name", "email", "message"];
    for (const k of need) if (!String(d[k] || "").trim()) return say("Please fill in all required fields.", false);
    if (!emailOk(d.email)) return say("Enter a valid email address.", false);
    if (d.phone && !phoneOk(d.phone)) return say("Enter a valid phone number (10–13 digits).", false);
    if (isOwner && !d.services) return say("Select at least one service.", false);
    if (!form.consent.checked) return say("Tick the consent box so we can contact you.", false);
    if (!window.SITE.endpoint) return say("Form is not connected yet. Add the Apps Script URL in js/site-config.js.", false);
    const key = JSON.stringify([d.email, d.message || d.challenge]);
    if (sessionStorage.getItem("last") === key) return say("This enquiry was already sent.", false);

    btn.disabled = true; say("Sending…", true);
    try {
      d.consent = "Yes"; d.token = crypto.randomUUID();
      // text/plain avoids a CORS preflight, which Apps Script cannot answer
      const r = await fetch(window.SITE.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(d) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Server error");
      sessionStorage.setItem("last", key);
      form.reset(); sync(); say(`Thanks! Your enquiry ID is ${j.id}. We'll be in touch soon.`, true);
    } catch (err) { say("Could not send. Try again or message us on WhatsApp.", false); }
    btn.disabled = false;
  });
})();
