/**
 * Module pour ajouter un onglet d'administration au profil utilisateur
 */

import AdminPanel from './admin-panel.js';
import { isAdmin } from './admin.service.js';
import { getAuthState } from '@features/auth/auth.service.js';

/**
 * Ajoute un onglet d'administration au profil utilisateur
 */
export function addAdminTab() {
  // Récupérer l'utilisateur actuel
  const authState = getAuthState();
  const currentUser = authState.profile;
  
  // Vérifier si l'utilisateur est administrateur
  if (!currentUser || !isAdmin(currentUser)) {
    console.log("L'utilisateur n'est pas administrateur, onglet d'administration non ajouté");
    return;
  }
  
  console.log("Ajout de l'onglet d'administration pour", currentUser.username);
  
  // Récupérer les éléments du DOM
  const tabsContainer = document.querySelector('.profile-tabs');
  const contentContainer = document.querySelector('.profile-content > .container');
  
  if (!tabsContainer || !contentContainer) {
    console.error("Conteneurs d'onglets ou de contenu non trouvés");
    return;
  }
  
  // Vérifier si l'onglet existe déjà
  if (document.querySelector('.profile-tab[data-tab="admin"]')) {
    console.log("L'onglet d'administration existe déjà");
    return;
  }
  
  // Créer l'onglet d'administration
  const adminTab = document.createElement('button');
  adminTab.className = 'profile-tab';
  adminTab.dataset.tab = 'admin';
  adminTab.innerHTML = '<i class="fas fa-shield-alt"></i> Administration';
  
  // Ajouter l'onglet au conteneur
  tabsContainer.appendChild(adminTab);
  
  // Créer le contenu de l'onglet d'administration
  const adminContent = document.createElement('div');
  adminContent.className = 'profile-tab-content';
  adminContent.id = 'admin-content';
  
  // Ajouter le contenu au conteneur
  contentContainer.appendChild(adminContent);
  
  // Initialiser le panneau d'administration
  const adminPanel = new AdminPanel();
  
  // Ajouter l'écouteur d'événement pour l'onglet
  adminTab.addEventListener('click', function() {
    // Retirer la classe active de tous les onglets et contenus
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
    
    // Ajouter la classe active à l'onglet d'administration
    adminTab.classList.add('active');
    adminContent.classList.add('active');
    
    // Initialiser le panneau d'administration si ce n'est pas déjà fait
    adminPanel.init(adminContent);
  });
  
  console.log("Onglet d'administration ajouté avec succès");
}

/**
 * Ajoute un badge d'administrateur au nom d'utilisateur
 */
export function addAdminBadge() {
  // Récupérer l'élément du nom d'utilisateur
  const usernameElement = document.getElementById('profile-username');
  
  if (!usernameElement) {
    console.error("Élément de nom d'utilisateur non trouvé");
    return;
  }
  
  // Vérifier si le badge existe déjà
  if (usernameElement.querySelector('.admin-badge')) {
    console.log("Le badge d'administrateur existe déjà");
    return;
  }
  
  // Créer le badge
  const badge = document.createElement('span');
  badge.className = 'admin-badge';
  badge.innerHTML = '<i class="fas fa-crown"></i> Admin';
  
  // Ajouter le badge après le nom d'utilisateur
  usernameElement.appendChild(badge);
  
  console.log("Badge d'administrateur ajouté avec succès");
}

/**
 * Initialise les fonctionnalités d'administration
 */
export function initAdminFeatures() {
  // Récupérer l'utilisateur actuel
  const authState = getAuthState();
  const currentUser = authState.profile;
  
  // Vérifier si l'utilisateur est administrateur
  if (!currentUser) {
    console.log("Aucun utilisateur connecté");
    return;
  }
  
  console.log("Vérification des droits d'administration pour", currentUser.username);
  
  // Vérification spéciale pour Ollie
  if (currentUser.username && currentUser.username.toLowerCase() === 'ollie') {
    console.log("Compte Ollie détecté, forçage des privilèges administrateur");
    
    // Ajouter le badge d'administrateur
    addAdminBadge();
    
    // Ajouter l'onglet d'administration
    addAdminTab();
    
    return;
  }
  
  // Vérifier si l'utilisateur est administrateur
  if (isAdmin(currentUser)) {
    console.log("Utilisateur administrateur détecté:", currentUser.username);
    
    // Ajouter le badge d'administrateur
    addAdminBadge();
    
    // Ajouter l'onglet d'administration
    addAdminTab();
  } else {
    console.log("L'utilisateur n'est pas administrateur");
  }
}

export default {
  addAdminTab,
  addAdminBadge,
  initAdminFeatures
};
