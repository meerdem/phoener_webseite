// ------------------------------------------------------------
// Offcanvas-Menü (Mobile) mit Sprungmarken
// ------------------------------------------------------------

var PAGE_ANCHORS = {
  'index.html': [
    { href: '#situationen', label: 'Typische Situationen' },
    { href: '#coaching', label: 'Mein Coaching' },
    { href: '#haltung', label: 'Meine Haltung' },
    { href: '#erstgespraech', label: 'Erstgespräch' }
  ],
  'angebot.html': [
    { href: '#angebote', label: 'Alle Angebote' },
    { href: '#erstgespraech', label: 'Erstgespräch' }
  ],
  'ueber-mich.html': [
    { href: '#profil', label: 'Profil' },
    { href: '#qualifikation', label: 'Qualifikation' }
  ],
  'kontakt.html': [
    { href: '#kontaktwege', label: 'Kontaktwege' }
  ]
};

var toggle = document.querySelector('.nav-toggle');
var nav = document.getElementById('mainnav');

if (toggle && nav) {
  // Backdrop
  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  // Schließen-Button im Offcanvas
  var closeBtn = document.createElement('button');
  closeBtn.className = 'nav-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Menü schließen');
  closeBtn.innerHTML = '<i data-lucide="x"></i>';
  nav.insertBefore(closeBtn, nav.firstChild);

  // Sprungmarken der aktuellen Seite
  var page = (location.pathname.split('/').pop() || 'index.html');
  var anchors = PAGE_ANCHORS[page];
  if (anchors && anchors.length) {
    var jump = document.createElement('div');
    jump.className = 'jump-links';
    jump.innerHTML = '<h5>Auf dieser Seite</h5>' + anchors.map(function (a) {
      return '<a href="' + a.href + '"><i data-lucide="corner-down-right"></i>' + a.label + '</a>';
    }).join('');
    nav.appendChild(jump);
  }

  var setMenu = function (open) {
    nav.classList.toggle('open', open);
    backdrop.classList.toggle('show', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });
  closeBtn.addEventListener('click', function () { setMenu(false); });
  backdrop.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  // Nach Link-Klick schließen (Sprungmarken und Seitenwechsel)
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
}

// ------------------------------------------------------------
// Zitat-Karussell
// ------------------------------------------------------------

// Fallback, falls content/zitate.json nicht geladen werden kann
var QUOTES_FALLBACK = [
  { text: '„Der Weg entsteht, indem man ihn geht."', by: 'Antonio Machado' },
  { text: '„Auch der weiteste Weg beginnt mit einem ersten Schritt."', by: 'Laozi' },
  { text: '„Wer immer tut, was er schon kann, bleibt immer das, was er schon ist."', by: 'Henry Ford' },
  { text: '„Wir können den Wind nicht ändern, aber die Segel anders setzen."', by: 'Aristoteles zugeschrieben' },
  { text: '„In dir muss brennen, was du in anderen entzünden willst."', by: 'Augustinus von Hippo' }
];

var QUOTES = QUOTES_FALLBACK;

var INTERVAL_MS = 7000;
var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero-Video: Abspielen sicherstellen, bei reduzierter Bewegung stoppen
var heroVideo = document.querySelector('.hero-bg video');
if (heroVideo) {
  if (reducedMotion) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
  } else {
    var tryPlay = function () {
      if (heroVideo.paused) heroVideo.play().catch(function () {});
    };
    tryPlay();
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
    // Fallback, falls die Autoplay-Policy eine Nutzerinteraktion verlangt
    ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, tryPlay, { once: true, passive: true });
    });
  }
}

function buildCarousel(band) {
  var carousel = document.createElement('div');
  carousel.className = 'quote-carousel';

  var slides = document.createElement('div');
  slides.className = 'quote-slides';
  slides.setAttribute('aria-live', 'polite');

  QUOTES.forEach(function (q) {
    var bq = document.createElement('blockquote');
    bq.innerHTML = '<i data-lucide="quote"></i><br>' + q.text +
      '<cite>' + q.by + '</cite>';
    slides.appendChild(bq);
  });

  var controls = document.createElement('div');
  controls.className = 'quote-controls';

  var btn = document.createElement('button');
  btn.className = 'qc-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Zitatwechsel pausieren');
  btn.innerHTML = '<i data-lucide="pause"></i>';

  var progress = document.createElement('div');
  progress.className = 'qc-progress';
  QUOTES.forEach(function (q, i) {
    var seg = document.createElement('button');
    seg.className = 'qc-seg';
    seg.type = 'button';
    seg.setAttribute('aria-label', 'Zitat ' + (i + 1) + ' anzeigen');
    seg.innerHTML = '<span class="qc-seg-fill"></span>';
    progress.appendChild(seg);
  });

  controls.appendChild(btn);
  controls.appendChild(progress);
  carousel.appendChild(slides);
  carousel.appendChild(controls);
  band.appendChild(carousel);
  band.style.setProperty('--qc-duration', (INTERVAL_MS / 1000) + 's');

  var quotes = slides.querySelectorAll('blockquote');
  var segs = progress.querySelectorAll('.qc-seg');
  var index = 0;
  var timer = null;
  var playing = !reducedMotion;

  function show(i) {
    index = (i + QUOTES.length) % QUOTES.length;
    quotes.forEach(function (bq, k) { bq.classList.toggle('active', k === index); });
    segs.forEach(function (seg, k) {
      seg.classList.remove('active', 'done');
      if (k < index) seg.classList.add('done');
      if (k === index) {
        // Fortschrittsanimation neu starten
        var fill = seg.querySelector('.qc-seg-fill');
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = '';
        seg.classList.add('active');
      }
    });
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(function () { show(index + 1); }, INTERVAL_MS);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function setPlaying(state) {
    playing = state;
    band.classList.toggle('paused', !playing);
    btn.innerHTML = playing ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
    btn.setAttribute('aria-label', playing ? 'Zitatwechsel pausieren' : 'Zitatwechsel fortsetzen');
    lucide.createIcons({ nameAttr: 'data-lucide' });
    if (playing) { startTimer(); } else { stopTimer(); }
  }

  btn.addEventListener('click', function () { setPlaying(!playing); });

  segs.forEach(function (seg, k) {
    seg.addEventListener('click', function () {
      show(k);
      if (playing) startTimer();
    });
  });

  show(0);
  band.classList.toggle('paused', !playing);
  if (!playing) btn.innerHTML = '<i data-lucide="play"></i>';
  if (playing) startTimer();
}

function initQuoteBands() {
  document.querySelectorAll('.quote-band[data-quotes]').forEach(buildCarousel);
  // Icons rendern (nach dem Karussell-Aufbau, damit alle data-lucide erfasst sind)
  lucide.createIcons();
}

// Zitate aus dem Content-Ordner laden, bei Fehlern eingebaute Zitate verwenden
fetch('content/zitate.json', { cache: 'no-store' })
  .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(function (data) {
    if (data && Array.isArray(data.zitate) && data.zitate.length) {
      QUOTES = data.zitate.map(function (z) {
        return { text: z.text, by: z.autor };
      });
    }
  })
  .catch(function () { /* Fallback bleibt aktiv */ })
  .then(initQuoteBands);
