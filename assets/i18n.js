/* Choix de la langue (anglais / français) pour tout le site.
   - Un petit sélecteur « EN | FR » est posé en haut à droite de chaque page ; le choix est mémorisé et suivi partout.
   - Sans choix, on prend la langue du navigateur : français si c'est du français, sinon anglais.
   - Un lien avec ?lang=fr ou ?lang=en force la langue (pratique pour la bio Instagram).
   - Le texte écrit dans les pages est l'anglais : si ce script ne se charge pas, tout reste lisible.

   Dans une page :
     data-i18n="clé"                 remplace le texte de l'élément
     data-i18n-html="clé"            idem, avec des balises
     data-i18n-attr="alt:clé;aria-label:clé"   remplace des attributs
   Les textes de chaque page se déclarent avec I18N.add({ en: {...}, fr: {...} }). */
(function () {
  var KEY = 'lang', LANGS = ['en', 'fr'];
  var dicts = { en: {}, fr: {} }, lang = 'en', roots = [], listeners = [];

  function stored() { try { var v = localStorage.getItem(KEY); return LANGS.indexOf(v) >= 0 ? v : null; } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function fromUrl() {
    try { var v = new URLSearchParams(location.search).get('lang'); return LANGS.indexOf(v) >= 0 ? v : null; } catch (e) { return null; }
  }
  function fromBrowser() {
    var n = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    return n.indexOf('fr') === 0 ? 'fr' : 'en';
  }

  function add(d) {
    LANGS.forEach(function (l) { if (d[l]) for (var k in d[l]) dicts[l][k] = d[l][k]; });
  }
  // Typographie française : espace insécable avant « : », espace fine insécable avant « ? ! ; »,
  // et entre un nombre et son unité (14 jours, 80 €) : ces signes ne passent jamais seuls à la ligne.
  function typo(s) {
    return s.replace(/ ([:])/g, ' $1').replace(/ ([?!;])/g, ' $1')
            .replace(/(\d) (g\/m²|g|cm|m|€|%|jours?|heures?)(?![\wé])/g, '$1 $2')
            .replace(/([A-Za-zÀ-ÿ])-(moi|toi|vous|nous|je|tu|il|elle|on|ils|elles|y|en|le|la|les|lui|leur|ce|t-il|t-elle|t-on)(?![\wÀ-ÿ])/g, '$1\u2011$2');   // « Écrivez‑moi » ne se coupe jamais au trait d'union
  }
  // Traduction d'une clé ; {nom} dans le texte est remplacé par vars.nom ; à défaut, l'anglais, puis la clé elle-même.
  function t(key, vars) {
    var s = dicts[lang][key];
    if (s == null) s = dicts.en[key];
    if (s == null) return key;
    if (vars) for (var v in vars) s = s.split('{' + v + '}').join(vars[v]);
    return lang === 'fr' ? typo(s) : s;
  }

  // Nombre décimal : 2.4 en anglais, 2,4 en français.
  function num(n) { return lang === 'fr' ? String(n).replace(/(\d)\.(\d)/g, '$1,$2') : String(n); }

  // Prix : « €80 » en anglais, « 80 € » en français.
  function price(n) { return lang === 'fr' ? num(n) + '\u00a0€' : '€' + num(n); }

  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    root.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i > 0) el.setAttribute(pair.slice(0, i).trim(), t(pair.slice(i + 1).trim()));
      });
    });
  }

  // ----- Sélecteur de langue (en haut à droite) -----
  var sw = null;
  function css() {
    if (document.getElementById('i18n-css')) return;
    var s = document.createElement('style'); s.id = 'i18n-css';
    s.textContent =
      '.langsw{position:fixed;z-index:20;top:1rem;right:1rem;display:inline-flex;align-items:center;padding:0.15rem;border-radius:999px;' +
      'background:rgba(255,255,255,0.88);box-shadow:0 0 0 1px rgba(0,0,0,0.07);font:400 0.82rem/1 Inter,system-ui,sans-serif;letter-spacing:0.08em}' +
      '.langsw button{appearance:none;border:0;background:transparent;color:#000;opacity:0.5;cursor:pointer;min-width:2.6rem;min-height:2.3rem;padding:0 0.6rem;border-radius:999px;font:inherit;letter-spacing:inherit;transition:opacity .2s,background .2s,color .2s}' +
      '.langsw button:hover{opacity:0.85}' +
      '.langsw button[aria-pressed="true"]{opacity:1;background:#000;color:#fff}' +
      '.langsw button:focus-visible{outline:2px solid #4a78b5;outline-offset:2px;opacity:1}' +
      '.langsw.dark{background:rgba(20,20,20,0.7);box-shadow:0 0 0 1px rgba(255,255,255,0.16)}' +
      '.langsw.dark button{color:#fff}' +
      '.langsw.dark button[aria-pressed="true"]{background:#fff;color:#000}' +
      '.viewer-open .langsw{display:none}' +
      '@media (prefers-reduced-motion:reduce){.langsw button{transition:none}}';
    document.head.appendChild(s);
  }
  function isDark() {
    try {
      var c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g) || [255, 255, 255];
      return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) < 110 && (c[3] == null || Number(c[3]) > 0.5);
    } catch (e) { return false; }
  }
  function mount() {
    if (sw || !document.body) return;
    css();
    sw = document.createElement('div');
    sw.className = 'langsw' + (isDark() ? ' dark' : '');
    sw.setAttribute('role', 'group');
    sw.innerHTML = '<button type="button" data-l="en" lang="en" aria-label="English">EN</button><button type="button" data-l="fr" lang="fr" aria-label="Français">FR</button>';
    sw.addEventListener('click', function (e) { var b = e.target.closest('button[data-l]'); if (b) set(b.getAttribute('data-l')); });
    document.body.appendChild(sw);
  }
  function paintSwitch() {
    if (!sw) return;
    sw.setAttribute('aria-label', lang === 'fr' ? 'Langue' : 'Language');
    sw.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === lang)); });
  }

  function applyAll() {
    document.documentElement.lang = lang === 'fr' ? 'fr' : 'en-GB';
    if (dicts[lang]['doc.title'] != null || dicts.en['doc.title'] != null) document.title = t('doc.title');
    apply(document);
    roots.forEach(apply);
    paintSwitch();
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) { if (window.console) console.error(e); } });   // une erreur d'une page n'empêche pas les autres
  }

  function set(l) {
    if (LANGS.indexOf(l) < 0 || l === lang) return;
    lang = l; save(l); applyAll();
  }
  function init() {
    var u = fromUrl();
    if (u) save(u);
    lang = u || stored() || fromBrowser();
    mount();
    applyAll();
  }

  window.I18N = {
    add: add, t: t, num: num, price: price, set: set, init: init, apply: apply,
    get: function () { return lang; },
    addRoot: function (r) { roots.push(r); apply(r); },        // un shadow DOM, par exemple
    onChange: function (fn) { listeners.push(fn); }             // pour les textes construits par le script de la page
  };
})();

// Le lien de retour ramène toujours à la page précédente (s'il y en a une sur ce site) ; sinon il suit son adresse habituelle.
document.addEventListener('click', function (e) {
  var a = e.target && e.target.closest ? e.target.closest('a.back') : null;
  if (!a || e.defaultPrevented) return;
  try {
    if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); }
  } catch (err) {}
});

// Textes communs à toutes les pages.
I18N.add({
  en: { 'nav.back': '← Back', 'nav.workpiece': 'Workpiece', 'nav.about': 'About', 'nav.workshop': 'Workshop', 'nav.contact': 'Contact', 'nav.menu': 'Main', 'nav.instagram': 'Instagram (opens in a new tab)' },
  fr: { 'nav.back': '← Retour', 'nav.workpiece': 'Galerie', 'nav.about': 'À propos', 'nav.workshop': 'Boutique', 'nav.contact': 'Contact', 'nav.menu': 'Menu principal', 'nav.instagram': 'Instagram (s’ouvre dans un nouvel onglet)' }
});
