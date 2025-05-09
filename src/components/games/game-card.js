/**
 * Composant de carte de jeu
 * Affiche les informations d'un jeu dans une carte interactive
 */

class GameCard {
  /**
   * Constructeur
   * @param {Object} game - Données du jeu
   * @param {Object} options - Options de configuration
   */
  constructor(game, options = {}) {
    this.game = game;
    
    // Options par défaut
    this.options = {
      showTags: true,
      showDifficulty: true,
      showButton: true,
      buttonText: 'Play Now',
      onClick: null,
      ...options
    };
    
    // Créer l'élément
    this.element = this.createCardElement();
  }
  
  /**
   * Crée l'élément HTML de la carte
   * @returns {HTMLElement} - Élément de carte
   */
  createCardElement() {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.gameId = this.game.id;
    
    // Ajouter la classe de difficulté
    if (this.game.difficulty) {
      card.classList.add(`game-card--${this.game.difficulty}`);
    }
    
    // Construire le HTML
    card.innerHTML = `
      <div class="game-card__image-container">
        <img src="${this.game.image}" alt="${this.game.title}" class="game-card__image">
        ${this.options.showDifficulty && this.game.difficulty ? `
          <div class="game-card__difficulty game-card__difficulty--${this.game.difficulty}">
            ${this.game.difficulty.toUpperCase()}
          </div>
        ` : ''}
      </div>
      <div class="game-card__content">
        <h3 class="game-card__title">${this.game.title}</h3>
        <p class="game-card__description">${this.game.description}</p>
        ${this.options.showTags && this.game.tags && this.game.tags.length > 0 ? `
          <div class="game-card__tags">
            ${this.game.tags.map(tag => `
              <span class="game-card__tag">${tag}</span>
            `).join('')}
          </div>
        ` : ''}
        ${this.options.showButton ? `
          <div class="game-card__footer">
            <a href="${this.game.url}" class="btn btn-primary btn-icon">
              ${this.game.icon ? `<span class="icon">${this.game.icon}</span>` : ''}
              <span>${this.options.buttonText}</span>
            </a>
          </div>
        ` : ''}
      </div>
    `;
    
    // Ajouter l'événement de clic
    if (typeof this.options.onClick === 'function') {
      card.addEventListener('click', (event) => {
        // Ne pas déclencher l'événement si on clique sur le bouton
        if (event.target.closest('.btn') && this.options.showButton) {
          return;
        }
        
        this.options.onClick(this.game, event);
      });
      
      // Ajouter la classe pour indiquer que la carte est cliquable
      card.classList.add('game-card--clickable');
    }
    
    return card;
  }
  
  /**
   * Rend la carte dans un conteneur
   * @param {HTMLElement|string} container - Conteneur ou ID du conteneur
   */
  render(container) {
    const targetContainer = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!targetContainer) {
      console.error(`Conteneur non trouvé: ${container}`);
      return;
    }
    
    targetContainer.appendChild(this.element);
  }
  
  /**
   * Met à jour les données du jeu
   * @param {Object} game - Nouvelles données du jeu
   */
  update(game) {
    this.game = { ...this.game, ...game };
    
    // Mettre à jour l'élément
    const newElement = this.createCardElement();
    this.element.replaceWith(newElement);
    this.element = newElement;
  }
  
  /**
   * Supprime la carte du DOM
   */
  remove() {
    this.element.remove();
  }
  
  /**
   * Crée une carte de jeu et la rend dans un conteneur
   * @param {Object} game - Données du jeu
   * @param {HTMLElement|string} container - Conteneur ou ID du conteneur
   * @param {Object} options - Options de configuration
   * @returns {GameCard} - Instance de GameCard
   */
  static render(game, container, options = {}) {
    const card = new GameCard(game, options);
    card.render(container);
    return card;
  }
  
  /**
   * Crée plusieurs cartes de jeu et les rend dans un conteneur
   * @param {Array} games - Tableau de données de jeux
   * @param {HTMLElement|string} container - Conteneur ou ID du conteneur
   * @param {Object} options - Options de configuration
   * @returns {Array<GameCard>} - Tableau d'instances de GameCard
   */
  static renderMultiple(games, container, options = {}) {
    const targetContainer = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!targetContainer) {
      console.error(`Conteneur non trouvé: ${container}`);
      return [];
    }
    
    // Vider le conteneur
    targetContainer.innerHTML = '';
    
    // Créer et rendre les cartes
    return games.map(game => {
      const card = new GameCard(game, options);
      card.render(targetContainer);
      return card;
    });
  }
}

export default GameCard;
