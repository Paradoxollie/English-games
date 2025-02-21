export class Carousel {
    constructor(containerId, items, isGame = true) {
        this.container = document.getElementById(containerId);
        this.items = [...items];
        this.currentIndex = 0;
        this.isGame = isGame;
        this.displayElement = this.container.querySelector(`#${isGame ? 'game' : 'course'}-display`);
        this.setupNavigation();
        this.startAutoRotation();
    }

    setupNavigation() {
        const prevBtn = this.container.querySelector(`.prev-${this.isGame ? 'game' : 'course'}`);
        const nextBtn = this.container.querySelector(`.next-${this.isGame ? 'game' : 'course'}`);

        prevBtn.addEventListener('click', () => this.showPrevious());
        nextBtn.addEventListener('click', () => this.showNext());
    }

    showPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.updateDisplay();
    }

    showNext() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.updateDisplay();
    }

    updateDisplay() {
        this.displayElement.style.opacity = '0';
        setTimeout(() => {
            this.displayElement.innerHTML = this.createCard(this.items[this.currentIndex]);
            this.displayElement.style.opacity = '1';
        }, 300);
    }

    startAutoRotation() {
        setInterval(() => this.showNext(), 5000);
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
} 