// ATTENTION : Ce fichier est un polyfill/mock pour Firebase, à utiliser UNIQUEMENT en développement local.
// Ne pas inclure ce fichier dans la page admin ou en production !

/**
 * Firebase Polyfill for Speed Verb Challenge
 * This provides a mock implementation when Firebase isn't available
 */

console.log("Loading firebase-polyfill.js");

// Only create mock if Firebase or Firestore is not available
if (typeof firebase === 'undefined' || (typeof firebase !== 'undefined' && typeof firebase.firestore !== 'function')) {
    console.warn('Firebase not available or not properly initialized, using mock implementation');
    
    // Create mock Firebase if it doesn't exist
    if (typeof firebase === 'undefined') {
        window.firebase = {};
    }
    
    // Mock data for leaderboard
    const mockScores = {
        speed_verb_scores: [
            { id: 'mock1', playerName: 'GrammarWizard', score: 950, timestamp: new Date(Date.now() - 86400000 * 3) },
            { id: 'mock2', playerName: 'VerbMaster', score: 850, timestamp: new Date(Date.now() - 86400000 * 5) },
            { id: 'mock3', playerName: 'SpellCaster', score: 780, timestamp: new Date(Date.now() - 86400000 * 2) },
            { id: 'mock4', playerName: 'WordSmith', score: 720, timestamp: new Date(Date.now() - 86400000 * 7) },
            { id: 'mock5', playerName: 'LexiconHero', score: 690, timestamp: new Date(Date.now() - 86400000 * 1) }
        ]
    };
    
    // Create FieldValue object with serverTimestamp
    firebase.firestore = {
        FieldValue: {
            serverTimestamp: function() {
                return new Date();
            }
        }
    };
    
    // Create firestore() method
    firebase.firestore = function() {
        return {
            collection: function(collectionName) {
                console.log(`Mock accessing collection: ${collectionName}`);
                
                // Get the correct mock data for this collection
                const collectionData = mockScores[collectionName] || [];
                
                return {
                    add: function(data) {
                        console.log(`Mock adding document to ${collectionName}:`, data);
                        
                        // Add the new document to the mock data
                        const newDoc = {
                            id: 'mock-' + Date.now(),
                            ...data,
                            // Convert serverTimestamp to actual Date
                            timestamp: data.timestamp instanceof Date ? data.timestamp : new Date()
                        };
                        
                        if (mockScores[collectionName]) {
                            mockScores[collectionName].push(newDoc);
                        } else {
                            mockScores[collectionName] = [newDoc];
                        }
                        
                        return Promise.resolve({ id: newDoc.id });
                    },
                    
                    orderBy: function(field, direction = 'asc') {
                        console.log(`Mock orderBy ${field} ${direction}`);
                        
                        // Sort the collection data
                        const sortedData = [...collectionData].sort((a, b) => {
                            if (direction === 'desc') {
                                return b[field] - a[field];
                            }
                            return a[field] - b[field];
                        });
                        
                        return {
                            limit: function(limitCount) {
                                console.log(`Mock limit ${limitCount}`);
                                
                                // Limit the results
                                const limitedData = sortedData.slice(0, limitCount);
                                
                                return {
                                    get: function() {
                                        console.log(`Mock executing query on ${collectionName}`);
                                        
                                        return Promise.resolve({
                                            empty: limitedData.length === 0,
                                            size: limitedData.length,
                                            forEach: function(callback) {
                                                limitedData.forEach(item => {
                                                    callback({
                                                        id: item.id,
                                                        data: function() {
                                                            return item;
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                };
                            },
                            get: function() {
                                return Promise.resolve({
                                    empty: sortedData.length === 0,
                                    size: sortedData.length,
                                    forEach: function(callback) {
                                        sortedData.forEach(item => {
                                            callback({
                                                id: item.id,
                                                data: function() {
                                                    return item;
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        };
                    },
                    
                    where: function(field, operator, value) {
                        console.log(`Mock where ${field} ${operator} ${value}`);
                        
                        // Filter the collection data
                        const filteredData = collectionData.filter(item => {
                            if (operator === '==') return item[field] === value;
                            if (operator === '>') return item[field] > value;
                            if (operator === '<') return item[field] < value;
                            if (operator === '>=') return item[field] >= value;
                            if (operator === '<=') return item[field] <= value;
                            return true;
                        });
                        
                        return {
                            orderBy: function(field, direction = 'asc') {
                                // Sort the filtered data
                                const sortedData = [...filteredData].sort((a, b) => {
                                    if (direction === 'desc') {
                                        return b[field] - a[field];
                                    }
                                    return a[field] - b[field];
                                });
                                
                                return {
                                    limit: function(limitCount) {
                                        // Limit the results
                                        const limitedData = sortedData.slice(0, limitCount);
                                        
                                        return {
                                            get: function() {
                                                return Promise.resolve({
                                                    empty: limitedData.length === 0,
                                                    size: limitedData.length,
                                                    forEach: function(callback) {
                                                        limitedData.forEach(item => {
                                                            callback({
                                                                id: item.id,
                                                                data: function() {
                                                                    return item;
                                                                }
                                                            });
                                                        });
                                                    }
                                                });
                                            }
                                        };
                                    },
                                    get: function() {
                                        return Promise.resolve({
                                            empty: sortedData.length === 0,
                                            size: sortedData.length,
                                            forEach: function(callback) {
                                                sortedData.forEach(item => {
                                                    callback({
                                                        id: item.id,
                                                        data: function() {
                                                            return item;
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                };
                            },
                            limit: function(limitCount) {
                                // Limit the results
                                const limitedData = filteredData.slice(0, limitCount);
                                
                                return {
                                    get: function() {
                                        return Promise.resolve({
                                            empty: limitedData.length === 0,
                                            size: limitedData.length,
                                            forEach: function(callback) {
                                                limitedData.forEach(item => {
                                                    callback({
                                                        id: item.id,
                                                        data: function() {
                                                            return item;
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                };
                            },
                            get: function() {
                                return Promise.resolve({
                                    empty: filteredData.length === 0,
                                    size: filteredData.length,
                                    forEach: function(callback) {
                                        filteredData.forEach(item => {
                                            callback({
                                                id: item.id,
                                                data: function() {
                                                    return item;
                                                }
                                            });
                                        });
                                    }
                                });
                            }
                        };
                    },
                    
                    get: function() {
                        console.log(`Mock getting all documents from ${collectionName}`);
                        
                        return Promise.resolve({
                            empty: collectionData.length === 0,
                            size: collectionData.length,
                            forEach: function(callback) {
                                collectionData.forEach(item => {
                                    callback({
                                        id: item.id,
                                        data: function() {
                                            return item;
                                        }
                                    });
                                });
                            }
                        });
                    }
                };
            }
        };
    };
    
    // Create apps array
    firebase.apps = [];
    
    // Create initializeApp function
    firebase.initializeApp = function(config) {
        console.log("Mock Firebase initialized with config", config);
        firebase.apps.push({});
        return {};
    };
    
    // Make db globally accessible
    window.db = firebase.firestore();
    
    console.log("Mock Firebase implementation complete");
}

console.log("Firebase polyfill loaded"); 