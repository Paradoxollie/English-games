export function initHeaderManager() {
    const header = document.querySelector('.site-header');
    let lastScroll = 0;
    let isMouseNearTop = false;
    
    // Fonction pour vérifier si la souris est près du haut
    function checkMousePosition(event) {
        isMouseNearTop = event.clientY <= 100;
        if (isMouseNearTop) {
            header.classList.add('visible');
        } else if (window.scrollY > 150) {
            header.classList.remove('visible');
        }
    }

    // Gestion du scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Au top de la page, toujours visible
        if (currentScroll <= 0) {
            header.classList.add('visible');
            header.classList.remove('compact');
            return;
        }

        // Compression du header
        if (currentScroll > 50) {
            header.classList.add('compact');
        } else {
            header.classList.remove('compact');
        }

        // Visibilité basée sur la direction du scroll
        if (currentScroll > lastScroll && !isMouseNearTop) {
            // Scroll vers le bas - cacher le header
            header.classList.remove('visible');
        } else if (currentScroll < lastScroll) {
            // Scroll vers le haut - montrer le header
            header.classList.add('visible');
        }

        lastScroll = currentScroll;
    });

    // Gestion de la position de la souris
    document.addEventListener('mousemove', checkMousePosition);

    // Gestion du focus pour l'accessibilité
    header.addEventListener('focus', () => {
        header.classList.add('visible');
    }, true);

    // Initialisation
    if (window.scrollY <= 0) {
        header.classList.add('visible');
    }
} 