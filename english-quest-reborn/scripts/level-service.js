/**
 * English Quest - Level Service
 * Gère le système de niveaux et XP
 */

class LevelService {
  constructor() {
    // Configuration de la progression XP
    this.baseXP = 100; // XP nécessaire pour le niveau 1->2
    this.xpMultiplier = 1.15; // Multiplicateur de croissance (15% d'augmentation par niveau)
    this.maxLevel = 100; // Niveau maximum
    
    // Cache des XP requis par niveau
    this.xpRequiredCache = new Map();
    
    // Pré-calculer les XP requis pour tous les niveaux
    this.precomputeXPRequirements();
  }

  /**
   * Pré-calcule les XP requis pour chaque niveau
   */
  precomputeXPRequirements() {
    let totalXP = 0;
    
    for (let level = 1; level <= this.maxLevel; level++) {
      if (level === 1) {
        this.xpRequiredCache.set(level, 0); // Niveau 1 = 0 XP
      } else {
        // XP requis pour passer de (level-1) à level
        const xpForThisLevel = Math.floor(this.baseXP * Math.pow(this.xpMultiplier, level - 2));
        totalXP += xpForThisLevel;
        this.xpRequiredCache.set(level, totalXP);
      }
    }
    
    console.log('[LevelService] XP requirements precomputed:', {
      level5: this.xpRequiredCache.get(5),
      level10: this.xpRequiredCache.get(10),
      level20: this.xpRequiredCache.get(20),
      level50: this.xpRequiredCache.get(50)
    });
  }

  /**
   * Calcule le niveau basé sur l'XP total
   */
  calculateLevel(totalXP) {
    if (totalXP <= 0) return 1;
    
    for (let level = this.maxLevel; level >= 1; level--) {
      const requiredXP = this.xpRequiredCache.get(level);
      if (totalXP >= requiredXP) {
        return level;
      }
    }
    
    return 1;
  }

  /**
   * Retourne l'XP total requis pour atteindre un niveau donné
   */
  getXPRequiredForLevel(level) {
    if (level < 1) return 0;
    if (level > this.maxLevel) return this.xpRequiredCache.get(this.maxLevel);
    
    return this.xpRequiredCache.get(level) || 0;
  }

  /**
   * Retourne l'XP nécessaire pour passer au niveau suivant
   */
  getXPForNextLevel(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    
    if (currentLevel >= this.maxLevel) {
      return {
        currentLevel,
        nextLevel: this.maxLevel,
        xpCurrent: currentXP,
        xpRequired: this.getXPRequiredForLevel(this.maxLevel),
        xpRemaining: 0,
        isMaxLevel: true
      };
    }
    
    const nextLevel = currentLevel + 1;
    const xpForCurrentLevel = this.getXPRequiredForLevel(currentLevel);
    const xpForNextLevel = this.getXPRequiredForLevel(nextLevel);
    const xpProgress = currentXP - xpForCurrentLevel;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpRemaining = xpForNextLevel - currentXP;
    
    return {
      currentLevel,
      nextLevel,
      xpCurrent: currentXP,
      xpProgress,
      xpNeeded,
      xpRemaining,
      xpForCurrentLevel,
      xpForNextLevel,
      progressPercentage: Math.floor((xpProgress / xpNeeded) * 100),
      isMaxLevel: false
    };
  }

  /**
   * Simule l'ajout d'XP et retourne les informations de niveau
   */
  simulateXPGain(currentXP, xpGain) {
    const beforeLevel = this.calculateLevel(currentXP);
    const newXP = currentXP + xpGain;
    const afterLevel = this.calculateLevel(newXP);
    
    const leveledUp = afterLevel > beforeLevel;
    const levelsGained = afterLevel - beforeLevel;
    
    return {
      beforeLevel,
      afterLevel,
      newXP,
      xpGain,
      leveledUp,
      levelsGained,
      progressInfo: this.getXPForNextLevel(newXP)
    };
  }

  /**
   * Retourne un tableau des niveaux avec leurs paliers d'XP pour debug/affichage
   */
  getLevelChart(maxLevelToShow = 20) {
    const chart = [];
    
    for (let level = 1; level <= Math.min(maxLevelToShow, this.maxLevel); level++) {
      const totalXP = this.getXPRequiredForLevel(level);
      const prevXP = level > 1 ? this.getXPRequiredForLevel(level - 1) : 0;
      const xpForThisLevel = totalXP - prevXP;
      
      chart.push({
        level,
        totalXP,
        xpForThisLevel: level > 1 ? xpForThisLevel : 0
      });
    }
    
    return chart;
  }

  /**
   * Vérifie si un utilisateur a le niveau requis pour débloquer un contenu
   */
  hasRequiredLevel(userLevel, requiredLevel) {
    return userLevel >= requiredLevel;
  }

  /**
   * Retourne les paliers de déblocage importants
   */
  getUnlockMilestones() {
    return [
      { level: 5, description: "Déblocage des skins Ours (tête et corps)" },
      { level: 10, description: "Déblocage d'accessoires spéciaux" },
      { level: 15, description: "Déblocage de nouveaux arrière-plans" },
      { level: 20, description: "Déblocage de skins exclusifs" },
      { level: 25, description: "Déblocage d'animations d'avatar" },
      { level: 30, description: "Déblocage de titres spéciaux" }
    ];
  }
}

// Export du service
export const levelService = new LevelService(); 