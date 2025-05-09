/**
 * Composant de carrousel
 * Affiche des éléments dans un carrousel interactif
 */

class Carousel {
  /**
   * Constructeur
   * @param {HTMLElement|string} container - Conteneur ou ID du conteneur
   * @param {Object} options - Options de configuration
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.getElementById(container) 
      : container;
    
    if (!this.container) {
      console.error(`Conteneur non trouvé: ${container}`);
      return;
    }
    
    // Options par défaut
    this.options = {
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: false,
      autoplaySpeed: 5000,
      infinite: true,
      dots: true,
      arrows: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1
          }
        }
      ],
      ...options
    };
    
    // État
    this.slides = [];
    this.currentSlide = 0;
    this.totalSlides = 0;
    this.autoplayInterval = null;
    this.isPlaying = false;
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.slideWidth = 0;
    
    // Initialiser
    this.init();
  }
  
  /**
   * Initialise le carrousel
   */
  init() {
    // Créer la structure
    this.createStructure();
    
    // Récupérer les slides
    this.slides = Array.from(this.container.querySelectorAll('.carousel__slide'));
    this.totalSlides = this.slides.length;
    
    // Calculer la largeur des slides
    this.calculateSlideWidth();
    
    // Initialiser les événements
    this.initEvents();
    
    // Démarrer l'autoplay si nécessaire
    if (this.options.autoplay) {
      this.startAutoplay();
    }
    
    // Afficher le premier slide
    this.goToSlide(0);
  }
  
  /**
   * Crée la structure HTML du carrousel
   */
  createStructure() {
    // Ajouter la classe
    this.container.classList.add('carousel');
    
    // Récupérer les slides existants
    const existingSlides = Array.from(this.container.children);
    
    // Créer le conteneur de slides
    const track = document.createElement('div');
    track.className = 'carousel__track';
    
    // Déplacer les slides dans le track
    existingSlides.forEach(slide => {
      slide.classList.add('carousel__slide');
      track.appendChild(slide);
    });
    
    // Créer la structure complète
    this.container.innerHTML = '';
    
    // Ajouter les flèches si nécessaire
    if (this.options.arrows) {
      const prevButton = document.createElement('button');
      prevButton.className = 'carousel__arrow carousel__arrow--prev';
      prevButton.setAttribute('aria-label', 'Previous slide');
      prevButton.innerHTML = '<span class="carousel__arrow-icon">&#10094;</span>';
      
      const nextButton = document.createElement('button');
      nextButton.className = 'carousel__arrow carousel__arrow--next';
      nextButton.setAttribute('aria-label', 'Next slide');
      nextButton.innerHTML = '<span class="carousel__arrow-icon">&#10095;</span>';
      
      this.container.appendChild(prevButton);
      this.container.appendChild(nextButton);
    }
    
    // Ajouter le track
    this.container.appendChild(track);
    
    // Ajouter les points si nécessaire
    if (this.options.dots) {
      const dots = document.createElement('div');
      dots.className = 'carousel__dots';
      
      for (let i = 0; i < existingSlides.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dots.appendChild(dot);
      }
      
      this.container.appendChild(dots);
    }
  }
  
