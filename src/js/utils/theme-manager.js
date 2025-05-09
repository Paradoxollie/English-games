/**
 * Gestionnaire de thème
 * Gère les thèmes et les préférences de l'utilisateur
 */

class ThemeManager {
  constructor() {
    this.currentTheme = null;
    this.prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Initialiser
    this.init();
  }
  
  /**
   * Initialise le gestionnaire de thème
   */
  init() {
    // Écouter les changements de préférence
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.prefersDarkMode = e.matches;
      this.applyTheme(this.currentTheme);
    });
    
    // Appliquer le thème par défaut
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('home');
    }
  }
  
  /**
   * Définit le thème actuel
   * @param {string} theme - Nom du thème
   */
  setTheme(theme) {
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }
  
  /**
   * Applique le thème
   * @param {string} theme - Nom du thème
   */
  applyTheme(theme) {
    // Supprimer les classes de thème existantes
    document.body.classList.remove(
      'theme-home',
      'theme-games',
      'theme-courses',
      'theme-leaderboard',
      'theme-contact'
    );
    
    // Ajouter la classe de thème
    document.body.classList.add(`theme-${theme}`);
    
    // Mettre à jour les méta-données
    this.updateMetaThemeColor(theme);
  }
  
  /**
   * Met à jour la couleur du thème dans les méta-données
   * @param {string} theme - Nom du thème
   */
  updateMetaThemeColor(theme) {
    // Couleurs des thèmes
    const themeColors = {
      home: '#c9aa71',      // Or
      games: '#71a9c9',     // Bleu
      courses: '#71c99a',   // Vert
      leaderboard: '#c97171', // Rouge
      contact: '#9a71c9'    // Violet
    };
    
    // Obtenir la couleur du thème
    const color = themeColors[theme] || themeColors.home;
    
    // Mettre à jour la balise meta
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = color;
  }
  
  /**
   * Obtient le thème actuel
   * @returns {string} - Nom du thème
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Vérifie si l'utilisateur préfère le mode sombre
   * @returns {boolean} - True si l'utilisateur préfère le mode sombre
   */
  isPreferringDarkMode() {
    return this.prefersDarkMode;
  }
}

export default ThemeManager;
