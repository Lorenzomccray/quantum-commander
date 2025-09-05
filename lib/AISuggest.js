// Premium AI Suggestion Module
// Uses fuzzy matching and ranking for smarter command suggestions
import { distance } from 'fastest-levenshtein';

/**
 * Suggest the most relevant command from memory based on input.
 * Uses fuzzy matching and ranks by similarity.
 * @param {string} input - The user input/query
 * @param {Object} memory - The memory object containing commands
 * @param {number} threshold - Similarity threshold (0-1, default 0.5)
 * @returns {string|null} - The best matching command or null
 */
export const suggestCommand = (input, memory, threshold = 0.5) => {
  if (!input || typeof input !== 'string' || !memory || typeof memory !== 'object') return null;
  const lower = input.toLowerCase();
  let best = null;
  let bestScore = threshold;
  for (const key of Object.keys(memory)) {
    const score = 1 - distance(lower, key.toLowerCase()) / Math.max(lower.length, key.length);
    if (score > bestScore) {
      best = memory[key].command;
      bestScore = score;
    }
  }
  return best;
};
