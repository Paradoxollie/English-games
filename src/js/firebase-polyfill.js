// Script pour simuler Firebase uniquement s'il n'est pas déjà disponible
if (typeof firebase === 'undefined' || !window.db) {
    console.warn('Firebase not available or not properly initialized, using mock implementation');
    
    // Créer un polyfill simple pour Firebase seulement si nécessaire
    if (typeof firebase === 'undefined') {
        window.firebase = {
            app: function() { return {}; },
            analytics: function() { return {}; },
            firestore: function() {
                return {
                    collection: function(name) {
                        return {
                            add: function(data) {
                                console.log('Simulating adding data to Firebase:', data);
                                return Promise.resolve();
                            },
                            orderBy: function() { return this; },
                            limit: function() { return this; },
                            get: function() {
                                return Promise.resolve({
                                    empty: false,
                                    forEach: function(callback) {
                                        // Données de test
                                        const testData = [
                                            { name: "Wizard123", score: 950, timestamp: { toDate: () => new Date() } },
                                            { name: "VerbMaster", score: 820, timestamp: { toDate: () => new Date() } },
                                            { name: "EnglishKnight", score: 780, timestamp: { toDate: () => new Date() } },
                                            { name: "GrammarHero", score: 720, timestamp: { toDate: () => new Date() } },
                                            { name: "WordSmith", score: 690, timestamp: { toDate: () => new Date() } }
                                        ];
                                        
                                        testData.forEach((data, index) => {
                                            callback({
                                                data: function() { return data; }
                                            });
                                        });
                                    }
                                });
                            }
                        };
                    }
                };
            },
            FieldValue: {
                serverTimestamp: function() { return new Date(); }
            }
        };
    }
    
    // Définir les variables globales si elles n'existent pas déjà
    if (!window.db) {
        window.db = {
            collection: function(name) {
                if (firebase.firestore) {
                    return firebase.firestore().collection(name);
                }
                return {
                    add: function(data) {
                        console.log('Mock db.collection().add():', data);
                        return Promise.resolve();
                    },
                    orderBy: function() { return this; },
                    limit: function() { return this; },
                    get: function() {
                        return Promise.resolve({
                            empty: false,
                            forEach: function(callback) {
                                const testData = [
                                    { name: "Wizard123", score: 950, timestamp: { toDate: () => new Date() } },
                                    { name: "VerbMaster", score: 820, timestamp: { toDate: () => new Date() } },
                                    { name: "EnglishKnight", score: 780, timestamp: { toDate: () => new Date() } },
                                    { name: "GrammarHero", score: 720, timestamp: { toDate: () => new Date() } },
                                    { name: "WordSmith", score: 690, timestamp: { toDate: () => new Date() } }
                                ];
                                
                                testData.forEach((data, index) => {
                                    callback({
                                        data: function() { return data; }
                                    });
                                });
                            }
                        });
                    }
                };
            }
        };
    }
    
    if (!window.analytics) {
        window.analytics = {};
    }
} 