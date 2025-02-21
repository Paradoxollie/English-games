class CacheManager {
    constructor() {
        this.cacheVersion = '1.0.0';
        this.cachePrefix = 'english-quest-';
        this.isLocalhost = window.location.protocol === 'file:' || 
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';
    }

    // Cache pour les scores
    async getCachedScores(gameId) {
        const cacheKey = `${this.cachePrefix}scores-${gameId}`;
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { data, timestamp, version } = JSON.parse(cached);
                // Vérifier si le cache est valide (5 minutes)
                if (version === this.cacheVersion && Date.now() - timestamp < 5 * 60 * 1000) {
                    return data;
                }
            }
            return null;
        } catch (error) {
            console.error('Cache error:', error);
            return null;
        }
    }

    async setCachedScores(gameId, scores) {
        const cacheKey = `${this.cachePrefix}scores-${gameId}`;
        try {
            const cacheData = {
                data: scores,
                timestamp: Date.now(),
                version: this.cacheVersion
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    // Cache pour les images
    setupImageCache() {
        // Ne pas utiliser l'API Cache en local
        if (this.isLocalhost) {
            console.log('Running locally - skipping Cache API');
            return;
        }

        if ('caches' in window) {
            caches.open(`${this.cachePrefix}images`).then(cache => {
                const imagesToCache = [
                    '/images/logo.gif',
                    '/images/background.webp',
                    // Ajouter d'autres images importantes
                ];
                
                // Vérifier que les URLs sont valides avant de les mettre en cache
                const validUrls = imagesToCache.map(url => {
                    try {
                        return new URL(url, window.location.origin).toString();
                    } catch (e) {
                        console.warn('Invalid URL:', url);
                        return null;
                    }
                }).filter(Boolean);

                if (validUrls.length > 0) {
                    cache.addAll(validUrls).catch(error => {
                        console.warn('Cache addAll failed:', error);
                    });
                }
            }).catch(error => {
                console.warn('Cache API error:', error);
            });
        }
    }

    // Méthode utilitaire pour vérifier si une URL est valide
    isValidUrl(url) {
        try {
            new URL(url, window.location.origin);
            return true;
        } catch (e) {
            return false;
        }
    }
}

window.CacheManager = CacheManager; 