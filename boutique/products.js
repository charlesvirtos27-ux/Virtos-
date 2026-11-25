// Catalogue : modifie ici tes produits. `supplier` = lien fournisseur (AliExpress, CJ, Spocket...)
// `cost` = prix d'achat fournisseur (sert au calcul de marge dans la console : margins())
window.PRODUCTS = [
  { id: 1, name: "Lampe Lune LED 3D", cat: "Maison", price: 29.9, old: 49.9, cost: 8.5, emoji: "🌙", badge: "Best-seller", desc: "Lampe veilleuse lune imprimée en 3D, 16 couleurs, télécommande incluse. Idée cadeau n°1.", supplier: "#" },
  { id: 2, name: "Mini Blender Portable USB", cat: "Cuisine", price: 34.9, old: 59.9, cost: 11, emoji: "🥤", badge: "-42%", desc: "Prépare tes smoothies partout. 6 lames inox, rechargeable USB-C, 400 ml.", supplier: "#" },
  { id: 3, name: "Écouteurs Sans Fil Pro", cat: "Tech", price: 39.9, old: 79.9, cost: 9.8, emoji: "🎧", badge: "Promo", desc: "Bluetooth 5.3, réduction de bruit, 30 h d'autonomie avec le boîtier.", supplier: "#" },
  { id: 4, name: "Brosse Nettoyante Animaux", cat: "Animaux", price: 19.9, old: 29.9, cost: 3.2, emoji: "🐕", badge: "", desc: "Enlève les poils en un geste, bouton auto-nettoyant. Chiens et chats.", supplier: "#" },
  { id: 5, name: "Organisateur de Câbles Magnétique", cat: "Tech", price: 14.9, old: 24.9, cost: 2.1, emoji: "🔌", badge: "", desc: "Lot de 6 clips magnétiques pour un bureau impeccable.", supplier: "#" },
  { id: 6, name: "Masseur Cervical Chauffant", cat: "Bien-être", price: 44.9, old: 79.9, cost: 14, emoji: "💆", badge: "Nouveau", desc: "Massage shiatsu avec chaleur apaisante. Idéal après une longue journée.", supplier: "#" },
  { id: 7, name: "Projecteur Ciel Étoilé", cat: "Maison", price: 32.9, old: 54.9, cost: 9, emoji: "✨", badge: "Tendance", desc: "Galaxie et aurore boréale dans ta chambre, enceinte Bluetooth intégrée.", supplier: "#" },
  { id: 8, name: "Gourde Isotherme 1 L", cat: "Bien-être", price: 24.9, old: 39.9, cost: 5.5, emoji: "💧", badge: "", desc: "Froid 24 h / chaud 12 h, acier inoxydable, embout paille.", supplier: "#" }
];
