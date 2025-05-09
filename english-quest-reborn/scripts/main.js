/**
 * English Quest - Script principal
 */

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser l'application
  initApp();
});

/**
 * Initialise l'application
 */
function initApp() {
  // Simuler le chargement
  setTimeout(hideLoadingScreen, 2000);
  
  // Initialiser les composants
  initMobileMenu();
  initTabs();
  initModals();
  
  // Ajouter des classes d'animation
  addAnimationClasses();
}

/**
 * Cache l'écran de chargement
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

/**
 * Initialise le menu mobile
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
}

/**
 * Initialise les onglets
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  if (tabButtons.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Supprimer la classe active de tous les boutons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Ajouter la classe active au bouton cliqué
        this.classList.add('active');
        
        // Changer le contenu des onglets (à implémenter)
        const tabId = this.getAttribute('data-tab');
        console.log(`Tab ${tabId} activated`);
      });
    });
  }
}

/**
 * Initialise les modales
 */
function initModals() {
  // Boutons qui ouvrent une modale
  const modalTriggers = document.querySelectorAll('[data-modal]');
  
  // Boutons qui ferment une modale
  const closeButtons = document.querySelectorAll('.modal-close');
  
  if (modalTriggers.length > 0) {
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        
        if (modal) {
          modal.classList.add('active');
        }
      });
    });
  }
  
  if (closeButtons.length > 0) {
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          modal.classList.remove('active');
        }
      });
    });
  }
  
  // Fermer la modale en cliquant en dehors
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
    }
  });
}

/**
 * Ajoute des classes d'animation aux éléments
 */
function addAnimationClasses() {
  // Animer les cartes de jeux
  const gameCards = document.querySelectorAll('.game-card');
  if (gameCards.length > 0) {
    gameCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, 100 * index);
    });
  }
  
  // Animer les cartes de cours
  const courseCards = document.querySelectorAll('.course-card');
  if (courseCards.length > 0) {
    courseCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, 100 * index);
    });
  }
  
  // Animer les cartes de fonctionnalités
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length > 0) {
    featureCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, 100 * index);
    });
  }
}
