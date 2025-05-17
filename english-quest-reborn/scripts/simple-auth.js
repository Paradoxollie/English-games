/**
 * Script pour gérer l'authentification simplifiée
 */

document.addEventListener('DOMContentLoaded', function() {
  // Éléments DOM
  const userMenu = document.getElementById('userMenu');
  const loginButton = document.getElementById('loginButton');
  const profileButton = document.getElementById('profileButton');
  
  // Vérifier si l'utilisateur est connecté
  const storedUser = localStorage.getItem('english_quest_current_user');
  
  if (storedUser) {
    // L'utilisateur est connecté
    if (loginButton) loginButton.style.display = 'none';
    if (profileButton) profileButton.style.display = 'inline-block';
    
    // Récupérer le profil utilisateur
    const userProfile = JSON.parse(storedUser);
    
    // Mettre à jour le texte du bouton de profil
    if (profileButton) {
      profileButton.textContent = userProfile.username || 'Mon Profil';
    }
    
    // Ajouter un bouton de déconnexion
    if (userMenu) {
      const logoutButton = document.createElement('a');
      logoutButton.href = '#';
      logoutButton.className = 'btn-logout';
      logoutButton.textContent = 'Déconnexion';
      logoutButton.style.marginLeft = '10px';
      logoutButton.style.color = '#e74c3c';
      
      logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Supprimer l'utilisateur du localStorage
        localStorage.removeItem('english_quest_current_user');
        
        // Recharger la page
        window.location.reload();
      });
      
      userMenu.appendChild(logoutButton);
    }
  } else {
    // L'utilisateur n'est pas connecté
    if (loginButton) loginButton.style.display = 'inline-block';
    if (profileButton) profileButton.style.display = 'none';
  }
});
