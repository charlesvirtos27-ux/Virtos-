/* Les prints (tirages) : une seule liste, lue par la page Boutique et par la page de chaque print.
   Tout est à confirmer : prix, nombre d'exemplaires, exemplaires déjà vendus (sold), papier.
   price (facultatif) : prix propre à une pièce ; sans lui, c'est le prix du format (formats[0].price).
   Pour ajouter un print : une ligne dans items, puis dupliquer l'une des pages print-….html en changeant data-print. */
window.PRINTS = {
  perPerson: 1,
  medium: 'val.print.medium',      // clés de traduction (voir print-page.js et workshop.html)
  paper: 'val.print.paper',
  formats: [{ id: 'a3', label: 'A3', size: '29.7 × 42 cm', price: 80, checkout: '' }],   // checkout : lien de paiement, plus tard
  items: [
    { slug: 'ninja-batbat', img: 'batman-2', title: 'Ninja Batbat', edition: 10, sold: 6, price: 60, bats: true,
      mood: { bg: '#050b07', glow: '#5fc531', accent: '#7cd43f', accentInk: '#06110a', second: '#4a5cd8', mark: 'BAT' } }
  ]
};