  /**
   * Initialise les événements
   */
  initEvents() {
    // Événements des flèches
    if (this.options.arrows) {
      const prevButton = this.container.querySelector('.carousel__arrow--prev');
      const nextButton = this.container.querySelector('.carousel__arrow--next');
      
      prevButton.addEventListener('click', () => this.prevSlide());
      nextButton.addEventListener('click', () => this.nextSlide());
    }
    
    // Événements des points
    if (this.options.dots) {
      const dots = this.container.querySelectorAll('.carousel__dot');
      
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });
    }
    
    // Événements de glissement
    const track = this.container.querySelector('.carousel__track');
    
    track.addEventListener('mousedown', (e) => this.startDrag(e));
    track.addEventListener('touchstart', (e) => this.startDrag(e), { passive: true });
    
    window.addEventListener('mousemove', (e) => this.drag(e));
    window.addEventListener('touchmove', (e) => this.drag(e), { passive: true });
    
    window.addEventListener('mouseup', () => this.endDrag());
    window.addEventListener('touchend', () => this.endDrag());
    
    // Événement de redimensionnement
    window.addEventListener('resize', () => {
      this.calculateSlideWidth();
      this.goToSlide(this.currentSlide);
    });
    
    // Événements de pause au survol
    this.container.addEventListener('mouseenter', () => {
      if (this.options.autoplay) {
        this.stopAutoplay();
      }
    });
    
    this.container.addEventListener('mouseleave', () => {
      if (this.options.autoplay) {
        this.startAutoplay();
      }
    });
  }
  
  /**
   * Calcule la largeur des slides
   */
  calculateSlideWidth() {
    // Obtenir la largeur du conteneur
    const containerWidth = this.container.offsetWidth;
    
    // Calculer la largeur des slides en fonction des options
    let slidesToShow = this.options.slidesToShow;
    
    // Appliquer les options responsive
    if (this.options.responsive) {
      for (let i = 0; i < this.options.responsive.length; i++) {
        const responsive = this.options.responsive[i];
        
        if (window.innerWidth <= responsive.breakpoint) {
          slidesToShow = responsive.settings.slidesToShow;
          break;
        }
      }
    }
    
    // Calculer la largeur des slides
    this.slideWidth = containerWidth / slidesToShow;
    
    // Appliquer la largeur aux slides
    this.slides.forEach(slide => {
      slide.style.width = `${this.slideWidth}px`;
    });
    
    // Mettre à jour la largeur du track
    const track = this.container.querySelector('.carousel__track');
    track.style.width = `${this.slideWidth * this.totalSlides}px`;
  }
  
  /**
   * Démarre le glissement
   * @param {Event} e - Événement
   */
  startDrag(e) {
    this.isDragging = true;
    this.startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    this.currentX = this.startX;
    
    // Ajouter la classe de glissement
    this.container.classList.add('carousel--dragging');
    
    // Arrêter l'autoplay
    if (this.options.autoplay) {
      this.stopAutoplay();
    }
  }
  
  /**
   * Gère le glissement
   * @param {Event} e - Événement
   */
  drag(e) {
    if (!this.isDragging) return;
    
    // Obtenir la position actuelle
    this.currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    
    // Calculer le déplacement
    const diff = this.currentX - this.startX;
    
    // Déplacer le track
    const track = this.container.querySelector('.carousel__track');
    const currentTranslate = -this.currentSlide * this.slideWidth;
    track.style.transform = `translateX(${currentTranslate + diff}px)`;
  }
  
  /**
   * Termine le glissement
   */
  endDrag() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Supprimer la classe de glissement
    this.container.classList.remove('carousel--dragging');
    
    // Calculer le déplacement
    const diff = this.currentX - this.startX;
    
    // Déterminer la direction
    if (Math.abs(diff) > this.slideWidth / 4) {
      if (diff > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    } else {
      // Revenir au slide actuel
      this.goToSlide(this.currentSlide);
    }
    
    // Redémarrer l'autoplay
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  }
  
  /**
   * Va au slide précédent
   */
  prevSlide() {
    let index = this.currentSlide - this.options.slidesToScroll;
    
    if (index < 0) {
      index = this.options.infinite ? this.totalSlides - 1 : 0;
    }
    
    this.goToSlide(index);
  }
  
  /**
   * Va au slide suivant
   */
  nextSlide() {
    let index = this.currentSlide + this.options.slidesToScroll;
    
    if (index >= this.totalSlides) {
      index = this.options.infinite ? 0 : this.totalSlides - 1;
    }
    
    this.goToSlide(index);
  }
  
  /**
   * Va à un slide spécifique
   * @param {number} index - Index du slide
   */
  goToSlide(index) {
    // Vérifier les limites
    if (index < 0) {
      index = 0;
    } else if (index >= this.totalSlides) {
      index = this.totalSlides - 1;
    }
    
    // Mettre à jour l'index actuel
    this.currentSlide = index;
    
    // Déplacer le track
    const track = this.container.querySelector('.carousel__track');
    track.style.transform = `translateX(${-index * this.slideWidth}px)`;
    
    // Mettre à jour les points
    if (this.options.dots) {
      const dots = this.container.querySelectorAll('.carousel__dot');
      
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('carousel__dot--active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('carousel__dot--active');
          dot.removeAttribute('aria-current');
        }
      });
    }
    
    // Mettre à jour les flèches
    if (this.options.arrows && !this.options.infinite) {
      const prevButton = this.container.querySelector('.carousel__arrow--prev');
      const nextButton = this.container.querySelector('.carousel__arrow--next');
      
      prevButton.disabled = index === 0;
      nextButton.disabled = index === this.totalSlides - 1;
    }
    
    // Déclencher l'événement de changement de slide
    this.container.dispatchEvent(new CustomEvent('slide-change', {
      detail: {
        currentSlide: index
      }
    }));
  }
  
  /**
   * Démarre l'autoplay
   */
  startAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
    
    this.isPlaying = true;
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.options.autoplaySpeed);
  }
  
  /**
   * Arrête l'autoplay
   */
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    
    this.isPlaying = false;
  }
  
  /**
   * Ajoute un slide
   * @param {HTMLElement} slide - Élément du slide
   */
  addSlide(slide) {
    // Ajouter la classe
    slide.classList.add('carousel__slide');
    slide.style.width = `${this.slideWidth}px`;
    
    // Ajouter au track
    const track = this.container.querySelector('.carousel__track');
    track.appendChild(slide);
    
    // Mettre à jour les slides
    this.slides = Array.from(this.container.querySelectorAll('.carousel__slide'));
    this.totalSlides = this.slides.length;
    
    // Mettre à jour la largeur du track
    track.style.width = `${this.slideWidth * this.totalSlides}px`;
    
    // Ajouter un point si nécessaire
    if (this.options.dots) {
      const dots = this.container.querySelector('.carousel__dots');
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to slide ${this.totalSlides}`);
      dot.addEventListener('click', () => this.goToSlide(this.totalSlides - 1));
      dots.appendChild(dot);
    }
    
    // Mettre à jour le slide actuel
    this.goToSlide(this.currentSlide);
  }
  
  /**
   * Supprime un slide
   * @param {number} index - Index du slide à supprimer
   */
  removeSlide(index) {
    if (index < 0 || index >= this.totalSlides) {
      return;
    }
    
    // Supprimer le slide
    this.slides[index].remove();
    
    // Mettre à jour les slides
    this.slides = Array.from(this.container.querySelectorAll('.carousel__slide'));
    this.totalSlides = this.slides.length;
    
    // Mettre à jour la largeur du track
    const track = this.container.querySelector('.carousel__track');
    track.style.width = `${this.slideWidth * this.totalSlides}px`;
    
    // Supprimer le point si nécessaire
    if (this.options.dots) {
      const dots = this.container.querySelectorAll('.carousel__dot');
      dots[index].remove();
    }
    
    // Mettre à jour le slide actuel
    if (this.currentSlide >= this.totalSlides) {
      this.currentSlide = this.totalSlides - 1;
    }
    
    this.goToSlide(this.currentSlide);
  }
  
  /**
   * Détruit le carrousel
   */
  destroy() {
    // Arrêter l'autoplay
    this.stopAutoplay();
    
    // Supprimer les événements
    window.removeEventListener('resize', this.calculateSlideWidth);
    
    // Restaurer la structure d'origine
    const track = this.container.querySelector('.carousel__track');
    const slides = Array.from(track.children);
    
    this.container.innerHTML = '';
    
    slides.forEach(slide => {
      slide.classList.remove('carousel__slide');
      slide.style.width = '';
      this.container.appendChild(slide);
    });
    
    // Supprimer les classes
    this.container.classList.remove('carousel');
  }
}

export default Carousel;
