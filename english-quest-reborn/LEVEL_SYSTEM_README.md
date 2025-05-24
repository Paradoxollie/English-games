# Système de Niveaux XP - English Quest Reborn

## Vue d'ensemble

Le système de niveaux XP a été implémenté pour créer une progression similaire à celle d'un MMO, avec une courbe de croissance exponentielle qui rend chaque niveau plus difficile à atteindre que le précédent.

## Fonctionnalités Implémentées

### 1. Service de Niveaux (`level-service.js`)
- **Progression exponentielle** : Chaque niveau nécessite 15% d'XP en plus que le précédent
- **Niveau de base** : 100 XP pour passer du niveau 1 au niveau 2
- **Niveau maximum** : 100 niveaux
- **Cache optimisé** : Pré-calcul de tous les paliers XP pour des performances optimales

### 2. Restrictions de Niveau
- **Skins Ours** : Tête et corps d'ours débloqués au niveau 5
- **Système extensible** : Facile d'ajouter de nouveaux items avec des niveaux requis
- **Vérification côté client et serveur** : Double validation pour la sécurité

### 3. Interface Utilisateur

#### Barre de Progression XP
- Affichage du niveau actuel
- Barre de progression visuelle
- XP actuel / XP nécessaire pour le niveau suivant
- Pourcentage de progression

#### Onglet Progression
- **Simulateur XP** : Testez combien d'XP vous ferait gagner de niveaux
- **Paliers de déblocage** : Visualisez les récompenses à venir
- **Tableau des niveaux** : Consultez les XP requis pour chaque niveau

#### Inventaire Amélioré
- **Items verrouillés** : Affichage grisé avec icône de cadenas
- **Niveau requis** : Badge rouge indiquant le niveau nécessaire
- **Feedback visuel** : Différenciation claire entre items disponibles et verrouillés

## Configuration des Niveaux

### Formule de Calcul XP
```javascript
XP_pour_niveau_N = 100 * (1.15)^(N-2)
XP_total_niveau_N = Somme des XP de tous les niveaux précédents
```

### Exemples de Paliers
- **Niveau 5** : ~518 XP total (déblocage skins Ours)
- **Niveau 10** : ~2,030 XP total
- **Niveau 20** : ~16,367 XP total
- **Niveau 50** : ~1,083,657 XP total

## Ajout de Nouveaux Items avec Restrictions

### Dans `skin-service.js`
```javascript
{
  id: 'nouveau_item',
  name: 'Nom de l\'item',
  price: 200,
  image: 'chemin/vers/image.png',
  minLevel: 10 // Niveau requis
}
```

### Paliers de Déblocage
Modifiez `getUnlockMilestones()` dans `level-service.js` pour ajouter de nouveaux paliers.

## Intégration avec les Jeux

Pour donner de l'XP aux joueurs après un jeu :

```javascript
// Exemple d'ajout d'XP
const xpGained = 50; // XP gagné
const user = authService.getCurrentUser();
const newXP = (user.xp || 0) + xpGained;

await authService.updateProfile({
  xp: newXP
});
```

## Sécurité

- **Validation côté serveur** : Toutes les vérifications de niveau sont faites côté serveur
- **Double vérification** : Le client et le serveur vérifient les restrictions
- **Protection contre la triche** : Impossible d'acheter des items sans le niveau requis

## Maintenance

### Ajustement de la Courbe XP
Modifiez les constantes dans `level-service.js` :
- `baseXP` : XP de base (défaut: 100)
- `xpMultiplier` : Multiplicateur de croissance (défaut: 1.15)
- `maxLevel` : Niveau maximum (défaut: 100)

### Ajout de Nouveaux Paliers
1. Ajoutez l'item dans `skin-service.js` avec `minLevel`
2. Mettez à jour `getUnlockMilestones()` si nécessaire
3. Testez avec le simulateur XP

## Tests

Utilisez le simulateur XP dans l'onglet "Progression" pour :
- Tester les montants d'XP
- Vérifier les passages de niveau
- Valider les déblocages

## Performance

- **Cache optimisé** : Tous les calculs XP sont pré-calculés
- **Chargement rapide** : Pas de calculs lourds en temps réel
- **Mémoire efficace** : Utilisation d'une Map pour le cache

## Évolutions Futures

- Système de prestige après le niveau 100
- Bonus XP temporaires
- Événements spéciaux avec XP doublé
- Quêtes journalières avec récompenses XP 