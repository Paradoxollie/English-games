export function createGameCard(game) {
    return `
        <div class="quest-card">
            <div class="quest-card-banner h-32">
                <img src="${game.image}" alt="${game.title}" class="w-full h-full object-cover">
                <div class="quest-difficulty ${game.difficulty}">${game.difficulty}</div>
            </div>
            <div class="quest-card-content p-4">
                <h3 class="text-xl font-bold text-quest-gold mb-2">${game.title}</h3>
                <p class="text-sm text-gray-300 mb-3">${game.description}</p>
                <div class="quest-tags flex flex-wrap gap-2 mb-3">
                    ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="${game.url}" class="quest-button flex items-center justify-center">
                    <span class="quest-button-icon mr-2">${game.icon}</span>
                    <span>Play Now</span>
                </a>
            </div>
        </div>
    `;
} 