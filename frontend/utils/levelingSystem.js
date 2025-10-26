/**
 * Advanced Leveling System
 *
 * Formula:
 * - To reach level x, you need (x - 1)² + 4 main stat points
 * - To reach main stat y, you need y² total substats (XP)
 * - Total XP required for level x: ((x - 1)² + 4)²
 */

/**
 * Calculate the main stat requirement for a given level
 * @param {number} level - The target level
 * @returns {number} The main stat points needed
 */
export function getMainStatForLevel(level) {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) + 4;
}

/**
 * Calculate total XP required to reach a specific level
 * @param {number} level - The target level
 * @returns {number} Total XP required
 */
export function getTotalXPForLevel(level) {
  if (level <= 1) return 0;
  const mainStat = getMainStatForLevel(level);
  return Math.pow(mainStat, 2);
}

/**
 * Calculate XP needed to go from one level to the next
 * @param {number} currentLevel - Current level
 * @returns {number} XP needed for next level
 */
export function getXPForNextLevel(currentLevel) {
  const currentTotalXP = getTotalXPForLevel(currentLevel);
  const nextTotalXP = getTotalXPForLevel(currentLevel + 1);
  return nextTotalXP - currentTotalXP;
}

/**
 * Calculate current level based on total XP
 * @param {number} totalXP - Total XP earned
 * @returns {number} Current level
 */
export function getLevelFromXP(totalXP) {
  let level = 1;

  // Find the highest level that the player has reached
  while (getTotalXPForLevel(level + 1) <= totalXP) {
    level++;
    // Safety check to prevent infinite loop (max level 1000)
    if (level >= 1000) break;
  }

  return level;
}

/**
 * Calculate progress percentage within current level
 * @param {number} totalXP - Total XP earned
 * @returns {number} Progress percentage (0-100)
 */
export function getLevelProgress(totalXP) {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
  const xpForNextLevel = getTotalXPForLevel(currentLevel + 1);

  if (currentLevel === 1 && totalXP === 0) return 0;

  const xpIntoCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

  return Math.min(100, Math.max(0, (xpIntoCurrentLevel / xpNeededForLevel) * 100));
}

/**
 * Get XP range for current level
 * @param {number} totalXP - Total XP earned
 * @returns {object} Object with current XP in level and XP needed for next level
 */
export function getXPRangeForCurrentLevel(totalXP) {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
  const xpForNextLevel = getTotalXPForLevel(currentLevel + 1);

  return {
    currentLevelXP: totalXP - xpForCurrentLevel,
    xpNeededForNextLevel: xpForNextLevel - xpForCurrentLevel,
    totalXPForCurrentLevel: xpForCurrentLevel,
    totalXPForNextLevel: xpForNextLevel
  };
}

/**
 * Generate level table for reference
 * @param {number} maxLevel - Maximum level to generate
 * @returns {array} Array of level data
 */
export function generateLevelTable(maxLevel = 30) {
  const table = [];

  for (let level = 1; level <= maxLevel; level++) {
    const mainStat = getMainStatForLevel(level);
    const totalXP = getTotalXPForLevel(level);
    const fromLastLevel = level > 1 ? totalXP - getTotalXPForLevel(level - 1) : 0;

    table.push({
      level,
      mainStat,
      totalXP,
      fromLastLevel
    });
  }

  return table;
}

/**
 * Format XP display with appropriate units
 * @param {number} xp - XP value to format
 * @returns {string} Formatted XP string
 */
export function formatXP(xp) {
  if (xp >= 1000000) {
    return (xp / 1000000).toFixed(2) + 'M';
  } else if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'K';
  }
  return xp.toFixed(0);
}