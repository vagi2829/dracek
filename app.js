/* Modern template interactions (no libraries) */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

/* Year */
$("#year").textContent = new Date().getFullYear();

/* Hero photoshow (crossfade + slow zoom) */
// Lokální fotky (složka /img)
// Pozn.: používáme STEJNÉ názvy a VELKÁ písmena, aby se to nechovalo jinak lokálně vs. na hostingu.
const heroImgs = [
  "img/HERO_KOLAZ.png",
  "img/HERO_KOLAZ_1.png",
  "img/HERO_KOLAZ_2.png",
  "img/HERO_KOLAZ_3.png",
];

// Jemné ořezy pro každý obrázek (x y). 0% 0% = levý horní roh, 100% 100% = pravý dolní.
// První (drak) posouváme níž (méně oblohy) a lehce doleva, aby byl drak vlevo a stavby vpravo.
const heroPos = [
  "28% 55%", // HERO_KOLAZ (drak) - posun nahoru pro viditelnou hlavu
  "50% 65%", // HERO_KOLAZ_1
  "55% 60%", // HERO_KOLAZ_2
  "55% 55%", // HERO_KOLAZ_3
];
const bgA = $("#heroBgA");
const bgB = $("#heroBgB");
let bgIdx = 0;
let bgOnA = true;

function setBg(el, url, pos){
  if(!el) return;
  el.style.backgroundImage = `url('${url}')`;
  if(pos) el.style.backgroundPosition = pos;
}

function cycleBg(){
  if(!bgA || !bgB) return;
  const next = heroImgs[bgIdx % heroImgs.length];
  const pos = heroPos[bgIdx % heroPos.length] || "50% 50%";
  const a = bgOnA ? bgA : bgB;
  const b = bgOnA ? bgB : bgA;

  setBg(b, next, pos);
  b.classList.add("is-on");
  a.classList.remove("is-on");

  bgOnA = !bgOnA;
  bgIdx++;
}

(function initBg(){
  if(!bgA || !bgB) return;
  setBg(bgA, heroImgs[0], heroPos[0]);
  bgA.classList.add("is-on");
  bgIdx = 1;
  setInterval(cycleBg, 5200);
})();


/* Smooth scroll */
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", (e)=>{
    const id = a.getAttribute("href");
    if(!id || id === "#") return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    target.scrollIntoView({behavior:"smooth", block:"start"});
    closeDrawer();
  });
});

/* Drawer */
const drawer = $("#drawer");
const hamburger = $("#hamburger");
const closeDrawerBtn = $("#closeDrawer");

function openDrawer(){
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeDrawer(){
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
hamburger?.addEventListener("click", openDrawer);
closeDrawerBtn?.addEventListener("click", closeDrawer);
drawer?.addEventListener("click", (e)=>{
  if(e.target === drawer) closeDrawer();
});

/* Reveal on scroll (repeat up & down) */
const revealEls = $$(".reveal");
const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    const el = ent.target;
    const delay = Number(el.dataset.delay || 0);

    if(ent.isIntersecting){
      clearTimeout(el.__revealTO);
      el.__revealTO = setTimeout(()=>{
        el.classList.add("is-in");
        if(el.classList.contains("wipe")) el.classList.add("is-wipe");
      }, delay);
    } else {
      clearTimeout(el.__revealTO);
      el.classList.remove("is-in");
      el.classList.remove("is-wipe");
    }
  });
},{threshold:0.12, rootMargin:"0px 0px -10% 0px"});

revealEls.forEach(el=> io.observe(el));

/* Animated counters */
function animateCounter(el){
  const end = Number(el.dataset.counter || "0");
  const start = 0;
  const dur = 1000 + Math.min(end, 200) * 8;
  const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t - t0)/dur);
    // easeOutCubic
    const eased = 1 - Math.pow(1-p, 3);
    const val = Math.round(start + (end-start)*eased);
    el.textContent = val.toLocaleString("cs-CZ");
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statNums = $$(".stat__num");
const statIO = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){
      animateCounter(ent.target);
      statIO.unobserve(ent.target);
    }
  })
},{threshold:0.45});
statNums.forEach(el=> statIO.observe(el));


/* Tile countups (01,02,03...) */
function pad2(n){ return String(n).padStart(2,"0"); }

function animatePadCounter(el){
  const end = Number(el.dataset.countup || "0");
  const dur = 650 + end * 120;
  const t0 = performance.now();
  function tick(t){
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1-p, 3);
    const val = Math.max(0, Math.round(end * eased));
    el.textContent = pad2(val);
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countupEls = $$("[data-countup]");
const countupIO = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    if(ent.isIntersecting){
      animatePadCounter(ent.target);
      countupIO.unobserve(ent.target);
    }
  });
},{threshold:0.55});
countupEls.forEach(el=> countupIO.observe(el));


/* Parallax tilt on hero card */
const tilt = $("#parallaxCard");
let tiltRect = null;
function updateTiltRect(){ tiltRect = tilt?.getBoundingClientRect() || null; }
window.addEventListener("resize", updateTiltRect, {passive:true});
updateTiltRect();

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

