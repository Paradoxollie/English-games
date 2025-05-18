/**
 * English Quest - Sélection de genre
 * Permet aux joueurs de choisir entre une tête de fille et une tête de garçon
 */

import { authService } from './auth-service.js';

// Afficher le modal de sélection de genre
async function showGenderSelectionModal() {
  console.log("Vérification pour afficher le modal de sélection de genre");

  // Vérifier si l'utilisateur est connecté
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    console.log("Aucun utilisateur connecté, modal non affiché");
    return;
  }

  console.log("Vérification de l'état de sélection du genre");

  // Charger les données utilisateur 
  const userData = await authService.loadUserData();
  if (!userData) {
    console.log("Impossible de charger les données utilisateur, modal non affiché");
    return;
  }

  // Vérifier si l'utilisateur a déjà choisi son genre (vérification stricte)
  if (userData.hasSelectedGender === true) {
    console.log("L'utilisateur a déjà choisi son genre, modal non affiché");
    return;
  }

  // Vérification supplémentaire basée sur l'avatar
  if (userData.avatar) {
    const head = userData.avatar.head || null;
    const body = userData.avatar.body || null;

    console.log("Avatar détecté - Tête:", head, "Corps:", body);

    // Si l'utilisateur a déjà un avatar cohérent (tête et corps du même genre)
    if ((head && body) &&
        ((head.includes('girl') && body.includes('girl')) ||
         (head.includes('boy') && body.includes('boy')) ||
         (head.includes('bear') && body.includes('bear')))) {

      console.log("L'utilisateur a déjà un avatar cohérent, définition de hasSelectedGender à true");

      // Mettre à jour hasSelectedGender
      await authService.updateProfile({ hasSelectedGender: true });
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
async function updateUserAvatar(gender) {
  try {
    console.log("Mise à jour de l'avatar avec le genre:", gender);

    // Mettre à jour l'avatar (tête et corps)
    await authService.updateProfile({
      avatar: {
        head: gender === 'boy' ? 'default_boy' : 'default_girl',
        body: gender === 'boy' ? 'default_boy' : 'default_girl',
        accessory: 'none',
        background: 'default'
      },
      hasSelectedGender: true
    });

    console.log("Avatar mis à jour pour l'utilisateur");
    console.log("Préférence de genre enregistrée");

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
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
      background-color: #1a1a1a;
      margin: 10% auto;
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
      position: relative;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
      margin-bottom: 20px;
    }

    .modal-header h2 {
      margin: 0;
      color: #2ecc71;
    }

    .gender-options {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      margin: 20px 0;
    }

    .gender-option {
      padding: 15px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      width: 45%;
    }

    .gender-option:hover, .gender-option.selected {
      background-color: rgba(46, 204, 113, 0.1);
      transform: translateY(-5px);
    }

    .gender-option.selected {
      border: 2px solid #2ecc71;
    }

    .gender-avatar {
      width: 150px;
      height: 150px;
      margin: 0 auto;
      position: relative;
    }

    .avatar-display {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 50%;
      overflow: hidden;
    }

    .avatar-background {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    .avatar-body, .avatar-head {
      position: absolute;
      width: 100%;
      height: 100%;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
    }

    .modal-footer {
      padding-top: 15px;
      text-align: center;
    }

    #confirm-gender {
      padding: 10px 20px;
      background-color: #2ecc71;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }

    #confirm-gender:hover {
      background-color: #27ae60;
    }

    @media (max-width: 768px) {
      .gender-options {
        flex-direction: column;
        align-items: center;
      }

      .gender-option {
        width: 80%;
        margin-bottom: 20px;
      }
    }
  `;
  document.head.appendChild(style);

  // Appeler la fonction après un délai pour s'assurer que l'utilisateur est connecté
  setTimeout(showGenderSelectionModal, 2000);
});

// Exposer la fonction pour qu'elle puisse être appelée depuis d'autres scripts
window.showGenderSelectionModal = showGenderSelectionModal;
