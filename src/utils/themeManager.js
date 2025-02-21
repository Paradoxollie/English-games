export function initThemeManager() {
    // Vérifie si le thème sombre est activé
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Ajoute un bouton pour basculer le thème
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle fixed bottom-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700';
    themeToggle.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
    `;

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    document.body.appendChild(themeToggle);
} 