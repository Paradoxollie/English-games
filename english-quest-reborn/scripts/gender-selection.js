/**
 * English Quest - Sélection de genre
 * Permet aux joueurs de choisir entre une tête de fille et une tête de garçon
 */

// Afficher le modal de sélection de genre
function showGenderSelectionModal() {
  console.log("Vérification pour afficher le modal de sélection de genre");

  // Vérifier si l'utilisateur est connecté
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté, modal non affiché");
    return;
  }

  console.log("Vérification de l'état de sélection du genre");

  // Vérifier si l'utilisateur a déjà choisi son genre (vérification stricte)
  if (currentUser.hasSelectedGender === true) {
    console.log("L'utilisateur a déjà choisi son genre, modal non affiché");
    return;
  }

  // Vérification supplémentaire basée sur l'avatar
  if (currentUser.avatar) {
    const head = currentUser.avatar.head;
    const body = currentUser.avatar.body;

    // Si l'utilisateur a déjà un avatar cohérent (tête et corps du même genre)
    if ((head === 'default_girl' && body === 'default_girl') ||
        (head === 'default_boy' && body === 'default_boy')) {

      console.log("L'utilisateur a déjà un avatar cohérent, définition de hasSelectedGender à true");

      // Mettre à jour hasSelectedGender
      currentUser.hasSelectedGender = true;

      // Sauvegarder les modifications
      const users = getUsers();
      const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

      if (userId) {
        users[userId] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      return;
    }
  }

  console.log("Affichage du modal de sélection de genre");

  // Créer le modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'gender-selection-modal';

  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Choisissez votre personnage</h2>
      </div>
      <div class="modal-body">
        <p>Bienvenue dans English Quest ! Choisissez votre personnage pour commencer votre aventure.</p>

        <div class="gender-options">
          <div class="gender-option" data-gender="boy">
            <div class="gender-avatar">
              <div class="avatar-display">
                <div class="avatar-background" style="background-color: #333;"></div>
                <div class="avatar-body" style="background-image: url('assets/avatars/bodies/default_boy.png');"></div>
                <div class="avatar-head" style="background-image: url('assets/avatars/heads/default_boy.png');"></div>
              </div>
            </div>
            <h3>Garçon</h3>
          </div>

          <div class="gender-option" data-gender="girl">
            <div class="gender-avatar">
              <div class="avatar-display">
                <div class="avatar-background" style="background-color: #333;"></div>
                <div class="avatar-body" style="background-image: url('assets/avatars/bodies/default_girl.png');"></div>
                <div class="avatar-head" style="background-image: url('assets/avatars/heads/default_girl.png');"></div>
              </div>
            </div>
            <h3>Fille</h3>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="confirm-gender">Confirmer</button>
      </div>
    </div>
  `;

  // Ajouter le modal au document
  document.body.appendChild(modal);

  // Afficher le modal
  modal.style.display = 'block';

  // Ajouter les écouteurs d'événements
  const genderOptions = modal.querySelectorAll('.gender-option');
  let selectedGender = null;

  genderOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Retirer la classe 'selected' de toutes les options
      genderOptions.forEach(opt => opt.classList.remove('selected'));

      // Ajouter la classe 'selected' à l'option cliquée
      this.classList.add('selected');

      // Enregistrer le genre sélectionné
      selectedGender = this.dataset.gender;
    });
  });

  // Écouteur pour le bouton de confirmation
  const confirmBtn = modal.querySelector('#confirm-gender');
  confirmBtn.addEventListener('click', function() {
    if (!selectedGender) {
      alert('Veuillez choisir un personnage');
      return;
    }

    // Mettre à jour l'avatar de l'utilisateur
    updateUserAvatar(selectedGender);

    // Fermer le modal
    document.body.removeChild(modal);
  });
}

// Mettre à jour l'avatar de l'utilisateur en fonction du genre choisi
function updateUserAvatar(gender) {
  // Récupérer l'utilisateur courant
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error("Aucun utilisateur connecté");
    return;
  }

  console.log("Mise à jour de l'avatar avec le genre:", gender);

  try {
    // Mettre à jour l'avatar (tête et corps)
    currentUser.avatar.head = gender === 'boy' ? 'default_boy' : 'default_girl';
    currentUser.avatar.body = gender === 'boy' ? 'default_boy' : 'default_girl';

    // Marquer explicitement que l'utilisateur a choisi son genre
    currentUser.hasSelectedGender = true;

    console.log("Avatar mis à jour pour l'utilisateur");
    console.log("Préférence de genre enregistrée");

    // Sauvegarder les modifications dans le localStorage
    const users = getUsers();
    const userId = Object.keys(users).find(id => users[id].username === currentUser.username);

    if (userId) {
      // Mettre à jour l'utilisateur dans la liste des utilisateurs
      users[userId] = {...currentUser};

      // Sauvegarder dans le localStorage
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      console.log("Choix de genre sauvegardé avec succès");
    } else {
      console.error("Impossible de trouver l'utilisateur pour sauvegarder le choix de genre");
    }

    // Mettre à jour l'affichage de l'avatar si possible
    if (typeof updateAvatarDisplay === 'function') {
      updateAvatarDisplay();
      console.log("Affichage de l'avatar mis à jour");
    }

    // Recharger la page pour s'assurer que les changements sont appliqués
    console.log("Rechargement de la page pour appliquer les changements");
    setTimeout(() => {
      window.location.reload();
    }, 500);

  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar:", error);
  }
}

// Ajouter des styles CSS pour le modal de sélection de genre
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');

  style.textContent = `
    /* Options de genre */
    .gender-options {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 2rem 0;
    }

    .gender-option {
      text-align: center;
      cursor: pointer;
      padding: 1rem;
      border-radius: var(--border-radius-lg);
      transition: all 0.3s ease;
    }

    .gender-option:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }

    .gender-option.selected {
      background-color: rgba(46, 204, 113, 0.1);
      border: 2px solid var(--color-primary);
    }

    .gender-avatar {
      margin-bottom: 1rem;
    }

    .gender-option .avatar-display {
      width: 150px;
      height: 150px;
      margin: 0 auto;
    }

    .gender-option h3 {
      margin: 0;
      font-size: 1.2rem;
      color: var(--color-text);
    }

    /* Modal de sélection de genre */
    #gender-selection-modal .modal-content {
      max-width: 600px;
    }

    #gender-selection-modal .modal-body {
      text-align: center;
    }

    #gender-selection-modal .modal-footer {
      justify-content: center;
    }
  `;

  document.head.appendChild(style);

  // Afficher le modal de sélection de genre après un court délai
  setTimeout(showGenderSelectionModal, 1000);
});
