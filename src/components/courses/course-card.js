/**
 * Composant de carte de cours
 * Affiche les informations d'un cours dans une carte interactive
 */

class CourseCard {
  /**
   * Constructeur
   * @param {Object} course - Données du cours
   * @param {Object} options - Options de configuration
   */
  constructor(course, options = {}) {
    this.course = course;
    
    // Options par défaut
    this.options = {
      showTags: true,
      showLevel: true,
      showButton: true,
      buttonText: 'Start Training',
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
    card.className = 'course-card';
    card.dataset.courseId = this.course.id;
    
    // Ajouter la classe de niveau
    if (this.course.level) {
      card.classList.add(`course-card--${this.course.level}`);
    }
    
    // Construire le HTML
    card.innerHTML = `
      <div class="course-card__image-container">
        <img src="${this.course.image}" alt="${this.course.title}" class="course-card__image">
        ${this.options.showLevel && this.course.level ? `
          <div class="course-card__level course-card__level--${this.course.level}">
            ${this.course.level.toUpperCase()}
          </div>
        ` : ''}
      </div>
      <div class="course-card__content">
        <h3 class="course-card__title">${this.course.title}</h3>
        <p class="course-card__description">${this.course.description}</p>
        ${this.options.showTags && this.course.tags && this.course.tags.length > 0 ? `
          <div class="course-card__tags">
            ${this.course.tags.map(tag => `
              <span class="course-card__tag">${tag}</span>
            `).join('')}
          </div>
        ` : ''}
        ${this.options.showButton ? `
          <div class="course-card__footer">
            <a href="${this.course.url}" class="btn btn-primary btn-icon">
              ${this.course.icon ? `<span class="icon">${this.course.icon}</span>` : ''}
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
        
        this.options.onClick(this.course, event);
      });
      
      // Ajouter la classe pour indiquer que la carte est cliquable
      card.classList.add('course-card--clickable');
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
   * Met à jour les données du cours
   * @param {Object} course - Nouvelles données du cours
   */
  update(course) {
    this.course = { ...this.course, ...course };
    
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
   * Crée une carte de cours et la rend dans un conteneur
   * @param {Object} course - Données du cours
   * @param {HTMLElement|string} container - Conteneur ou ID du conteneur
   * @param {Object} options - Options de configuration
   * @returns {CourseCard} - Instance de CourseCard
   */
  static render(course, container, options = {}) {
    const card = new CourseCard(course, options);
    card.render(container);
    return card;
  }
  
  /**
   * Crée plusieurs cartes de cours et les rend dans un conteneur
   * @param {Array} courses - Tableau de données de cours
   * @param {HTMLElement|string} container - Conteneur ou ID du conteneur
   * @param {Object} options - Options de configuration
   * @returns {Array<CourseCard>} - Tableau d'instances de CourseCard
   */
  static renderMultiple(courses, container, options = {}) {
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
    return courses.map(course => {
      const card = new CourseCard(course, options);
      card.render(targetContainer);
      return card;
    });
  }
}

export default CourseCard;