tilt?.addEventListener("mousemove", (e)=>{
  if(!tiltRect) return;
  const x = (e.clientX - tiltRect.left) / tiltRect.width;
  const y = (e.clientY - tiltRect.top) / tiltRect.height;
  const rx = clamp((0.5 - y) * 10, -10, 10);
  const ry = clamp((x - 0.5) * 12, -12, 12);
  tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
});
tilt?.addEventListener("mouseleave", ()=>{
  tilt.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
});

/* Modal */
const modal = $("#modal");
const modalClose = $("#modalClose");
const modalTitle = $("#modalTitle");
const modalKicker = $("#modalKicker");
const modalBody = $("#modalBody");

function openModal({title, kicker="Detail", bodyHTML=""}){
  modalTitle.textContent = title || "Detail";
  modalKicker.textContent = kicker;
  modalBody.innerHTML = bodyHTML;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e)=>{
  const close = e.target?.dataset?.close;
  if(close) closeModal();
});
window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

/* Quick inquiry buttons */
function quickInquiry(){
  openModal({
    title: "Rychlá poptávka",
    kicker: "Kontakt během 30 sekund",
    bodyHTML: `
      <div class="grid2">
        <div class="kv">
          <div class="kv__row"><span class="kv__k">Služba</span><span class="kv__v">Stavby / Reality / Pronájmy</span></div>
          <div class="kv__row"><span class="kv__k">Doba odpovědi</span><span class="kv__v">do 24 hodin</span></div>
          <div class="kv__row"><span class="kv__k">Forma</span><span class="kv__v">telefon / e-mail</span></div>
          <div class="note">Tip: klikni na <b>Chci nabídku</b> a skočíš dolů na formulář.</div>
        </div>
        <div class="bigimg" style="background-image:url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1400&q=70')"></div>
      </div>
    `
  });
}
$("#openQuick")?.addEventListener("click", quickInquiry);
$("#openQuick2")?.addEventListener("click", quickInquiry);


