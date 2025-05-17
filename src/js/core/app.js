/**
 * Application principale
 * Initialise les services et les composants
 */

import AuthService from '../services/auth-service.js';
import LeaderboardService from '../services/leaderboard-service.js';
import GameService from '../services/game-service.js';
import ThemeManager from '../utils/theme-manager.js';
import NavigationManager from '../utils/navigation-manager.js';
import PerformanceMonitor from '../utils/performance-monitor.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js';

class App {
  constructor() {
    // Firebase
    this.firebase = null;
    this.auth = null;
    this.db = null;
    this.analytics = null;

    // Services
    this.authService = null;
    this.leaderboardService = null;
    this.gameService = null;

    // Utilitaires
    this.themeManager = null;
    this.navigationManager = null;
    this.performanceMonitor = null;

    // État
    this.isInitialized = false;
    this.currentPage = null;
  }

  /**
   * Initialise l'application
   * @returns {Promise} - Promesse résolue lorsque l'initialisation est terminée
   */
  async init() {
    try {
      console.log('Initialisation de l\'application...');

      // Initialiser Firebase
      await this.initFirebase();

      // Initialiser les services
      this.initServices();

      // Initialiser les utilitaires
      this.initUtils();

      // Initialiser la page actuelle
      this.initCurrentPage();

      // Marquer comme initialisé
      this.isInitialized = true;

      console.log('Application initialisée avec succès.');

      return this;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'application:', error);
      throw error;
    }
  }

  /**
   * Initialise Firebase
   * @returns {Promise} - Promesse résolue lorsque Firebase est initialisé
   */
  async initFirebase() {
    try {
      // Importer la configuration Firebase
      const { firebaseConfig } = await import('../firebase-config.js');

      // Initialiser Firebase
      this.firebase = initializeApp(firebaseConfig);
      this.auth = getAuth(this.firebase);
      this.db = getFirestore(this.firebase);
      this.analytics = getAnalytics(this.firebase);

      console.log('Firebase initialisé avec succès.');
      return this.firebase;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Firebase:', error);
      // Créer un objet Firebase factice pour le développement
      this.firebase = {
        auth: () => ({
          onAuthStateChanged: (callback) => callback(null),
          signInAnonymously: () => Promise.resolve({ user: null }),
          signOut: () => Promise.resolve()
        }),
        firestore: () => ({
          collection: () => ({
            doc: () => ({
              get: () => Promise.resolve({ exists: false, data: () => ({}) }),
              set: () => Promise.resolve(),
              update: () => Promise.resolve(),
              delete: () => Promise.resolve()
            }),
            where: () => ({
              limit: () => ({
                get: () => Promise.resolve({ empty: true, docs: [] })
              })
            }),
            add: () => Promise.resolve({ id: 'dummy-id' }),
            get: () => Promise.resolve({ docs: [] })
          })
        })
      };

      console.log('Firebase factice initialisé pour le développement.');
      return this.firebase;
    }
  }

  /**
   * Initialise les services
   */
  initServices() {
    // Service d'authentification
    this.authService = new AuthService(this.firebase);

    // Service de classement
    this.leaderboardService = new LeaderboardService(this.firebase, this.authService);

    // Service de jeu
    this.gameService = new GameService(this.firebase, this.authService);

    console.log('Services initialisés avec succès.');
  }

  /**
   * Initialise les utilitaires
   */
  initUtils() {
    // Gestionnaire de thème
    this.themeManager = new ThemeManager();

    // Gestionnaire de navigation
    this.navigationManager = new NavigationManager();

    // Moniteur de performance
    this.performanceMonitor = new PerformanceMonitor();

    console.log('Utilitaires initialisés avec succès.');
  }

  /**
   * Initialise la page actuelle
   */
  initCurrentPage() {
    // Déterminer la page actuelle
    const path = window.location.pathname;
    const pageName = path.split('/').pop().replace('.html', '') || 'index';

    this.currentPage = pageName;

    // Ajouter la classe de page au body
    document.body.classList.add(`page-${pageName}`);

    // Initialiser le thème
    if (pageName === 'index') {
      this.themeManager.setTheme('home');
    } else if (pageName.includes('game') || pageName === 'all-games') {
      this.themeManager.setTheme('games');
    } else if (pageName.includes('course') || pageName === 'courses') {
      this.themeManager.setTheme('courses');
    } else if (pageName === 'leaderboard') {
      this.themeManager.setTheme('leaderboard');
    } else if (pageName === 'contact') {
      this.themeManager.setTheme('contact');
    }

    console.log(`Page actuelle: ${pageName}`);

    // Initialiser les composants spécifiques à la page
    this.initPageComponents(pageName);
  }

  /**
   * Initialise les composants spécifiques à la page
   * @param {string} pageName - Nom de la page
   */
  async initPageComponents(pageName) {
    try {
      switch (pageName) {
        case 'index':
          await this.initHomePage();
          break;
        case 'all-games':
          await this.initGamesPage();
          break;
        case 'courses':
          await this.initCoursesPage();
          break;
        case 'leaderboard':
          await this.initLeaderboardPage();
          break;
        case 'contact':
          await this.initContactPage();
          break;
        default:
          // Vérifier s'il s'agit d'une page de jeu
          if (pageName.includes('game') || pageName.includes('challenge') || pageName.includes('matrix') || pageName.includes('bubbles')) {
            await this.initGamePage(pageName);
          }
          // Vérifier s'il s'agit d'une page de cours
          else if (pageName.includes('course') || pageName.includes('conditional') || pageName.includes('superlative')) {
            await this.initCoursePage(pageName);
          }
          break;
      }
    } catch (error) {
      console.error(`Erreur lors de l'initialisation des composants de la page ${pageName}:`, error);
    }
  }

  /**
   * Initialise la page d'accueil
   */
  async initHomePage() {
    try {
      // Charger les jeux et les cours
      await this.gameService.init();

      // Importer les composants nécessaires
      const { default: GameCard } = await import('../../components/games/game-card.js');
      const { default: CourseCard } = await import('../../components/courses/course-card.js');
      const { default: Carousel } = await import('../../components/common/carousel.js');

      // Initialiser le carrousel des jeux
      const gameCarouselContainer = document.getElementById('game-carousel');
      if (gameCarouselContainer) {
        // Créer les slides
        this.gameService.games.forEach(game => {
          const slide = document.createElement('div');
          GameCard.render(game, slide);
          gameCarouselContainer.appendChild(slide);
        });

        // Initialiser le carrousel
        new Carousel(gameCarouselContainer, {
          slidesToShow: 3,
          autoplay: true,
          autoplaySpeed: 5000
        });
      }

      // Initialiser le carrousel des cours
      const courseCarouselContainer = document.getElementById('course-carousel');
      if (courseCarouselContainer) {
        // Créer les slides
        this.gameService.courses.forEach(course => {
          const slide = document.createElement('div');
          CourseCard.render(course, slide);
          courseCarouselContainer.appendChild(slide);
        });

        // Initialiser le carrousel
        new Carousel(courseCarouselContainer, {
          slidesToShow: 3,
          autoplay: true,
          autoplaySpeed: 7000
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la page d\'accueil:', error);
    }
  }

  /**
   * Initialise la page des jeux
   */
  async initGamesPage() {
    try {
      // Charger les jeux
      await this.gameService.init();

      // Importer les composants nécessaires
      const { default: GameCard } = await import('../../components/games/game-card.js');

      // Initialiser la grille de jeux
      const gameGrid = document.getElementById('game-grid');
      if (gameGrid) {
        GameCard.renderMultiple(this.gameService.games, gameGrid);
      }

      // Initialiser les filtres
      const filterButtons = document.querySelectorAll('.game-filter');
      if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
          button.addEventListener('click', () => {
            // Supprimer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');

            // Filtrer les jeux
            const category = button.dataset.category;
            let filteredGames;

            if (category === 'all') {
              filteredGames = this.gameService.games;
            } else {
              filteredGames = this.gameService.getGamesByCategory(category);
            }

            // Mettre à jour la grille
            GameCard.renderMultiple(filteredGames, gameGrid);
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la page des jeux:', error);
    }
  }

  /**
   * Initialise la page des cours
   */
  async initCoursesPage() {
    try {
      // Charger les cours
      await this.gameService.init();

      // Importer les composants nécessaires
      const { default: CourseCard } = await import('../../components/courses/course-card.js');

      // Initialiser la grille de cours
      const courseGrid = document.getElementById('course-grid');
      if (courseGrid) {
        CourseCard.renderMultiple(this.gameService.courses, courseGrid);
      }

      // Initialiser les filtres
      const filterButtons = document.querySelectorAll('.course-filter');
      if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
          button.addEventListener('click', () => {
            // Supprimer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');

            // Filtrer les cours
            const level = button.dataset.level;
            let filteredCourses;

            if (level === 'all') {
              filteredCourses = this.gameService.courses;
            } else {
              filteredCourses = this.gameService.getCoursesByLevel(level);
            }

            // Mettre à jour la grille
            CourseCard.renderMultiple(filteredCourses, courseGrid);
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la page des cours:', error);
    }
  }

  /**
   * Initialise la page de classement
   */
  async initLeaderboardPage() {
    try {
      // Importer les composants nécessaires
      const { default: Leaderboard } = await import('../../components/common/leaderboard.js');

      // Initialiser le classement
      const leaderboardContainer = document.getElementById('leaderboard-container');
      if (leaderboardContainer) {
        // Obtenir le jeu sélectionné
        const gameSelect = document.getElementById('game-select');
        let gameId = 'speed-verb-challenge'; // Par défaut

        if (gameSelect) {
          gameId = gameSelect.value;

          // Écouter les changements
          gameSelect.addEventListener('change', () => {
            const selectedGameId = gameSelect.value;
            leaderboard.loadScores(selectedGameId);
          });
        }

        // Créer le classement
        const leaderboard = new Leaderboard(this.leaderboardService, 'leaderboard-container', {
          gameId,
          limit: 10,
          showTabs: true
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la page de classement:', error);
    }
  }

  /**
   * Initialise la page de contact
   */
  async initContactPage() {
    try {
      // Initialiser le formulaire de contact
      const contactForm = document.getElementById('contact-form');
      if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          // Récupérer les données du formulaire
          const formData = new FormData(contactForm);
          const data = Object.fromEntries(formData.entries());

          // Valider les données
          if (!data.name || !data.message) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
          }

          try {
            // Envoyer les données
            const response = await fetch('https://formspree.io/f/your-form-id', {
              method: 'POST',
              body: formData,
              headers: {
                'Accept': 'application/json'
              }
            });

            if (response.ok) {
              // Afficher un message de succès
              contactForm.reset();
              alert('Votre message a été envoyé avec succès !');
            } else {
              // Afficher un message d'erreur
              alert('Une erreur s\'est produite lors de l\'envoi du message. Veuillez réessayer.');
            }
          } catch (error) {
            console.error('Erreur lors de l\'envoi du formulaire:', error);
            alert('Une erreur s\'est produite lors de l\'envoi du message. Veuillez réessayer.');
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la page de contact:', error);
    }
  }

  /**
   * Initialise une page de jeu
   * @param {string} pageName - Nom de la page
   */
  async initGamePage(pageName) {
    try {
      // Obtenir l'ID du jeu
      const gameId = pageName.replace('-game', '').replace('-challenge', '');

      // Charger les données du jeu
      await this.gameService.init();
      const game = this.gameService.getGameById(gameId);

      if (!game) {
        console.error(`Jeu non trouvé: ${gameId}`);
        return;
      }

      // Importer les composants nécessaires
      const { default: Leaderboard } = await import('../../components/common/leaderboard.js');
      const { default: AuthModal } = await import('../../components/common/auth-modal.js');

      // Initialiser le classement
      const leaderboardContainer = document.getElementById('game-leaderboard');
      if (leaderboardContainer) {
        new Leaderboard(this.leaderboardService, 'game-leaderboard', {
          gameId,
          limit: 5,
          showTabs: true
        });
      }

      // Initialiser le modal d'authentification
      const authModal = new AuthModal(this.authService);

      // Écouter les événements de fin de jeu
      document.addEventListener('game-over', async (e) => {
        const { score, gameData } = e.detail;

        try {
          // Enregistrer le score
          if (this.authService.isLoggedIn() && this.authService.hasProfile()) {
            // Utilisateur connecté
            await this.authService.saveScore(gameId, score, gameData);
          } else {
            // Utilisateur non connecté
            // Proposer de créer un compte
            authModal.open(async () => {
              // Callback après connexion réussie
              await this.authService.saveScore(gameId, score, gameData);

              // Mettre à jour le classement
              if (leaderboardContainer) {
                leaderboardContainer.querySelector('.leaderboard').loadScores(gameId);
              }
            });
          }
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement du score:', error);
        }
      });
    } catch (error) {
      console.error(`Erreur lors de l'initialisation de la page de jeu ${pageName}:`, error);
    }
  }

  /**
   * Initialise une page de cours
   * @param {string} pageName - Nom de la page
   */
  async initCoursePage(pageName) {
    try {
      // Obtenir l'ID du cours
      const courseId = pageName.replace('-course', '');

      // Charger les données du cours
      await this.gameService.init();
      const course = this.gameService.getCourseById(courseId);

      if (!course) {
        console.error(`Cours non trouvé: ${courseId}`);
        return;
      }

      // Initialiser les quiz
      const quizContainers = document.querySelectorAll('.course-quiz');
      if (quizContainers.length > 0) {
        // Importer le composant de quiz
        const { default: Quiz } = await import('../../components/courses/quiz.js');

        quizContainers.forEach(container => {
          new Quiz(container);
        });
      }
    } catch (error) {
      console.error(`Erreur lors de l'initialisation de la page de cours ${pageName}:`, error);
    }
  }
}

// Exporter l'instance
const app = new App();
export default app;
