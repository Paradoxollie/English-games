/**
 * English Quest - Script de correction pour l'administration
 * Ce script force les privilèges administrateur pour le compte Ollie
 */

// Fonction pour forcer les privilèges administrateur pour Ollie
function forceOllieAdmin() {
  console.log("Tentative de forcer les privilèges administrateur pour Ollie...");
  
  try {
    // Vérifier si l'utilisateur est connecté
    const currentUserJson = localStorage.getItem('english_quest_current_user');
    if (!currentUserJson) {
      console.log("Aucun utilisateur connecté");
      return;
    }
    
    // Récupérer l'utilisateur courant
    const currentUser = JSON.parse(currentUserJson);
    console.log("Utilisateur courant:", currentUser);
    
    // Vérifier si c'est Ollie
    if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
      console.log("Compte Ollie détecté, forçage des privilèges administrateur");
      
      // Forcer les privilèges administrateur
      currentUser.isAdmin = true;
      
      // Sauvegarder l'utilisateur courant
      localStorage.setItem('english_quest_current_user', JSON.stringify(currentUser));
      console.log("Privilèges administrateur forcés pour Ollie dans english_quest_current_user");
      
      // Mettre à jour l'utilisateur dans la liste des utilisateurs
      const usersJson = localStorage.getItem('english_quest_users');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const userId = Object.keys(users).find(id => users[id].username === currentUser.username);
        
        if (userId) {
          users[userId].isAdmin = true;
          localStorage.setItem('english_quest_users', JSON.stringify(users));
          console.log("Privilèges administrateur forcés pour Ollie dans english_quest_users");
        }
      }
      
      // Mettre à jour l'utilisateur dans l'ancienne liste des utilisateurs
      const oldUsersJson = localStorage.getItem('users');
      if (oldUsersJson) {
        const oldUsers = JSON.parse(oldUsersJson);
        const userId = Object.keys(oldUsers).find(id => oldUsers[id].username === currentUser.username);
        
        if (userId) {
          oldUsers[userId].isAdmin = true;
          localStorage.setItem('users', JSON.stringify(oldUsers));
          console.log("Privilèges administrateur forcés pour Ollie dans users");
        }
      }
      
      // Mettre à jour le profil local
      const profileJson = localStorage.getItem('userProfile');
      if (profileJson) {
        const profile = JSON.parse(profileJson);
        if (profile.username === currentUser.username) {
          profile.isAdmin = true;
          localStorage.setItem('userProfile', JSON.stringify(profile));
          console.log("Privilèges administrateur forcés pour Ollie dans userProfile");
        }
      }
      
      // Forcer le rechargement de la page pour appliquer les changements
      alert("Privilèges administrateur forcés pour Ollie. La page va être rechargée.");
      window.location.reload();
    } else {
      console.log("L'utilisateur courant n'est pas Ollie");
    }
  } catch (error) {
    console.error("Erreur lors du forçage des privilèges administrateur:", error);
  }
}

// Ajouter un bouton de débogage pour forcer les privilèges administrateur
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si nous sommes sur la page de profil
  if (window.location.pathname.includes('profile.html')) {
    console.log("Page de profil détectée, ajout du bouton de débogage");
    
    // Créer le bouton de débogage
    const debugButton = document.createElement('button');
    debugButton.id = 'force-admin-btn';
    debugButton.className = 'btn btn-primary';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '20px';
    debugButton.style.right = '20px';
    debugButton.style.zIndex = '9999';
    debugButton.style.padding = '10px 15px';
    debugButton.style.backgroundColor = '#e74c3c';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '5px';
    debugButton.style.cursor = 'pointer';
    debugButton.innerHTML = '<i class="fas fa-crown"></i> Forcer Admin';
    
    // Ajouter l'écouteur d'événement
    debugButton.addEventListener('click', function() {
      forceOllieAdmin();
    });
    
    // Ajouter le bouton au document
    document.body.appendChild(debugButton);
    
    // Exécuter automatiquement la fonction si l'utilisateur est Ollie
    const currentUserJson = localStorage.getItem('english_quest_current_user');
    if (currentUserJson) {
      const currentUser = JSON.parse(currentUserJson);
      if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
        console.log("Compte Ollie détecté, forçage automatique des privilèges administrateur");
        setTimeout(forceOllieAdmin, 1000);
      }
    }
  }
});

// Exécuter la fonction immédiatement
forceOllieAdmin();
