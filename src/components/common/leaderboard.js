/**
 * Composant de tableau de classement
 * Affiche les meilleurs scores et les scores récents
 */

class Leaderboard {
  /**
   * Constructeur
   * @param {LeaderboardService} leaderboardService - Service de gestion des classements
   * @param {string} containerId - ID du conteneur HTML
   * @param {Object} options - Options de configuration
   */
  constructor(leaderboardService, containerId, options = {}) {
    this.leaderboardService = leaderboardService;
    this.container = document.getElementById(containerId);
    
    // Options par défaut
    this.options = {
      gameId: null,
      limit: 10,
      showRank: true,
      showDate: true,
      showTabs: true,
      autoLoad: true,
      ...options
    };
    
    // État
    this.scores = [];
    this.recentScores = [];
    this.isLoading = false;
    this.activeTab = 'top';
    
    // Initialiser
    if (this.container) {
      this.init();
    } else {
      console.error(`Conteneur avec l'ID "${containerId}" non trouvé.`);
    }
  }
  
  /**
   * Initialise le composant
   */
  init() {
    // Créer la structure HTML
    this.createStructure();
    
    // Charger les données si autoLoad est activé
    if (this.options.autoLoad && this.options.gameId) {
      this.loadScores();
    }
  }
  
  /**
   * Crée la structure HTML du composant
   */
  createStructure() {
    // Vider le conteneur
    this.container.innerHTML = '';
    
    // Ajouter la classe
    this.container.classList.add('leaderboard');
    
    // Créer le titre
    const title = document.createElement('h2');
    title.className = 'leaderboard__title';
    title.textContent = 'Classement';
    this.container.appendChild(title);
    
    // Créer les onglets si nécessaire
    if (this.options.showTabs) {
      const tabs = document.createElement('div');
      tabs.className = 'leaderboard__tabs';
      
      const topTab = document.createElement('button');
      topTab.className = 'leaderboard__tab active';
      topTab.dataset.tab = 'top';
      topTab.textContent = 'Meilleurs scores';
      topTab.addEventListener('click', () => this.switchTab('top'));
      
      const recentTab = document.createElement('button');
      recentTab.className = 'leaderboard__tab';
      recentTab.dataset.tab = 'recent';
      recentTab.textContent = 'Scores récents';
      recentTab.addEventListener('click', () => this.switchTab('recent'));
      
      tabs.appendChild(topTab);
      tabs.appendChild(recentTab);
      this.container.appendChild(tabs);
    }
    
    // Créer le conteneur de contenu
    const content = document.createElement('div');
    content.className = 'leaderboard__content';
    this.container.appendChild(content);
    
    // Créer le tableau des meilleurs scores
    const topScoresContent = document.createElement('div');
    topScoresContent.className = 'leaderboard__scores active';
    topScoresContent.dataset.content = 'top';
    
    const topScoresTable = document.createElement('table');
    topScoresTable.className = 'leaderboard__table';
    
    const topScoresThead = document.createElement('thead');
    topScoresThead.innerHTML = `
      <tr>
        ${this.options.showRank ? '<th class="leaderboard__rank">Rang</th>' : ''}
        <th class="leaderboard__player">Joueur</th>
        <th class="leaderboard__score">Score</th>
        ${this.options.showDate ? '<th class="leaderboard__date">Date</th>' : ''}
      </tr>
    `;
    
    const topScoresTbody = document.createElement('tbody');
    topScoresTbody.id = 'top-scores-body';
    topScoresTbody.innerHTML = `
      <tr class="leaderboard__loading">
        <td colspan="${this.getColumnCount()}">
          <div class="leaderboard__spinner"></div>
          <span>Chargement des scores...</span>
        </td>
      </tr>
    `;
    
    topScoresTable.appendChild(topScoresThead);
    topScoresTable.appendChild(topScoresTbody);
    topScoresContent.appendChild(topScoresTable);
    content.appendChild(topScoresContent);
    
    // Créer le tableau des scores récents
    if (this.options.showTabs) {
      const recentScoresContent = document.createElement('div');
      recentScoresContent.className = 'leaderboard__scores';
      recentScoresContent.dataset.content = 'recent';
      
      const recentScoresTable = document.createElement('table');
      recentScoresTable.className = 'leaderboard__table';
      
      const recentScoresThead = document.createElement('thead');
      recentScoresThead.innerHTML = `
        <tr>
          ${this.options.showRank ? '<th class="leaderboard__rank">Rang</th>' : ''}
          <th class="leaderboard__player">Joueur</th>
          <th class="leaderboard__score">Score</th>
          ${this.options.showDate ? '<th class="leaderboard__date">Date</th>' : ''}
        </tr>
      `;
      
      const recentScoresTbody = document.createElement('tbody');
      recentScoresTbody.id = 'recent-scores-body';
      recentScoresTbody.innerHTML = `
        <tr class="leaderboard__loading">
          <td colspan="${this.getColumnCount()}">
            <div class="leaderboard__spinner"></div>
            <span>Chargement des scores...</span>
          </td>
        </tr>
      `;
      
      recentScoresTable.appendChild(recentScoresThead);
      recentScoresTable.appendChild(recentScoresTbody);
      recentScoresContent.appendChild(recentScoresTable);
      content.appendChild(recentScoresContent);
    }
  }
  
