export class Carousel {
    constructor(id, items, options = {}) {
        this.container = document.getElementById(id);
        this.items = items;
        this.options = {
            autoplaySpeed: options.autoplaySpeed || 8000,
            cardsToShow: options.cardsToShow || 3,
            ...options
        };
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Injecter les cartes
        this.container.innerHTML = this.items.map(item => this.createCard(item)).join('');
        
        // Dupliquer pour l'effet infini
        const cards = Array.from(this.container.children);
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            this.container.appendChild(clone);
        });

        // Initialiser la navigation
        this.setupNavigation();
        this.setupAutoplay();
        this.updateCarousel(false);
    }

    createCard(item) {
        return `
            <div class="game-card transform hover:scale-105 transition-all duration-300">
                <img src="${item.image}" alt="${item.title}" class="game-image">
                <div class="game-info">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="game-features mb-4">
                        ${item.tags.map(tag => `
                            <span class="feature-tag">${tag}</span>
                        `).join('')}
                    </div>
                    <a href="${item.url}" class="quest-button">${item.buttonText || 'Play Now'}</a>
                </div>
            </div>
        `;
    }

    updateCarousel(smooth = true) {
        const cardWidth = this.container.querySelector('.game-card').offsetWidth;
        const gap = 32;
        const offset = -(this.currentIndex * (cardWidth + gap));
        
        this.container.style.transition = smooth ? 'transform 1s ease-in-out' : 'none';
        this.container.style.transform = `translateX(${offset}px)`;

        if (this.currentIndex >= this.items.length && !this.isTransitioning) {
            this.isTransitioning = true;
            setTimeout(() => {
                this.container.style.transition = 'none';
                this.currentIndex = 0;
                this.container.style.transform = `translateX(0)`;
                setTimeout(() => {
                    this.container.style.transition = 'transform 1s ease-in-out';
                    this.isTransitioning = false;
                }, 50);
            }, 1000);
        }
    }

    setupNavigation() {
        const container = this.container.closest('.games-carousel-container');
        const prevBtn = container.querySelector('.prev');
        const nextBtn = container.querySelector('.next');

        prevBtn.addEventListener('click', () => this.prev());
        nextBtn.addEventListener('click', () => this.next());
    }

    setupAutoplay() {
        let autoplayInterval = setInterval(() => this.next(), this.options.autoplaySpeed);

        this.container.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        this.container.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(() => this.next(), this.options.autoplaySpeed);
        });
    }

    next() {
        if (!this.isTransitioning) {
            this.currentIndex++;
            this.updateCarousel(true);
        }
    }

    prev() {
        if (!this.isTransitioning && this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel(true);
        } else if (!this.isTransitioning) {
            this.currentIndex = this.items.length - 1;
            this.updateCarousel(true);
        }
    }
} 