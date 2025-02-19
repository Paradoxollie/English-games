class EventManager {
    constructor() {
        this.events = new Map();
    }

    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        this.events.get(eventName).add(callback);
        
        // Retourne une fonction pour supprimer l'écouteur
        return () => this.off(eventName, callback);
    }

    off(eventName, callback) {
        if (this.events.has(eventName)) {
            this.events.get(eventName).delete(callback);
        }
    }

    emit(eventName, data) {
        if (this.events.has(eventName)) {
            this.events.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event ${eventName}:`, error);
                }
            });
        }
    }

    clear() {
        this.events.clear();
    }
}

export default EventManager; 