  /**
   * Obtient le nombre de colonnes du tableau
   * @returns {number} - Nombre de colonnes
   */
  getColumnCount() {
    let count = 2; // Joueur et Score sont toujours présents
    if (this.options.showRank) count++;
    if (this.options.showDate) count++;
    return count;
  }
  
  /**
   * Change l'onglet actif
   * @param {string} tab - Onglet à activer ('top' ou 'recent')
   */
  switchTab(tab) {
    // Mettre à jour l'onglet actif
    this.activeTab = tab;
    
    // Mettre à jour les classes des onglets
    const tabs = this.container.querySelectorAll('.leaderboard__tab');
    tabs.forEach(tabElement => {
      if (tabElement.dataset.tab === tab) {
        tabElement.classList.add('active');
      } else {
        tabElement.classList.remove('active');
      }
    });
    
    // Mettre à jour les classes des contenus
    const contents = this.container.querySelectorAll('.leaderboard__scores');
    contents.forEach(contentElement => {
      if (contentElement.dataset.content === tab) {
        contentElement.classList.add('active');
      } else {
        contentElement.classList.remove('active');
      }
    });
    
    // Charger les scores si nécessaire
    if (tab === 'top' && this.scores.length === 0) {
      this.loadTopScores();
    } else if (tab === 'recent' && this.recentScores.length === 0) {
      this.loadRecentScores();
    }
  }
  
  /**
   * Charge les scores
   * @param {string} gameId - Identifiant du jeu
   */
  loadScores(gameId = null) {
    if (gameId) {
      this.options.gameId = gameId;
    }
    
    this.loadTopScores();
    if (this.options.showTabs) {
      this.loadRecentScores();
    }
  }
  