/* Service modal */
$$("[data-modal='service']").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const title = btn.dataset.title || "Služba";

    if(title === "Stavební realizace"){
      openModal({
        title,
        kicker: "Služba",
        bodyHTML: `
          <div class="grid2">
            <div class="bigimg bigimg--dark" style="background-image:url('img/STAVEBNI_REALIZACE.jpg')"></div>
            <div class="kv">
              <div class="note" style="font-size:15px; line-height:1.7">
                <p><strong>Na trhu jsme již od roku 1991, máme 35 let zkušeností v oboru.</strong></p>

                <p>Připravíme Vám cenovou nabídku a po jejím schválení společně uzavřeme smlouvu o dílo.
                V domluveném termínu budeme pracovat a následně i dokončíme Vaši zakázku.</p>

                <p>Zajistíme Vám vypracování projektu, vyřízení stavebního povolení,
                kolaudace, kompletní servis DOTACE NZU.</p>

                <p>Oběháme za Vás úřady a zajistíme Vám vydání stavebního povolení i kolaudace.</p>
              </div>
            </div>
          </div>
        `
      });
      return;
    }

    if(title === "Reality"){
      openModal({
        title,
        kicker: "Služba",
        bodyHTML: `
          <div class="grid2">
            <div class="bigimg bigimg--dark" style="background-image:url('img/REALITNI_SLUZB.png')"></div>
            <div class="kv">
              <div class="note" style="font-size:15px; line-height:1.7">
                <p><strong>Realitní servis zajišťuje Bc. Alena Quast - Realitní makléřka.</strong></p>

                <p>Makléřkou jsem od roku 2013 a mám mnoho zkušeností, svět realit dobře znám.
                Provizi za služby nehradíte předem, ale až ze složené Kupní ceny.
                Nabízím Vám příznivé ceny za svoje služby.</p>

                <p><strong>Zajistím Vám kompletní servis při prodeji nebo pronájmu Vaší nemovitosti, zejména:</strong></p>

                <ul>
                  <li>konzultaci k prodeji/pronájmu nemovitosti - tržní ocenění ZDARMA</li>
                  <li>profesionální prezentaci nemovitosti - fotografie, video prohlídku, 2D a 3D modelace</li>
                  <li>inzerci největší realitní inzertní Mega servery v ČR</li>
                  <li>reklamu na Facebooku</li>
                  <li>prohlídky nemovitosti, komunikace se zájemci, pomoc zájemcům s financováním Kupní ceny</li>
                  <li>kompletní právní servis u ověřených Realitních právníků</li>
                  <li>Bankovní úschovu Kupní ceny (pokud nechcete advokátní úschovu)</li>
                </ul>

                <p>a další potřebný servis tak, aby byla realitní transakce úspěšně dokončena.</p>

                <p>Jsem Vám k dispozici každý všední den i o víkendech, abyste byli spokojeni.</p>
              </div>
            </div>
          </div>
        `
      });
      return;
    }


    

    if(title === "Financování"){
      openModal({
        title,
        kicker: "Služba",
        bodyHTML: `

          <div class="grid2">
            <div class="bigimg bigimg--dark" style="background-image:url('img/financovani.jpg'); background-position:center 55%;"></div>
            <div class="kv">
              <div class="note" style="font-size:15px; line-height:1.7; max-height:520px; overflow:auto; padding-right:8px;">
                <p><strong>Zajistím Vám nový hypoteční úvěr nebo refinancování stávající hypotéky za nejlepších podmínek na trhu.</strong>
                Moje služby jsou pro Vás vždy <strong>ZDARMA</strong>, finančně jsem hodnocena přímo od vybrané banky.</p>

                <p><strong>BENEFITY ZDARMA:</strong></p>
                <ul>
                  <li>mohu za Vás komunikovat s Realitní kanceláří i s právníky</li>
                  <li>provedu kontrolu rezervační smlouvy</li>
                  <li>zajistím, aby byla Vaše hypotéka schválená a abyste včas složili Kupní cenu do úschovy</li>
                </ul>

                <p><strong>Zajistím Vám kompletní servis:</strong></p>
                <ul>
                  <li>ověření bonity ve vybrané bance</li>
                  <li>příprava a podání žádosti o hypoteční úvěr</li>
                  <li>kompletaci podkladů</li>
                  <li>schválení hypotečního úvěru</li>
                  <li>podpis úvěrové dokumentace</li>
                  <li>plnění podmínek čerpání + čerpání hypotečního úvěru</li>
                  <li>podání návrhu Zástavního práva do katastru nemovitostí</li>
                </ul>

                <p><strong>Zařídím Vám i hypotéku bez nemovitosti:</strong></p>
                <ul>
                  <li>hypotéku můžete mít schválenou ihned, jen doložíte bance příjem</li>
                  <li>podepíšete si úvěrovou smlouvu</li>
                  <li>v bance máte připravenou hotovost na koupi nemovitosti</li>
                  <li>neplatíte splátku ani úroky, dokud nenajdete nemovitost</li>
                  <li>jste připraveni rychle jednat o nemovitost</li>
                  <li>jste na úrovni kupce s hotovostí</li>
                  <li>můžete se ucházet o ty nejlepší nemovitosti, které jsou obvykle rychle pryč</li>
                </ul>
              </div>
            </div>
          </div>

        `
      });
      return;
    }


    if(title === "Rekonstrukce domů, bytů"){
      openModal({
        title,
        kicker: "Služba",
        bodyHTML: `
          <div class="grid2">
            <div class="bigimg bigimg--dark" style="background-image:url('img/rekonstrukce-domu-bytu.jpg'); background-position:center; background-size:cover;"></div>
            <div class="kv">
              <div class="note" style="font-size:15px; line-height:1.7; max-height:520px; overflow:auto; padding-right:6px;">
                <p><strong>Zrekonstruujeme kompletně interiér i exteriér Vašeho domu</strong>, bez ohledu na to, zda se jedná o dům zděný, panelový či dřevostavbu. Provádíme rekonstrukce bytových jader, koupelen, kuchyní, dětských pokojů, obývacích pokojů, ložnic, celých bytových jednotek, včetně půdních a sklepních prostor.</p>

                <p>Sejdeme se s Vámi a sdělíte nám Vaše požadavky na rekonstrukci. Ujasníme si práce, pomůžeme Vám s výběrem stavebních materiálů a vybavení. Zakládáme si na individuálním přístupu ke všem zákazníkům. <strong>Zaměření, konzultace a cenová kalkulace je u nás ZDARMA.</strong></p>

                <h3 style="margin:14px 0 6px; font-size:16px;">Interiér</h3>
                <p>V rámci interiérové rekonstrukce domu jsme schopni provést veškeré zednické, sádrokartonářské práce, stavební práce v oborech voda, topení, plyn, kompletní elektroinstalace, podlahářské práce, natěračské a malířské práce, výrobu a montáž nábytku.</p>

                <h3 style="margin:14px 0 6px; font-size:16px;">Exteriér</h3>
                <p>V rámci exteriérových prací dokážeme zrealizovat zateplení, izolaci, novou fasádu, výměnu oken, dveří, střechy, včetně zámkových dlažeb a terénních úprav kolem domu.</p>
              </div>
            </div>
          </div>
        `
      });
      return;
    }


openModal({
      title,
      kicker: "Služba",
      bodyHTML: `
        <div class="grid2">
          <div class="bigimg bigimg--dark" style="background-image:url('img/STAVEBNI_REALIZACE.jpg')"></div>
          <div class="kv">
            <div class="note">Obsah služby bude doplněn.</div>
          </div>
        </div>
      `
    });
  });
});
/* Gallery / Detail buttons on hero card */
$("#openGallery")?.addEventListener("click", ()=>{
  openModal({
    title:"Galerie (demo)",
    kicker:"Vizualizace",
    bodyHTML: `
      <div class="grid2">
        <div class="bigimg" style="background-image:url('https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=70')"></div>
        <div class="bigimg" style="background-image:url('https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70')"></div>
      </div>
      <div class="note">Pro „opravdovou“ galerii sem můžeš přidat slider nebo lightbox.</div>
    `
  });
});
$("#openDetail")?.addEventListener("click", ()=>{
  openModal({
    title:"Rezidence Šarlat",
    kicker:"Projekt",
    bodyHTML: listingDetailHTML({
      title:"Rezidence Šarlat",
      location:"Praha • okraj",
      price:"od 4 990 000 Kč",
      type:"Rodinný dům",
      tag:"novostavba",
      img:"https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=70",
      area:"124 m²",
      rooms:"4+kk",
      status:"k dispozici"
    })
  });
});

