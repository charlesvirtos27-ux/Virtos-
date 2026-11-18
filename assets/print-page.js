/* Page d'un print : toutes les informations d'un tirage, et le bouton d'achat qui renvoie vers la page Contact.
   Les données viennent de prints.js ; le texte suit la langue choisie sur l'accueil. */
(function () {
  I18N.add({ en: {
  "pp.back": "← Back",
  "pp.doc": "{title} — Prints — Virtos Charles",
  "pp.kind": "Limited edition print · {f} · {size}",
  "pp.ship": "Shipping included",
  "pp.closed": "Edition closed",
  "pp.allgone": "All {n} copies have found a home.",
  "pp.left": "<b>{left} of {n} left</b> · next number {k} / {n}",
  "pp.edclosed": "<b>Edition closed.</b> {n} of {n} sold.",
  "pp.meter": "{s} of {n} sold",
  "pp.print": "Print",
  "pp.paper": "Paper",
  "pp.size": "Size",
  "pp.edition": "Edition",
  "pp.edval": "Numbered and signed, {n} copies",
  "val.print.medium": "Giclée print",
  "val.print.paper": "320 gsm textured fine-art paper",
  "val.print.glossy": "300 gsm glossy coated paper",
  "pp.signed": "Numbered and signed by hand, with a certificate",
  "pp.sleeve": "Ships flat in a rigid sleeve, with tracking",
  "pp.returns": "14-day returns",
  "pp.one": "One per person",
  "pp.buy": "Buy print · {f}",
  "pp.wait": "Join the waiting list",
  "pp.frame": "Frame",
  "pp.noframe": "Not included",
  "pp.shown": "Shown framed for illustration · frame not included",
  "pp.artist": "Virtos Charles",
  "pp.c.medium": "{m} on {p}",
  "pp.c.edition": "Each print is numbered and signed by hand, with a certificate",
  "pp.c.ed": "Limited edition of {n}",
  "pp.zoom": "Enlarge the artwork",
  "pp.close": "Close",
  "pp.c.frame": "Frame not included",
  "pp.c.left": "{left} of {n} left · next number {k} / {n}",
  "pp.c.buy": "Buy print · {f}",
  "pp.c.inbtn": "{left} of {n} pieces left",
  "pp.c.orig": "The original is available. Get in touch.",
  "pp.c.next": "Next number: {k} / {n}",
  "pp.c.price": "Price",
  "pp.c.bar": "{left} of {n} left",
  "pp.c.big": "Only {left} left",
  "pp.c.bigsub": "out of {n} numbered prints · next number {k}",
  "pp.c.terms": "Tracked shipping · 14-day returns · One per person",
  "alt.batman-2": "Painting of Batman in a blue cowl with red lips and a bat emblem, on a green background",
  "alt.clown-diable-3": "Painting of a grinning clown with red devil horns and green hair, in a green jacket holding a pistol, on an orange background"
}, fr: {
  "pp.back": "← Retour",
  "pp.doc": "{title} — Tirages — Virtos Charles",
  "pp.kind": "Tirage en édition limitée · {f} · {size}",
  "pp.ship": "Livraison incluse",
  "pp.closed": "Édition terminée",
  "pp.allgone": "Les {n} tirages ont trouvé preneur.",
  "pp.left": "<b>Il en reste {left} sur {n}</b> · prochain numéro {k} / {n}",
  "pp.edclosed": "<b>Édition terminée.</b> Les {n} tirages sont vendus.",
  "pp.meter": "{s} tirages vendus sur {n}",
  "pp.print": "Tirage",
  "pp.paper": "Papier",
  "pp.size": "Format",
  "pp.edition": "Édition",
  "pp.edval": "{n} exemplaires, numérotés et signés",
  "val.print.medium": "Impression giclée",
  "val.print.paper": "Papier beaux-arts texturé 320 g/m²",
  "val.print.glossy": "Papier couché brillant 300 g/m²",
  "pp.signed": "Numéroté et signé à la main, avec un certificat",
  "pp.sleeve": "Expédié à plat sous protection rigide, avec suivi",
  "pp.returns": "Retour possible sous 14 jours",
  "pp.one": "Un par personne",
  "pp.buy": "Acheter le tirage · {f}",
  "pp.wait": "Rejoindre la liste d’attente",
  "pp.frame": "Cadre",
  "pp.noframe": "Non fourni",
  "pp.shown": "Présenté encadré à titre d’illustration · cadre non fourni",
  "pp.artist": "Virtos Charles",
  "pp.c.medium": "{m} sur {p}",
  "pp.c.edition": "Chaque tirage est numéroté et signé à la main, avec un certificat",
  "pp.c.ed": "Édition limitée à {n} tirages",
  "pp.zoom": "Agrandir l’œuvre",
  "pp.close": "Fermer",
  "pp.c.frame": "Cadre non fourni",
  "pp.c.left": "Il en reste {left} sur {n} · prochain numéro {k} / {n}",
  "pp.c.buy": "Acheter le tirage · {f}",
  "pp.c.inbtn": "Il en reste {left} sur {n}",
  "pp.c.orig": "L’original est disponible : n’hésitez pas à me contacter.",
  "pp.c.next": "Prochain numéro : {k} / {n}",
  "pp.c.price": "Prix",
  "pp.c.bar": "Il en reste {left} sur {n}",
  "pp.c.big": "Il n’en reste que {left}",
  "pp.c.bigsub": "sur {n} tirages numérotés · prochain numéro {k}",
  "pp.c.terms": "Expédition avec suivi · Retour sous 14 jours · Un exemplaire par personne",
  "alt.batman-2": "Peinture de Batman en cagoule bleue, aux lèvres rouges et à l’emblème de chauve-souris, sur fond vert",
  "alt.clown-diable-3": "Peinture d’un clown souriant aux cornes de diable rouges et aux cheveux verts, en veste verte tenant un pistolet, sur fond orange"
} });
  var P = window.PRINTS, slug = document.body.getAttribute('data-print');
  var it = P.items.filter(function (x) { return x.slug === slug; })[0];
  if (!it) return;
  var T = I18N.t, q = function (t) { return '“' + t + '”'; };

  // L'univers de la pièce : couleurs tirées de la toile, lueur derrière le cadre, grand signe en filigrane.
  var cartel = document.body.classList.contains('cartel');
  var m = it.mood;
  if (m && !cartel) {
    var bs = document.body.style;
    bs.setProperty('--bg', m.bg); bs.setProperty('--glow', m.glow); bs.setProperty('--accent', m.accent);
    bs.setProperty('--accent-ink', m.accentInk); bs.setProperty('--second', m.second);
    document.body.classList.add('mood');
    var aura = document.createElement('div');
    aura.className = 'aura'; aura.setAttribute('aria-hidden', 'true');
    aura.innerHTML = '<span class="mark">' + m.mark + '</span>';
    document.body.insertBefore(aura, document.body.firstChild);
  }

  // Présentation « cartel » : fond gris neutre, l'œuvre au mur, et à côté une étiquette de musée, sans lignes.
  function renderCartel() {
    var f = P.formats[0], left = it.edition - it.sold, open = left > 0;
    // Couleur d'accent de la pièce (Archer : orange). Ninja Batbat n'a pas d'attribut data-accent : son bouton reste sombre.
    if (document.body.hasAttribute('data-accent') && m) {
      document.body.style.setProperty('--acc', m.accent);
      document.body.style.setProperty('--accent-ink', m.accentInk);
    }
    var lc = function (t) { return t.charAt(0).toLowerCase() + t.slice(1); };
    var href = open ? (f.checkout || 'contact.html') : 'workshop.html#notify';
    var price = I18N.price(it.price || f.price);
    var buy = '<a class="btn" href="' + href + '"><span class="bt"><b>' + (open ? T('pp.c.buy', { f: f.label }) : T('pp.wait')) + '</b>' +
      (open ? '<small>' + T('pp.c.inbtn', { left: left, n: it.edition }) + '</small>' : '') + '</span><span class="go" aria-hidden="true">→</span></a>';
    document.getElementById('print').innerHTML =
      '<figure class="wall"><div class="framed" role="button" tabindex="0" aria-label="' + T('pp.zoom') + '"><img src="assets/img/' + it.img + '.webp" alt="' + T('alt.' + it.img) + '" decoding="async" />' +
        '<span class="zoom-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M10.5 8v5M8 10.5h5"/></svg></span></div></figure>' +
      '<div class="label">' +
        '<h1>' + q(it.title) + '</h1>' +
        '<p class="edl">' + T('pp.c.ed', { n: it.edition }) + '</p>' +
        '<div class="spec"><p>' + T('pp.c.medium', { m: T(P.medium), p: lc(T(it.paper || P.paper)) }) + '</p><p>' + I18N.num(f.size) + ' (' + f.label + ')</p><p class="spec-it">' + T('pp.c.edition', { n: it.edition }) + '</p></div>' +
        '<div class="bx">' +
          '<p class="bx-k">' + T('pp.c.price') + '</p>' +
          '<p class="bx-price">' + (open ? price : T('pp.closed')) + '</p>' +
          '<p class="bx-ship">' + (open ? T('pp.ship') : T('pp.allgone', { n: it.edition })) + '</p>' +
          '<a class="cta" href="' + href + '"><span>' + (open ? T('pp.c.buy', { f: f.label }) : T('pp.wait')) + '</span><span class="go" aria-hidden="true">→</span></a>' +
        '</div>' +
        '<p class="fine">* ' + T('pp.c.frame') + '</p>' +
        '<p class="fine orig">' + T('pp.c.orig') + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="zoom" id="zoom" hidden><button class="zoom-x" type="button">' + T('pp.close') + '</button>' +
        '<img src="assets/img/' + it.img + '.webp" alt="' + T('alt.' + it.img) + '" /></div>';
    // Agrandir l'œuvre : un appui ouvre la toile en grand, un appui ou Échap la referme.
    var fr = document.querySelector('.wall .framed'), zm = document.getElementById('zoom');
    var openZ = function () { zm.hidden = false; document.body.style.overflow = 'hidden'; zm.querySelector('.zoom-x').focus(); };
    fr.addEventListener('click', openZ);
    fr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openZ(); } });
    zm.addEventListener('click', function () { closeZoom(); fr.focus(); });
    document.title = T('pp.doc', { title: q(it.title) });
  }

  // Barre d'achat : tant que le vrai bouton n'est pas visible à l'écran, un rappel reste collé en bas ; il disparaît dès qu'on l'atteint.
  function updateBar() {
    var bar = document.getElementById('sbar'), b = document.querySelector('.buy .btn');
    if (!bar || !b) return;
    var r = b.getBoundingClientRect();
    var out = r.top > window.innerHeight - 70 || r.bottom < 0;
    bar.classList.toggle('show', out);
    bar.setAttribute('aria-hidden', String(!out));
    var a = bar.querySelector('.sbtn'); if (a) a.tabIndex = out ? 0 : -1;
  }
  function closeZoom() { var z = document.getElementById('zoom'); if (z && !z.hidden) { z.hidden = true; document.body.style.overflow = ''; } }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeZoom(); });
  window.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('resize', updateBar);
  window.addEventListener('load', updateBar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateBar);   // la mise en page change quand les polices arrivent

  function render() {
    if (cartel) return renderCartel();
    var f = P.formats[0], left = it.edition - it.sold, open = left > 0;
    var li = function (t) { return '<li>' + t + '</li>'; };
    var row = function (k, v) { return '<div><dt>' + T(k) + '</dt><dd>' + v + '</dd></div>'; };
    document.getElementById('print').innerHTML =
      '<h1>' + q(it.title) + '</h1>' +
      '<figure class="pfig"><div class="framed"><img src="assets/img/' + it.img + '.webp" alt="' + T('alt.' + it.img) + '" decoding="async" /></div>' +
        '<figcaption>' + T('pp.shown') + '</figcaption></figure>' +
      '<div class="info">' +
      '<p class="one">' + T('pp.kind', { f: f.label, size: I18N.num(f.size) }) + '</p>' +
      '<p class="price">' + (open ? I18N.price(it.price || f.price) : T('pp.closed')) + '<small>' + (open ? T('pp.ship') : T('pp.allgone', { n: it.edition })) + '</small></p>' +
      '<div class="edition"><div class="meter" role="img" aria-label="' + T('pp.meter', { s: it.sold, n: it.edition }) + '"><span style="width:' + Math.round(it.sold / it.edition * 100) + '%"></span></div><p>' +
        (open ? T('pp.left', { left: left, n: it.edition, k: it.sold + 1 }) : T('pp.edclosed', { n: it.edition })) + '</p></div>' +
      (open ? '<a class="btn" href="' + (f.checkout || 'contact.html') + '">' + T('pp.buy', { f: f.label }) + '</a>'
            : '<a class="btn" href="workshop.html#notify">' + T('pp.wait') + '</a>') +
      '<dl class="specs">' + row('pp.print', T(P.medium)) + row('pp.paper', T(it.paper || P.paper)) + row('pp.size', I18N.num(f.size) + ' (' + f.label + ')') + row('pp.edition', T('pp.edval', { n: it.edition })) + row('pp.frame', T('pp.noframe')) + '</dl>' +
      '<ul class="assure">' + [T('pp.signed'), T('pp.sleeve'), T('pp.returns'), T('pp.one')].map(li).join('') + '</ul>' +
      '</div>';
    document.title = T('pp.doc', { title: q(it.title) });
  }
  // Chauves-souris (Ninja Batbat) : le vol est dans assets/bats.js, chargé seulement sur cette page.
  function flyBats() { if (it.bats && window.VirtosBats) VirtosBats.play(); }

  I18N.onChange(render);
  I18N.init();
  flyBats();
})();
