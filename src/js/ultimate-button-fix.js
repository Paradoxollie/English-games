// Solution d'urgence ultime pour les boutons qui ne fonctionnent pas
(function() {
    // Attendre que tout soit chargé
    window.addEventListener('load', function() {
        console.log("SOLUTION D'URGENCE ULTIME : Initialisation...");
        
        // Stocker le verbe actuel
        let currentVerb = "";
        
        // Initialiser les verbes irréguliers
        const verbDatabase = {
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
        
        // Fonction pour installer les boutons d'urgence
        function createEmergencyButtons() {
            console.log("Création des boutons d'urgence");
            
            // Trouver le conteneur des boutons
            const buttonContainer = document.querySelector('.verb-actions');
            if (!buttonContainer) {
                console.error("Conteneur de boutons non trouvé");
                return false;
            }
            
            // Créer les boutons d'urgence
            buttonContainer.innerHTML = `
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="ultimate-check-btn" style="
                        background: linear-gradient(45deg, #2563eb, #3b82f6);
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        font-family: 'Cinzel', serif;
                        font-size: 16px;
                        cursor: pointer;
                        box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                        transition: all 0.3s ease;
                    ">Lancer le Sort ✦</button>
                    
                    <button id="ultimate-skip-btn" style="
                        background: #0f172a;
                        color: white;
                        padding: 12px 24px;
                        border: 1px solid #3b82f6;
                        border-radius: 8px;
                        font-family: 'Cinzel', serif;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Bannir ✧</button>
                </div>
            `;
            
            // Ajouter les écouteurs d'événements
            document.getElementById('ultimate-check-btn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Bouton d'urgence 'Lancer le Sort' cliqué");
                checkVerb();
            });
            
            document.getElementById('ultimate-skip-btn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Bouton d'urgence 'Bannir' cliqué");
                skipVerb();
            });
            
            return true;
        }
        
        // Fonction pour générer un nouveau verbe
        function displayNewVerb() {
            // Sélectionner un verbe aléatoire
            const verbKeys = Object.keys(verbDatabase);
            const newVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
            currentVerb = newVerb;
            
            // Trouver et mettre à jour les éléments d'affichage
            const verbDisplay = document.getElementById('current-verb');
            const translationDisplay = document.getElementById('verb-translation');
            
            if (verbDisplay) {
                verbDisplay.textContent = newVerb;
            }
            
            if (translationDisplay) {
                translationDisplay.textContent = `(${verbDatabase[newVerb][2]})`;
            }
            
            // Effacer les champs de saisie
            clearInputFields();
            
            console.log(`Nouveau verbe affiché: ${newVerb}`);
        }
        
        // Fonction pour effacer les champs de saisie
        function clearInputFields() {
            const pastSimpleInput = document.getElementById('past-simple');
            const pastParticipleInput = document.getElementById('past-participle');
            
            if (pastSimpleInput) {
                pastSimpleInput.value = '';
                pastSimpleInput.focus();
            }
            
            if (pastParticipleInput) {
                pastParticipleInput.value = '';
            }
        }
        
        // Fonction pour vérifier la réponse
        function checkVerb() {
            // Obtenir la difficulté
            let difficulty = "1";
            const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
            difficultyOptions.forEach(option => {
                if (option.checked) {
                    difficulty = option.value;
                }
            });
            
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
            
            // Vérifier la validité de la réponse
            let isCorrect = false;
            
            if (!currentVerb || !verbDatabase[currentVerb]) {
                console.error("Pas de verbe actuel valide");
                return;
            }
            
            // Comparer avec les réponses correctes selon la difficulté
            if (difficulty === "1") {
                isCorrect = userPastSimple.toLowerCase() === verbDatabase[currentVerb][0].toLowerCase();
            } else if (difficulty === "2") {
                isCorrect = userPastParticiple.toLowerCase() === verbDatabase[currentVerb][1].toLowerCase();
            } else {
                isCorrect = userPastSimple.toLowerCase() === verbDatabase[currentVerb][0].toLowerCase() && 
                           userPastParticiple.toLowerCase() === verbDatabase[currentVerb][1].toLowerCase();
            }
            
            // Afficher le feedback
            showFeedback(isCorrect, difficulty);
            
            // Générer un nouveau verbe immédiatement
            displayNewVerb();
        }
        
        // Fonction pour afficher le feedback
        function showFeedback(isCorrect, difficulty) {
            const feedbackElement = document.getElementById('feedback-message');
            if (!feedbackElement) return;
            
            if (isCorrect) {
                let points = parseInt(difficulty);
                feedbackElement.innerHTML = `<span class="success-message">Correct ! +${points} points</span>`;
                
                // Animation du verbe
                const verbElement = document.getElementById('current-verb');
                if (verbElement) {
                    verbElement.classList.add('success-pulse');
                    setTimeout(() => {
                        verbElement.classList.remove('success-pulse');
                    }, 300);
                }
            } else {
                // Obtenir la réponse correcte
                let correctAnswer = '';
                if (difficulty === "1") {
                    correctAnswer = verbDatabase[currentVerb][0];
                } else if (difficulty === "2") {
                    correctAnswer = verbDatabase[currentVerb][1];
                } else {
                    correctAnswer = `${verbDatabase[currentVerb][0]} / ${verbDatabase[currentVerb][1]}`;
                }
                
                feedbackElement.innerHTML = `<span class="error-message">Incorrect. La réponse correcte est : ${correctAnswer}</span>`;
                
                // Animation d'erreur
                const verbElement = document.getElementById('current-verb');
                if (verbElement) {
                    verbElement.classList.add('error-shake');
                    setTimeout(() => {
                        verbElement.classList.remove('error-shake');
                    }, 300);
                }
            }
            
            // Rendre visible avec style en ligne
            feedbackElement.style.cssText = "opacity: 1; transform: translateY(0); transition: all 0.3s ease;";
            
            // Masquer après un délai
            setTimeout(() => {
                feedbackElement.style.cssText = "opacity: 0; transform: translateY(-20px); transition: all 0.3s ease;";
            }, 2000);
        }
        
        // Fonction pour bannir un verbe
        function skipVerb() {
            // Afficher un message de bannissement
            const feedbackElement = document.getElementById('feedback-message');
            if (feedbackElement) {
                feedbackElement.innerHTML = '<span class="skip-message">Verbe banni !</span>';
                feedbackElement.style.cssText = "opacity: 1; transform: translateY(0); transition: all 0.3s ease;";
                
                setTimeout(() => {
                    feedbackElement.style.cssText = "opacity: 0; transform: translateY(-20px); transition: all 0.3s ease;";
                }, 1500);
            }
            
            // Animation de bannissement
            const verbElement = document.getElementById('current-verb');
            if (verbElement) {
                verbElement.classList.add('banish-animation');
                
                // Générer un nouveau verbe immédiatement
                displayNewVerb();
                
                // Supprimer l'animation après un court délai
                setTimeout(() => {
                    verbElement.classList.remove('banish-animation');
                }, 300);
            } else {
                displayNewVerb();
            }
        }
        
        // Initialiser le jeu quand on clique sur le bouton de démarrage
        function initGameStart() {
            const startButton = document.getElementById('start-game-btn');
            if (startButton) {
                startButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Passer à l'écran de jeu
                    const startScreen = document.getElementById('game-start');
                    const gameScreen = document.getElementById('game-playing');
                    
                    if (startScreen) startScreen.classList.remove('active');
                    if (gameScreen) gameScreen.classList.add('active');
                    
                    // Démarrer le timer
                    startTimer();
                    
                    // Afficher un premier verbe
                    displayNewVerb();
                    
                    // Créer les boutons d'urgence après un court délai pour s'assurer que tout est chargé
                    setTimeout(() => {
                        if (!createEmergencyButtons()) {
                            console.error("Échec de la création des boutons d'urgence");
                        }
                    }, 500);
                });
            }
        }
        
        // Fonction pour démarrer le timer
        function startTimer() {
            const timerElement = document.getElementById('time-left');
            if (timerElement) {
                let timeLeft = 90;
                timerElement.textContent = timeLeft;
                
                const timerId = setInterval(function() {
                    timeLeft--;
                    timerElement.textContent = timeLeft;
                    
                    // Quand le temps est écoulé
                    if (timeLeft <= 0) {
                        clearInterval(timerId);
                        
                        // Afficher l'écran de fin
                        const gamePlayingScreen = document.getElementById('game-playing');
                        const gameOverScreen = document.getElementById('game-over');
                        
                        if (gamePlayingScreen) gamePlayingScreen.classList.remove('active');
                        if (gameOverScreen) gameOverScreen.classList.add('active');
                    }
                }, 1000);
            }
        }
        
        // Ajouter un écouteur de clavier global
        document.addEventListener('keydown', function(e) {
            // Si un champ de saisie est actif et que la touche est Entrée
            if (e.key === 'Enter' && (
                document.activeElement.id === 'past-simple' || 
                document.activeElement.id === 'past-participle'
            )) {
                checkVerb();
            }
            
            // Si la touche Espace est appuyée et qu'aucun champ n'est actif
            if (e.key === ' ' && 
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault(); // Empêcher le défilement de la page
                skipVerb();
            }
        });
        
        // Initialiser le jeu
        initGameStart();
        
        console.log("SOLUTION D'URGENCE ULTIME : Installation terminée");
    }, { once: true });
})(); 