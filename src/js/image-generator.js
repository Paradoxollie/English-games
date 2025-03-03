/**
 * Génère une image de particule avec un dégradé radial
 * Cette fonction crée dynamiquement une image de particule
 * pour éviter d'avoir à créer un fichier externe
 */
export function generateParticleImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Créer un dégradé radial
    const gradient = ctx.createRadialGradient(
        64, 64, 0,
        64, 64, 64
    );
    
    // Ajouter les étapes de couleur
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    // Dessiner le cercle avec le dégradé
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();
    
    return canvas.toDataURL('image/png');
}

/**
 * Génère une image de motif de runes
 */
export function generateRunesPattern() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fond transparent
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 512, 512);
    
    // Dessiner des runes aléatoires
    const runeSymbols = [
        'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 
        'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 
        'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'
    ];
    
    ctx.font = '32px serif';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    
    // Dessiner 100 runes aléatoires
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rune = runeSymbols[Math.floor(Math.random() * runeSymbols.length)];
        const size = 16 + Math.random() * 32;
        
        ctx.font = `${size}px serif`;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI * 2);
        ctx.fillText(rune, 0, 0);
        ctx.restore();
    }
    
    return canvas.toDataURL('image/png');
} 