// Script pour s'assurer que les boutons fonctionnent correctement
document.addEventListener('DOMContentLoaded', function() {
    // Après le chargement complet du DOM, attendre un peu pour s'assurer que tout est initialisé
    setTimeout(function() {
        console.log("Vérification des boutons...");
        
        const checkButton = document.getElementById('check-answer-btn');
        const skipButton = document.getElementById('skip-verb-btn');
        
        // Fonction pour vérifier la réponse
        const checkAnswerFunction = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Bouton 'Lancer le Sort' cliqué");
            
            // Obtenir les valeurs
            let isCorrect = false;
            let userPastSimple = '';
            let userPastParticiple = '';
            
            const pastSimpleInput = document.getElementById('past-simple');
            if (pastSimpleInput) {
                userPastSimple = pastSimpleInput.value.trim().toLowerCase();
            }
            
            const pastParticipleInput = document.getElementById('past-participle');
            if (pastParticipleInput) {
                userPastParticiple = pastParticipleInput.value.trim().toLowerCase();
            }
            
            // Obtenir le verbe actuel et sa difficulté
            const currentVerbElement = document.getElementById('current-verb');
            if (!currentVerbElement) return;
            
            const currentVerb = currentVerbElement.textContent;
            if (!verbData[currentVerb]) return;
            
            // Vérifier selon la difficulté
            const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
            let difficulty = "1";
            difficultyRadios.forEach(radio => {
                if (radio.checked) {
                    difficulty = radio.value;
                }
            });
            
            if (difficulty === "1") {
                isCorrect = userPastSimple === verbData[currentVerb][0].toLowerCase();
            } else if (difficulty === "2") {
                isCorrect = userPastParticiple === verbData[currentVerb][1].toLowerCase();
            } else {
                isCorrect = userPastSimple === verbData[currentVerb][0].toLowerCase() && 
                           userPastParticiple === verbData[currentVerb][1].toLowerCase();
            }
            
            // Afficher un retour visuel
            const feedbackElement = document.getElementById('feedback-message');
            if (feedbackElement) {
                if (isCorrect) {
                    feedbackElement.innerHTML = '<span class="success-message">Correct !</span>';
                    feedbackElement.classList.add('success');
                } else {
                    let correctAnswer = '';
                    if (difficulty === "1") {
                        correctAnswer = verbData[currentVerb][0];
                    } else if (difficulty === "2") {
                        correctAnswer = verbData[currentVerb][1];
                    } else {
                        correctAnswer = `${verbData[currentVerb][0]} / ${verbData[currentVerb][1]}`;
                    }
                    
                    feedbackElement.innerHTML = `<span class="error-message">Incorrect. La réponse correcte est : ${correctAnswer}</span>`;
                    feedbackElement.classList.add('error');
                }
                
                feedbackElement.style.opacity = '1';
                feedbackElement.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    feedbackElement.style.opacity = '0';
                    feedbackElement.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => {
                        feedbackElement.innerHTML = '';
                        feedbackElement.classList.remove('success', 'error');
                    }, 500);
                }, 2000);
            }
            
            // Réinitialiser les champs
            if (pastSimpleInput) pastSimpleInput.value = '';
            if (pastParticipleInput) pastParticipleInput.value = '';
            
            // Focus sur le premier champ
            if (pastSimpleInput) pastSimpleInput.focus();
        };
        
        // Fonction pour skiper un verbe
        const skipVerbFunction = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Bouton 'Bannir' cliqué");
            
            // Afficher un message
            const feedbackElement = document.getElementById('feedback-message');
            if (feedbackElement) {
                feedbackElement.innerHTML = '<span class="skip-message">Verbe banni !</span>';
                feedbackElement.classList.add('skip');
                
                feedbackElement.style.opacity = '1';
                feedbackElement.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    feedbackElement.style.opacity = '0';
                    feedbackElement.style.transform = 'translateY(-20px)';
                    
                    setTimeout(() => {
                        feedbackElement.innerHTML = '';
                        feedbackElement.classList.remove('skip');
                    }, 500);
                }, 1500);
            }
            
            // Animation de bannissement
            const verbElement = document.getElementById('current-verb');
            if (verbElement) {
                verbElement.classList.add('banish-animation');
                setTimeout(() => {
                    verbElement.classList.remove('banish-animation');
                    
                    // Obtenir un nouveau verbe
                    const verbKeys = Object.keys(verbData);
                    const randomVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
                    verbElement.textContent = randomVerb;
                    
                    // Mettre à jour la traduction
                    const translationElement = document.getElementById('verb-translation');
                    if (translationElement) {
                        translationElement.textContent = `(${verbData[randomVerb][2]})`;
                    }
                    
                    // Réinitialiser les champs
                    const pastSimpleInput = document.getElementById('past-simple');
                    if (pastSimpleInput) pastSimpleInput.value = '';
                    
                    const pastParticipleInput = document.getElementById('past-participle');
                    if (pastParticipleInput) pastParticipleInput.value = '';
                    
                    // Focus sur le premier champ
                    if (pastSimpleInput) pastSimpleInput.focus();
                }, 800);
            }
        };
        
        // Ajouter les écouteurs d'événements
        if (checkButton) {
            // Nettoyer les écouteurs existants
            checkButton.replaceWith(checkButton.cloneNode(true));
            const newCheckButton = document.getElementById('check-answer-btn');
            
            // Ajouter le nouvel écouteur
            newCheckButton.addEventListener('click', checkAnswerFunction);
            console.log("Écouteur click ajouté pour 'Lancer le Sort'");
            
            // Assurer que le bouton est cliquable
            newCheckButton.style.pointerEvents = 'auto';
            newCheckButton.style.cursor = 'pointer';
            newCheckButton.style.zIndex = '100';
        }
        
        if (skipButton) {
            // Nettoyer les écouteurs existants
            skipButton.replaceWith(skipButton.cloneNode(true));
            const newSkipButton = document.getElementById('skip-verb-btn');
            
            // Ajouter le nouvel écouteur
            newSkipButton.addEventListener('click', skipVerbFunction);
            console.log("Écouteur click ajouté pour 'Bannir'");
            
            // Assurer que le bouton est cliquable
            newSkipButton.style.pointerEvents = 'auto';
            newSkipButton.style.cursor = 'pointer';
            newSkipButton.style.zIndex = '100';
        }
    }, 1000);
}); 