  /**
   * Charge les meilleurs scores
   */
  async loadTopScores() {
    if (!this.options.gameId) {
      console.error('ID de jeu non spécifié.');
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Afficher l'état de chargement
      const tbody = document.getElementById('top-scores-body');
      tbody.innerHTML = `
        <tr class="leaderboard__loading">
          <td colspan="${this.getColumnCount()}">
            <div class="leaderboard__spinner"></div>
            <span>Chargement des scores...</span>
          </td>
        </tr>
      `;
      
      // Charger les scores
      this.scores = await this.leaderboardService.getTopScores(
        this.options.gameId,
        this.options.limit
      );
      
      // Afficher les scores
      this.renderScores(this.scores, 'top-scores-body');
    } catch (error) {
      console.error('Erreur lors du chargement des meilleurs scores:', error);
      
      // Afficher l'erreur
      const tbody = document.getElementById('top-scores-body');
      tbody.innerHTML = `
        <tr class="leaderboard__error">
          <td colspan="${this.getColumnCount()}">
            <span>Erreur lors du chargement des scores.</span>
          </td>
        </tr>
      `;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Charge les scores récents
   */
  async loadRecentScores() {
    if (!this.options.gameId) {
      console.error('ID de jeu non spécifié.');
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Afficher l'état de chargement
      const tbody = document.getElementById('recent-scores-body');
      tbody.innerHTML = `
        <tr class="leaderboard__loading">
          <td colspan="${this.getColumnCount()}">
            <div class="leaderboard__spinner"></div>
            <span>Chargement des scores...</span>
          </td>
        </tr>
      `;
      
      // Charger les scores
      this.recentScores = await this.leaderboardService.getRecentScores(
        this.options.gameId,
        this.options.limit
      );
      
      // Afficher les scores
      this.renderScores(this.recentScores, 'recent-scores-body');
    } catch (error) {
      console.error('Erreur lors du chargement des scores récents:', error);
      
      // Afficher l'erreur
      const tbody = document.getElementById('recent-scores-body');
      tbody.innerHTML = `
        <tr class="leaderboard__error">
          <td colspan="${this.getColumnCount()}">
            <span>Erreur lors du chargement des scores.</span>
          </td>
        </tr>
      `;
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Affiche les scores dans le tableau
   * @param {Array} scores - Scores à afficher
   * @param {string} tbodyId - ID du tbody
   */
  renderScores(scores, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    
    // Si aucun score, afficher un message
    if (scores.length === 0) {
      tbody.innerHTML = `
        <tr class="leaderboard__empty">
          <td colspan="${this.getColumnCount()}">
            <span>Aucun score disponible.</span>
          </td>
        </tr>
      `;
      return;
    }
    
    // Vider le tbody
    tbody.innerHTML = '';
    
    // Ajouter les scores
    scores.forEach((score, index) => {
      const formattedScore = this.leaderboardService.formatScore(score);
      
      const tr = document.createElement('tr');
      tr.className = 'leaderboard__row';
      
      // Ajouter la classe pour les 3 premiers
      if (index < 3 && tbodyId === 'top-scores-body') {
        tr.classList.add(`leaderboard__row--top-${index + 1}`);
      }
      
      // Construire le contenu de la ligne
      let html = '';
      
      if (this.options.showRank) {
        html += `<td class="leaderboard__rank">${index + 1}</td>`;
      }
      
      html += `
        <td class="leaderboard__player">${formattedScore.username}</td>
        <td class="leaderboard__score">${formattedScore.formattedScore}</td>
      `;
      
      if (this.options.showDate) {
        html += `<td class="leaderboard__date">${formattedScore.formattedDate}</td>`;
      }
      
      tr.innerHTML = html;
      tbody.appendChild(tr);
    });
  }
  
  /**
   * Ajoute un nouveau score et met à jour le classement
   * @param {Object} score - Score à ajouter
   */
  addScore(score) {
    // Ajouter aux scores récents
    this.recentScores.unshift(score);
    this.recentScores = this.recentScores.slice(0, this.options.limit);
    
    // Mettre à jour l'affichage des scores récents
    if (this.options.showTabs) {
      this.renderScores(this.recentScores, 'recent-scores-body');
    }
    
    // Vérifier si le score doit être ajouté aux meilleurs scores
    if (this.scores.length < this.options.limit || score.score > this.scores[this.scores.length - 1].score) {
      // Ajouter le score
      this.scores.push(score);
      
      // Trier les scores
      this.scores.sort((a, b) => b.score - a.score);
      
      // Limiter le nombre de scores
      this.scores = this.scores.slice(0, this.options.limit);
      
      // Mettre à jour l'affichage des meilleurs scores
      this.renderScores(this.scores, 'top-scores-body');
    }
  }
}

export default Leaderboard;
