/**
 * Version simplifiée du point d'entrée principal pour le développement
 */

// Initialiser l'application lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Application initialisée en mode développement');

    // Configurer le lazy loading
    setupLazyLoading();

    // Initialiser les carousels
    initCarousels();

    // Initialiser le menu mobile
    initMobileMenu();

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

/**
 * Initialise les carousels avec des données factices
 */
function initCarousels() {
  // Données factices pour les jeux
  const games = [
    {
      id: 'speed-verb-challenge',
      title: 'Speed Verb Challenge',
      description: 'Testez votre connaissance des verbes irréguliers anglais contre la montre !',
      image: 'assets/images/speed-challenge.webp',
      url: 'speed-verb-challenge.html'
    },
    {
      id: 'word-bubbles',
      title: 'Word Bubbles',
      description: 'Formez des phrases correctes en faisant éclater les bulles de mots dans le bon ordre.',
      image: 'assets/images/word-bubbles.webp',
      url: 'word-bubbles.html'
    },
    {
      id: 'grammar-matrix',
      title: 'Grammar Matrix',
      description: 'Naviguez dans la matrice grammaticale et trouvez les erreurs cachées.',
      image: 'assets/images/matrix-game.webp',
      url: 'grammar-matrix.html'
    },
    {
      id: 'vocabulary-quest',
      title: 'Vocabulary Quest',
      description: 'Partez à l\'aventure et collectez des mots de vocabulaire pour vaincre les boss.',
      image: 'assets/images/vocabulary-quest.webp',
      url: 'vocabulary-quest.html'
    },
    {
      id: 'tense-tower',
      title: 'Tense Tower',
      description: 'Grimpez la tour en maîtrisant les différents temps verbaux anglais.',
      image: 'assets/images/tense-tower.webp',
      url: 'tense-tower.html'
    },
    {
      id: 'pronunciation-duel',
      title: 'Pronunciation Duel',
      description: 'Affrontez l\'IA dans un duel de prononciation pour améliorer votre accent.',
      image: 'assets/images/pronunciation-duel.webp',
      url: 'pronunciation-duel.html'
    }
  ];

  // Données factices pour les cours
  const courses = [
    {
      id: 'conditional-tenses',
      title: 'Les Temps Conditionnels',
      description: 'Maîtrisez les différents temps conditionnels en anglais et leur utilisation.',
      image: 'assets/images/conditionnel-course.webp',
      url: 'conditional-tenses.html'
    },
    {
      id: 'comparative-superlative',
      title: 'Comparatifs et Superlatifs',
      description: 'Apprenez à comparer en anglais avec les formes comparatives et superlatives.',
      image: 'assets/images/comparative.webp',
      url: 'comparative-superlative.html'
    },
    {
      id: 'modal-verbs',
      title: 'Les Verbes Modaux',
      description: 'Découvrez les nuances des verbes modaux anglais et quand les utiliser.',
      image: 'assets/images/modaux.webp',
      url: 'modal-verbs.html'
    },
    {
      id: 'phrasal-verbs',
      title: 'Phrasal Verbs',
      description: 'Maîtrisez les verbes à particule qui sont essentiels pour parler anglais couramment.',
      image: 'assets/images/phrasal-verbs.webp',
      url: 'phrasal-verbs.html'
    },
    {
      id: 'business-english',
      title: 'Business English',
      description: 'Apprenez le vocabulaire et les expressions utilisés dans le monde professionnel.',
      image: 'assets/images/business-english.webp',
      url: 'business-english.html'
    },
    {
      id: 'idioms-expressions',
      title: 'Idioms & Expressions',
      description: 'Découvrez les expressions idiomatiques anglaises pour parler comme un natif.',
      image: 'assets/images/idioms.webp',
      url: 'idioms-expressions.html'
    }
  ];

  // Initialiser le carousel des jeux
  const gameCarousel = document.getElementById('game-carousel');
  if (gameCarousel) {
    gameCarousel.innerHTML = games.map(game => `
      <div class="carousel__item">
        <div class="card">
          <div class="card__image">
            <img src="${game.image}" alt="${game.title}">
            <div class="card__badge">${Math.floor(Math.random() * 5) + 1} <span class="star">★</span></div>
          </div>
          <div class="card__content">
            <h3 class="card__title">${game.title}</h3>
            <p class="card__description">${game.description}</p>
            <div class="card__footer">
              <a href="${game.url}" class="btn btn-primary btn-sm">Jouer</a>
              <span class="card__players">${Math.floor(Math.random() * 1000) + 100} joueurs</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Ajouter la navigation du carousel
    setupCarouselNavigation('game-carousel');
  }

  // Initialiser le carousel des cours
  const courseCarousel = document.getElementById('course-carousel');
  if (courseCarousel) {
    courseCarousel.innerHTML = courses.map(course => `
      <div class="carousel__item">
        <div class="card">
          <div class="card__image">
            <img src="${course.image}" alt="${course.title}">
            <div class="card__level">Niveau ${['Débutant', 'Intermédiaire', 'Avancé'][Math.floor(Math.random() * 3)]}</div>
          </div>
          <div class="card__content">
            <h3 class="card__title">${course.title}</h3>
            <p class="card__description">${course.description}</p>
            <div class="card__footer">
              <a href="${course.url}" class="btn btn-secondary btn-sm">Commencer</a>
              <span class="card__duration">${Math.floor(Math.random() * 10) + 5} leçons</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Ajouter la navigation du carousel
    setupCarouselNavigation('course-carousel');
  }
}

/**
 * Configure la navigation du carousel
 * @param {string} carouselId - L'ID du carousel
 */
function setupCarouselNavigation(carouselId) {
  const carousel = document.getElementById(carouselId);
  const container = carousel.closest('.carousel-container');

  if (!carousel || !container) return;

  const prevBtn = container.querySelector('.prev');
  const nextBtn = container.querySelector('.next');

  if (prevBtn && nextBtn) {
    // Gérer le clic sur le bouton précédent
    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({
        left: -350,
        behavior: 'smooth'
      });
    });

    // Gérer le clic sur le bouton suivant
    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({
        left: 350,
        behavior: 'smooth'
      });
    });
  }
}

/**
 * Initialise le menu mobile
 */
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const headerNav = document.querySelector('.header__nav');

  if (mobileMenuToggle && headerNav) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      headerNav.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
    });

    // Fermer le menu mobile lorsqu'un lien est cliqué
    const navLinks = headerNav.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        headerNav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}