/* Listings data */
const listings = [
  { id:"l1", title:"Rodinný dům 4+kk", location:"Praha 9 • Újezd nad Lesy", price:"8 490 000 Kč", type:"prodej", tag:"novostavba", area:"138 m²", rooms:"4+kk", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=70" },
  { id:"l2", title:"Byt 2+kk s terasou", location:"Brno • Žabovřesky", price:"22 900 Kč / měs.", type:"pronajem", tag:"pronajem", area:"58 m²", rooms:"2+kk", status:"volné od 1. 3.",
    img:"https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70" },
  { id:"l3", title:"Loft po rekonstrukci", location:"Ostrava • Poruba", price:"5 990 000 Kč", type:"prodej", tag:"prodej", area:"92 m²", rooms:"3+kk", status:"rezervace",
    img:"https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=70" },
  { id:"l4", title:"Novostavba 5+kk", location:"Zlín • Kudlov", price:"9 990 000 Kč", type:"prodej", tag:"novostavba", area:"164 m²", rooms:"5+kk", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1572120360610-d971b9b78825?auto=format&fit=crop&w=1400&q=70" },
  { id:"l5", title:"Byt 1+kk (modern)", location:"Praha 7 • Letná", price:"18 500 Kč / měs.", type:"pronajem", tag:"pronajem", area:"34 m²", rooms:"1+kk", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70" },
  { id:"l6", title:"Dům se zahradou", location:"Plzeň • Bory", price:"7 750 000 Kč", type:"prodej", tag:"prodej", area:"121 m²", rooms:"4+1", status:"k dispozici",
    img:"https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=70" },
];

function listingCardHTML(item){
  return `
  <article class="listing reveal" data-reveal="up" data-id="${item.id}" tabindex="0" role="button" aria-label="Otevřít ${item.title}">
    <div class="listing__img" style="background-image:url('${item.img}')"></div>
    <div class="listing__body">
      <div class="listing__title">${item.title}</div>
      <div class="listing__sub">${item.location} • <b>${item.price}</b></div>
      <div class="listing__row">
        <span class="pillmini">${item.area}</span>
        <span class="pillmini">${item.rooms}</span>
        <span class="pillmini">${item.status}</span>
      </div>
    </div>
  </article>`;
}

function listingDetailHTML(item){
  return `
    <div class="grid2">
      <div class="bigimg" style="background-image:url('${item.img}')"></div>
      <div class="kv">
        <div class="kv__row"><span class="kv__k">Lokalita</span><span class="kv__v">${item.location}</span></div>
        <div class="kv__row"><span class="kv__k">Cena</span><span class="kv__v">${item.price}</span></div>
        <div class="kv__row"><span class="kv__k">Plocha</span><span class="kv__v">${item.area}</span></div>
        <div class="kv__row"><span class="kv__k">Dispozice</span><span class="kv__v">${item.rooms}</span></div>
        <div class="kv__row"><span class="kv__k">Stav</span><span class="kv__v">${item.status}</span></div>
        <div class="note">Tip: přidej napojení na backend (API) a vykrm to reálnými daty.</div>
      </div>
    </div>
  `;
}

/* Render listings + filter */
const listingsEl = $("#listings");
let currentFilter = "all";

function randomizeListingReveal(el, i){
  const modes = ["fly-left","pop","fly-right"];
  if(!el.dataset.reveal) el.dataset.reveal = modes[i % modes.length];
  if(!el.dataset.delay) el.dataset.delay = String(60 * (i % 6));
  el.classList.add("wipe");
}

function renderListings(){
  const filtered = listings.filter(it=>{
    if(currentFilter === "all") return true;
    if(currentFilter === "novostavba") return it.tag === "novostavba";
    return it.type === currentFilter || it.tag === currentFilter;
  });

  listingsEl.innerHTML = filtered.map(listingCardHTML).join("");

  // observe reveals for new elements
  $$(".listing.reveal", listingsEl).forEach((el,i)=>{ randomizeListingReveal(el,i); io.observe(el); });

  // click handlers
  $$(".listing", listingsEl).forEach(card=>{
    const open = ()=>{
      const id = card.dataset.id;
      const item = listings.find(x=>x.id === id);
      if(!item) return;
      openModal({title:item.title, kicker:"Nabídka", bodyHTML: listingDetailHTML(item)});
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault(); open();
      }
    });
  });
}
renderListings();

$$(".chipbtn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".chipbtn").forEach(b=> b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter || "all";
    animateOutAndRerender();
    toast(`Filtr: ${btn.textContent.trim()}`);
  });
});

/* Projects -> open modal */

