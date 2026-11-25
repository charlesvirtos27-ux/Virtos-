const CONFIG = {
  shop: "Virtos",
  currency: "€",
  freeShippingFrom: 49,
  // Colle ici ton lien de paiement (Stripe Payment Link, Shopify checkout, PayPal.me...)
  checkoutUrl: ""
};
const $ = s => document.querySelector(s);
const fmt = n => n.toFixed(2).replace(".", ",") + " " + CONFIG.currency;
let cart = JSON.parse(localStorage.getItem("cart") || "{}");
let cat = "Tous";

const save = () => localStorage.setItem("cart", JSON.stringify(cart));
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 1800); };

function renderFilters() {
  const cats = ["Tous", ...new Set(PRODUCTS.map(p => p.cat))];
  $("#filters").innerHTML = cats.map(c => `<button class="chip ${c === cat ? "on" : ""}" data-c="${c}">${c}</button>`).join("");
  document.querySelectorAll(".chip").forEach(b => b.onclick = () => { cat = b.dataset.c; renderFilters(); renderGrid(); });
}
function renderGrid() {
  const list = PRODUCTS.filter(p => cat === "Tous" || p.cat === cat);
  $("#grid").innerHTML = list.map(p => `
    <article class="card">
      <div class="img" data-open="${p.id}">${p.badge ? `<span class="badge">${p.badge}</span>` : ""}${p.emoji}</div>
      <div class="body"><small>${p.cat}</small><b>${p.name}</b>
        <div class="stars">★★★★★ <small>(${100 + p.id * 37})</small></div>
        <div class="price">${fmt(p.price)}<s>${fmt(p.old)}</s></div>
        <button class="add" data-add="${p.id}">Ajouter au panier</button>
      </div></article>`).join("");
  document.querySelectorAll("[data-add]").forEach(b => b.onclick = () => add(+b.dataset.add));
  document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => openModal(+b.dataset.open));
}
function add(id, d = 1) {
  cart[id] = (cart[id] || 0) + d;
  if (cart[id] <= 0) delete cart[id];
  save(); renderCart();
  if (d > 0) { toast("Ajouté au panier ✓"); }
}
function renderCart() {
  const ids = Object.keys(cart);
  const total = ids.reduce((s, id) => s + PRODUCTS.find(p => p.id == id).price * cart[id], 0);
  const count = ids.reduce((s, id) => s + cart[id], 0);
  $("#count").textContent = count;
  $("#items").innerHTML = ids.length ? ids.map(id => {
    const p = PRODUCTS.find(p => p.id == id);
    return `<div class="it"><div class="e">${p.emoji}</div><div class="t"><b>${p.name}</b><br>${fmt(p.price)}</div>
      <div class="q"><button data-d="-1" data-id="${id}">−</button><span>${cart[id]}</span><button data-d="1" data-id="${id}">+</button></div></div>`;
  }).join("") : "<p style='color:#6b6b78;text-align:center;margin-top:3rem'>Ton panier est vide 🛒</p>";
  document.querySelectorAll(".q button").forEach(b => b.onclick = () => add(+b.dataset.id, +b.dataset.d));
  const left = CONFIG.freeShippingFrom - total;
  $("#ship").textContent = left > 0 ? `Plus que ${fmt(left)} pour la livraison offerte !` : "🎉 Livraison offerte !";
  $("#bar").style.width = Math.min(100, total / CONFIG.freeShippingFrom * 100) + "%";
  $("#total").textContent = fmt(total);
}
function openModal(id) {
  const p = PRODUCTS.find(p => p.id === id);
  $("#modal").innerHTML = `<div class="mbox" style="position:relative"><button class="x" id="mx">×</button>
    <div class="img">${p.emoji}</div><div class="mb"><small>${p.cat}</small><h3>${p.name}</h3>
    <div class="stars">★★★★★ (${100 + p.id * 37} avis)</div><p style="color:#6b6b78">${p.desc}</p>
    <div class="price">${fmt(p.price)}<s>${fmt(p.old)}</s></div>
    <ul style="color:#6b6b78;font-size:.9rem;padding-left:1.1rem"><li>Livraison 7-15 jours</li><li>Satisfait ou remboursé 30 jours</li></ul>
    <button class="add" id="madd">Ajouter au panier</button></div></div>`;
  $("#modal").classList.add("on");
  $("#mx").onclick = () => $("#modal").classList.remove("on");
  $("#madd").onclick = () => { add(id); $("#modal").classList.remove("on"); };
}
const drawer = on => { $("#drawer").classList.toggle("on", on); $("#ov").classList.toggle("on", on); };
$("#cartbtn").onclick = () => drawer(true);
$("#close").onclick = $("#ov").onclick = () => drawer(false);
$("#modal").onclick = e => { if (e.target.id === "modal") $("#modal").classList.remove("on"); };
$("#pay").onclick = () => {
  if (!Object.keys(cart).length) return toast("Panier vide");
  if (CONFIG.checkoutUrl) location.href = CONFIG.checkoutUrl;
  else alert("Paiement non configuré : renseigne CONFIG.checkoutUrl dans app.js (Stripe Payment Link, Shopify, PayPal…).");
};
$("#nl").onsubmit = e => { e.preventDefault(); toast("Merci ! -10% dans ta boîte mail 🎁"); e.target.reset(); };
// Aide : tape margins() dans la console pour voir ta marge par produit
window.margins = () => console.table(PRODUCTS.map(p => ({ produit: p.name, prix: p.price, achat: p.cost, marge: +(p.price - p.cost).toFixed(2), "marge %": Math.round((p.price - p.cost) / p.price * 100) })));
renderFilters(); renderGrid(); renderCart();
