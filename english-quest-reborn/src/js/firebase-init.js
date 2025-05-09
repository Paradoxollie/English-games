/**
 * Initialisation de Firebase pour English Quest Reborn
 */
(function() {
    // Vérifier si le mode hors ligne permanent est activé
    if (localStorage.getItem('firebaseOfflineMode') === 'true') {
        console.log("Mode hors ligne permanent activé, Firebase ne sera pas initialisé");

        // Initialiser l'état de connexion en mode hors ligne
        window.firebaseConnectionState = {
            isOnline: false,
            hasInitializedFirebase: false,
            lastConnectionAttempt: Date.now(),
            connectionErrors: 3, // Valeur suffisante pour maintenir le mode hors ligne
            lastSuccessfulConnection: 0,
            offlineMode: true
        };

        // Mettre à jour l'indicateur visuel
        setTimeout(() => {
            if (typeof updateConnectionIndicator === 'function') {
                updateConnectionIndicator(false);
            }

            // Déclencher l'événement pour informer l'application
            document.dispatchEvent(new CustomEvent('firebaseOffline'));
        }, 500);

        return;
    }

    // Configuration Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAm_fvXFh9Iv1EkoCJniaLkmXOelC6CRv0",
        authDomain: "english-games-41017.firebaseapp.com",
        projectId: "english-games-41017",
        storageBucket: "english-games-41017.appspot.com",
        messagingSenderId: "452279652544",
        appId: "1:452279652544:web:916f93e0ab29183e739d25",
        measurementId: "G-RMCQTMKDVP",
        databaseURL: "https://english-games-41017-default-rtdb.europe-west1.firebasedatabase.app"
    };

    // Variable globale pour suivre l'état de la connexion
    window.firebaseConnectionState = {
        isOnline: false,
        hasInitializedFirebase: false,
        lastConnectionAttempt: Date.now(),
        connectionErrors: 0,
        lastSuccessfulConnection: 0,
        offlineMode: false
    };

    // Initialiser Firebase
    try {
        if (typeof firebase !== 'undefined') {
            // Vérifier si Firebase est déjà initialisé
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
                console.log("Firebase initialisé avec succès");
                window.firebaseConnectionState.hasInitializedFirebase = true;

                // Configurer la détection de connexion
                setupConnectionDetection();
            } else {
                console.log("Firebase déjà initialisé");
                window.firebaseConnectionState.hasInitializedFirebase = true;
            }
        } else {
            console.warn("Firebase n'est pas disponible, mode hors ligne activé");
            window.firebaseConnectionState.isOnline = false;
            window.firebaseConnectionState.offlineMode = true;

            // Déclencher un événement pour informer l'application
            document.dispatchEvent(new CustomEvent('firebaseOffline'));
        }
    } catch (error) {
        console.warn("Erreur lors de l'initialisation de Firebase, mode hors ligne activé:", error);
        window.firebaseConnectionState.isOnline = false;
        window.firebaseConnectionState.offlineMode = true;
        window.firebaseConnectionState.connectionErrors++;

        // Déclencher un événement pour informer l'application
        document.dispatchEvent(new CustomEvent('firebaseOffline'));
    }

    /**
     * Configure la détection de connexion à Firebase
     */
    function setupConnectionDetection() {
        if (!window.firebase || !window.firebase.firestore) {
            console.warn("Firebase n'est pas disponible, mode hors ligne activé");
            window.firebaseConnectionState.isOnline = false;
            document.dispatchEvent(new CustomEvent('firebaseOffline'));
            updateConnectionIndicator(false);
            return;
        }

        // Vérifier si nous avons déjà eu trop d'erreurs de connexion
        if (window.firebaseConnectionState.connectionErrors >= 3) {
            console.warn("Trop d'erreurs de connexion précédentes, mode hors ligne permanent activé");
            window.firebaseConnectionState.isOnline = false;
            document.dispatchEvent(new CustomEvent('firebaseOffline'));
            updateConnectionIndicator(false);
            return;
        }

        try {
            // Référence à la collection de statut de connexion
            const db = firebase.firestore();

            // Configurer Firestore avec le paramètre merge pour éviter les erreurs
            db.settings({
                cacheSizeBytes: 1048576,  // 1 MB au lieu de CACHE_SIZE_UNLIMITED
                merge: true  // Ajouter le paramètre merge pour éviter l'erreur d'écrasement des paramètres
            });

            // Vérifier la connexion initiale avec un timeout
            const connectionPromise = db.collection('_connection_test').doc('status')
                .set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });

            // Ajouter un timeout pour éviter d'attendre trop longtemps
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Timeout de connexion")), 5000);
            });

            // Utiliser Promise.race pour limiter le temps d'attente
            Promise.race([connectionPromise, timeoutPromise])
                .then(() => {
                    console.log("Connexion à Firebase établie");
                    window.firebaseConnectionState.isOnline = true;
                    window.firebaseConnectionState.connectionErrors = 0;
                    window.firebaseConnectionState.lastSuccessfulConnection = Date.now();

                    // Déclencher un événement pour informer l'application
                    document.dispatchEvent(new CustomEvent('firebaseOnline'));

                    // Ajouter un indicateur visuel
                    updateConnectionIndicator(true);
                })
                .catch((error) => {
                    console.warn("Erreur de connexion à Firebase:", error);
                    window.firebaseConnectionState.isOnline = false;
                    window.firebaseConnectionState.connectionErrors++;

                    // Si trop d'erreurs, passer en mode hors ligne permanent
                    if (window.firebaseConnectionState.connectionErrors >= 3) {
                        console.warn("Trop d'erreurs de connexion, passage en mode hors ligne permanent");
                        // Stocker cette décision dans le localStorage pour la persistance entre les sessions
                        localStorage.setItem('firebaseOfflineMode', 'true');
                    }

                    // Déclencher un événement pour informer l'application
                    document.dispatchEvent(new CustomEvent('firebaseOffline'));

                    // Ajouter un indicateur visuel
                    updateConnectionIndicator(false);
                });

            // Configurer un écouteur pour les erreurs de connexion
            window.addEventListener('online', () => {
                // Vérifier si nous sommes en mode hors ligne permanent
                if (localStorage.getItem('firebaseOfflineMode') === 'true') {
                    console.log("Mode hors ligne permanent activé, ignorant la reconnexion réseau");
                    return;
                }

                // Réinitialiser le compteur d'erreurs lors d'une reconnexion réseau
                if (window.firebaseConnectionState.connectionErrors < 3) {
                    // Attendre un peu avant de vérifier pour s'assurer que la connexion est stable
                    setTimeout(() => {
                        checkFirebaseConnection();
                    }, 5000);
                }
            });

            window.addEventListener('offline', () => {
                window.firebaseConnectionState.isOnline = false;
                document.dispatchEvent(new CustomEvent('firebaseOffline'));
                updateConnectionIndicator(false);
            });
        } catch (error) {
            console.warn("Erreur lors de la configuration de la détection de connexion:", error);
            window.firebaseConnectionState.isOnline = false;
            window.firebaseConnectionState.connectionErrors++;
            document.dispatchEvent(new CustomEvent('firebaseOffline'));
            updateConnectionIndicator(false);
        }
    }

    /**
     * Vérifie la connexion à Firebase
     */
    function checkFirebaseConnection() {
        if (!window.firebase || !window.firebase.firestore) {
            return;
        }

        // Vérifier si nous sommes en mode hors ligne permanent
        if (localStorage.getItem('firebaseOfflineMode') === 'true') {
            console.log("Mode hors ligne permanent activé, vérification ignorée");
            window.firebaseConnectionState.isOnline = false;
            return;
        }

        // Éviter de vérifier trop fréquemment
        const now = Date.now();
        if (now - window.firebaseConnectionState.lastConnectionAttempt < 30000) { // 30 secondes minimum entre les tentatives
            return;
        }

        // Limiter les tentatives après trop d'erreurs
        if (window.firebaseConnectionState.connectionErrors >= 3) {
            console.log("Trop d'erreurs de connexion, vérification ignorée");
            // Passer en mode hors ligne permanent
            localStorage.setItem('firebaseOfflineMode', 'true');
            window.firebaseConnectionState.isOnline = false;
            document.dispatchEvent(new CustomEvent('firebaseOffline'));
            updateConnectionIndicator(false);
            return;
        }

        window.firebaseConnectionState.lastConnectionAttempt = now;

        try {
            const db = firebase.firestore();

            // Ajouter un timeout pour éviter d'attendre trop longtemps
            const connectionPromise = db.collection('_connection_test').doc('status')
                .set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() });

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Timeout de connexion")), 5000);
            });

            // Utiliser Promise.race pour limiter le temps d'attente
            Promise.race([connectionPromise, timeoutPromise])
                .then(() => {
                    if (!window.firebaseConnectionState.isOnline) {
                        console.log("Connexion à Firebase rétablie");
                        window.firebaseConnectionState.isOnline = true;
                        window.firebaseConnectionState.connectionErrors = 0;
                        window.firebaseConnectionState.lastSuccessfulConnection = Date.now();

                        // Réinitialiser le mode hors ligne permanent si la connexion est rétablie
                        localStorage.removeItem('firebaseOfflineMode');

                        // Déclencher un événement pour informer l'application
                        document.dispatchEvent(new CustomEvent('firebaseOnline'));

                        // Mettre à jour l'indicateur visuel
                        updateConnectionIndicator(true);
                    }
                })
                .catch((error) => {
                    console.warn("Erreur de connexion à Firebase:", error);
                    window.firebaseConnectionState.isOnline = false;
                    window.firebaseConnectionState.connectionErrors++;

                    // Déclencher un événement pour informer l'application
                    document.dispatchEvent(new CustomEvent('firebaseOffline'));

                    // Mettre à jour l'indicateur visuel
                    updateConnectionIndicator(false);

                    // Si trop d'erreurs, arrêter les vérifications
                    if (window.firebaseConnectionState.connectionErrors >= 3) {
                        console.warn("Trop d'erreurs de connexion, passage en mode hors ligne permanent");
                        localStorage.setItem('firebaseOfflineMode', 'true');
                    }
                });
        } catch (error) {
            console.warn("Erreur lors de la vérification de la connexion:", error);
            window.firebaseConnectionState.connectionErrors++;

            // Si trop d'erreurs, passer en mode hors ligne permanent
            if (window.firebaseConnectionState.connectionErrors >= 3) {
                console.warn("Trop d'erreurs de connexion, passage en mode hors ligne permanent");
                localStorage.setItem('firebaseOfflineMode', 'true');
                window.firebaseConnectionState.isOnline = false;
                document.dispatchEvent(new CustomEvent('firebaseOffline'));
                updateConnectionIndicator(false);
            }
        }
    }

    /**
     * Met à jour l'indicateur visuel de connexion
     * @param {boolean} isOnline - Si la connexion est établie
     */
    function updateConnectionIndicator(isOnline) {
        // Fonction désactivée pour ne pas afficher le popup
        console.log("État de connexion:", isOnline ? "En ligne" : "Hors ligne");

        // Mettre à jour l'état de connexion sans afficher de popup
        window.firebaseConnectionState.isOnline = isOnline;

        // Vérifier si nous sommes en mode hors ligne permanent
        const isPermanentOffline = localStorage.getItem('firebaseOfflineMode') === 'true';

        // Supprimer l'indicateur s'il existe
        let indicator = document.getElementById('connection-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Vérifier périodiquement la connexion, mais avec un délai plus long pour éviter les erreurs en boucle
    // et seulement si la connexion a été établie au moins une fois
    let connectionCheckInterval = null;

    // Fonction pour démarrer les vérifications périodiques
    function startConnectionChecks() {
        // Arrêter l'intervalle existant si présent
        if (connectionCheckInterval) {
            clearInterval(connectionCheckInterval);
        }

        // Si trop d'erreurs, ne pas démarrer de nouvelles vérifications
        if (window.firebaseConnectionState.connectionErrors >= 3) {
            console.log("Trop d'erreurs de connexion, mode hors ligne permanent activé");
            window.firebaseConnectionState.isOnline = false;
            document.dispatchEvent(new CustomEvent('firebaseOffline'));
            updateConnectionIndicator(false);
            return;
        }

        // Démarrer un nouvel intervalle avec un délai plus long
        connectionCheckInterval = setInterval(() => {
            // Ne vérifier que si le nombre d'erreurs n'est pas trop élevé
            if (window.firebaseConnectionState.connectionErrors < 3) {
                checkFirebaseConnection();
            } else {
                console.log("Trop d'erreurs de connexion, vérifications suspendues");
                // Arrêter les vérifications après trop d'erreurs
                clearInterval(connectionCheckInterval);
                connectionCheckInterval = null;

                // Passer en mode hors ligne permanent
                window.firebaseConnectionState.isOnline = false;
                document.dispatchEvent(new CustomEvent('firebaseOffline'));
                updateConnectionIndicator(false);
            }
        }, 120000); // Vérifier toutes les 2 minutes pour réduire les erreurs
    }

    // Démarrer les vérifications uniquement si la connexion est établie initialement
    document.addEventListener('firebaseOnline', () => {
        // Réinitialiser le compteur d'erreurs lors d'une connexion réussie
        window.firebaseConnectionState.connectionErrors = 0;
        startConnectionChecks();
    });

    // Arrêter les vérifications en cas de déconnexion
    document.addEventListener('firebaseOffline', () => {
        if (connectionCheckInterval) {
            clearInterval(connectionCheckInterval);
            connectionCheckInterval = null;
        }
    });
})();
