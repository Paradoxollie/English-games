// CORRECTIF POUR LES POWER-UPS - ENIGMA SCROLL
console.log('🔧 Chargement du correctif power-ups...');

// Attendre que tout soit chargé
window.addEventListener('load', function() {
  setTimeout(function() {
    
    console.log('🔧 Installation du correctif...');
    
    // Override de la fonction usePowerUp pour qu'elle fonctionne vraiment
    window.usePowerUp = function(type) {
      console.log(`🚀 CORRECTIF Power-up ${type} activé`);
      
      try {
        if (!window.gameActive) {
          console.log('❌ Jeu non actif');
          alert('Le jeu n\'est pas actif !');
          return;
        }
        
        if (!window.gameStats || !window.gameStats.powerUps || window.gameStats.powerUps[type] <= 0) {
          console.log('❌ Power-up non disponible');
          alert(`Aucun "${type}" disponible !`);
          return;
        }
        
        // Consommer le power-up
        window.gameStats.powerUps[type]--;
        console.log(`✅ ${type} consommé, restant: ${window.gameStats.powerUps[type]}`);
        
        // Mettre à jour l'affichage
        if (window.displayPowerUps) {
          window.displayPowerUps();
        }
        
        // Actions selon le type
        if (type === 'hint') {
          console.log('💡 Utilisation indice');
          alert('💡 Indice utilisé !');
          
          // Révéler une lettre
          if (window.currentGameWord && window.currentRow !== undefined) {
            const word = window.currentGameWord;
            const row = window.currentRow;
            
            for (let i = 1; i < word.length; i++) {
              const cell = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
              if (cell && !cell.textContent) {
                cell.textContent = word[i];
                cell.classList.add('filled', 'hint');
                cell.style.background = '#f39c12';
                cell.style.color = '#121212';
                cell.style.animation = 'bounce 1s ease';
                console.log(`💡 Lettre "${word[i]}" révélée en position ${i+1}`);
                break;
              }
            }
          }
          
        } else if (type === 'time') {
          console.log('⏰ Bonus temps');
          window.gameStats.timeRemaining += 30;
          alert('⏰ +30 secondes ajoutées !');
          
          // Mettre à jour le timer
          const timer = document.getElementById('time-display');
          if (timer) {
            timer.style.color = '#2ecc71';
            timer.style.fontWeight = 'bold';
            timer.style.animation = 'bounce 1s ease';
            timer.textContent = window.gameStats.timeRemaining;
            setTimeout(() => {
              timer.style.color = '';
              timer.style.fontWeight = '';
              timer.style.animation = '';
            }, 2000);
          }
          
        } else if (type === 'skip') {
          console.log('⏭️ Passage mot');
          alert(`⏭️ Mot passé ! Le mot était : ${window.currentGameWord}`);
          
          setTimeout(() => {
            if (window.initSimpleGame && window.selectedDifficulty) {
              window.initSimpleGame(window.selectedDifficulty);
            }
          }, 1000);
        }
        
        console.log(`✅ Power-up ${type} exécuté avec succès`);
        
      } catch (error) {
        console.error(`❌ Erreur power-up ${type}:`, error);
        alert(`Erreur power-up: ${error.message}`);
      }
    };
    
    // Override de handleEnterInput pour qu'elle fonctionne
    window.handleEnterInput = function() {
      console.log('🚀 CORRECTIF Validation du mot...');
      
      try {
        if (!window.gameActive) {
          console.log('❌ Jeu non actif dans handleEnterInput');
          return;
        }
        
        if (!window.currentGuess || !window.currentGameWord) {
          console.log('❌ Données manquantes');
          console.log('currentGuess:', window.currentGuess);
          console.log('currentGameWord:', window.currentGameWord);
          alert('Erreur: données du jeu manquantes');
          return;
        }
        
        const guess = window.currentGuess.toUpperCase();
        const target = window.currentGameWord.toUpperCase();
        
        console.log(`🔍 Validation: "${guess}" vs "${target}"`);
        
        if (guess.length !== target.length) {
          alert('Veuillez compléter le mot !');
          return;
        }
        
        // Validation simple - on accepte le mot comme valide
        const isCorrect = guess === target;
        
        if (isCorrect) {
          console.log('🎉 Mot correct trouvé !');
          alert(`🎉 Excellent ! "${target}" trouvé !`);
          
          // Mettre à jour les stats
          if (window.gameStats) {
            window.gameStats.wordsFound = (window.gameStats.wordsFound || 0) + 1;
            window.gameStats.totalScore = (window.gameStats.totalScore || 0) + 100;
            window.gameStats.combo = (window.gameStats.combo || 0) + 1;
            
            // Mettre à jour l'affichage
            const scoreEl = document.getElementById('score-display');
            if (scoreEl) scoreEl.textContent = window.gameStats.totalScore;
            
            const comboEl = document.getElementById('combo-display');
            if (comboEl) comboEl.textContent = 'x' + (window.gameStats.combo + 1);
          }
          
          // Nouveau mot après 2 secondes
          setTimeout(() => {
            if (window.initSimpleGame && window.selectedDifficulty) {
              console.log('🔄 Passage au mot suivant');
              window.initSimpleGame(window.selectedDifficulty);
            }
          }, 2000);
          
        } else {
          console.log('❌ Mot incorrect');
          alert(`❌ Mot incorrect ! Essayez encore.`);
          
          // Passer à la ligne suivante si possible
          if (window.currentRow !== undefined && window.currentGameConfig) {
            window.currentRow++;
            window.currentCol = 1;
            window.currentGuess = target[0]; // Reset avec première lettre
            
            if (window.currentRow >= (window.currentGameConfig.maxAttempts || 6)) {
              alert(`💀 Game Over ! Le mot était : ${target}`);
              window.gameActive = false;
              
              setTimeout(() => {
                if (confirm('🎮 Voulez-vous rejouer ?')) {
                  if (window.initSimpleGame && window.selectedDifficulty) {
                    window.initSimpleGame(window.selectedDifficulty);
                  }
                }
              }, 1000);
            } else {
              // Remettre la première lettre sur la nouvelle ligne
              const firstCell = document.querySelector(`[data-row="${window.currentRow}"][data-col="0"]`);
              if (firstCell && target[0]) {
                firstCell.textContent = target[0];
                firstCell.classList.add('filled', 'hint');
              }
              console.log(`➡️ Passage à la ligne ${window.currentRow + 1}`);
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Erreur handleEnterInput:', error);
        alert(`Erreur validation: ${error.message}`);
      }
    };
    
    // Fonction pour déclencher un événement aléatoire
    window.triggerRandomEventFixed = function() {
      if (!window.gameActive || !window.gameStats) return;
      
      const events = [
        {
          name: 'Bonus de temps',
          action: () => {
            window.gameStats.timeRemaining += 30;
            const timer = document.getElementById('time-display');
            if (timer) timer.textContent = window.gameStats.timeRemaining;
            alert('🎉 ÉVÉNEMENT SPÉCIAL ! ⏰ +30 secondes gratuites !');
          }
        },
        {
          name: 'Power-up gratuit',
          action: () => {
            const types = ['hint', 'time', 'skip'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            window.gameStats.powerUps[randomType]++;
            if (window.displayPowerUps) window.displayPowerUps();
            alert(`🎉 ÉVÉNEMENT SPÉCIAL ! 🎁 Power-up "${randomType}" offert !`);
          }
        },
        {
          name: 'Super Indice',
          action: () => {
            // Révéler 2 lettres
            window.usePowerUp('hint');
            setTimeout(() => window.usePowerUp('hint'), 500);
            alert('🎉 ÉVÉNEMENT SPÉCIAL ! 💡 Double indice offert !');
          }
        }
      ];
      
      const event = events[Math.floor(Math.random() * events.length)];
      console.log(`🎲 Événement aléatoire: ${event.name}`);
      event.action();
    };
    
    // Forcer l'installation des event listeners
    setTimeout(() => {
      console.log('🔗 Installation event listeners power-ups...');
      
      // Rechercher tous les éléments de power-ups possibles
      const selectors = [
        '.power-up-item',
        '[data-power]',
        '[data-type]',
        '[id*="power"]',
        '[id*="hint"]',
        '[id*="time"]',
        '[id*="skip"]'
      ];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          const type = el.dataset.type || el.dataset.power || 
            (el.id.includes('hint') ? 'hint' : 
             el.id.includes('time') ? 'time' : 
             el.id.includes('skip') ? 'skip' : null);
          
          if (type) {
            // Supprimer anciens listeners en clonant l'élément
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
            
            // Ajouter nouveau listener
            newEl.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              console.log(`🖱️ CORRECTIF Clic power-up ${type}`);
              window.usePowerUp(type);
            });
            
            console.log(`✅ Event listener installé pour ${type} sur`, newEl);
          }
        });
      });
      
      // Event listeners clavier FORCÉS
      document.addEventListener('keydown', function(e) {
        if (e.key === '1') {
          e.preventDefault();
          console.log('🎮 Raccourci clavier: indice');
          window.usePowerUp('hint');
        } else if (e.key === '2') {
          e.preventDefault();
          console.log('🎮 Raccourci clavier: temps');
          window.usePowerUp('time');
        } else if (e.key === '3') {
          e.preventDefault();
          console.log('🎮 Raccourci clavier: passer');
          window.usePowerUp('skip');
        } else if (e.key === '0') {
          e.preventDefault();
          console.log('🎮 Raccourci clavier: événement aléatoire');
          window.triggerRandomEventFixed();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          console.log('🎮 Raccourci clavier: validation');
          window.handleEnterInput();
        }
      });
      
    }, 1500);
    
    // Déclencher des événements aléatoires automatiquement
    setInterval(() => {
      if (window.gameActive && Math.random() < 0.15) { // 15% chance toutes les 10 secondes
        window.triggerRandomEventFixed();
      }
    }, 10000);
    
    console.log('✅ CORRECTIF COMPLET installé !');
    console.log('🎮 Raccourcis clavier: 1=indice, 2=temps, 3=passer, 0=événement, Entrée=valider');
    console.log('🎲 Événements aléatoires activés toutes les 10 secondes');
    
  }, 3000); // Attendre 3 secondes que tout soit chargé
}); 