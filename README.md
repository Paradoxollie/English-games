# English Quest - Système d'Avatars et de Skins

## Structure des Avatars

Le système d'avatars est composé de plusieurs éléments qui peuvent être personnalisés :

1. **Tête (heads)**
   - Garçon par défaut
   - Fille par défaut
   - Ours (100 pièces)
   - Renard (150 pièces)
   - Chat (200 pièces)

2. **Corps (bodies)**
   - Garçon par défaut
   - Fille par défaut
   - Chevalier (200 pièces)
   - Magicien (250 pièces)
   - Ninja (300 pièces)

3. **Accessoires (accessories)**
   - Aucun (gratuit)
   - Chapeau (100 pièces)
   - Lunettes (150 pièces)
   - Couronne (500 pièces)

4. **Arrière-plans (backgrounds)**
   - Défaut (gratuit)
   - Forêt (200 pièces)
   - Château (300 pièces)
   - Espace (400 pièces)

## Structure des Dossiers

```
assets/
  └── avatars/
      ├── heads/
      │   ├── default_boy.png
      │   ├── default_girl.png
      │   ├── bear.png
      │   ├── fox.png
      │   └── cat.png
      ├── bodies/
      │   ├── default_boy.png
      │   ├── default_girl.png
      │   ├── knight.png
      │   ├── wizard.png
      │   └── ninja.png
      ├── accessories/
      │   ├── none.png
      │   ├── hat.png
      │   ├── glasses.png
      │   └── crown.png
      └── backgrounds/
          ├── default.png
          ├── forest.png
          ├── castle.png
          └── space.png
```

## Spécifications des Images

Pour assurer une cohérence visuelle, les images doivent respecter les spécifications suivantes :

1. **Format** : PNG avec transparence
2. **Dimensions** :
   - Têtes : 200x200 pixels
   - Corps : 200x400 pixels
   - Accessoires : 200x200 pixels
   - Arrière-plans : 400x400 pixels

## Utilisation

1. **Achat de Skins**
   - Les skins peuvent être achetés dans la boutique avec des pièces
   - Les skins achetés sont ajoutés à l'inventaire de l'utilisateur

2. **Équipement des Skins**
   - Les skins possédés peuvent être équipés depuis l'inventaire
   - L'avatar est mis à jour en temps réel

3. **Personnalisation**
   - Les éléments peuvent être combinés librement
   - Les changements sont sauvegardés automatiquement

## Développement

Pour ajouter de nouveaux skins :

1. Créer les images selon les spécifications
2. Ajouter les images dans les dossiers appropriés
3. Mettre à jour le fichier `skin-service.js` avec les nouvelles options
4. Ajouter les prix et les descriptions dans le service

## Notes

- Les skins par défaut sont gratuits
- Les skins achetés sont liés au compte de l'utilisateur
- Les skins peuvent être équipés/déséquipés à tout moment
- Les changements sont sauvegardés automatiquement dans Firebase 