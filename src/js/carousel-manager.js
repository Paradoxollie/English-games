export class CarouselManager {
    constructor() {
        this.games = [
            {
                title: "Speed Verb Challenge",
                description: "Test your knowledge of irregular verbs! Type as many verbs as you can in 90 seconds!",
                image: "./images/speed-challenge.webp",
                url: "./speed-verb-challenge.html",
                difficulty: "legendary",
                tags: ["Verbs", "Time Trial", "Grammar"],
                icon: "⚔️"
            },
            {
                title: "Enigma Scroll",
                description: "Uncover the mysteries of the enchanted scroll! Test your English skills by solving magical word puzzles!",
                image: "./images/enigma-scroll.webp",
                url: "./enigma-scroll.html",
                difficulty: "epic",
                tags: ["Puzzles", "Vocabulary", "Adventure"],
                icon: "📜"
            },
            {
                title: "Word Bubbles",
                description: "Pop word bubbles and expand your vocabulary in this enchanting underwater adventure!",
                image: "./images/word-bubbles.webp",
                url: "./word-bubbles.html",
                difficulty: "rare",
                tags: ["Vocabulary", "Speed", "Fun"],
                icon: "🫧"
            }
        ];

        this.courses = [
            {
                title: "The Conditional",
                description: "Master the different forms and usage of the conditional with this comprehensive guide.",
                image: "./images/conditionnel-course.webp",
                url: "./conditional-course.html",
                level: "advanced",
                tags: ["Grammar", "Advanced", "Conditional"],
                icon: "🎯"
            },
            {
                title: "The Superlative",
                description: "Learn the art of comparison and reach the pinnacle of excellence with superlatives.",
                image: "./images/superlative.webp",
                url: "./superlative.html",
                level: "intermediate",
                tags: ["Grammar", "Comparison", "Superlative"],
                icon: "📊"
            },
            {
                title: "Comparative",
                description: "Face off against fierce grammar guardians and claim your place as the true Grammar Champion.",
                image: "./images/comparative.webp",
                url: "./comparative.html",
                level: "intermediate",
                tags: ["Grammar", "Comparison", "Comparative"],
                icon: "⚖️"
            }
        ];
    }

    createCard(item, isGame = true) {
        return `
            <div class="game-card bg-black/90 border-2 ${isGame ? 'border-quest-gold/80' : 'border-blue-500/80'} rounded-lg overflow-hidden w-[450px]">
                <div class="relative h-52">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
                </div>
                <div class="p-6 bg-gradient-to-b from-black/95 to-black/90">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-2xl font-medieval ${isGame ? 'text-quest-gold' : 'text-blue-400'}">${item.title}</h3>
                        <div class="badge badge-${isGame ? item.difficulty : item.level}">
                            ${isGame ? item.difficulty.toUpperCase() : item.level.toUpperCase()}
                        </div>
                    </div>
                    <p class="text-gray-300 mb-4">${item.description}</p>
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${item.tags.map(tag => `
                            <span class="tag tag-${tag.toLowerCase().replace(/\s+/g, '-')}">
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                    <a href="${item.url}" class="quest-button ${isGame ? 'quest-button-game' : 'quest-button-course'}">
                        <span class="mr-2 text-xl">${item.icon}</span>
                        <span>${isGame ? 'Play Now' : 'Start Training'}</span>
                    </a>
                </div>
            </div>
        `;
    }

    updateDisplays() {
        const gameDisplay = document.getElementById('game-display');
        const courseDisplay = document.getElementById('course-display');

        if (gameDisplay) {
            const randomGame = this.games[Math.floor(Math.random() * this.games.length)];
            gameDisplay.style.opacity = '0';
            setTimeout(() => {
                gameDisplay.innerHTML = this.createCard(randomGame, true);
                gameDisplay.style.opacity = '1';
            }, 300);
        }

        if (courseDisplay) {
            const randomCourse = this.courses[Math.floor(Math.random() * this.courses.length)];
            courseDisplay.style.opacity = '0';
            setTimeout(() => {
                courseDisplay.innerHTML = this.createCard(randomCourse, false);
                courseDisplay.style.opacity = '1';
            }, 300);
        }
    }
} 