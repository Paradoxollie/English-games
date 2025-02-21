import { db } from './firebase-config.js';

export class VisitorCounter {
    constructor(elementId) {
        this.elementId = elementId;
        this.counterElement = document.getElementById(elementId);
    }

    async updateCounter() {
        try {
            const counterRef = db.collection('counters').doc('visitors');
            
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(counterRef);
                const newCount = (doc.data()?.count || 0) + 1;
                transaction.set(counterRef, { count: newCount });
                this.displayCount(newCount);
            });
        } catch (error) {
            console.error('Error updating counter:', error);
            this.displayError();
        }
    }

    displayCount(count) {
        if (this.counterElement) {
            this.counterElement.innerHTML = `
                <div class="flex items-center justify-center space-x-2">
                    <span class="text-quest-gold">👥 Visitors:</span>
                    <span class="font-bold text-white">${count.toLocaleString()}</span>
                </div>
            `;
        }
    }

    displayError() {
        if (this.counterElement) {
            this.counterElement.innerHTML = `
                <div class="text-red-500">
                    Unable to load visitor count
                </div>
            `;
        }
    }
} 