import fs from 'fs/promises';
import path from 'path';
import { encrypt, decrypt } from './QuantumCrypto.js';
import { suggestCommand } from './AISuggest.js';
import { syncWithCloud } from './QuantumSync.js';
import { distance } from 'fastest-levenshtein';

/**
 * QuantumCognition: AI-powered command memory and recall system
 * Premium version: async, robust, secure, and extensible
 */
export default class QuantumCognition {
  constructor() {
    this.memoryPath = path.join(process.env.HOME || process.cwd(), '.qc_secure_memory.enc');
    this.memory = {};
    this.cloudEnabled = false;
  }

  /**
   * Load memory from encrypted file
   */
  async loadMemory() {
    try {
      await fs.access(this.memoryPath);
      const encrypted = await fs.readFile(this.memoryPath, 'utf-8');
      this.memory = JSON.parse(decrypt(encrypted)) || {};
    } catch (e) {
      this.memory = {};
      if (e.code !== 'ENOENT') console.error('❌ Memory load failed:', e.message);
    }
    return this.memory;
  }

  /**
   * Save memory to encrypted file and optionally sync to cloud
   */
  async saveMemory() {
    try {
      const encrypted = encrypt(JSON.stringify(this.memory));
      await fs.writeFile(this.memoryPath, encrypted);
      if (this.cloudEnabled) await syncWithCloud(this.memory);
    } catch (e) {
      console.error('❌ Memory save failed:', e.message);
    }
  }

  /**
   * Learn a new command
   */
  async learn(input, output, tags = []) {
    if (!input || !output) throw new Error('Input and output required');
    this.memory[input] = {
      command: output,
      created: new Date().toISOString(),
      lastUsed: null,
      tags: [...new Set(tags)]
    };
    await this.saveMemory();
    return `📚 Learned:\n"${input}" → "${output}"\n🏷️ Tags: ${tags.join(', ') || 'None'}`;
  }

  /**
   * Recall a command with fuzzy/AI matching
   */
  async recall(input, { threshold = 0.7, suggest = false } = {}) {
    if (this.memory[input]) {
      this.memory[input].lastUsed = new Date().toISOString();
      await this.saveMemory();
      return { command: this.memory[input].command, match: 'exact' };
    }
    const matches = Object.entries(this.memory)
      .map(([key, data]) => {
        const score = 1 - distance(input, key) / Math.max(input.length, key.length);
        return { key, score, data };
      })
      .filter(m => m.score >= threshold)
      .sort((a, b) => b.score - a.score);
    if (matches.length > 0) {
      matches[0].data.lastUsed = new Date().toISOString();
      await this.saveMemory();
      return { command: matches[0].data.command, match: 'fuzzy', score: matches[0].score };
    }
    if (suggest) {
      const suggestion = suggestCommand(input, this.memory);
      if (suggestion) return { command: suggestion, match: 'ai-suggested' };
    }
    return null;
  }

  /**
   * List all learned commands, optionally filtered/sorted
   */
  list({ tags = [], sortBy = 'recent' } = {}) {
    let entries = Object.entries(this.memory);
    if (tags.length) {
      entries = entries.filter(([_, data]) => tags.some(tag => data.tags.includes(tag)));
    }
    if (sortBy === 'recent') {
      entries.sort((a, b) => new Date(b[1].lastUsed || 0) - new Date(a[1].lastUsed || 0));
    }
    return entries.map(([input, data]) =>
      `• ${input} → ${data.command}\n  📅 ${data.created}\n  🏷️ ${data.tags.join(', ') || 'None'}`
    ).join('\n') || 'No commands found.';
  }

  /**
   * Enable cloud sync with provider config
   */
  async enableCloudSync(config) {
    this.cloudEnabled = true;
    await syncWithCloud(this.memory, config);
    return '☁️ Cloud sync enabled.';
  }
}

// --- Helper Functions ---
export const createCognition = async () => {
  const cognition = new QuantumCognition();
  await cognition.loadMemory();
  return cognition;
};
export const loadCognition = async () => {
  const cognition = new QuantumCognition();
  await cognition.loadMemory();
  if (Object.keys(cognition.memory).length === 0) {
    console.warn('⚠️ No memory found. Use `qc learn` to add commands.');
  }
  return cognition;
};
export const saveCognition = async (cognition) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  await cognition.saveMemory();
  return '✅ Memory saved successfully.';
};
export const clearCognition = async (cognition) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  cognition.memory = {};
  await cognition.saveMemory();
  return '🗑️ Memory cleared successfully.';
};
export const syncCognition = async (cognition, config) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  const success = await syncWithCloud(cognition.memory, config);
  return success ? '☁️ Memory synced successfully.' : '❌ Memory sync failed.';
};
export const suggestCognitionCommand = (input, cognition) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  return suggestCommand(input, cognition.memory);
};
export const getCognitionMemory = (cognition) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  return cognition.memory;
};
export const setCognitionMemory = async (cognition, memory) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  if (typeof memory !== 'object') {
    throw new Error('Memory must be an object');
  }
  cognition.memory = memory;
  await cognition.saveMemory();
  return '✅ Memory set successfully.';
};
export const getCognitionPath = (cognition) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  return cognition.memoryPath;
};
export const setCognitionPath = (cognition, newPath) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  if (typeof newPath !== 'string') {
    throw new Error('Path must be a string');
  }
  cognition.memoryPath = newPath;
  return '✅ Memory path set successfully.';
};
export const getCognitionCloudStatus = (cognition) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  return cognition.cloudEnabled ? '☁️ Cloud sync is enabled.' : '☁️ Cloud sync is disabled.';
};
export const toggleCognitionCloudSync = (cognition, enable) => {
  if (!(cognition instanceof QuantumCognition)) {
    throw new Error('Invalid cognition instance');
  }
  cognition.cloudEnabled = !!enable;
  return enable ? '☁️ Cloud sync enabled.' : '☁️ Cloud sync disabled.';
};
export const getCognitionVersion = () => 'QuantumCognition v3.0.0';
export const getCognitionHelp = () => `
QuantumCognition Help:
  - learn <input> <output> [--tags <tags>]: Teach QC a new command with optional tags.
  - recall <input> [--exec] [--threshold <number>] [--suggest]: Recall a command with fuzzy matching and optional execution.
  - suggest <query>: Get AI-generated command suggestions.
  - list [--tags <tags>] [--sortBy <recent|alphabetical>]: List commands with optional filtering and sorting.
  - enableCloudSync: Enable cloud sync for memory.
  - disableCloudSync: Disable cloud sync for memory.
  - clear: Clear all stored commands.
  - version: Show the current version of QuantumCognition.
  - help: Show this help message.
`;