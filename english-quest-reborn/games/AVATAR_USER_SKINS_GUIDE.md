# 🎨 Guide Avatar Utilisateur - Enigma Scroll

## 📋 Vue d'Ensemble

Le système d'avatar d'Enigma Scroll affiche maintenant automatiquement les skins choisis par l'utilisateur dans sa page de profil. L'avatar s'adapte en temps réel aux changements de personnalisation.

## 🔧 Fonctionnalités

### ✅ **Skins Supportés**
- **Tête** : Garçon, Fille, Ours, Sorcier, Chevalier...
- **Corps** : Corps correspondants aux têtes
- **Accessoire** : Fichiers GIF animés (lunettes, chapeaux, couronnes...)
- **Arrière-plan** : Défaut, Forêt, Château, Espace...

### ✅ **Intégration Automatique**
- Lecture des données depuis `localStorage`
- Mise à jour en temps réel lors des changements de profil
- Surveillance automatique des modifications
- Fallbacks robustes en cas de problème

## 🎮 Test du Système

### **Fichier de Test**
Ouvrez `games/test-user-skins-avatar.html` pour tester le système :

1. **Configuration** : Sélectionnez différents skins
2. **Application** : Cliquez sur "🎨 Appliquer Skins"
3. **Vérification** : L'avatar flottant se met à jour
4. **Tests** : Utilisez les boutons de test pour animations

### **Boutons de Test Disponibles**
- 🎨 **Appliquer Skins** : Met à jour l'avatar avec les skins sélectionnés
- 💾 **Simuler Sauvegarde** : Simule une sauvegarde de profil
- 🔄 **Reset Défauts** : Remet les skins par défaut
- 🗑️ **Effacer Données** : Efface les données utilisateur
- 💬 **Test Message** : Teste l'affichage des messages
- 🎭 **Test Animation** : Teste les animations
- ⚡ **Test Réaction** : Teste les réactions
- 🔄 **Forcer Refresh** : Force la mise à jour des skins
- 🚀 **Forcer Initialisation** : Force la réinitialisation de l'avatar

## 🔌 Intégration avec le Profil

### **Côté Profil Utilisateur**
Quand l'utilisateur sauvegarde son avatar dans le profil :
```javascript
// Le système appelle automatiquement :
window.updateEnigmaAvatarFromProfile(avatarData);
```

### **Structure des Données**
```javascript
const avatarData = {
    head: "default_girl",      // ID de la tête
    body: "default_girl",      // ID du corps  
    accessory: "glasses",      // ID de l'accessoire (peut être un GIF)
    background: "forest"       // ID de l'arrière-plan
};
```

## 🚀 Fonctions API

### **window.updateEnigmaAvatarFromProfile(avatarData)**
Met à jour l'avatar avec de nouvelles données de profil
```javascript
const success = window.updateEnigmaAvatarFromProfile({
    head: "bear",
    body: "bear", 
    accessory: "crown",
    background: "castle"
});
```

### **window.refreshEnigmaAvatarSkins()**
Force le rafraîchissement des skins depuis le localStorage
```javascript
const refreshed = window.refreshEnigmaAvatarSkins();
```

### **window.forceInitEnigmaAvatar()**
Force la réinitialisation complète de l'avatar
```javascript
const initialized = window.forceInitEnigmaAvatar();
```

## 📁 Chemins des Assets

### **Structure des Fichiers**
```
assets/avatars/
├── heads/
│   ├── default_boy.png
│   ├── default_girl.png
│   ├── bear.png
│   └── ...
├── bodies/
│   ├── default_boy.png
│   ├── default_girl.png
│   ├── bear.png
│   └── ...
├── accessories/
│   ├── default.gif        # ⚠️ GIF pour animation
│   ├── glasses.gif
│   ├── crown.gif
│   └── ...
└── backgrounds/
    ├── default.png
    ├── forest.png
    ├── castle.png
    └── ...
```

### **Important : Accessoires GIF**
Les accessoires utilisent le format `.gif` pour permettre les animations. Le système gère automatiquement :
- Chargement des GIF animés
- Fallback en cas d'erreur
- Positioning et sizing automatiques

## 🔧 Dépannage

### **Avatar Non Visible**
1. Ouvrez la console : `F12`
2. Vérifiez les logs `[EnigmaAvatar]`
3. Utilisez `window.forceInitEnigmaAvatar()`

### **Skins Pas Mis à Jour**
1. Vérifiez le localStorage : `localStorage.getItem('english_quest_current_user')`
2. Utilisez `window.refreshEnigmaAvatarSkins()`
3. Vérifiez la console pour les erreurs

### **Accessoires Non Affichés**
1. Vérifiez que le fichier `.gif` existe
2. Vérifiez la console pour les erreurs de chargement
3. Le fallback utilise `default.gif`

## 🎯 Logs de Debug

### **Messages Importants**
- ✅ `Avatar initialisé avec succès!` : Tout fonctionne
- 🎯 `Skins utilisateur: {...}` : Affiche les skins détectés
- 🎨 `Avatar mis à jour avec succès` : Mise à jour réussie
- ⚠️ `Avatar non initialisé` : Problème d'initialisation

### **Surveillance en Temps Réel**
Le système vérifie automatiquement les changements toutes les 3 secondes et met à jour l'avatar si nécessaire.

## 🎨 Customisation Avancée

### **Ajouter de Nouveaux Skins**
1. Ajoutez les fichiers image dans le bon dossier
2. Mettez à jour le système de profil pour inclure les nouveaux IDs
3. Testez avec `test-user-skins-avatar.html`

### **Modifier les Animations**
Le système d'animation est indépendant des skins. Les animations s'appliquent à l'avatar complet quelle que soit sa personnalisation.

---

**✨ Le système est maintenant entièrement fonctionnel et intégré !** 