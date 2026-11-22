/* Équivalent en ETH des prix affichés.
   Tout élément portant data-eur="60" reçoit « ≈ 0,0213 ETH ».
   Le cours vient de CoinGecko (repli : Coinbase), gardé 10 minutes dans le navigateur.
   Si le cours est introuvable, l'équivalent reste masqué : le prix en euros fait foi. */
(function () {
  var KEY = 'eth_eur', TTL = 10 * 60 * 1000, rate = null, at = 0;

  function lang() { return (window.I18N && I18N.get && I18N.get()) || document.documentElement.lang || 'en'; }
  function fmt(eth) {
    var d = eth >= 1 ? 3 : 4;
    var s = eth.toFixed(d);
    return lang() === 'fr' ? s.replace('.', ',') : s;
  }
  function label(eur) {
    var fr = lang() === 'fr', r = Math.round(rate).toLocaleString(fr ? 'fr-FR' : 'en-GB');
    return fr ? 'Cours indicatif : 1 ETH ≈ ' + r + ' €. Le paiement se fait en euros.'
              : 'Indicative rate: 1 ETH ≈ €' + r + '. Payment is made in euros.';
  }
  function fill() {
    var els = document.querySelectorAll('[data-eur]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i], eur = parseFloat(el.getAttribute('data-eur'));
      if (!rate || !(eur > 0)) { el.hidden = true; continue; }
      var txt = '≈ ' + fmt(eur / rate) + ' ETH';
      if (el.textContent !== txt) el.textContent = txt;
      el.title = label(eur);
      el.hidden = false;
    }
  }
  function store(r) { rate = r; at = Date.now(); try { localStorage.setItem(KEY, JSON.stringify({ r: r, t: at })); } catch (e) {} fill(); }
  function get(url, pick) {
    return fetch(url, { cache: 'no-store' }).then(function (res) { if (!res.ok) throw 0; return res.json(); })
      .then(function (j) { var r = parseFloat(pick(j)); if (!(r > 0)) throw 0; return r; });
  }
  function load() {
    try { var c = JSON.parse(localStorage.getItem(KEY) || 'null'); if (c && c.r > 0) { rate = c.r; at = c.t; } } catch (e) {}
    fill();
    if (rate && Date.now() - at < TTL) return;
    if (!window.fetch) return;
    get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur', function (j) { return j.ethereum.eur; })
      .catch(function () { return get('https://api.coinbase.com/v2/exchange-rates?currency=ETH', function (j) { return j.data.rates.EUR; }); })
      .then(store, function () { fill(); });
  }

  if (window.I18N && I18N.onChange) I18N.onChange(function () { setTimeout(fill, 0); });
  if (window.MutationObserver) {
    var t = null;
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(fill, 30); })
      .observe(document.documentElement, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
  setInterval(function () { if (Date.now() - at >= TTL) load(); }, TTL);
})();
