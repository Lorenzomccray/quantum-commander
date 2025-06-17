import CryptoJS from 'crypto-js';

const DEFAULT_KEY = 'quantum-default-key-256';
const SECRET_KEY = process.env.QC_SECRET || DEFAULT_KEY;

if (SECRET_KEY === DEFAULT_KEY) {
  console.warn('[QuantumCrypto] WARNING: Using default key. Set QC_SECRET for better security.');
}

// Derive a 256-bit key using PBKDF2
function deriveKey(passphrase) {
  return CryptoJS.PBKDF2(passphrase, CryptoJS.enc.Hex.parse('a1b2c3d4e5f6a7b8'), {
    keySize: 256 / 32,
    iterations: 1000
  });
}

export const encrypt = (data) => {
  if (typeof data !== 'string') data = JSON.stringify(data);
  const key = deriveKey(SECRET_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(data, key, { iv });
  // Return IV + ciphertext (both base64)
  return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
};

export const decrypt = (ciphertext) => {
  try {
    const [ivB64, enc] = ciphertext.split(':');
    if (!ivB64 || !enc) throw new Error('Invalid ciphertext format');
    const key = deriveKey(SECRET_KEY);
    const iv = CryptoJS.enc.Base64.parse(ivB64);
    const decrypted = CryptoJS.AES.decrypt(enc, key, { iv });
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error('Decryption failed');
    return result;
  } catch (e) {
    console.error('[QuantumCrypto] Decrypt error:', e.message);
    return null;
  }
}
