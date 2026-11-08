(function () {
  const S = window.SITE, $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  document.title = S.seo.title;
  $('meta[name="description"]').content = S.seo.description;
  document.querySelectorAll("[data-brand]").forEach((e) => (e.textContent = S.brand));
  document.querySelectorAll("[data-tagline]").forEach((e) => (e.textContent = S.tagline));
  const wa = (msg) => `https://wa.me/${S.whatsappNumber}?text=${encodeURIComponent(msg || "Hi Spark Solutions, I'd like to book a 1-hour consultation call.")}`;
  document.querySelectorAll("[data-wa]").forEach((e) => (e.href = wa()));
  $("#ig").href = S.instagram; $("#li").href = S.linkedin; $("#mail").href = "mailto:" + S.email; $("#mail").textContent = S.email; $("#fb").href = S.facebook; $("#tel").href = "tel:+91" + S.phone; $("#tel").textContent = "+91 " + S.phone;
  $("#year").textContent = new Date().getFullYear();

  const live0 = window.SERVICES.filter((s) => s.enabled);
  $("#services-grid").innerHTML = live0.map((s, i) =>
    `<article class="svc rv"><div class="num">0${i + 1}</div><div class="ico" aria-hidden="true">${esc(s.icon)}</div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p><ul>${(s.points || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul><a href="#contact">Explore service →</a></article>`).join("");
  $("#svc-checks").innerHTML = live0.map((s) => `<label><input type="checkbox" name="services" value="${esc(s.title)}"> ${esc(s.title)}</label>`).join("");
  $("#footer-services").innerHTML = live0.map((s) => `<a href="#services">${esc(s.title)}</a>`).join("");

  $("#skills-grid").innerHTML = (window.SKILLS || []).filter((g) => g.enabled).map((g) =>
    `<div class="kit-row rv"><h3>${esc(g.group)}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");

  $("#projects-grid").innerHTML = window.PROJECTS.map((p) =>
    `<article class="pf rv"><div class="vis">${p.image ? `<img loading="lazy" src="${esc(p.image)}" alt="${esc(p.title)}">` : esc(p.category || "Project")}</div><span class="muted">${esc(p.category)}${p.example ? " · Example" : ""}</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.link ? `<a href="${esc(p.link)}" rel="noopener">View project →</a>` : ""}</article>`).join("");

  const today = new Date().toISOString().slice(0, 10);
  const live = window.OFFERS.filter((o) => o.active && o.start <= today && today <= o.expiry);
  if (live.length) {
    $("#offers").hidden = false;
    $("#offers-grid").innerHTML = live.map((o) =>
      `<article class="offer rv" id="offer-${esc(o.id)}"><span class="badge">Limited time</span>${o.image ? `<img loading="lazy" src="${esc(o.image)}" alt="">` : ""}<h3 style="margin-top:1rem">${esc(o.title)}</h3><p>${esc(o.description)}</p><p class="price"><s>${esc(o.currency)}${esc(o.originalPrice)}</s> <strong>${o.discountedPrice === 0 ? "Free" : esc(o.currency) + esc(o.discountedPrice)}</strong></p><p class="muted">Valid until ${esc(o.expiry)}</p><a class="btn" href="${esc(o.ctaLink)}"${/^https?:/.test(o.ctaLink) ? ' target="_blank" rel="noopener"' : ""}>${esc(o.ctaText)}</a></article>`).join("");
    const items = live.map((o) => { const [a, ...r] = String(o.ticker || o.title).split("|"); return `<a href="#offer-${esc(o.id)}"><span class="hl">${esc(a.trim())}</span>${r.length ? " | " + esc(r.join("|").trim()) : ""}</a>`; }).join("");
    const t = $("#ticker"); t.hidden = false;
    t.querySelector(".track").innerHTML = `<div class="set">${items}</div><div class="set" aria-hidden="true">${items}</div>`;
  } else { $("#offers").hidden = true; $("#ticker").hidden = true; }

  const hd = $("#top"); const sc = () => hd.classList.toggle("scrolled", window.scrollY > 10); sc(); addEventListener("scroll", sc, { passive: true });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
  } else document.querySelectorAll(".rv").forEach((el) => el.classList.add("in"));

  const nav = $("#nav"), mb = $("#menu-btn");
  const closeMenu = () => { nav.classList.remove("open"); document.body.classList.remove("menu-open"); mb.setAttribute("aria-expanded", "false"); mb.textContent = "☰"; };
  mb.addEventListener("click", () => { const o = nav.classList.toggle("open"); document.body.classList.toggle("menu-open", o); mb.setAttribute("aria-expanded", o); mb.textContent = o ? "✕" : "☰"; });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  addEventListener("resize", () => innerWidth > 900 && closeMenu());
  document.querySelectorAll("[data-call]").forEach((e) => (e.href = "tel:+91" + S.phone));
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => document.body.classList.toggle("at-contact", es[0].isIntersecting), { threshold: 0.15 }).observe($("#contact"));
})();