const serviceData = [
  {
    title:"Stavební realizace",
    kicker:"Služba • stavební realizace",
    img:"img/STAVEBNI_REALIZACE.jpg",
    text:`<div class="service-text">
<p>Nabízíme Vám profesionální a kompletní servis při provádění stavebních prací.</p>
<p>Na trhu jsme již od roku <strong>1991</strong>, máme <strong>35 let zkušeností</strong> v oboru.</p>
<p>Připravíme Vám cenovou nabídku a po jejím schválení společně uzavřeme smlouvu o dílo.<br>V domluveném termínu budeme pracovat a následně i dokončíme Vaši zakázku.</p>
<p>Zajistíme Vám vypracování projektu, vyřízení stavebního povolení, kolaudace, kompletní servis <strong>DOTACE NZÚ</strong>.</p>
<p>Oběháme za Vás úřady a zajistíme Vám vydání stavebního povolení a kolaudace.</p>
</div>`
  },
  {
    title:"Reality",
    kicker:"Služba • realitní servis",
    img:"img/REALITNI_SLUZB.png",
    text:"<div class=\"service-text\"><p>Realitní servis zajišťuje <strong>Bc. Alena Quast</strong> - Realitní makléřka. Makléřkou jsem od roku <strong>2013</strong> a mám mnoho zkušeností, svět realit dobře znám. Provizi za služby nehradíte předem, ale až ze složené Kupní ceny. Nabízím Vám příznivé ceny za svoje služby.</p><p>Zajistím Vám kompletní servis při prodeji nebo pronájmu Vaší nemovitosti, zejména:</p><ul><li>konzultaci k prodeji/pronájmu nemovitosti – tržní ocenění <strong>ZDARMA</strong></li><li>profesionální prezentaci nemovitosti – fotografie, video prohlídku, 2D a 3D modelace</li><li>inzerci na největších realitních mega serverech v ČR</li><li>reklamu na Facebooku</li><li>prohlídky nemovitosti, komunikaci se zájemci, pomoc zájemcům s financováním Kupní ceny</li><li>kompletní právní servis u ověřených realitních právníků</li><li>zajištění bankovní úschovy Kupní ceny, pokud nechcete advokátní úschovu</li></ul><p>A další potřebný servis tak, aby byla realitní transakce úspěšně dokončena.</p><p>Jsem Vám k dispozici každý všední den i o víkendech, abyste byli spokojeni.</p></div>"
  },
  {
    title:"Financování",
    
    model: "Analýza → Nabídky → Schválení",
    vyber: "Nejlepší podmínky",
    hodnota: "Služby zdarma",
    desc: "Zajištění hypotéky nebo refinancování s kompletním servisem.",
    kicker:"Služba • hypoteční poradenství",
    img:"img/financovani.jpg",
    text:"<div class=\"service-text\"><p>Financování výstavby a koupě nemovitostí zajišťuje naše úvěrová specialistka <strong>Bc. Alena Quast</strong>.Hypoteční makléřkou jsem již od roku <strong>2013</strong> a mám mnoho zkušeností. Ve vybraných bankách spolupracuji s ověřenými bankéři na hypotečních centrech.</p><p>Zajistím Vám nový hypoteční úvěr nebo refinancování stávající hypotéky za nejlepších podmínek na trhu.Moje služby jsou pro Vás vždy <strong>ZDARMA</strong> – finančně jsem hodnocena přímo vybranou bankou.</p><h4>BENEFITY ZDARMA:</h4><ul><li>komunikace s realitní kanceláří i právníky</li><li>kontrola rezervační smlouvy</li><li>zajištění schválení hypotéky a složení Kupní ceny do úschovy</li></ul><h4>Kompletní servis:</h4><ul><li>ověření bonity ve vybrané bance</li><li>příprava a podání žádosti o hypoteční úvěr</li><li>kompletace podkladů</li><li>schválení hypotečního úvěru</li><li>podpis úvěrové dokumentace</li><li>plnění podmínek čerpání a samotné čerpání úvěru</li><li>podání návrhu zástavního práva do katastru nemovitostí</li></ul><h4>Hypotéka bez nemovitosti:</h4><ul><li>schválení ihned po doložení příjmu</li><li>podpis úvěrové smlouvy</li><li>připravená hotovost na koupi nemovitosti</li><li>neplatíte splátky ani úroky, dokud nemovitost nenajdete</li><li>možnost rychle jednat o vybrané nemovitosti</li><li>pozice kupce s hotovostí</li><li>přístup k nejlepším nemovitostem na trhu</li></ul><p><strong>Rychlá odpověď.</strong></p></div>"
  },
  {
    title:"Rekonstrukce domů, bytů",
    kicker:"Služba • rekonstrukce",
    img:"img/rekonstrukce-domu-bytu.jpg",
    text:"<div class=\"service-text\"><p>Specializujeme se na kompletní rekonstrukce domů. Proměníme od A po Z Váš interiér i exteriér. Nabízíme vysokou kvalitu prací za rozumné ceny. Proto je volba naší firmy sázkou na jistotu.</p><p>Zrekonstruujeme kompletně interiér i exteriér Vašeho domu, bez ohledu na to, zda se jedná o dům zděný, panelový či dřevostavbu. Provádíme rekonstrukce bytových jader, koupelen, kuchyní, dětských pokojů, obývacích pokojů, ložnic, celých bytových jednotek včetně půdních a sklepních prostor.</p><p>Sejdeme se s Vámi a sdělíte nám Vaše požadavky na rekonstrukci. Ujasníme si práce, pomůžeme Vám s výběrem stavebních materiálů a vybavení. Zakládáme si na individuálním přístupu ke všem zákazníkům. Zaměření, konzultace a cenová kalkulace je u nás <strong>ZDARMA</strong>.</p><h4>Interiérové práce:</h4><ul><li>zednické a sádrokartonářské práce</li><li>voda, topení, plyn</li><li>kompletní elektroinstalace</li><li>podlahářské práce</li><li>natěračské a malířské práce</li><li>výroba a montáž nábytku</li></ul><h4>Exteriérové práce:</h4><ul><li>zateplení a izolace</li><li>nová fasáda</li><li>výměna oken a dveří</li><li>střecha</li><li>zámkové dlažby a terénní úpravy</li></ul></div>"
  }
];

