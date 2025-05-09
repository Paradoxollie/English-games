/**
 * Point d'entrée principal de l'application
 */

import app from './core/app.js';

// Initialiser l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialiser l'application
    await app.init();

    // Configurer le lazy loading
    setupLazyLoading();

  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'application:', error);
  }
});

/**
 * Configure le chargement paresseux des images et autres éléments
 */
function setupLazyLoading() {
  // Utiliser l'API Intersection Observer pour le lazy loading
  if ('IntersectionObserver' in window) {
    const lazyElements = document.querySelectorAll('[data-lazy]');

    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const lazyType = element.dataset.lazy;

          // Charger l'élément en fonction de son type
          if (lazyType === 'image' && element.tagName === 'IMG') {
            element.src = element.dataset.src;
            if (element.dataset.srcset) {
              element.srcset = element.dataset.srcset;
            }
          } else if (lazyType === 'background') {
            element.style.backgroundImage = `url('${element.dataset.src}')`;
          } else if (lazyType === 'iframe' && element.tagName === 'IFRAME') {
            element.src = element.dataset.src;
          }

          // Supprimer les attributs data-* une fois chargé
          element.removeAttribute('data-lazy');
          element.removeAttribute('data-src');
          element.removeAttribute('data-srcset');

          // Arrêter d'observer cet élément
          lazyObserver.unobserve(element);
        }
      });
    }, {
      rootMargin: '100px', // Charger les éléments 100px avant qu'ils n'entrent dans la vue
      threshold: 0.1 // Déclencher lorsque 10% de l'élément est visible
    });

    // Observer chaque élément
    lazyElements.forEach(element => {
      lazyObserver.observe(element);
    });
  } else {
    // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
    const lazyElements = document.querySelectorAll('[data-lazy]');

    lazyElements.forEach(element => {
      const lazyType = element.dataset.lazy;

      if (lazyType === 'image' && element.tagName === 'IMG') {
        element.src = element.dataset.src;
        if (element.dataset.srcset) {
          element.srcset = element.dataset.srcset;
        }
      } else if (lazyType === 'background') {
        element.style.backgroundImage = `url('${element.dataset.src}')`;
      } else if (lazyType === 'iframe' && element.tagName === 'IFRAME') {
        element.src = element.dataset.src;
      }

      element.removeAttribute('data-lazy');
      element.removeAttribute('data-src');
      element.removeAttribute('data-srcset');
    });
  }
}