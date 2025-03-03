// Solution d'urgence pour les boutons non fonctionnels
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que tout soit chargé
    setTimeout(function() {
        console.log("SOLUTION D'URGENCE : Remplacement des boutons non fonctionnels");
        
        // Fonction pour remplacer complètement les boutons
        function replaceButtons() {
            // 1. Récupérer le conteneur des boutons
            const buttonContainer = document.querySelector('.verb-actions');
            if (!buttonContainer) {
                console.error("Conteneur de boutons non trouvé");
                return;
            }
            
            // 2. Vider le conteneur
            buttonContainer.innerHTML = '';
            
            // 3. Créer de nouveaux boutons basiques
            const checkButton = document.createElement('button');
            checkButton.id = 'emergency-check-btn';
            checkButton.innerHTML = 'Lancer le Sort ✦';
            checkButton.style.cssText = `
                background: linear-gradient(45deg, #2563eb, #3b82f6);
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                margin-right: 10px;
                font-family: 'Cinzel', serif;
                font-size: 16px;
                cursor: pointer;
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                transition: all 0.3s ease;
            `;
            
            const skipButton = document.createElement('button');
            skipButton.id = 'emergency-skip-btn';
            skipButton.innerHTML = 'Bannir ✧';
            skipButton.style.cssText = `
                background: #0f172a;
                color: white;
                padding: 12px 24px;
                border: 1px solid #3b82f6;
                border-radius: 8px;
                font-family: 'Cinzel', serif;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            // 4. Ajouter des écouteurs d'événements directs
            checkButton.onclick = function() {
                console.log("Bouton d'urgence 'Lancer le Sort' cliqué");
                checkAnswer();
            };
            
            skipButton.onclick = function() {
                console.log("Bouton d'urgence 'Bannir' cliqué");
                skipVerb();
            };
            
            // 5. Ajouter les boutons au conteneur
            buttonContainer.appendChild(checkButton);
            buttonContainer.appendChild(skipButton);
            
            console.log("Boutons d'urgence installés avec succès");
        }
        
        // Fonction de vérification de réponse simplifiée
        window.checkAnswer = function() {
            // Obtenir les valeurs des champs
            const pastSimpleInput = document.getElementById('past-simple');
            const pastParticipleInput = document.getElementById('past-participle');
            
            let userPastSimple = '';
            let userPastParticiple = '';
            
            if (pastSimpleInput) {
                userPastSimple = pastSimpleInput.value.trim().toLowerCase();
            }
            
            if (pastParticipleInput) {
                userPastParticiple = pastParticipleInput.value.trim().toLowerCase();
            }
            
            // Récupérer le verbe actuel
            const currentVerbElement = document.getElementById('current-verb');
            if (!currentVerbElement) return;
            
            const currentVerb = currentVerbElement.textContent;
            if (!window.verbData || !window.verbData[currentVerb]) {
                console.error("Données de verbe non disponibles");
                return;
            }
            
            // Vérifier la difficulté
            const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
            let difficulty = "1";
            difficultyOptions.forEach(option => {
                if (option.checked) {
                    difficulty = option.value;
                }
            });
            
            // Vérifier la réponse
            let isCorrect = false;
            
            if (difficulty === "1") {
                isCorrect = userPastSimple === window.verbData[currentVerb][0].toLowerCase();
            } else if (difficulty === "2") {
                isCorrect = userPastParticiple === window.verbData[currentVerb][1].toLowerCase();
            } else {
                isCorrect = userPastSimple === window.verbData[currentVerb][0].toLowerCase() && 
                           userPastParticiple === window.verbData[currentVerb][1].toLowerCase();
            }
            
            // Afficher un message
            const feedbackElement = document.getElementById('feedback-message');
            if (feedbackElement) {
                if (isCorrect) {
                    // Calculer les points gagnés
                    let points = parseInt(difficulty);
                    feedbackElement.innerHTML = `<span class="success-message">Correct ! +${points} points</span>`;
                    
                    // Animation du verbe
                    if (currentVerbElement) {
                        currentVerbElement.classList.add('success-pulse');
                        setTimeout(() => {
                            currentVerbElement.classList.remove('success-pulse');
                        }, 500);
                    }
                } else {
                    // Obtenir la réponse correcte
                    let correctAnswer = '';
                    if (difficulty === "1") {
                        correctAnswer = window.verbData[currentVerb][0];
                    } else if (difficulty === "2") {
                        correctAnswer = window.verbData[currentVerb][1];
                    } else {
                        correctAnswer = `${window.verbData[currentVerb][0]} / ${window.verbData[currentVerb][1]}`;
                    }
                    
                    feedbackElement.innerHTML = `<span class="error-message">Incorrect. La réponse correcte est : ${correctAnswer}</span>`;
                    
                    // Animation d'erreur
                    if (currentVerbElement) {
                        currentVerbElement.classList.add('error-shake');
                        setTimeout(() => {
                            currentVerbElement.classList.remove('error-shake');
                        }, 500);
                    }
                }
                
                // Rendre visible
                feedbackElement.style.cssText = "opacity: 1; transform: translateY(0);";
            }
            
            // Générer immédiatement un nouveau verbe
            generateNewVerb();
            
            // Cacher le feedback après un moment (mais le nouveau verbe est déjà affiché)
            if (feedbackElement) {
                setTimeout(() => {
                    feedbackElement.style.cssText = "opacity: 0; transform: translateY(-20px);";
                }, 2000);
            }
            
            // Vider les champs
            if (pastSimpleInput) pastSimpleInput.value = '';
            if (pastParticipleInput) pastParticipleInput.value = '';
            
            // Focus sur le premier champ
            if (pastSimpleInput) pastSimpleInput.focus();
        };
        
        // Fonction pour passer au verbe suivant
        window.skipVerb = function() {
            console.log("Fonction skipVerb appelée");
            
            // Message
            const feedbackElement = document.getElementById('feedback-message');
            if (feedbackElement) {
                feedbackElement.innerHTML = '<span class="skip-message">Verbe banni !</span>';
                feedbackElement.style.cssText = "opacity: 1; transform: translateY(0);";
                
                setTimeout(() => {
                    feedbackElement.style.cssText = "opacity: 0; transform: translateY(-20px);";
                }, 1500);
            }
            
            // Animation et génération immédiate du nouveau verbe
            const verbElement = document.getElementById('current-verb');
            if (verbElement) {
                verbElement.classList.add('banish-animation');
                
                // Générer immédiatement un nouveau verbe
                generateNewVerb();
                
                // Retirer l'animation après un court délai
                setTimeout(() => {
                    verbElement.classList.remove('banish-animation');
                }, 400);
            } else {
                generateNewVerb();
            }
        };
        
        // Fonction pour générer un nouveau verbe
        function generateNewVerb() {
            // Verbes irréguliers si verbData n'est pas disponible
            if (!window.verbData) {
                window.verbData = {
                    "become": ["became", "become", "devenir"],
                    "begin": ["began", "begun", "commencer"],
                    "break": ["broke", "broken", "casser"],
                    "bring": ["brought", "brought", "apporter"],
                    "build": ["built", "built", "construire"],
                    "buy": ["bought", "bought", "acheter"],
                    "catch": ["caught", "caught", "attraper"],
                    "choose": ["chose", "chosen", "choisir"],
                    "come": ["came", "come", "venir"],
                    "do": ["did", "done", "faire"],
                    "drink": ["drank", "drunk", "boire"],
                    "drive": ["drove", "driven", "conduire"],
                    "eat": ["ate", "eaten", "manger"],
                    "fall": ["fell", "fallen", "tomber"],
                    "feel": ["felt", "felt", "ressentir"],
                    "find": ["found", "found", "trouver"],
                    "get": ["got", "gotten", "obtenir"],
                    "give": ["gave", "given", "donner"],
                    "go": ["went", "gone", "aller"],
                    "have": ["had", "had", "avoir"],
                    "hear": ["heard", "heard", "entendre"],
                    "know": ["knew", "known", "savoir"],
                    "learn": ["learnt", "learnt", "apprendre"],
                    "leave": ["left", "left", "partir"],
                    "make": ["made", "made", "faire"],
                    "meet": ["met", "met", "rencontrer"],
                    "put": ["put", "put", "mettre"],
                    "read": ["read", "read", "lire"],
                    "run": ["ran", "run", "courir"],
                    "say": ["said", "said", "dire"],
                    "see": ["saw", "seen", "voir"],
                    "send": ["sent", "sent", "envoyer"],
                    "speak": ["spoke", "spoken", "parler"],
                    "take": ["took", "taken", "prendre"],
                    "teach": ["taught", "taught", "enseigner"],
                    "tell": ["told", "told", "raconter"],
                    "think": ["thought", "thought", "penser"],
                    "understand": ["understood", "understood", "comprendre"],
                    "write": ["wrote", "written", "écrire"]
                };
            }
            
            // Générer un nouveau verbe aléatoire
            const verbKeys = Object.keys(window.verbData);
            const randomVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
            
            // Mettre à jour l'affichage
            const verbElement = document.getElementById('current-verb');
            if (verbElement) {
                verbElement.textContent = randomVerb;
            }
            
            const translationElement = document.getElementById('verb-translation');
            if (translationElement) {
                translationElement.textContent = `(${window.verbData[randomVerb][2]})`;
            }
            
            // Vider les champs
            const pastSimpleInput = document.getElementById('past-simple');
            if (pastSimpleInput) pastSimpleInput.value = '';
            
            const pastParticipleInput = document.getElementById('past-participle');
            if (pastParticipleInput) pastParticipleInput.value = '';
            
            // Focus sur le premier champ
            if (pastSimpleInput) pastSimpleInput.focus();
        }
        
        // Remplacer les boutons
        replaceButtons();
        
        // Ajouter un gestionnaire pour le démarrage du jeu
        const startButton = document.getElementById('start-game-btn');
        if (startButton) {
            startButton.onclick = function() {
                // Cacher l'écran de démarrage
                const startScreen = document.getElementById('game-start');
                if (startScreen) {
                    startScreen.classList.remove('active');
                }
                
                // Afficher l'écran de jeu
                const gameScreen = document.getElementById('game-playing');
                if (gameScreen) {
                    gameScreen.classList.add('active');
                }
                
                // Générer le premier verbe
                generateNewVerb();
                
                // Démarrer un timer simple
                const timerElement = document.getElementById('time-left');
                if (timerElement) {
                    let timeLeft = 90;
                    timerElement.textContent = timeLeft;
                    
                    const timerId = setInterval(function() {
                        timeLeft--;
                        timerElement.textContent = timeLeft;
                        
                        if (timeLeft <= 0) {
                            clearInterval(timerId);
                            
                            // Afficher l'écran de fin
                            const gameOverScreen = document.getElementById('game-over');
                            if (gameOverScreen) {
                                gameScreen.classList.remove('active');
                                gameOverScreen.classList.add('active');
                            }
                        }
                    }, 1000);
                }
            };
        }
    }, 1500);
}); 