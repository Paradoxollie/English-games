class UIManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id ${containerId} not found`);
        }
    }

    showMessage(text, type = 'info', duration = 3000) {
        const messageEl = document.createElement('div');
        messageEl.className = `game-message ${type}`;
        messageEl.textContent = text;
        
        this.container.appendChild(messageEl);

        if (duration > 0) {
            setTimeout(() => {
                messageEl.remove();
            }, duration);
        }

        return messageEl;
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else {
                element.innerHTML = '';
                element.appendChild(content);
            }
        }
    }

    createElement(type, options = {}) {
        const element = document.createElement(type);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.text) {
            element.textContent = options.text;
        }
        
        if (options.html) {
            element.innerHTML = options.html;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        return element;
    }

    clearContainer() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}

export default UIManager; 