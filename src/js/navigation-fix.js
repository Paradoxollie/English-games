/**
 * Script de correction de la navigation - Force le centrage des menus
 * Ce script s'exécute sur toutes les pages et centre la navigation
 * quelle que soit la structure HTML sous-jacente
 */

(function() {
    console.log("🚀 Navigation Fix - Centrage des menus en cours...");
    
    // Fonction pour centrer la navigation
    function centerNavigation() {
        // Liste des sélecteurs possibles pour les conteneurs de navigation
        const navContainerSelectors = [
            'nav', '.nav', '.navbar', '.navigation', '.main-nav', '.site-nav', 
            '.menu', '.menu-container', '.nav-container', '.header-nav',
            'header ul', '.header ul', '#main-menu', '#primary-menu',
            '.main-menu', '.primary-menu', '.top-menu', '.site-menu'
        ];
        
        // Trouver tous les conteneurs de navigation possibles
        let navContainers = [];
        navContainerSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(el => navContainers.push(el));
            }
        });
        
        // Déduplication des conteneurs (certains peuvent être sélectionnés plusieurs fois)
        navContainers = [...new Set(navContainers)];
        
        console.log(`🔍 ${navContainers.length} conteneurs de navigation trouvés`);
        
        // Appliquer les styles de centrage à chaque conteneur
        navContainers.forEach(container => {
            // Appliquer les styles au conteneur
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.width = '100%';
            container.style.textAlign = 'center';
            container.style.margin = '0 auto';
            container.style.padding = '10px 0';
            container.style.float = 'none';
            
            // Si c'est une liste, s'assurer qu'elle n'a pas de style de liste
            if (container.tagName === 'UL' || container.tagName === 'OL') {
                container.style.listStyle = 'none';
                container.style.paddingLeft = '0';
            }
            
            // Trouver tous les éléments de liste à l'intérieur
            const listItems = container.querySelectorAll('li');
            listItems.forEach(item => {
                item.style.display = 'inline-block';
                item.style.float = 'none';
                item.style.textAlign = 'center';
                item.style.margin = '0 15px';
            });
            
            // Trouver tous les liens à l'intérieur
            const links = container.querySelectorAll('a');
            links.forEach(link => {
                link.style.display = 'inline-block';
                link.style.textAlign = 'center';
                link.style.padding = '8px 15px';
                link.style.color = '#fff';
                link.style.textDecoration = 'none';
                link.style.fontFamily = "'Cinzel', serif";
                link.style.fontWeight = '600';
                link.style.letterSpacing = '1px';
                link.style.textTransform = 'uppercase';
                link.style.position = 'relative';
                link.style.transition = 'all 0.3s ease';
                link.style.textShadow = '0 0 5px rgba(33, 150, 243, 0.5)';
                
                // Vérifier si le lien contient un des textes de navigation
                const navTexts = ['Accueil', 'Jeux', 'Cours', 'Classement', 'Contact', 
                                 'Home', 'Games', 'Courses', 'Leaderboard'];
                
                navTexts.forEach(text => {
                    if (link.textContent.includes(text)) {
                        console.log(`📌 Lien de navigation trouvé: "${link.textContent}"`);
                    }
                });
            });
            
            console.log(`✅ Styles appliqués au conteneur: ${container.tagName}${container.className ? '.' + container.className.replace(/\s+/g, '.') : ''}`);
        });
        
        // Recherche spécifique des liens de navigation par texte
        const navTexts = ['Accueil', 'Jeux', 'Cours', 'Classement', 'Contact', 
                         'Home', 'Games', 'Courses', 'Leaderboard'];
        
        navTexts.forEach(text => {
            // Trouver tous les liens contenant ce texte
            const links = Array.from(document.querySelectorAll('a')).filter(
                link => link.textContent.trim() === text
            );
            
            if (links.length > 0) {
                console.log(`🔍 ${links.length} liens "${text}" trouvés`);
                
                // Trouver le parent commun le plus proche
                if (links.length > 1) {
                    let commonParent = links[0].parentElement;
                    while (commonParent && !links.every(link => commonParent.contains(link))) {
                        commonParent = commonParent.parentElement;
                    }
                    
                    if (commonParent) {
                        console.log(`🎯 Parent commun trouvé pour les liens "${text}": ${commonParent.tagName}${commonParent.className ? '.' + commonParent.className.replace(/\s+/g, '.') : ''}`);
                        
                        // Centrer ce parent
                        commonParent.style.display = 'flex';
                        commonParent.style.justifyContent = 'center';
                        commonParent.style.width = '100%';
                        commonParent.style.textAlign = 'center';
                    }
                }
            }
        });
        
        // Recherche des conteneurs de navigation par la présence de plusieurs liens de navigation
        const allLinks = Array.from(document.querySelectorAll('a'));
        const navLinks = allLinks.filter(link => 
            navTexts.some(text => link.textContent.trim() === text)
        );
        
        if (navLinks.length >= 3) {
            console.log(`🔍 ${navLinks.length} liens de navigation trouvés au total`);
            
            // Trouver le parent commun le plus proche pour tous les liens de navigation
            let commonParent = navLinks[0].parentElement;
            while (commonParent && !navLinks.every(link => commonParent.contains(link))) {
                commonParent = commonParent.parentElement;
            }
            
            if (commonParent) {
                console.log(`🎯 Parent commun trouvé pour tous les liens de navigation: ${commonParent.tagName}${commonParent.className ? '.' + commonParent.className.replace(/\s+/g, '.') : ''}`);
                
                // Appliquer des styles de centrage au parent commun et à tous ses parents jusqu'à body
                let currentParent = commonParent;
                while (currentParent && currentParent !== document.body) {
                    currentParent.style.display = 'flex';
                    currentParent.style.flexDirection = 'column';
                    currentParent.style.alignItems = 'center';
                    currentParent.style.width = '100%';
                    currentParent.style.textAlign = 'center';
                    currentParent.style.float = 'none';
                    
                    // Si c'est un conteneur de navigation, utiliser flexRow
                    if (navContainers.includes(currentParent)) {
                        currentParent.style.flexDirection = 'row';
                    }
                    
                    currentParent = currentParent.parentElement;
                }
                
                // Forcer le centrage des éléments enfants directs
                const children = commonParent.children;
                for (let i = 0; i < children.length; i++) {
                    children[i].style.float = 'none';
                    children[i].style.textAlign = 'center';
                    children[i].style.margin = '0 auto';
                }
            }
        }
        
        // Forcer le centrage de tous les éléments avec des classes de positionnement
        const alignmentSelectors = [
            '.pull-right', '.float-right', '.align-right', '.right', '.text-right',
            '.pull-left', '.float-left', '.align-left', '.left', '.text-left'
        ];
        
        alignmentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.float = 'none';
                el.style.textAlign = 'center';
                el.style.margin = '0 auto';
            });
        });
        
        console.log("✅ Centrage de la navigation terminé");
    }
    
    // Exécuter la fonction une fois que le DOM est chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', centerNavigation);
    } else {
        centerNavigation();
    }
    
    // Réexécuter après un court délai pour s'assurer que tous les éléments sont chargés
    setTimeout(centerNavigation, 500);
    
    // Réexécuter après un délai plus long pour les pages qui chargent du contenu dynamiquement
    setTimeout(centerNavigation, 1500);
})(); 