// Services modals
$$('[data-service]').forEach((btn)=>{
  btn.addEventListener('click', ()=>{
    const idx = Number(btn.dataset.service || '0');
    const s = serviceData[idx] || serviceData[0];

    const bodyHTML = `
      <div class="kv kv--full">
        <div class="note service-text-wrap">
          ${s.text || ''}
        </div>
      </div>
    `;

    openModal({
      kicker: s.kicker || '',
      title: s.title || 'Služba',
      bodyHTML,
      ctaText: 'Chci nabídku',
      ctaHref: '#kontakt'
    });
  });
});

const projectData = [
  {
    title:"Realizace rodinného domu",
    
    model: "Rozpočet → Design → Výstavba",
    vyber: "Rozsáhlý obsah služeb",
    hodnota: "Vysoká kvalita za rozumné ceny",
    desc: "Kompletní realizace rodinného domu od projektu po předání klíčů.",
    kicker: "",
    img:"img/REALIZACE_1.png",
    url:"",
    text:"Kompletní realizace rodinného domu od projektu po předání klíčů.",
    meta:[
      {label:"Výběr", value:"Rozsáhlý obsah služeb"},
      {label:"Hodnota", value:"Vysoká kvalita za rozumné ceny"}
    ]
  },
  {
    title:"Rekonstrukce interiéru",
    
    model: "Konzultace → Návrh → Realizace",
    vyber: "Individuální řešení",
    hodnota: "Čistá práce a detail",
    desc: "Moderní rekonstrukce interiéru od návrhu po finální předání.",
    kicker:"Rekonstrukce • modernizace prostoru",
    img:"img/REKONSTRUKCE_INETRIERU.png",
    url:"",
    text:"Rekonstrukce bytů a domů na klíč. Koupelny, kuchyně, podlahy, elektroinstalace, sádrokartony i kompletní redesign interiéru."
  },
  {
    title:"Financování",
    kicker:"Hypotéky • investice • poradenství",
    img:"img/FINANCOVANI_PROJEKTY.png",
    url:"",
    text:"<div class=\"service-text\"><p>Financování výstavby a koupě nemovitostí zajišťuje naše úvěrová specialistka <strong>Bc. Alena Quast</strong>.Hypoteční makléřkou jsem již od roku <strong>2013</strong> a mám mnoho zkušeností. Ve vybraných bankách spolupracuji s ověřenými bankéři na hypotečních centrech.</p><p>Zajistím Vám nový hypoteční úvěr nebo refinancování stávající hypotéky za nejlepších podmínek na trhu.Moje služby jsou pro Vás vždy <strong>ZDARMA</strong> – finančně jsem hodnocena přímo vybranou bankou.</p><h4>BENEFITY ZDARMA:</h4><ul><li>komunikace s realitní kanceláří i právníky</li><li>kontrola rezervační smlouvy</li><li>zajištění schválení hypotéky a složení Kupní ceny do úschovy</li></ul><h4>Kompletní servis:</h4><ul><li>ověření bonity ve vybrané bance</li><li>příprava a podání žádosti o hypoteční úvěr</li><li>kompletace podkladů</li><li>schválení hypotečního úvěru</li><li>podpis úvěrové dokumentace</li><li>plnění podmínek čerpání a samotné čerpání úvěru</li><li>podání návrhu zástavního práva do katastru nemovitostí</li></ul><h4>Hypotéka bez nemovitosti:</h4><ul><li>schválení ihned po doložení příjmu</li><li>podpis úvěrové smlouvy</li><li>připravená hotovost na koupi nemovitosti</li><li>neplatíte splátky ani úroky, dokud nemovitost nenajdete</li><li>možnost rychle jednat o vybrané nemovitosti</li><li>pozice kupce s hotovostí</li><li>přístup k nejlepším nemovitostem na trhu</li></ul><p><strong>Rychlá odpověď.</strong></p></div>"
  }
];


$$('[data-project]').forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const idx = Number(btn.dataset.project || "0");
    const p = projectData[idx] || projectData[0];

    const bodyHTML = `
      <div class="kv kv--full">
        <div class="note">
          <div class="kv__row"><span class="kv__k">Model:</span><span class="kv__v">${p.model || ""}</span></div>
          <div class="kv__row"><span class="kv__k">Výběr:</span><span class="kv__v">${p.vyber || ""}</span></div>
          <div class="kv__row"><span class="kv__k">Hodnota:</span><span class="kv__v">${p.hodnota || ""}</span></div>
          ${p.desc ? `<div class="note__sep"></div><p>${p.desc}</p>` : ""}
        </div>
      </div>
    `;

    openModal({
      kicker: "",
      title: p.title,
      bodyHTML,
      ctaText: "Chci nabídku",
      ctaHref: "#kontakt"
    });
  });
});


