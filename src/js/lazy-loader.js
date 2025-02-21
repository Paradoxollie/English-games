export class LazyLoader {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );
    }

    observe(element, callback) {
        element.dataset.lazyCallback = callback;
        this.observer.observe(element);
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const callback = entry.target.dataset.lazyCallback;
                if (callback && typeof window[callback] === 'function') {
                    window[callback](entry.target);
                    this.observer.unobserve(entry.target);
                }
            }
        });
    }
} 