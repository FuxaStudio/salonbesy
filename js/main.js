/* Besy · psí salon – interakce */
(function () {
  'use strict';

  /* ---------- navigace ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');
  var callbar = document.getElementById('callbar');

  /* ---------- spodni lista s telefonem ---------- */
  /* Krizek listu schova do konce navstevy, ne navzdy. Kdo si ji odklikne, chce
     mit klid ted; za tyden uz je to znovu nejrychlejsi cesta k objednani a
     natrvalo zapamatovane odmitnuti by mu ji vzalo, aniz by o tom vedel.
     Proto sessionStorage, a v try/catch - v privatnim rezimu nekterych
     prohlizecu pristup k nemu hodi vyjimku a shodil by zbytek skriptu. */
  var callbarClose = document.getElementById('callbar-close');
  var callbarOff = false;
  try { callbarOff = sessionStorage.getItem('besy-callbar-off') === '1'; } catch (e) {}

  function setCallbarOff() {
    callbarOff = true;
    if (callbar) callbar.classList.add('is-off');
    document.body.classList.add('callbar-off');
    try { sessionStorage.setItem('besy-callbar-off', '1'); } catch (e) {}
  }
  if (callbarOff) setCallbarOff();
  if (callbarClose) callbarClose.addEventListener('click', setCallbarOff);

  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    /* mobilni lista se vysune az kdyz hero zmizi, at neduplikuje jeho tlacitka */
    if (callbar && !callbarOff) callbar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('nav--open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    document.body.classList.toggle('no-scroll', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('nav--open'));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  window.addEventListener('resize', function () {
    /* 1200 = hranice hamburgeru v CSS; nad ni uz je panel skryty a musi se odhlasit i stav */
    if (window.innerWidth > 1200 && nav.classList.contains('nav--open')) setMenu(false);
  });

  /* ---------- logo vede zpátky nahoru ---------- */
  /* href="./" v HTML je zaloha pro vypnuty JS - nacte stranku znovu. S JS je
     ale reload jednostrankoveho webu skoda: prohlizec pri nem obnovi i pozici
     posunuti, takze klik na logo vypadal, jako by nedelal vubec nic. Misto nej
     se odscrolluje nahoru a z adresy se sundava kotva, at v ni po navratu na
     zacatek nevisi #kontakt a Zpet se chova ocekavane.
     Modifikatory se propousti dal - Ctrl+klik ma porad otevrit novou zalozku. */
  Array.prototype.forEach.call(document.querySelectorAll('a.logo'), function (logo) {
    logo.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      setMenu(false);
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (window.location.hash && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    });
  });

  /* ---------- rozbalovaci nabidka sluzeb ---------- */
  /* Mys a klavesnice si vystaci s CSS (:hover / :focus-within). JS resi dve veci,
     na ktere CSS nestaci: zavreni Escapem a dotykovy displej v desktopovem
     rozlozeni, kde by prvni tuk rovnou odscrolloval na #sluzby a podseznam by
     nikdo nevidel. V hamburgeru je podseznam rozbaleny nastalo, takze tam se
     spoustec chova jako bezny odkaz. */
  var navGroup = document.querySelector('.nav__group');
  var navGroupBtn = document.getElementById('nav-services-btn');

  /* Nabidku otevira i samotne CSS (:hover a :focus-within), o cemz JS nevi -
     aria-expanded pak hlasilo "sbaleno" nad viditelne otevrenym seznamem.
     Tahle funkce ho misto toho dopocita ze skutecneho stavu. Pod 1200 px je
     podseznam rozbaleny natrvalo a spoustec neni rozbalovatko, takze se
     atribut sundava uplne - "vzdy otevreno" neni stav, ktery by se mel hlasit. */
  /* Skutecny stav nabidky. Otevrit ji umi tri veci a jen jedna z nich je JS:
     .is-open (tuk na dotykovem displeji), :hover a :focus-within. */
  function isGroupVisible() {
    if (!navGroup || window.innerWidth <= 1200) return false;
    if (navGroup.classList.contains('is-dismissed')) return false;
    return navGroup.classList.contains('is-open') ||
      navGroup.matches(':hover') ||
      navGroup.contains(document.activeElement);
  }

  function syncGroupAria() {
    if (!navGroup) return;
    /* Pod 1200 px je podseznam rozbaleny natrvalo a spoustec neni rozbalovatko -
       "vzdy otevreno" neni stav, ktery by se mel hlasit, atribut se sundava. */
    if (window.innerWidth <= 1200) { navGroupBtn.removeAttribute('aria-expanded'); return; }
    navGroupBtn.setAttribute('aria-expanded', String(isGroupVisible()));
  }

  /* Escape musi nabidku zavrit i tehdy, kdyz ji drzi :focus-within - fokus se po
     nem vraci na spoustec, ktery je uvnitr .nav__group, takze CSS by ji nechalo
     otevrenou dal a Escape by nedelal nic viditelneho. .is-dismissed to prebije
     do doby, nez kurzor nebo fokus ze skupiny odejde. */
  function dismissGroup() {
    if (!navGroup) return;
    navGroup.classList.remove('is-open');
    navGroup.classList.add('is-dismissed');
    syncGroupAria();
  }

  function setGroup(open) {
    if (!navGroup) return;
    navGroup.classList.remove('is-dismissed');
    navGroup.classList.toggle('is-open', open);
    syncGroupAria();
  }

  if (navGroup && navGroupBtn) {
    /* focusout a mouseleave prijdou driv, nez se fokus presune na dalsi prvek -
       setTimeout necha prohlizec presun dokoncit a az pak se stav docte */
    ['mouseenter', 'mouseleave', 'focusin', 'focusout'].forEach(function (ev) {
      navGroup.addEventListener(ev, function () {
        setTimeout(function () {
          /* jakmile kurzor i fokus opusti skupinu, zamitnuti se zapomene -
             priste uz nabidku hover i Tab otevrou normalne */
          if (!navGroup.matches(':hover') && !navGroup.contains(document.activeElement)) {
            navGroup.classList.remove('is-dismissed');
          }
          syncGroupAria();
        }, 0);
      });
    });
    window.addEventListener('resize', syncGroupAria);
    syncGroupAria();

    navGroupBtn.addEventListener('click', function (e) {
      if (window.innerWidth <= 1200) return;
      if (!window.matchMedia('(hover: none)').matches) return;
      if (!navGroup.classList.contains('is-open')) { e.preventDefault(); setGroup(true); }
    });
    /* tuk mimo nabidku ji zavre - jinak by na dotyku zustala viset otevrena */
    document.addEventListener('click', function (e) {
      if (!navGroup.contains(e.target)) setGroup(false);
    });
    navGroup.addEventListener('focusout', function (e) {
      if (!navGroup.contains(e.relatedTarget)) setGroup(false);
    });
  }

  /* ---------- zvýraznění sekce, ve které návštěvník právě je ---------- */
  /* Sleduje se uzky pas uprostred okna (rootMargin -45 % / -50 %), ne cela
     sekce - pri dvou sekcich na obrazovce je tak vzdy prave jedna aktivni.
     #hero se sleduje taky, aby se po navratu nahoru pilulka zhasla; #objednat
     naopak ne, tam ma zustat svitit Kontakt. */
  var spyMap = { hero: null };
  Array.prototype.forEach.call(
    document.querySelectorAll('.nav__links > a[href^="#"], .nav__group-btn'),
    function (a) { spyMap[a.getAttribute('href').slice(1)] = a; }
  );

  if ('IntersectionObserver' in window) {
    var currentLink = null;
    var setCurrent = function (link) {
      if (link === currentLink) return;
      if (currentLink) { currentLink.classList.remove('is-current'); currentLink.removeAttribute('aria-current'); }
      currentLink = link;
      if (currentLink) { currentLink.classList.add('is-current'); currentLink.setAttribute('aria-current', 'true'); }
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(spyMap[e.target.id]); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(spyMap).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---------- záložky služeb ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab[role="tab"]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel[role="tabpanel"]'));

  /* Dva rezimy podle sirky okna:
     - nad 768 px bocni zalozky: prave jedna vybrana, role=tab/tabpanel, sipky prepinaji,
     - pod 768 px harmonika: samostatna rozbalovatka s aria-expanded, na sobe nezavisla -
       po nacteni je zavrene vsechno, otevrit i zavrit jde kterekoli a klidne vsechna naraz.
     Proto ma kazdy rezim vlastni tridu: .is-active nese vyber zalozky, .is-open otevreni
     v harmonice. Role tabu bez lista ctecce lze, takze se skutecne prehazuji, ne jen
     prekresluji v CSS. */
  var ACC_MAX = 768;
  var tabList = document.querySelector('.tabs');
  var accordion = false;
  /* posledni vyber z bocniho rozlozeni - po navratu z harmoniky se obnovi */
  var lastActive = tabs.filter(function (t) { return t.classList.contains('is-active'); })[0] || tabs[0];

  function panelOf(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }

  function setOpen(tab, open) {
    var panel = panelOf(tab);
    tab.classList.toggle('is-open', open);
    tab.setAttribute('aria-expanded', String(open));
    if (panel) { panel.classList.toggle('is-open', open); panel.hidden = !open; }
  }

  /* poradi dvojic v harmonice: zalozka 1, panel 1, zalozka 2, panel 2, ...
     Pise se z JS, aby sesta sluzba nepotrebovala dalsi radek v CSS. Ve dvousloupcovem
     rozlozeni je `order` bez ucinku (.panels je blok) nebo drzi puvodni poradi (.tabs je flex). */
  tabs.forEach(function (t, i) { t.style.order = String(2 * i + 1); });
  panels.forEach(function (p, i) { p.style.order = String(2 * i + 2); });

  function syncTabsMode() {
    var acc = window.innerWidth <= ACC_MAX;
    if (acc === accordion) return;
    accordion = acc;
    if (tabList) tabList.setAttribute('role', acc ? 'presentation' : 'tablist');

    if (acc) {
      /* do harmoniky se vstupuje se vsim zavrenym - vyber si schovame na navrat */
      lastActive = tabs.filter(function (t) { return t.classList.contains('is-active'); })[0] || lastActive;
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.removeAttribute('role');
        t.removeAttribute('aria-selected');
        t.tabIndex = 0;
        setOpen(t, false);
      });
      panels.forEach(function (p) { p.classList.remove('is-active'); p.removeAttribute('role'); });
    } else {
      tabs.forEach(function (t) {
        setOpen(t, false);
        t.classList.remove('is-open');
        t.removeAttribute('aria-expanded');
        t.setAttribute('role', 'tab');
      });
      panels.forEach(function (p) { p.classList.remove('is-open'); p.setAttribute('role', 'tabpanel'); });
      activateTab(lastActive, false);
    }
  }

  function activateTab(tab, focus) {
    lastActive = tab;
    tabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle('is-active', active);
      if (accordion) {
        t.setAttribute('aria-expanded', String(active));
        t.tabIndex = 0;
      } else {
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
      }
    });
    panels.forEach(function (p) {
      var active = p.id === tab.getAttribute('aria-controls');
      p.classList.toggle('is-active', active);
      p.hidden = !active;
    });
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      if (accordion) setOpen(tab, !tab.classList.contains('is-open'));
      else activateTab(tab, false);
    });
    tab.addEventListener('keydown', function (e) {
      /* v harmonice jsou to samostatna tlacitka - sipky maji scrollovat strankou */
      if (accordion) return;
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); activateTab(next, true); }
    });
  });

  /* odkaz z jine sekce muze rovnou otevrit konkretni sluzbu: <a href="#sluzby" data-tab="tab-4">.
     Kotva se nechava na prohlizeci, JS jen prehodi zalozku - bez toho by navstevnik
     pristal na prvni zalozce a pointa odkazu by se ztratila. */
  Array.prototype.forEach.call(document.querySelectorAll('a[data-tab]'), function (link) {
    link.addEventListener('click', function () {
      var tab = document.getElementById(link.getAttribute('data-tab'));
      if (!tab) return;
      if (accordion) {
        /* v harmonice je po nacteni zavreno vsechno - odkaz musi cilovou sluzbu
           otevrit a doscrollovat na ni sam, kotva #sluzby by skoncila u nadpisu */
        setOpen(tab, true);
        window.requestAnimationFrame(function () { tab.scrollIntoView({ block: 'start' }); });
      } else {
        activateTab(tab, false);
      }
    });
  });

  syncTabsMode();
  window.addEventListener('resize', syncTabsMode);

  /* 404.html zalozky nema, takze jeji odkazy na sluzby nesou cislo v adrese:
     ?sluzba=4#sluzby. Na kotvu odscrolluje prohlizec, tady se jen prepne zalozka
     (v harmonice otevre a doscrolluje az po nacteni, jinak by ho kotva prebila)
     a parametr se z adresy uklidi. */
  var wantedTab = /[?&]sluzba=(\d+)/.exec(window.location.search);
  wantedTab = wantedTab && document.getElementById('tab-' + wantedTab[1]);
  if (wantedTab && tabs.indexOf(wantedTab) > -1) {
    if (accordion) {
      setOpen(wantedTab, true);
      window.addEventListener('load', function () { wantedTab.scrollIntoView({ block: 'start' }); });
    } else {
      activateTab(wantedTab, false);
    }
    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }

  /* ---------- sdílený focus-trap pro dialogy ---------- */
  function trapFocus(box, e) {
    if (e.key !== 'Tab') return;
    var f = box.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- více recenzí ----------
     Místo modalu se rozbalí mřížka pod tlačítkem. Kolik karet je vidět
     před rozbalením řídí CSS (.reviews__grid:not(.is-open)), ne tenhle kód –
     počet se liší podle šířky, a JS o breakpointech nemusí vědět. */
  var revGrid = document.getElementById('reviews-grid');
  var revBtn = document.getElementById('reviews-more');

  if (revGrid && revBtn) {
    revBtn.addEventListener('click', function () {
      var open = revBtn.getAttribute('aria-expanded') === 'true';
      revGrid.classList.toggle('is-open', !open);
      revBtn.setAttribute('aria-expanded', String(!open));
      revBtn.textContent = open ? 'Více recenzí' : 'Méně recenzí';
      /* Při sbalení může tlačítko vyskočit nad viewport – vrátíme ho k oku. */
      if (open) revBtn.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  }

  /* ---------- photobox: fotka od zákazníka u recenze ----------
     Miniatura zůstává <a> na plnou fotku, takže bez JS funguje jako odkaz;
     tady jen odchytíme klik a otevřeme dialog. */
  var photobox = document.getElementById('photobox');
  var closePhotobox = function () {};

  if (photobox) {
    var pbImg = document.getElementById('photobox-img');
    var pbCap = document.getElementById('photobox-cap');
    var pbClose = document.getElementById('photobox-close');
    var pbLastFocus = null;

    closePhotobox = function () {
      photobox.hidden = true;
      document.body.classList.remove('no-scroll');
      /* src nemažeme – při dalším otevření se fotka nemusí načítat znovu */
      if (pbLastFocus) pbLastFocus.focus();
    };

    document.querySelectorAll('.review__photo').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        pbLastFocus = link;
        pbImg.src = link.getAttribute('href');
        pbImg.alt = link.querySelector('img').alt;
        pbCap.innerHTML = 'Fotka od&nbsp;zákazníka · <b>' + link.dataset.author + '</b>';
        photobox.hidden = false;
        document.body.classList.add('no-scroll');
        pbClose.focus();
      });
    });

    pbClose.addEventListener('click', closePhotobox);
    photobox.addEventListener('click', function (e) {
      if (e.target === photobox || e.target.classList.contains('photobox__box')) closePhotobox();
    });
    photobox.addEventListener('keydown', function (e) { trapFocus(photobox, e); });
  }

  /* ---------- lightbox galerie: otevírá celou dvojici, ne jednu fotku ---------- */
  var lightbox = document.getElementById('lightbox');
  var pairs = Array.prototype.slice.call(document.querySelectorAll('.gallery__grid .pair'));
  var closeLightbox = function () {};

  if (lightbox && pairs.length) {
    var lbBefore = document.getElementById('lightbox-before');
    var lbAfter = document.getElementById('lightbox-after');
    var lbCaption = document.getElementById('lightbox-caption');
    var lbCounter = document.getElementById('lightbox-counter');
    var lbClose = document.getElementById('lightbox-close');
    var lbPrev = document.getElementById('lightbox-prev');
    var lbNext = document.getElementById('lightbox-next');
    var lbIndex = 0;
    var lbLastFocus = null;

    var lbImgs = lightbox.querySelector('.lightbox__imgs');

    /* Dopočítá výšku řádku tak, aby obě fotky byly stejně vysoké a pár se vešel
       do šířky boxu i do okna. h = (šířka - mezera) / (poměr1 + poměr2). */
    var lightboxLayout = function () {
      if (lightbox.hidden) return;
      if (window.matchMedia('(max-width: 768px)').matches) { lbImgs.style.height = ''; return; }
      var a1 = lbBefore.naturalWidth / lbBefore.naturalHeight;
      var a2 = lbAfter.naturalWidth / lbAfter.naturalHeight;
      if (!a1 || !a2) return;
      var gap = parseFloat(getComputedStyle(lbImgs).columnGap) || 16;
      var byWidth = (lbImgs.clientWidth - gap) / (a1 + a2);
      var byHeight = window.innerHeight - lbCaption.offsetHeight - lbCounter.offsetHeight - 90;
      /* pojistka proti rozmazání: fotku nenafukujeme o víc než polovinu
         její skutečné výšky (víc detailu už v souboru stejně není) */
      var byPixels = 1.5 * Math.min(lbBefore.naturalHeight, lbAfter.naturalHeight);
      lbImgs.style.height = Math.max(180, Math.min(byWidth, byHeight, byPixels)) + 'px';
    };

    /* naturalWidth je k dispozici až po načtení, u fotek z cache hned */
    lbBefore.addEventListener('load', lightboxLayout);
    lbAfter.addEventListener('load', lightboxLayout);
    window.addEventListener('resize', lightboxLayout, { passive: true });

    /* obsah se čte z mřížky, aby popisky nebyly na stránce dvakrát */
    var showPair = function (i) {
      lbIndex = (i + pairs.length) % pairs.length;
      var imgs = pairs[lbIndex].querySelectorAll('.pair__side img');
      lbBefore.src = imgs[0].currentSrc || imgs[0].src;
      lbBefore.alt = imgs[0].alt;
      lbAfter.src = imgs[1].currentSrc || imgs[1].src;
      lbAfter.alt = imgs[1].alt;
      lbCaption.innerHTML = pairs[lbIndex].querySelector('figcaption').innerHTML;
      lbCounter.textContent = (lbIndex + 1) + ' / ' + pairs.length;
      lightboxLayout();
    };

    var openLightbox = function (i) {
      lbLastFocus = document.activeElement;
      showPair(i);
      lightbox.hidden = false;
      document.body.classList.add('no-scroll');
      lightboxLayout();
      lbClose.focus();
    };

    closeLightbox = function () {
      lightbox.hidden = true;
      document.body.classList.remove('no-scroll');
      if (lbLastFocus) lbLastFocus.focus();
    };

    pairs.forEach(function (fig, i) {
      var btn = fig.querySelector('.pair__imgs');
      if (btn) btn.addEventListener('click', function () { openLightbox(i); });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showPair(lbIndex - 1); });
    lbNext.addEventListener('click', function () { showPair(lbIndex + 1); });

    /* klik mimo fotky zavírá */
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox ||
          e.target.classList.contains('lightbox__box') ||
          e.target.classList.contains('lightbox__imgs')) closeLightbox();
    });

    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showPair(lbIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showPair(lbIndex + 1); }
      else trapFocus(lightbox, e);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lightbox && !lightbox.hidden) closeLightbox();
    else if (photobox && !photobox.hidden) closePhotobox();
    /* Podminka je "nabidka je videt", ne ".is-open" - otevrit ji umi i samotne
       CSS pres :hover a :focus-within, kde zadna trida nepribude a Escape by
       na takhle otevrenou nabidku nedosahl. */
    else if (navGroup && isGroupVisible()) { dismissGroup(); navGroupBtn.focus(); }
    else if (nav.classList.contains('nav--open')) setMenu(false);
  });

  /* ---------- odhalovaní patičky ---------- */
  /* Patička se přišpendlí ke spodku okna a <main> přes ni jede nahoru.
     Zapínáme jen na desktopu a jen když je patička nižší než okno – jinak
     by spodek patičky nebylo možné dorolovat. */
  var footerEl = document.querySelector('.footer');
  if (footerEl && document.querySelector('main')) {
    var waveEl = document.querySelector('.cta .wave');
    var syncFooterReveal = function () {
      /* nejdřív změříme patičku bez efektu, tedy bez přidaného horního pruhu */
      document.body.classList.remove('footer-reveal');
      var waveH = waveEl ? waveEl.getBoundingClientRect().height : 72;
      /* Mobilní lišta jede až do 1200 px a je fixed na bottom: 0 – tedy přesně
         tam, kde v odhaleném stavu stojí patička. Překryla by jí spodní řádek
         s IČO, a to bez ohledu na výšku okna: odhalená patička je taky
         přišpendlená k bottom: 0, takže se jí ta lišta vždycky položí přes
         posledních ~64 px. V běžném toku to řeší padding-bottom na <body>,
         ale ten na fixed patičku nesahá. Když je lišta vidět, efekt tedy
         vypneme celý. */
      var callbarEl = document.querySelector('.callbar');
      var callbarShown = callbarEl && getComputedStyle(callbarEl).display !== 'none';
      /* patička musí do okna vejít i s pruhem pod vlnou a ještě něco zbýt –
         jinak by vlna na konci scrollu dosedla přímo na obsah patičky */
      var on = window.innerWidth > 768 && !callbarShown &&
               footerEl.offsetHeight + waveH + 24 <= window.innerHeight;
      document.body.classList.toggle('footer-reveal', on);
      /* změřit znovu, už s efektem – patička je teď o vlnu vyšší */
      document.documentElement.style.setProperty('--footer-h', (on ? footerEl.offsetHeight : 0) + 'px');
    };
    window.addEventListener('resize', syncFooterReveal, { passive: true });
    window.addEventListener('load', syncFooterReveal);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncFooterReveal);
    syncFooterReveal();
  }

  /* ---------- vitrína ocenění (vodorovný pás) ---------- */
  var awardsRow = document.getElementById('awards-row');
  if (awardsRow) {
    var awardsNav = document.getElementById('awards-nav');
    var awardsPrev = document.getElementById('awards-prev');
    var awardsNext = document.getElementById('awards-next');

    /* posun o jednu dlaždici i s mezerou; čte se z DOM, at sedí i po změně šířky */
    function awardStep() {
      var card = awardsRow.querySelector('.award');
      if (!card) return awardsRow.clientWidth;
      var gap = parseFloat(getComputedStyle(awardsRow).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    /* nekonečné listování: před původní dlaždice a za ně se vloží jejich kopie.
       Jakmile pás vyjede z prostřední sady, posune se o šířku jedné sady zpátky –
       pod tím leží úplně stejný obsah, takže skok není vidět a listovat jde
       pořád dokola. Kopie dělá JS, ve zdrojovém HTML zůstává každé ocenění jednou. */
    var awards = Array.prototype.slice.call(awardsRow.children);
    var clones = [];
    var loopOn = false;
    var loopSet = 0;

    if (awards.length > 1) {
      var before = document.createDocumentFragment();
      var after = document.createDocumentFragment();
      awards.forEach(function (item) {
        var head = item.cloneNode(true);
        var tail = item.cloneNode(true);
        /* čtečka ať nečte ocenění třikrát */
        head.setAttribute('aria-hidden', 'true');
        tail.setAttribute('aria-hidden', 'true');
        clones.push(head, tail);
        before.appendChild(head);
        after.appendChild(tail);
      });
      awardsRow.insertBefore(before, awardsRow.firstChild);
      awardsRow.appendChild(after);
    }

    function syncLoop() {
      var step = awardStep();
      /* smyčka dává smysl jen tehdy, když se dlaždice do pásu nevejdou */
      var on = clones.length > 0 && step * awards.length > awardsRow.clientWidth + 1;
      loopSet = step * awards.length;
      if (on === loopOn) return;
      loopOn = on;
      clones.forEach(function (c) { c.hidden = !on; });
      awardsRow.scrollLeft = on ? loopSet : 0;
    }

    /* vrátí, o kolik se pás přesunul, aby si tažení mohlo dorovnat výchozí bod */
    function loopShift() {
      if (!loopOn || loopSet < 1) return 0;
      var shift = 0;
      while (awardsRow.scrollLeft < loopSet * 0.5) { awardsRow.scrollLeft += loopSet; shift += loopSet; }
      while (awardsRow.scrollLeft > loopSet * 1.5) { awardsRow.scrollLeft -= loopSet; shift -= loopSet; }
      return shift;
    }

    function syncAwards() {
      /* 2 px rezerva na subpixelové zaokrouhlení, jinak šipka zůstane aktivní na konci */
      var max = awardsRow.scrollWidth - awardsRow.clientWidth;
      awardsNav.hidden = max < 2;
      /* ve smyčce konec neexistuje, tak se šipky nevypínají */
      awardsPrev.disabled = !loopOn && awardsRow.scrollLeft < 2;
      awardsNext.disabled = !loopOn && awardsRow.scrollLeft > max - 2;
    }

    /* posun vždy o dvě dlaždice, at se pás hýbe po skocích a ne o kus fotky */
    var AWARDS_STEP = 2;

    function scrollAwards(dir) {
      /* přesun sady vždycky před animací - uprostřed plynulého posunu by ji zrušil */
      loopShift();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      awardsRow.scrollBy({ left: awardStep() * AWARDS_STEP * dir, behavior: reduce ? 'auto' : 'smooth' });
    }

    awardsPrev.addEventListener('click', function () { scrollAwards(-1); });
    awardsNext.addEventListener('click', function () { scrollAwards(1); });

    /* dosednutí na nejbližší dlaždici po puštění myši; CSS snap to sám neudělá,
       protože během tažení je vypnutý */
    function snapAwards() {
      var step = awardStep();
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      awardsRow.scrollTo({
        left: Math.round(awardsRow.scrollLeft / step) * step,
        behavior: reduce ? 'auto' : 'smooth'
      });
    }

    /* tažení myší: chytit pás a posunout. Prst se nechává prohlížeči – nativní
       scroll je plynulejší a nese setrvačnost, kterou bychom tu dopisovali. */
    var drag = null;
    var settling = false;

    awardsRow.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      drag = { x: e.clientX, left: awardsRow.scrollLeft, moved: false };
      awardsRow.setPointerCapture(e.pointerId);
    });

    awardsRow.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      /* pár pixelů při kliknutí ještě není tažení */
      if (!drag.moved && Math.abs(dx) < 3) return;
      if (!drag.moved) {
        drag.moved = true;
        /* snap se musí vypnout, jinak by pás každý pixel odskakoval zpátky */
        awardsRow.classList.add('is-dragging');
      }
      e.preventDefault();
      awardsRow.scrollLeft = drag.left - dx;
      /* při dlouhém tažení se sada přesune i uprostřed gesta; výchozí bod se
         musí posunout s ní, jinak by pás poskočil */
      drag.left += loopShift();
    });

    /* Dojezd na dlaždici. Snap zůstane vypnutý, dokud se pás nezastaví - kdyby se
       zapnul hned po puštění, prohlížeč pás přisaje na dlaždici skokem a z plynulého
       dojezdu není nic vidět. Konec animace se pozná podle toho, že se pozice
       přestala měnit; scrollend zatím neumí každý prohlížeč. */
    function settleAwards() {
      settling = true;
      awardsRow.classList.add('is-settling');
      snapAwards();
      var last = -1;
      var still = 0;
      (function check() {
        var now = Math.round(awardsRow.scrollLeft);
        if (now === last) {
          if (++still > 2) {
            awardsRow.classList.remove('is-settling');
            settling = false;
            return;
          }
        } else {
          still = 0;
          last = now;
        }
        requestAnimationFrame(check);
      })();
    }

    function endDrag(e) {
      if (!drag) return;
      var moved = drag.moved;
      drag = null;
      awardsRow.classList.remove('is-dragging');
      if (awardsRow.hasPointerCapture(e.pointerId)) awardsRow.releasePointerCapture(e.pointerId);
      if (moved) settleAwards();
    }
    awardsRow.addEventListener('pointerup', endDrag);
    awardsRow.addEventListener('pointercancel', endDrag);

    /* prohlížeč jinak při tažení přes fotku spustí vlastní drag&drop obrázku */
    awardsRow.addEventListener('dragstart', function (e) { e.preventDefault(); });
    /* Přesun sady se dělá až chvíli po zastavení scrollu. Kdyby se sahalo na
       scrollLeft během setrvačného posunu prstem, prohlížeč by ho utnul. */
    var settle;
    awardsRow.addEventListener('scroll', function () {
      syncAwards();
      /* pojistka na hodně dlouhý švih: než se pás zastaví, došel by na konec
         kopií a narazil. Tady se posune hned, i za cenu utnuté setrvačnosti. */
      if (!settling && loopOn && (awardsRow.scrollLeft < loopSet * 0.15 || awardsRow.scrollLeft > loopSet * 1.85)) loopShift();
      clearTimeout(settle);
      settle = setTimeout(loopShift, 150);
    }, { passive: true });

    var lastWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      /* na mobilu se resize spustí i při schování adresního řádku - to je jen
         změna výšky a pás se kvůli ní nemá kam hýbat */
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      syncLoop();
      loopShift();
      syncAwards();
    }, { passive: true });

    window.addEventListener('load', function () { syncLoop(); syncAwards(); });
    syncLoop();
    syncAwards();
  }

  /* ---------- mapa ---------- */
  /* Leaflet misto vlozene Google mapy: jen tak jde dat do markeru logo salonu.
     Dlazdice jsou z OpenStreetMap, barvu jim srovnava filtr v .map__canvas. */
  var mapEl = document.getElementById('map-canvas');
  if (mapEl && window.L) {
    var mapLat = parseFloat(mapEl.getAttribute('data-lat'));
    var mapLng = parseFloat(mapEl.getAttribute('data-lng'));
    var mapZoom = parseInt(mapEl.getAttribute('data-zoom'), 10);

    var buildMap = function () {
      var map = L.map(mapEl, {
        center: [mapLat, mapLng],
        zoom: mapZoom,
        /* kolecko obsluhujeme sami nize - viz komentar u map__hint */
        scrollWheelZoom: false
      });

      /* Kolecko samo o sobe scrolluje stranku, s Ctrl (na Macu Cmd) zoomuje mapu -
         stejne jako vlozena Google mapa. Leafletiho vlastni handler zustava vypnuty
         a zoom resime rucne, jinak by se prvni otocka kolecka ztratila.
         Dvojklik a stazeni dvou prstu na mobilu zoomuji porad. */
      var hint = document.createElement('div');
      hint.className = 'map__hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.textContent = 'Pro přiblížení podržte Ctrl a\u00a0otočte kolečkem';
      mapEl.appendChild(hint);

      var hintTimer;
      var wheelLock = 0;

      mapEl.addEventListener('wheel', function (e) {
        if (e.ctrlKey || e.metaKey) {
          /* bez toho by Ctrl+kolecko zoomovalo cely prohlizec */
          e.preventDefault();
          hint.classList.remove('is-visible');
          /* trackpad posila desitky malych udalosti - bez brzdy by mapa preletela */
          var now = Date.now();
          if (now - wheelLock < 120) return;
          wheelLock = now;
          map.setZoomAround(map.mouseEventToLatLng(e), map.getZoom() + (e.deltaY > 0 ? -1 : 1));
        } else {
          hint.classList.add('is-visible');
          clearTimeout(hintTimer);
          hintTimer = setTimeout(function () { hint.classList.remove('is-visible'); }, 1400);
        }
      }, { passive: false });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
      }).addTo(map);

      /* rozmery musi sedet s .map-pin v CSS, jinak spicka neukazuje na dum */
      var pin = L.divIcon({
        className: 'map-pin-wrap',
        html: '<span class="map-pin"><img src="images/logo-white.svg" alt="" width="24" height="24"></span>',
        iconSize: [44, 56],
        iconAnchor: [22, 56],
        popupAnchor: [0, -52]
      });

      L.marker([mapLat, mapLng], { icon: pin, title: 'Besy – psí salon', alt: 'Besy – psí salon' })
        .addTo(map)
        .bindPopup(
          '<b>Besy · Marie Kasanová</b>Dr.&nbsp;Janského 668<br>537&nbsp;01 Chrudim&nbsp;II<br>' +
          '<a href="https://www.google.com/maps/search/?api=1&query=Besy%20-%20Marie%20Kasanov%C3%A1%2C%20Dr.%20Jansk%C3%A9ho%20668%2C%20537%2001%20Chrudim" target="_blank" rel="noopener">Otevřít v&nbsp;Google Mapách</a>'
        );

      /* .map se odhaluje pres translateY - dokud animace bezi, ma Leaflet
         spatne spocitanou pozici dlazdic */
      mapEl.parentNode.addEventListener('transitionend', function () {
        map.invalidateSize();
      });
    };

    /* dlazdice se stahuji az kdyz se ke kontaktum doscrolluje */
    if ('IntersectionObserver' in window) {
      var mapIo = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          mapIo.disconnect();
          buildMap();
        }
      }, { rootMargin: '200px' });
      mapIo.observe(mapEl);
    } else {
      buildMap();
    }
  }

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  }
})();