/* Testimonials carousel */
const testimonials = [
  { name:"P. Konečný", role:"Investor", text:"Rychlá domluva, jasné termíny a přístup k detailu. Dům i pronájem bez zbytečných průtahů." },
  { name:"M. Svobodová", role:"Majitelka bytu", text:"Profesionální prezentace nabídky a super komunikace. Vše šlo hladce, doporučuji." },
  { name:"J. Dvořák", role:"Klient rekonstrukce", text:"Stylové řešení interiéru, moderní materiály a čisté předání. Přesně to jsme chtěli." },
];

const tTrack = $("#tTrack");
const tBar = $("#tBar");
let tIndex = 0;
let tTimer = null;
const T_INTERVAL = 5200;

function renderTestimonials(){
  tTrack.innerHTML = testimonials.map(t=>{
    const initial = (t.name || "?").trim().charAt(0).toUpperCase();
    return `
      <article class="quote">
        <div class="quote__text">“${t.text}”</div>
        <div class="quote__who">
          <div class="avatar" aria-hidden="true">${initial}</div>
          <div>
            <div class="who__name">${t.name}</div>
            <div class="who__role">${t.role}</div>
          </div>
        </div>
      </article>
    `;
  }).join("");
  updateTestimonial();
}
function updateTestimonial(){
  tTrack.style.transform = `translateX(${-100 * tIndex}%)`;
  // progress width by scaling
  const p = (tIndex+1) / testimonials.length;
  tBar.style.transform = `scaleX(${p})`;
}

function nextT(){ tIndex = (tIndex+1) % testimonials.length; updateTestimonial(); restartAuto(); }
function prevT(){ tIndex = (tIndex-1+testimonials.length) % testimonials.length; updateTestimonial(); restartAuto(); }
$("#tNext")?.addEventListener("click", nextT);
$("#tPrev")?.addEventListener("click", prevT);

function restartAuto(){
  clearInterval(tTimer);
  tTimer = setInterval(nextT, T_INTERVAL);
}
renderTestimonials();
restartAuto();

/* Form demo + toast */
const toastEl = $("#toast");
let toastTO = null;
function toast(msg){
  toastEl.innerHTML = `<span class="t-dot" aria-hidden="true"></span><span class="t-msg">${msg}</span>`;
  toastEl.classList.add("is-show");
  clearTimeout(toastTO);
  toastTO = setTimeout(()=> toastEl.classList.remove("is-show"), 2500);
}

$("#prefill")?.addEventListener("click", ()=>{
  const f = $("#contactForm");
  if(!f) return;
  f.name.value = "Jan Novák";
  f.email.value = "jan@email.cz";
  f.topic.value = "Stavba / rekonstrukce";
  f.message.value = "Dobrý den, mám zájem o konzultaci a předběžný rozpočet. Lokalita: Praha, termín: jaro.";
  toast("Demo data doplněna ✨");
});

$("#contactForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  toast("Odesláno (demo) ✅");
  e.target.reset();
});

/* Theme toggle (contrast) */
let hi = false;
$("#themeToggle")?.addEventListener("click", ()=>{
  hi = !hi;
  document.documentElement.style.setProperty("--panel", hi ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.06)");
  document.documentElement.style.setProperty("--panel2", hi ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.09)");
  document.documentElement.style.setProperty("--stroke", hi ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.12)");
  toast(hi ? "Kontrast: vyšší" : "Kontrast: standard");
});

/* little welcome toast */
setTimeout(()=> toast("Drak s.r.o: klikni na karty → efekty"), 900);


/* FAQ accordion */
$$(".faq__item").forEach(item=>{
  item.addEventListener("click", ()=>{
    const open = item.classList.toggle("is-open");
    const icon = $(".faq__icon", item);
    if(icon) icon.textContent = open ? "–" : "+";
  });
});

/* Modal close animation (fly out) */
function closeModalAnimated(){
  if(!modal.classList.contains("is-open")) return;
  modal.classList.add("is-closing");
  // wait for panel transition
  setTimeout(()=>{
    modal.classList.remove("is-closing");
    closeModal();
  }, 240);
}
// override close buttons to use animated close
modalClose?.removeEventListener("click", closeModal);
modalClose?.addEventListener("click", closeModalAnimated);
modal?.addEventListener("click", (e)=>{
  const close = e.target?.dataset?.close;
  if(close) closeModalAnimated();
});
window.addEventListener("keydown", (e)=>{
  if(e.key === "Escape" && modal.classList.contains("is-open")) closeModalAnimated();
});

/* Filter: animate old cards out to sides before rerender (odlet) */
function animateOutAndRerender(){
  const cards = $$(".listing", listingsEl);
  if(cards.length === 0){ renderListings(); return; }
  cards.forEach((c,i)=>{
    c.classList.add(i % 2 ? "is-out-right" : "is-out-left");
  });
  setTimeout(()=> renderListings(), 280);
}


