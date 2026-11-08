/* Spark Solutions assistant. Rule-based, runs in the browser, no API keys.
   It answers from site-config.js, services.js, offers.js and skills.js, so it updates when you edit them.
   Anything it can't answer is redirected to WhatsApp or Instagram. */
(function () {
  const S = window.SITE;
  const SV = (window.SERVICES || []).filter((s) => s.enabled);
  const SK = (window.SKILLS || []).filter((g) => g.enabled);
  const today = new Date().toISOString().slice(0, 10);
  const liveOffers = () => (window.OFFERS || []).filter((o) => o.active && o.start <= today && today <= o.expiry);
  const wa = (t) => `https://wa.me/${S.whatsappNumber}?text=${encodeURIComponent(t)}`;
  const LINK = {
    wa: () => ({ label: "Chat on WhatsApp", href: wa("Hi Spark Solutions, I have a question.") }),
    ig: () => ({ label: "Instagram", href: S.instagram }),
    call: () => ({ label: "Call " + S.phone, href: "tel:+91" + S.phone }),
    mail: () => ({ label: S.email, href: "mailto:" + S.email }),
    form: () => ({ label: "Open enquiry form", href: "#contact" }),
    book: () => ({ label: "Book a 1-hour call", href: wa("Hi Spark Solutions, I'd like to book the 1-hour consultation call.") })
  };

  const FAQ = [
    { k: ["hi", "hello", "hey", "hii", "vanakkam", "good morning", "good evening"], r: () => ({ t: "Hi! I'm the Spark Solutions assistant. Ask me about our services, offers, how to book a call, or how to use this website." }) },
    { k: ["thanks", "thank you", "bye", "ok thanks"], r: () => ({ t: "You're welcome! Reach out any time." }) },
    { k: ["about", "who are you", "what is spark", "spark solutions", "company", "agency", "mission", "vision", "what do you do"],
      r: () => ({ t: "Spark Solutions is a growth-focused digital agency for startups, small businesses, D2C brands and established companies. Our mission is to identify business challenges, develop effective strategies and turn opportunities into business growth. " + S.tagline, l: [LINK.form()] }) },
    { k: ["services", "service", "offer you", "provide", "help with", "what can you do", "do you do"],
      r: () => ({ t: "We offer: " + SV.map((s) => s.title).join(", ") + ". Ask me about any of them for details.", l: [{ label: "See services", href: "#services" }] }) },
    { k: ["offer", "offers", "discount", "deal", "promotion", "999"],
      r: () => { const o = liveOffers(); return o.length ? { t: o.map((x) => `${x.title}: ${x.discountedPrice === 0 ? "Free" : x.currency + x.discountedPrice} (was ${x.currency}${x.originalPrice}), valid until ${x.expiry}.`).join(" "), l: o.map((x) => ({ label: x.ctaText, href: x.ctaLink })) } : { t: "There's no active offer right now. Follow our Instagram for updates.", l: [LINK.ig()] }; } },
    { k: ["price", "pricing", "cost", "how much", "quote", "package", "packages", "budget", "charges", "fees", "rate", "rates"],
      r: () => { const o = liveOffers()[0]; return { t: (o ? `Our current offer: ${o.title} for ${o.currency}${o.discountedPrice}. ` : "") + "For project pricing, message us on WhatsApp and we'll discuss what you need.", l: [LINK.wa()] }; } },
    { k: ["book", "booking", "call", "consult", "consultation", "appointment", "meeting", "slot", "schedule"],
      r: () => ({ t: "You can book a 1-hour consultation call. The button opens WhatsApp with a message ready; press Send and we'll agree a time with you. You can also send an enquiry through the form.", l: [LINK.book(), LINK.form()] }) },
    { k: ["contact", "phone", "number", "email", "mail", "reach", "whatsapp", "instagram", "linkedin", "facebook", "social"],
      r: () => ({ t: `You can reach us on WhatsApp or phone at +91 ${S.phone}, or email ${S.email}.`, l: [LINK.wa(), LINK.call(), LINK.mail(), LINK.ig()] }) },
    { k: ["process", "how do you work", "steps", "approach", "how it works"],
      r: () => ({ t: "Our process has four steps: Discover (understand the business), Analyse (find challenges and opportunities), Strategise (build a customised growth plan) and Execute (implement, measure and improve)." }) },
    { k: ["portfolio", "projects", "project", "examples", "our work", "past work"],
      r: () => ({ t: "You can see our projects in the Our work section of this page.", l: [{ label: "See our work", href: "#work" }] }) },
    { k: ["tools", "skills", "languages", "technology", "tech", "stack", "toolkit", "software"],
      r: () => ({ t: SK.length ? "Our toolkit: " + SK.map((g) => `${g.group}: ${g.items.join(", ")}`).join(". ") + "." : "Ask us on WhatsApp about the tools we use.", l: SK.length ? [] : [LINK.wa()] }) },
    { k: ["form", "enquiry", "enquire", "inquiry", "business owner", "exploring", "submit", "how to use", "website", "site", "consent", "send message"],
      r: () => ({ t: "On the contact form, choose \"I am a Business Owner\" for a full enquiry (name, WhatsApp number, email, business details, services and your challenge), or \"I am Exploring\" for a quick message. Tick the consent box and send. You'll see an enquiry ID when it goes through.", l: [LINK.form()] }) }
  ];

  const norm = (s) => " " + s.toLowerCase().replace(/[^a-z0-9₹\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
  const has = (text, kw) => text.includes(" " + kw + " ") || text.includes(" " + kw + "s ");

  function answer(q) {
    const t = norm(q);
    // 1. a specific service named in the question
    let best = [], max = 0;
    SV.forEach((s) => {
      const hits = s.title.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2 && w !== "and").filter((w) => has(t, w)).length;
      if (hits > max) { max = hits; best = [s]; } else if (hits && hits === max) best.push(s);
    });
    const generic = FAQ.some((f) => ["book", "price", "contact"].some(() => false));
    if (max && best.length <= 2 && !/\b(book|price|cost|how much|call)\b/.test(q.toLowerCase()))
      return { t: best.map((s) => `${s.title}: ${s.description} Includes ${(s.points || []).join(", ").toLowerCase()}.`).join(" "), l: [LINK.form()] };
    // 2. FAQ by keyword score
    let top = null, score = 0;
    FAQ.forEach((f) => { const sc = f.k.reduce((n, kw) => n + (has(t, kw) ? kw.split(" ").length : 0), 0); if (sc > score) { score = sc; top = f; } });
    if (top) return top.r();
    // 3. redirect
    return { t: "I can only answer questions about Spark Solutions and this website. For anything else, please message us directly and our team will help.",
      l: [{ label: "Ask on WhatsApp", href: wa("Hi Spark Solutions, I have a question: " + q.slice(0, 200)) }, LINK.ig()] };
  }

  // ---- UI ----
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
  const fab = el("button", "cb-fab", "💬 Ask Spark"); fab.setAttribute("aria-label", "Open chat assistant"); fab.setAttribute("aria-expanded", "false");
  const box = el("section", "cb-box"); box.hidden = true; box.setAttribute("aria-label", "Spark Solutions assistant");
  const head = el("div", "cb-head"); head.append(el("strong", "", "Spark Solutions assistant"));
  const close = el("button", "cb-x", "✕"); close.setAttribute("aria-label", "Close chat"); head.append(close);
  const log = el("div", "cb-log"); log.setAttribute("role", "log"); log.setAttribute("aria-live", "polite");
  const chips = el("div", "cb-chips");
  ["What services do you offer?", "Current offer", "Book a 1-hour call", "How do I enquire?", "Contact details"].forEach((c) => { const b = el("button", "", c); b.type = "button"; b.addEventListener("click", () => ask(c)); chips.append(b); });
  const form = el("form", "cb-form"); const inp = el("input"); inp.type = "text"; inp.maxLength = 300; inp.placeholder = "Type your question…"; inp.setAttribute("aria-label", "Your question"); inp.autocomplete = "off";
  const send = el("button", "", "Send"); send.type = "submit"; form.append(inp, send);
  box.append(head, log, chips, form); document.body.append(fab, box);

  function say(who, text, links) {
    const m = el("div", "cb-msg " + who); m.append(el("p", "", text));
    (links || []).forEach((l) => { const a = el("a", "cb-link", l.label); a.href = l.href;
      if (/^https?:/.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; } else a.addEventListener("click", () => toggle(false));
      m.append(a); });
    log.append(m); log.scrollTop = log.scrollHeight;
  }
  function ask(q) {
    q = q.trim(); if (!q) return; say("user", q); inp.value = "";
    setTimeout(() => { const a = answer(q); say("bot", a.t, a.l); }, 350);
  }
  let greeted = false;
  function toggle(open) {
    box.hidden = !open; fab.hidden = open; fab.setAttribute("aria-expanded", open);
    if (open) { if (!greeted) { greeted = true; say("bot", "Hi! I'm the Spark Solutions assistant. I can tell you about our services, offers and booking, or help with this website. What would you like to know?"); } inp.focus(); }
    else fab.focus();
  }
  fab.addEventListener("click", () => toggle(true)); close.addEventListener("click", () => toggle(false));
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(inp.value); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) toggle(false); });
})();
