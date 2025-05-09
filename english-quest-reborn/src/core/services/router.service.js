/**
 * Service de routage pour English Quest Reborn
 * Gère la navigation entre les différentes pages de l'application
 */

import { getAuthState } from '@features/auth/auth.service';

// Configuration des routes
const routes = [
  {
    path: '/',
    component: 'home-page',
    title: 'Accueil - English Quest',
    public: true
  },
  {
    path: '/games',
    component: 'games-page',
    title: 'Jeux - English Quest',
    public: true
  },
  {
    path: '/courses',
    component: 'courses-page',
    title: 'Cours - English Quest',
    public: true
  },
  {
    path: '/leaderboard',
    component: 'leaderboard-page',
    title: 'Classement - English Quest',
    public: true
  },
  {
    path: '/profile',
    component: 'profile-page',
    title: 'Profil - English Quest',
    public: false
  },
  {
    path: '/battle',
    component: 'battle-page',
    title: 'Combat - English Quest',
    public: false
  },
  {
    path: '/register',
    component: 'register-page',
    title: 'Inscription - English Quest',
    public: true
  },
  {
    path: '/login',
    component: 'login-page',
    title: 'Connexion - English Quest',
    public: true
  },
  {
    path: '/game/:id',
    component: 'game-detail-page',
    title: 'Jeu - English Quest',
    public: true
  },
  {
    path: '/course/:id',
    component: 'course-detail-page',
    title: 'Cours - English Quest',
    public: true
  },
  {
    path: '/404',
    component: 'not-found-page',
    title: 'Page non trouvée - English Quest',
    public: true
  }
];

// État du routeur
let routerState = {
  currentRoute: null,
  previousRoute: null,
  params: {},
  query: {}
};

// Callbacks pour les changements de route
const routeChangeListeners = new Set();

/**
 * Initialise le service de routage
 * @returns {Object} Le service de routage
 */
export async function initializeRouter() {
  // Écouter les changements d'URL
  window.addEventListener('popstate', handlePopState);
  
  // Intercepter les clics sur les liens
  document.addEventListener('click', handleLinkClick);
  
  // Naviguer vers la route initiale
  await navigateToCurrentUrl();
  
  return {
    navigate,
    navigateToHome,
    navigateToGames,
    navigateToCourses,
    navigateToLeaderboard,
    navigateToProfile,
    navigateToBattle,
    navigateToRegister,
    navigateToLogin,
    navigateToGame,
    navigateToCourse,
    navigateToNotFound,
    getCurrentRoute,
    subscribeToRouteChanges
  };
}

/**
 * Gère les événements popstate (navigation avec les boutons du navigateur)
 * @param {Event} event - L'événement popstate
 */
async function handlePopState(event) {
  await navigateToCurrentUrl();
}

/**
 * Gère les clics sur les liens
 * @param {Event} event - L'événement de clic
 */
async function handleLinkClick(event) {
  // Vérifier si le clic est sur un lien
  let target = event.target;
  while (target && target.tagName !== 'A') {
    target = target.parentNode;
  }
  
  if (!target || !target.href || target.target === '_blank' || target.hasAttribute('download') || target.hasAttribute('rel') && target.getAttribute('rel').includes('external')) {
    return;
  }
  
  // Vérifier si le lien est interne
  const url = new URL(target.href);
  const isInternalLink = url.origin === window.location.origin;
  
  if (isInternalLink) {
    event.preventDefault();
    await navigate(url.pathname + url.search + url.hash);
  }
}

/**
 * Navigue vers l'URL actuelle
 * @returns {Promise<void>}
 */
async function navigateToCurrentUrl() {
  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  
  await navigate(path + search + hash, false);
}

/**
 * Navigue vers une URL spécifique
 * @param {string} url - L'URL de destination
 * @param {boolean} pushState - Ajouter l'URL à l'historique
 * @returns {Promise<void>}
 */
async function navigate(url, pushState = true) {
  try {
    // Extraire le chemin, les paramètres de requête et le hash
    const [pathWithParams, hash] = url.split('#');
    const [path, queryString] = pathWithParams.split('?');
    
    // Trouver la route correspondante
    const route = findRoute(path);
    
    if (!route) {
      return navigateToNotFound();
    }
    
    // Vérifier si la route nécessite une authentification
    if (!route.public && !getAuthState().isAuthenticated) {
      return navigateToLogin();
    }
    
    // Extraire les paramètres de route
    const params = extractRouteParams(route.path, path);
    
    // Extraire les paramètres de requête
    const query = extractQueryParams(queryString);
    
    // Mettre à jour l'état du routeur
    routerState.previousRoute = routerState.currentRoute;
    routerState.currentRoute = route;
    routerState.params = params;
    routerState.query = query;
    
    // Mettre à jour l'URL dans l'historique
    if (pushState) {
      window.history.pushState(null, '', url);
    }
    
    // Mettre à jour le titre de la page
    document.title = route.title;
    
    // Rendre le composant
    await renderComponent(route.component, params, query);
    
    // Notifier les listeners
    notifyRouteChangeListeners();
    
    // Faire défiler vers le haut de la page ou vers l'ancre
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Navigation error:', error);
    navigateToNotFound();
  }
}

/**
 * Trouve la route correspondant au chemin
 * @param {string} path - Le chemin de l'URL
 * @returns {Object|null} La route correspondante ou null
 */
