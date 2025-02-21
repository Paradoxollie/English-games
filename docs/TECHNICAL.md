# English Quest - Documentation Technique

## Table des Matières
- [Structure du Projet](#structure-du-projet)
- [Configuration Firebase](#configuration-firebase)
- [Services et Fonctionnalités](#services-et-fonctionnalités)
  - [Firebase Integration](#firebase-integration)
  - [Système de Cache](#système-de-cache)
  - [Monitoring](#monitoring)
  - [Compteur de Visites](#compteur-de-visites)
- [Pages Principales](#pages-principales)
- [Styles et Design](#styles-et-design)
  - [Thème Principal](#thème-principal)
  - [Composants Réutilisables](#composants-réutilisables)
  - [Animations](#animations)
- [Optimisations](#optimisations)
  - [Performance](#performance)
  - [Accessibilité](#accessibilité)
- [Scripts de Build](#scripts-de-build)
- [Maintenance](#maintenance)
- [Dépendances et Versions](#dépendances-et-versions)

---

## Structure du Projet

```plaintext
english-quest/
├── src/
│   ├── config/
│   │   └── firebase-config.js    # Configuration Firebase
│   ├── services/
│   │   ├── visitor-counter.js     # Service de comptage des visites
│   │   └── monitoring.js          # Service de monitoring
│   ├── components/
│   │   └── reusable-components    # Composants réutilisables
│   ├── js/
│   │   ├── performance.js         # Optimisation des performances
│   │   ├── accessibility.js       # Gestion de l'accessibilité
│   │   ├── cache-manager.js       # Gestion du cache
│   │   ├── monitoring.js          # Service de monitoring (utilisé côté client)
│   │   └── carousel.js            # Gestion des carousels
│   └── styles/
│       ├── layout.css             # Mise en page principale
│       ├── colors.css             # Variables de couleurs
│       ├── fonts.css              # Typographie
│       ├── transitions.css        # Animations
│       ├── navigation.css         # Styles de navigation
│       ├── carousel.css           # Styles des carousels
│       ├── accessibility.css      # Styles d'accessibilité
│       └── visitor-counter.css    # Styles du compteur
Configuration Firebase
La configuration Firebase est centralisée dans le fichier src/config/firebase-config.js.
Les clés API et autres informations sensibles sont gérées via des variables d'environnement.

Services et Fonctionnalités
Firebase Integration
Configuration centralisée dans firebase-config.js.
Gestion des scores et statistiques via Firestore.
Compteur de visites intégré pour le suivi en temps réel.
Système de Cache
Permet d’optimiser l’accès aux scores et autres données critiques.

javascript
Copier
// Exemple d'utilisation du CacheManager
const cacheManager = new CacheManager();
await cacheManager.getCachedScores(gameId);
Monitoring
Assure le suivi des performances et l’analyse du comportement utilisateur.

javascript
Copier
// Exemple d'utilisation du MonitoringService
const monitoring = new MonitoringService();
monitoring.trackPerformance({
  name: 'page_load',
  value: Date.now()
});
Compteur de Visites
Suivi des visites quotidiennes.
Gestion des visiteurs uniques.
Statistiques en temps réel grâce à Firestore.
Pages Principales
index.html : Page d'accueil avec carousels de jeux et cours.
all-games.html : Liste complète des jeux disponibles.
courses.html : Catalogue des cours.
leaderboard.html : Tableau des scores.
Styles et Design
Thème Principal
Couleurs :
Or (#ffd700) pour les jeux.
Bleu (#3b82f6) pour les cours.
Noir translucide pour les fonds.
Composants Réutilisables
Cards pour la présentation des jeux et cours.
Badges indiquant le niveau de difficulté.
Tags pour la catégorisation.
Boutons personnalisés.
Animations
Transitions fluides pour les carousels.
Effets hover sur les cartes.
Animations de chargement pour une meilleure expérience utilisateur.
Optimisations
Performance
Préchargement des ressources critiques.
Mise en place d’un système de cache pour accélérer le chargement des scores.
Optimisation et compression des images.
Accessibilité
Navigation optimisée au clavier.
Utilisation d’une structure HTML sémantique.
Respect des contrastes de couleurs pour une meilleure lisibilité.
Scripts de Build
Installation des dépendances
bash
Copier
npm install
Mode Développement
bash
Copier
npm run dev
Build pour la Production
bash
Copier
npm run build
Maintenance
Ajout d'un Nouveau Jeu
Placer les assets dans le dossier /images.
Créer la page HTML dédiée au jeu.
Ajouter le jeu dans le carousel de la page index.html.
Mettre à jour la liste dans all-games.html.
Ajout d'un Nouveau Cours
Suivre la même structure que pour les cours existants.
Réutiliser les composants déjà disponibles pour assurer la cohérence.
Vérifier la cohérence visuelle sur l'ensemble du site.
Dépendances et Versions
Dépendances Principales :
Firebase 8.10.0
TailwindCSS
Google Fonts (Cinzel, MedievalSharp)
Notes de Version :
Version actuelle : 1.0.0
Dernière mise à jour : 2024