/* Team profiles -> modal */
const teamProfiles = [
  {
    name: "Jan Novák",
    role: "Jednatel",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1400&q=70",
    legend: "",
    work: ["?","?","?","?","?"]
  },
  {
    name: "Petra Konečná",
    role: "Realitní specialistka • Reality & pronájmy",
    img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=1400&q=70",
    legend: "Stará se o prodej i pronájmy: prezentace, prohlídky, jednání, smlouvy. Umí nabídku zabalit tak, aby působila prémiově a prodala se rychle.",
    work: ["Marketing nabídky", "Prohlídky & jednání", "Smlouvy & předání", "Správa pronájmu"]
  },
  {
    name: "Marek Svoboda",
    role: "Architekt • Design & dokumentace",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1400&q=70",
    legend: "Vymýšlí dispozice, řeší detaily a připravuje dokumentaci. Minimalistický styl, funkční řešení a důraz na materiály.",
    work: ["Studie & koncept", "Projektová dokumentace", "Vizualizace", "Autorský dozor"]
  }
];

function teamModalHTML(p){
  const items = (p.work || []).map(x=>`<div class="kv__row"><span class="kv__k">•</span><span class="kv__v">${x}</span></div>`).join("");
  return `
    <div class="grid2">
      <div class="bigimg" style="background-image:url('${p.img}')"></div>
      <div class="kv">
        <div class="kv__row"><span class="kv__k">Role</span><span class="kv__v">${p.role}</span></div>
        <div class="note">${p.legend}</div>
        <div style="margin-top:10px; display:grid; gap:6px;">
          <div class="kv__row"><span class="kv__k">Co dělá</span><span class="kv__v"></span></div>
          ${items}
        </div>
      </div>
    </div>
  `;
}

$$(".person").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const idx = Number(btn.dataset.person || "0");
    const p = teamProfiles[idx] || teamProfiles[0];
    openModal({ title: p.name, kicker: "Profil", bodyHTML: teamModalHTML(p) });
  });
});



/* Team stack hover controller (disabled by JS-hover mode) */
/* ===== TEAM HOVER JS (stable) ===== */
window.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.teamGrid, .teamList');
  containers.forEach(container => {
    const cards = Array.from(container.querySelectorAll('.teamCard, .teamItem'));
    if (!cards.length) return;

    const clear = () => {
      if (container.dataset && 'active' in container.dataset) { delete container.dataset.active; }

      container.classList.remove('team-hovering');
      cards.forEach(c => c.classList.remove('is-hovered'));
    };

    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        container.classList.add('team-hovering');
        if (container.dataset && 'active' in container.dataset) { delete container.dataset.active; }
        cards.forEach(c => c.classList.toggle('is-hovered', c === card));
      });
    });

    container.addEventListener('mouseleave', clear);
  });
});


/* ===== TEAM MODAL JS ===== */
window.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('teamModal');
  if (!modal) return;

  const dialog = modal.querySelector('.teamModal__dialog');
  const media = document.getElementById('teamModalMedia');
  const titleEl = document.getElementById('teamModalTitle');
  const roleEl = document.getElementById('teamModalRole');
  const bioEl = document.getElementById('teamModalDesc');
  const tasksEl = document.getElementById('teamModalTasks');

  let lastFocus = null;

  const openModal = (card) => {
    const name = card.getAttribute('data-team-name') || '—';
    const role = card.getAttribute('data-team-role') || '—';
    const bio = card.getAttribute('data-team-bio') || '—';
    const tasksRaw = card.getAttribute('data-team-tasks') || '';
    const tasks = tasksRaw ? tasksRaw.split('||').filter(Boolean) : [];

    // image: try to pick the same card background image
    // Support: <img> inside .teamCard OR background-image on card media
    let imgSrc = '';
    const img = card.querySelector('img');
    if (img && img.getAttribute('src')) imgSrc = img.getAttribute('src');
    if (!imgSrc){
      const bg = getComputedStyle(card).backgroundImage;
      if (bg && bg.startsWith('url(')){
        imgSrc = bg.slice(4, -1).replace(/"/g,'');
      }
    }
    // also check for child .teamImg / .teamPhoto
    const mediaEl = card.querySelector('.teamImg, .teamPhoto, .teamCard__img, .teamCardImg');
    if (!imgSrc && mediaEl){
      const bg2 = getComputedStyle(mediaEl).backgroundImage;
      if (bg2 && bg2.startsWith('url(')){
        imgSrc = bg2.slice(4, -1).replace(/"/g,'');
      }
    }

    titleEl.textContent = name;
    roleEl.textContent = role;
    bioEl.textContent = bio;

    tasksEl.innerHTML = '';
    tasks.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      tasksEl.appendChild(li);
    });

    media.innerHTML = '';
    if (imgSrc){
      const big = document.createElement('img');
      big.src = imgSrc;
      big.alt = name;
      media.appendChild(big);
    }

    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // focus dialog for accessibility
    setTimeout(() => dialog.focus(), 10);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };

  // Click on team cards to open modal
  const cards = document.querySelectorAll('.teamGrid .teamCard, .teamList .teamCard, .teamGrid .teamItem, .teamList .teamItem');
  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // Close handlers
  modal.querySelectorAll('[data-team-modal-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
});
