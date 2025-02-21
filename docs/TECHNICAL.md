# English Quest - Documentation Technique

## Structure du Projet
- `/src` : Code source
  - `/config` : Configuration (Firebase, etc.)
  - `/services` : Services (compteur de visites, etc.)
  - `/components` : Composants réutilisables
  
## Configuration Firebase
La configuration Firebase est centralisée dans `src/config/firebase.js`.
Les clés API sont gérées via des variables d'environnement.

## Compteur de Visites
Le service de comptage des visites utilise Firestore pour stocker :
- Visites quotidiennes
- Visiteurs uniques
- Statistiques globales 