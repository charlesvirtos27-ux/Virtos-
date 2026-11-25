# Virtos Gallery — thème Shopify pour vendre des œuvres

Thème Online Store 2.0, esthétique de ton portfolio (blanc, serif italique, bleu #A6DDFF).

## Installer (sans outil)
1. Zippe le **contenu** de ce dossier (`layout/`, `sections/`, `config/`… à la racine du zip).
2. Shopify admin → **Boutique en ligne → Thèmes → Ajouter un thème → Importer un fichier zip**.
3. **Personnaliser** : bannière (une peinture), photo d'atelier, collection à la une, menus, logo, réseaux sociaux.

## Ajouter tes œuvres
- **Produits → Importer** `products-import.csv` (2 exemples, en brouillon), ou crée-les à la main.
- Une œuvre unique = stock **1**, « Continuer à vendre en rupture » **désactivé** → le thème affiche automatiquement « Vendue ».
- Pour un tirage (print) : ajoute une option (ex. A3 / A2) avec un prix par variante.
- Paramètres → **Données personnalisées → Produits** : crée les métachamps `technique`, `dimensions`, `year`, `edition` (espace de noms `custom`, texte sur une ligne). Ils s'affichent sur la fiche.

## À configurer dans Shopify
Paiements (Shopify Payments / PayPal), tarifs de livraison, CGV / mentions légales / retours (Paramètres → Politiques), nom de domaine, page **Contact** (modèle `page.contact`), menus `main-menu` et `footer`.
