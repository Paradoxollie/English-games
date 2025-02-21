export function initMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Créer le contenu du menu mobile
    mobileMenu.innerHTML = `
        <div class="px-4 py-3 space-y-3">
            <a href="/all-games.html" class="block nav-link">Games</a>
            <a href="/courses.html" class="block nav-link">Courses</a>
            <a href="/leaderboard.html" class="block nav-link">Leaderboard</a>
            <a href="/contact.html" class="block nav-link">Contact</a>
        </div>
    `;

    // Gérer l'ouverture/fermeture du menu
    menuButton.addEventListener('click', () => {
        const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
        menuButton.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden');
    });
} 