function findRoute(path) {
  // Recherche exacte
  const exactRoute = routes.find(route => route.path === path);
  if (exactRoute) {
    return exactRoute;
  }
  
  // Recherche avec paramètres
  for (const route of routes) {
    if (isRouteMatch(route.path, path)) {
      return route;
    }
  }
  
  return null;
}

/**
 * Vérifie si un chemin correspond à un modèle de route
 * @param {string} routePath - Le modèle de route
 * @param {string} path - Le chemin à vérifier
 * @returns {boolean} Vrai si le chemin correspond
 */
function isRouteMatch(routePath, path) {
  // Convertir le modèle de route en expression régulière
  const pattern = routePath
    .replace(/:[^/]+/g, '([^/]+)')
    .replace(/\//g, '\\/');
  
  const regex = new RegExp(`^${pattern}$`);
  return regex.test(path);
}

/**
 * Extrait les paramètres de route
 * @param {string} routePath - Le modèle de route
 * @param {string} path - Le chemin de l'URL
 * @returns {Object} Les paramètres de route
 */
function extractRouteParams(routePath, path) {
  const params = {};
  
  // Si la route ne contient pas de paramètres
  if (!routePath.includes(':')) {
    return params;
  }
  
  // Extraire les noms de paramètres
  const paramNames = routePath
    .split('/')
    .filter(segment => segment.startsWith(':'))
    .map(segment => segment.substring(1));
  
  // Extraire les valeurs de paramètres
  const pathSegments = path.split('/');
  const routeSegments = routePath.split('/');
  
  for (let i = 0; i < routeSegments.length; i++) {
    if (routeSegments[i].startsWith(':')) {
      const paramName = routeSegments[i].substring(1);
      params[paramName] = pathSegments[i] || '';
    }
  }
  
  return params;
}

/**
 * Extrait les paramètres de requête
 * @param {string} queryString - La chaîne de requête
 * @returns {Object} Les paramètres de requête
 */
function extractQueryParams(queryString) {
  if (!queryString) {
    return {};
  }
  
  const params = {};
  const searchParams = new URLSearchParams(queryString);
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
}

/**
 * Rend le composant correspondant à la route
 * @param {string} componentName - Le nom du composant
 * @param {Object} params - Les paramètres de route
 * @param {Object} query - Les paramètres de requête
 * @returns {Promise<void>}
 */
async function renderComponent(componentName, params, query) {
  const appElement = document.getElementById('app');
  
  if (!appElement) {
    console.error('App element not found');
    return;
  }
  
  try {
    // Charger dynamiquement le composant
    const module = await import(`@features/${componentName.replace('-page', '')}/components/${componentName}.js`);
    const Component = module.default;
    
    // Créer une instance du composant
    const component = new Component(params, query);
    
    // Rendre le composant
    appElement.innerHTML = '';
    appElement.appendChild(component.render());
    
    // Initialiser le composant
    if (component.init) {
      component.init();
    }
  } catch (error) {
    console.error(`Error rendering component ${componentName}:`, error);
    appElement.innerHTML = `
      <div class="error-container">
        <h1>Erreur de chargement</h1>
        <p>Impossible de charger la page demandée.</p>
        <button onclick="window.location.reload()">Réessayer</button>
      </div>
    `;
  }
}

/**
 * Notifie les listeners des changements de route
 */
function notifyRouteChangeListeners() {
  const state = { ...routerState };
  routeChangeListeners.forEach(listener => {
    try {
      listener(state);
    } catch (error) {
      console.error('Error in route change listener:', error);
    }
  });
}

/**
 * Récupère la route actuelle
 * @returns {Object} L'état actuel du routeur
 */
function getCurrentRoute() {
  return { ...routerState };
}

/**
 * S'abonne aux changements de route
 * @param {Function} listener - Fonction à appeler lors des changements
 * @returns {Function} Fonction pour se désabonner
 */
function subscribeToRouteChanges(listener) {
  routeChangeListeners.add(listener);
  
  // Appeler immédiatement avec l'état actuel
  listener({ ...routerState });
  
  // Retourner une fonction pour se désabonner
  return () => {
    routeChangeListeners.delete(listener);
  };
}

// Fonctions de navigation vers des routes spécifiques
function navigateToHome() {
  return navigate('/');
}

function navigateToGames() {
  return navigate('/games');
}

function navigateToCourses() {
  return navigate('/courses');
}

function navigateToLeaderboard() {
  return navigate('/leaderboard');
}

function navigateToProfile() {
  return navigate('/profile');
}

function navigateToBattle() {
  return navigate('/battle');
}

function navigateToRegister() {
  return navigate('/register');
}

function navigateToLogin() {
  return navigate('/login');
}

function navigateToGame(gameId) {
  return navigate(`/game/${gameId}`);
}

function navigateToCourse(courseId) {
  return navigate(`/course/${courseId}`);
}

function navigateToNotFound() {
  return navigate('/404');
}

export default {
  initializeRouter,
  navigate,
  navigateToHome,
  navigateToGames,
  navigateToCourses,
  navigateToLeaderboard,
  navigateToProfile,
  navigateToBattle,
  navigateToRegister,
  navigateToLogin,
  navigateToGame,
  navigateToCourse,
  navigateToNotFound,
  getCurrentRoute,
  subscribeToRouteChanges
};
