// Solution finale consolidée - Désactive toutes les autres solutions
(function() {
    // Attendre que le DOM soit chargé
    window.addEventListener('load', function() {
        console.log("SOLUTION CONSOLIDÉE : Initialisation...");
        
        // 1. DÉSACTIVER TOUTES LES AUTRES SOLUTIONS
        // ---------------------------------------
        // Remplacer les fonctions d'origine
        if (window.checkAnswer) window._originalCheckAnswer = window.checkAnswer;
        if (window.skipVerb) window._originalSkipVerb = window.skipVerb;
        
        // Neutraliser les fonctions des scripts précédents
        window.checkAnswer = function() { 
            console.log("Fonction checkAnswer désactivée, utilisant la nouvelle solution consolidée");
            return false;
        };
        
        window.skipVerb = function() {
            console.log("Fonction skipVerb désactivée, utilisant la nouvelle solution consolidée");
            return false;
        };
        
        // Nettoyer tous les écouteurs d'événements des boutons existants
        const oldCheckButton = document.getElementById('check-answer-btn');
        const oldSkipButton = document.getElementById('skip-verb-btn');
        const emergencyCheckButton = document.getElementById('emergency-check-btn');
        const emergencySkipButton = document.getElementById('emergency-skip-btn');
        const ultimateCheckButton = document.getElementById('ultimate-check-btn');
        const ultimateSkipButton = document.getElementById('ultimate-skip-btn');
        
        [oldCheckButton, oldSkipButton, emergencyCheckButton, emergencySkipButton, 
         ultimateCheckButton, ultimateSkipButton].forEach(button => {
            if (button) {
                // Créer une copie sans écouteurs d'événements
                const newButton = button.cloneNode(true);
                if (button.parentNode) {
                    button.parentNode.replaceChild(newButton, button);
                }
            }
        });
        
        // 2. DÉFINIR NOS PROPRES VARIABLES ET FONCTIONS
        // -------------------------------------------
        // Stocker le verbe actuel et son index
        let currentVerb = "";
        let currentVerbs = [];  // Pour suivre les verbes déjà utilisés
        let score = 0;
        let streak = 0;
        let maxStreak = 0;
        let verbsCompleted = 0;
        
        // Variables pour le système d'XP et de niveau (INITIALISÉES ICI)
        let playerXP = 0;
        let playerLevel = 1;
        let xpToNextLevel = 100;
        
        // Initialiser les verbes irréguliers ou utiliser ceux déjà disponibles
        const verbDatabase = window.verbData || {
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
        
        // 3. CRÉER NOS PROPRES FONCTIONS DE JEU
        // -----------------------------------
        // Fonction pour créer les champs d'entrée selon la difficulté
        function createInputFields(difficulty) {
            const verbFormInputs = document.getElementById('verb-form-inputs');
            if (!verbFormInputs) return;
            
            // Vider le conteneur
            verbFormInputs.innerHTML = '';
            
            if (difficulty === "1" || difficulty === "3") {
                // Champ pour le passé simple
                const pastSimpleContainer = document.createElement('div');
                pastSimpleContainer.className = 'input-group';
                
                const pastSimpleLabel = document.createElement('label');
                pastSimpleLabel.textContent = 'Past Simple:';
                pastSimpleLabel.setAttribute('for', 'past-simple');
                
                const pastSimpleInput = document.createElement('input');
                pastSimpleInput.type = 'text';
                pastSimpleInput.id = 'past-simple';
                pastSimpleInput.className = 'verb-input';
                pastSimpleInput.setAttribute('autocomplete', 'off');
                
                pastSimpleContainer.appendChild(pastSimpleLabel);
                pastSimpleContainer.appendChild(pastSimpleInput);
                verbFormInputs.appendChild(pastSimpleContainer);
            }
            
            if (difficulty === "2" || difficulty === "3") {
                // Champ pour le participe passé
                const pastParticipleContainer = document.createElement('div');
                pastParticipleContainer.className = 'input-group';
                
                const pastParticipleLabel = document.createElement('label');
                pastParticipleLabel.textContent = 'Past Participle:';
                pastParticipleLabel.setAttribute('for', 'past-participle');
                
                const pastParticipleInput = document.createElement('input');
                pastParticipleInput.type = 'text';
                pastParticipleInput.id = 'past-participle';
                pastParticipleInput.className = 'verb-input';
                pastParticipleInput.setAttribute('autocomplete', 'off');
                
                pastParticipleContainer.appendChild(pastParticipleLabel);
                pastParticipleContainer.appendChild(pastParticipleInput);
                verbFormInputs.appendChild(pastParticipleContainer);
            }
            
            // Focus sur le premier champ
            const firstInput = verbFormInputs.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }
        
        // Fonction pour générer un nouveau verbe
        function displayNewVerb() {
            // Obtenir tous les verbes disponibles
            const verbKeys = Object.keys(verbDatabase);
            
            // S'il ne reste plus de verbes à montrer, réinitialiser la liste
            if (currentVerbs.length >= verbKeys.length) {
                currentVerbs = [];
            }
            
            // Sélectionner un verbe aléatoire non utilisé
            let newVerb;
            do {
                newVerb = verbKeys[Math.floor(Math.random() * verbKeys.length)];
            } while (currentVerbs.includes(newVerb) && currentVerbs.length < verbKeys.length);
            
            // Mémoriser ce verbe
            currentVerbs.push(newVerb);
            currentVerb = newVerb;
            
            // Mettre à jour l'affichage
            const verbDisplay = document.getElementById('current-verb');
            const translationDisplay = document.getElementById('verb-translation');
            
            if (verbDisplay) {
                verbDisplay.textContent = newVerb;
            }
            
            if (translationDisplay) {
                translationDisplay.textContent = `(${verbDatabase[newVerb][2]})`;
            }
            
            // Obtenir la difficulté actuelle
            let difficulty = "1";
            const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
            difficultyOptions.forEach(option => {
                if (option.checked) {
                    difficulty = option.value;
                }
            });
            
            // Créer les champs d'entrée selon la difficulté
            createInputFields(difficulty);
            
            console.log(`Nouveau verbe : ${newVerb} (${verbDatabase[newVerb][2]})`);
            return newVerb;
        }
        
        // Fonction pour vider les champs
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
        function checkAnswer() {
            // Obtenir la difficulté
            let difficulty = "1";
            const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
            difficultyOptions.forEach(option => {
                if (option.checked) {
                    difficulty = option.value;
                }
            });
            
            // Récupérer les valeurs saisies
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
            
            // Vérifier si nous avons un verbe valide à vérifier
            if (!currentVerb || !verbDatabase[currentVerb]) {
                console.error("Pas de verbe valide à vérifier");
                // Générer un nouveau verbe et sortir
                displayNewVerb();
                return;
            }
            
            // Vérifier la réponse
            let isCorrect = false;
            
            // Normalisation des réponses (enlever les espaces, mettre en minuscules)
            const correctPastSimple = verbDatabase[currentVerb][0].toLowerCase().trim();
            const correctPastParticiple = verbDatabase[currentVerb][1].toLowerCase().trim();
            
            // Vérifier selon la difficulté
            if (difficulty === "1") {
                isCorrect = userPastSimple === correctPastSimple;
            } else if (difficulty === "2") {
                isCorrect = userPastParticiple === correctPastParticiple;
            } else {
                isCorrect = userPastSimple === correctPastSimple && userPastParticiple === correctPastParticiple;
            }
            
            // Préparer la réponse correcte pour l'affichage
            let correctAnswer = '';
            if (difficulty === "1") {
                correctAnswer = verbDatabase[currentVerb][0];
            } else if (difficulty === "2") {
                correctAnswer = verbDatabase[currentVerb][1];
            } else {
                correctAnswer = `${verbDatabase[currentVerb][0]} / ${verbDatabase[currentVerb][1]}`;
            }
            
            console.log(`Vérification pour ${currentVerb}: User=${userPastSimple}/${userPastParticiple}, Correct=${correctPastSimple}/${correctPastParticiple}, isCorrect=${isCorrect}`);
            
            // Traiter la réponse
            if (isCorrect) {
                const points = parseInt(difficulty);
                score += points;
                streak++;
                verbsCompleted++;
                if (streak > maxStreak) maxStreak = streak;
                
                // Mise à jour du score
                updateScore(score);
                
                // Ajouter de l'expérience
                addExperience(points * 10);
                
                // Effets visuels
                createSuccessParticles(15 + (streak * 3));
                playSuccessAnimation();
                
                // Feedback
                showFeedback(true, points);
            } else {
                streak = 0;
                
                // Effets visuels
                playErrorAnimation();
                
                // Feedback
                showFeedback(false, correctAnswer);
            }
            
            // Sauvegarder l'ancien verbe et générer un nouveau
            const oldVerb = currentVerb;
            const newVerb = displayNewVerb();
            
            console.log(`Changement de verbe: ${oldVerb} → ${newVerb}`);
        }
        
        // Fonction pour sauter un verbe
        function skipVerb() {
            // Réinitialiser le streak
            streak = 0;
            
            // Afficher le message
            showFeedback('skip');
            
            // Générer un nouveau verbe
            displayNewVerb();
        }
        
        // Fonction pour afficher un feedback
        function showFeedback(type, data) {
            const feedbackElement = document.getElementById('feedback-message');
            if (!feedbackElement) return;
            
            // Configurer le message selon le type
            if (type === true) {
                // Succès
                feedbackElement.innerHTML = `<span class="success-message">Correct ! +${data} points</span>`;
                
                // Animation du verbe
                const verbElement = document.getElementById('current-verb');
                if (verbElement) {
                    verbElement.classList.add('success-pulse');
                    setTimeout(() => {
                        verbElement.classList.remove('success-pulse');
                    }, 300);
                }
            } else if (type === false) {
                // Erreur
                feedbackElement.innerHTML = `<span class="error-message">Incorrect. La réponse correcte est : ${data}</span>`;
                
                // Animation d'erreur
                const verbElement = document.getElementById('current-verb');
                if (verbElement) {
                    verbElement.classList.add('error-shake');
                    setTimeout(() => {
                        verbElement.classList.remove('error-shake');
                    }, 300);
                }
            } else if (type === 'skip') {
                // Saut
                feedbackElement.innerHTML = '<span class="skip-message">Verbe banni !</span>';
                
                // Animation de bannissement
                const verbElement = document.getElementById('current-verb');
                if (verbElement) {
                    verbElement.classList.add('banish-animation');
                    setTimeout(() => {
                        verbElement.classList.remove('banish-animation');
                    }, 300);
                }
            }
            
            // Afficher le feedback
            feedbackElement.style.cssText = "opacity: 1; transform: translateY(0); transition: all 0.3s ease;";
            
            // Cacher après un délai
            setTimeout(() => {
                feedbackElement.style.cssText = "opacity: 0; transform: translateY(-20px); transition: all 0.3s ease;";
            }, 2000);
        }
        
        // Mettre à jour l'affichage du score
        function updateScore(newScore) {
            const scoreElement = document.getElementById('player-score');
            if (scoreElement) {
                scoreElement.textContent = newScore;
            }
            
            // Mettre à jour le multiplicateur
            const multiplierElement = document.getElementById('combo-multiplier');
            if (multiplierElement) {
                const multiplier = 1 + (streak * 0.1);
                multiplierElement.textContent = `x${multiplier.toFixed(1)}`;
            }
        }
        
        // Fonction améliorée pour ajouter de l'expérience/énergie arcanique avec effets visuels
        function addExperience(xp) {
            const oldXP = playerXP;
            playerXP += xp;
            
            // Vérifier si le joueur monte de niveau
            const oldLevel = Math.floor(oldXP / xpToNextLevel);
            const newLevel = Math.floor(playerXP / xpToNextLevel);
            
            if (newLevel > oldLevel) {
                levelUp();
            }
            
            // Mettre à jour la barre d'XP avec une animation améliorée
            const xpProgress = document.getElementById('xp-progress');
            if (xpProgress) {
                const percentage = (playerXP % xpToNextLevel) / xpToNextLevel * 100;
                
                // Animation MMORPG améliorée pour la barre d'XP
                xpProgress.style.width = `${percentage}%`;
                xpProgress.classList.add('xp-bar-pulse', 'energy-flow');
                
                // Créer un effet de pulsation/onde
                const ripple = document.createElement('div');
                ripple.className = 'xp-ripple';
                xpProgress.appendChild(ripple);
                
                // Supprimer l'onde après l'animation
                setTimeout(() => {
                    ripple.remove();
                    xpProgress.classList.remove('xp-bar-pulse', 'energy-flow');
                }, 1500);
            }
        }
        
        // Fonction pour créer des particules de succès (comme dans un MMORPG)
        function createSuccessParticles(count = 20) {
            const container = document.getElementById('particles-container');
            if (!container) return;
            
            for (let i = 0; i < count; i++) {
                // Créer une particule
                const particle = document.createElement('div');
                particle.className = 'success-particle';
                
                // Position aléatoire autour du verbe actuel
                const verbElement = document.getElementById('current-verb');
                let x, y;
                
                if (verbElement) {
                    const rect = verbElement.getBoundingClientRect();
                    x = rect.left + rect.width/2 + (Math.random() - 0.5) * 100;
                    y = rect.top + rect.height/2 + (Math.random() - 0.5) * 100;
                } else {
                    x = window.innerWidth/2 + (Math.random() - 0.5) * 200;
                    y = window.innerHeight/2 + (Math.random() - 0.5) * 200;
                }
                
                // Taille et couleur aléatoires
                const size = 5 + Math.random() * 15;
                const hue = 210 + Math.random() * 40; // Bleus variés pour le thème
                const alpha = 0.7 + Math.random() * 0.3;
                
                // Appliquer les styles
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                particle.style.backgroundColor = `hsla(${hue}, 100%, 60%, ${alpha})`;
                particle.style.boxShadow = `0 0 ${size/2}px hsla(${hue}, 100%, 70%, 0.8)`;
                
                // Animation MMORPG pour les particules (montée puis dissipation)
                const duration = 800 + Math.random() * 1200;
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 100;
                const targetX = x + Math.cos(angle) * distance;
                const targetY = y + Math.sin(angle) * distance - 100; // Montée
                
                particle.animate([
                    { transform: `translate(0, 0) scale(1)`, opacity: alpha },
                    { transform: `translate(${targetX - x}px, ${targetY - y}px) scale(0)`, opacity: 0 }
                ], {
                    duration: duration,
                    easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.0)' // Easing type MMORPG
                });
                
                // Ajouter au DOM
                container.appendChild(particle);
                
                // Nettoyer après l'animation
                setTimeout(() => {
                    if (container.contains(particle)) {
                        container.removeChild(particle);
                    }
                }, duration);
            }
        }
        
        // Fonction améliorée pour la montée de niveau avec effets MMORPG
        function levelUp() {
            playerLevel++;
            
            // Réinitialiser l'XP excédentaire
            playerXP = playerXP % xpToNextLevel;
            
            // Augmenter l'XP nécessaire pour le niveau suivant (progression MMORPG classique)
            xpToNextLevel = Math.floor(xpToNextLevel * 1.2);
            
            // Mettre à jour l'affichage du niveau
            const levelElement = document.getElementById('player-level');
            if (levelElement) {
                levelElement.textContent = playerLevel;
                
                // Animation MMORPG pour le changement de niveau
                levelElement.classList.add('level-up-animation');
                setTimeout(() => {
                    levelElement.classList.remove('level-up-animation');
                }, 2000);
            }
            
            // Bonus de temps selon le niveau
            let timeBonus = 10;
            if (playerLevel >= 5) timeBonus = 15;
            if (playerLevel >= 10) timeBonus = 20;
            
            // Ajouter du temps
            const timerElement = document.getElementById('time-left');
            if (timerElement) {
                const currentTime = parseInt(timerElement.textContent);
                timerElement.textContent = currentTime + timeBonus;
                
                // Animation pour l'ajout de temps
                timerElement.classList.add('time-bonus-animation');
                setTimeout(() => {
                    timerElement.classList.remove('time-bonus-animation');
                }, 1500);
            }
            
            // Afficher une notification de niveau améliorée type MMORPG
            showLevelUpEffect();
            
            // Jouer un son (en commentaire pour le moment)
            // playSound('level-up');
        }
        
        // Effet de montée de niveau style MMORPG
        function showLevelUpEffect() {
            // Créer l'élément de niveau
            const levelUpEffect = document.createElement('div');
            levelUpEffect.className = 'level-up-effect';
            levelUpEffect.innerHTML = `
                <div class="level-up-aura"></div>
                <div class="level-up-text">
                    <span class="level-up-label">NIVEAU</span>
                    <span class="level-up-value">${playerLevel}</span>
                </div>
                <div class="level-up-rays"></div>
            `;
            
            document.body.appendChild(levelUpEffect);
            
            // Nettoyer après l'animation
            setTimeout(() => {
                levelUpEffect.classList.add('fade-out');
                setTimeout(() => {
                    if (document.body.contains(levelUpEffect)) {
                        document.body.removeChild(levelUpEffect);
                    }
                }, 1000);
            }, 3000);
            
            // Notification de compétence débloquée
            const achievementContainer = document.getElementById('achievements-container');
            if (achievementContainer) {
                const achievement = document.createElement('div');
                achievement.className = 'achievement';
                
                let newPower = "Dilatation Temporelle";
                let powerDesc = "+10 secondes";
                let powerIcon = "🔮";
                
                if (playerLevel === 3) {
                    newPower = "Amplificateur d'Essence";
                    powerDesc = "+0.2 au multiplicateur";
                    powerIcon = "✨";
                } else if (playerLevel === 5) {
                    newPower = "Récupération de Sort";
                    powerDesc = "Chance de seconde tentative";
                    powerIcon = "🌟";
                }
                
                achievement.innerHTML = `
                    <div class="achievement-title">
                        <span class="achievement-icon">${powerIcon}</span>
                        Pouvoir Débloqué
                    </div>
                    <div class="achievement-desc">${newPower}: ${powerDesc}</div>
                `;
                
                achievementContainer.appendChild(achievement);
                
                // Supprimer après l'animation
                setTimeout(() => {
                    achievement.classList.add('fade-out');
                    setTimeout(() => {
                        if (achievementContainer.contains(achievement)) {
                            achievementContainer.removeChild(achievement);
                        }
                    }, 1000);
                }, 4000);
            }
        }
        
        // Fonctions pour les animations de succès et d'erreur
        function playSuccessAnimation() {
            // Effet sur le verbe
            const verbElement = document.getElementById('current-verb');
            if (verbElement) {
                verbElement.classList.add('success-glow');
                setTimeout(() => {
                    verbElement.classList.remove('success-glow');
                }, 1000);
            }
            
            // Effet sur la carte
            const verbCard = document.querySelector('.verb-card');
            if (verbCard) {
                verbCard.style.transform = 'perspective(1000px) rotateX(5deg) translateY(-10px)';
                verbCard.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 200, 83, 0.3), inset 0 0 15px rgba(0, 200, 83, 0.2)';
                verbCard.style.borderColor = 'rgba(0, 200, 83, 0.5)';
                
                setTimeout(() => {
                    verbCard.style.transform = '';
                    verbCard.style.boxShadow = '';
                    verbCard.style.borderColor = '';
                }, 1000);
            }
        }
        
        function playErrorAnimation() {
            // Effet sur le verbe
            const verbElement = document.getElementById('current-verb');
            if (verbElement) {
                verbElement.style.color = '#ff3d00';
                verbElement.style.textShadow = '0 0 15px rgba(255, 61, 0, 0.7), 0 0 30px rgba(255, 61, 0, 0.4)';
                
                setTimeout(() => {
                    verbElement.style.color = '';
                    verbElement.style.textShadow = '';
                }, 1000);
            }
            
            // Effet sur le panneau
            const gamePanel = document.querySelector('.gameplay-panel');
            if (gamePanel) {
                gamePanel.classList.add('screen-shake');
                setTimeout(() => {
                    gamePanel.classList.remove('screen-shake');
                }, 500);
            }
        }
        
        // 4. CRÉER DE NOUVEAUX BOUTONS FIABLES
        // ----------------------------------
        function createNewButtons() {
            // Trouver le conteneur
            const buttonContainer = document.querySelector('.verb-actions');
            if (!buttonContainer) {
                console.error("Conteneur des boutons non trouvé");
                return false;
            }
            
            // Remplacer par nos propres boutons
            buttonContainer.innerHTML = `
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="final-check-btn" style="
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
                    
                    <button id="final-skip-btn" style="
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
            
            // Ajouter nos propres écouteurs
            document.getElementById('final-check-btn').onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Bouton 'Lancer le Sort' cliqué");
                checkAnswer();
            };
            
            document.getElementById('final-skip-btn').onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Bouton 'Bannir' cliqué");
                skipVerb();
            };
            
            return true;
        }
        
        // 5. INITIALISER LE JEU
        // -----------------
        // Configurer le bouton de démarrage
        const startButton = document.getElementById('start-game-btn');
        if (startButton) {
            startButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Afficher l'écran de jeu
                const startScreen = document.getElementById('game-start');
                const gameScreen = document.getElementById('game-playing');
                
                if (startScreen) startScreen.classList.remove('active');
                if (gameScreen) gameScreen.classList.add('active');
                
                // Initialiser le jeu
                score = 0;
                streak = 0;
                maxStreak = 0;
                verbsCompleted = 0;
                currentVerbs = [];
                
                // Mettre à jour l'affichage
                updateScore(0);
                
                // Démarrer le timer
                const timerElement = document.getElementById('time-left');
                if (timerElement) {
                    let timeLeft = 90;
                    timerElement.textContent = timeLeft;
                    
                    const timerId = setInterval(function() {
                        timeLeft--;
                        timerElement.textContent = timeLeft;
                        
                        if (timeLeft <= 0) {
                            clearInterval(timerId);
                            endGame();
                        }
                    }, 1000);
                }
                
                // Créer les boutons
                setTimeout(() => {
                    if (!createNewButtons()) {
                        console.error("Échec de la création des boutons");
                    }
                }, 300);
                
                // Afficher le premier verbe
                displayNewVerb();
            });
        }
        
        // Fonction pour terminer le jeu
        function endGame() {
            // Passer à l'écran de fin
            const gameScreen = document.getElementById('game-playing');
            const gameOverScreen = document.getElementById('game-over');
            
            if (gameScreen) gameScreen.classList.remove('active');
            if (gameOverScreen) gameOverScreen.classList.add('active');
            
            // Mettre à jour les statistiques finales
            const finalScoreElement = document.getElementById('final-score-value');
            const finalLevelElement = document.getElementById('final-level');
            const verbsCompletedElement = document.getElementById('verbs-completed');
            const highestComboElement = document.getElementById('highest-combo');
            
            if (finalScoreElement) finalScoreElement.textContent = score;
            if (finalLevelElement) finalLevelElement.textContent = Math.floor(score / 100) + 1;
            if (verbsCompletedElement) verbsCompletedElement.textContent = verbsCompleted;
            if (highestComboElement) highestComboElement.textContent = `x${(1 + maxStreak * 0.1).toFixed(1)}`;
            
            // Focus sur le champ de nom
            const nameInput = document.getElementById('player-name');
            if (nameInput) nameInput.focus();
        }
        
        // 6. AJOUTER LE SUPPORT CLAVIER
        // --------------------------
        document.addEventListener('keydown', function(e) {
            // Si un champ de saisie est actif et qu'on appuie sur Entrée
            if (e.key === 'Enter' && (
                document.activeElement.id === 'past-simple' || 
                document.activeElement.id === 'past-participle'
            )) {
                e.preventDefault();
                checkAnswer();
            }
            
            // Si on appuie sur Espace et aucun champ n'est focusé
            if (e.key === ' ' && 
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                skipVerb();
            }
        });
        
        console.log("SOLUTION CONSOLIDÉE : Installation terminée");
    }, { once: true });
})(); 