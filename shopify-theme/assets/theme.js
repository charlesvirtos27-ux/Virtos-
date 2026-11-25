(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function toast(msg) { var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); setTimeout(function () { t.classList.remove('on'); }, 2200); }

  // Menu mobile
  var tg = $('[data-menu-toggle]'), nav = $('[data-nav]');
  if (tg && nav) tg.addEventListener('click', function () { var o = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', o); });

  // Fiche produit : variantes + ajout au panier sans rechargement
  var form = $('[data-product-form]');
  if (form) {
    var sel = $('[data-variant-select]', form), btn = $('[data-add]', form), price = $('[data-price]');
    var label = btn.textContent.trim();
    form.addEventListener('change', function (e) {
      if (!e.target.matches('[data-option]')) return;
      var vals = Array.prototype.map.call(form.querySelectorAll('[data-option]:checked'), function (i) { return i.value; }).join(' / ');
      Array.prototype.forEach.call(sel.options, function (o) {
        if (o.text === vals) {
          sel.value = o.value;
          btn.disabled = o.dataset.available !== 'true';
          if (price) price.textContent = o.dataset.price;
          history.replaceState(null, '', '?variant=' + o.value);
        }
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      btn.disabled = true;
      fetch(window.theme.addUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ id: sel.value, quantity: 1 }) })
        .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
        .then(function () { return fetch('/cart.js').then(function (r) { return r.json(); }); })
        .then(function (c) { var n = $('[data-cart-count]'); if (n) n.textContent = c.item_count; toast(window.theme.strings.added); })
        .catch(function () { toast(window.theme.strings.error); })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  }

  // Zoom lightbox
  var lb = $('[data-lightbox]');
  if (lb) {
    var img = $('[data-lightbox-img]', lb);
    document.addEventListener('click', function (e) {
      var z = e.target.closest('[data-zoom]');
      if (z) { img.src = z.dataset.zoom; lb.hidden = false; return; }
      if (e.target === lb || e.target.closest('[data-lightbox-close]')) lb.hidden = true;
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
  }
})();
