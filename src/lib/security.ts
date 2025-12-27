export const STORAGE_KEY = "aether_session_k";

// A simple obfuscation layer to prevent plain-text reading in DevTools.
// NOTE: Client-side encryption with a fixed or stored key is technically obfuscation,
// as the code itself contains the logic to decrypt. However, this protects against 
// casual snooping and non-targeted scraping.
export function encryptKey(key: string): string {
    if (!key) return "";
    try {
        // Simple Base64 + Reverse obfuscation
        return btoa(key.split('').reverse().join(''));
    } catch (e) {
        console.error("Encryption failed", e);
        return "";
    }
}

export function decryptKey(encryptedKey: string): string {
    if (!encryptedKey) return "";
    try {
        return atob(encryptedKey).split('').reverse().join('');
    } catch (e) {
        console.error("Decryption failed", e);
        return "";
    }
}

export function saveKey(key: string) {
    if (!key) return;
    const encrypted = encryptKey(key);
    // Use sessionStorage so it clears when the tab/window closes (more secure than localStorage)
    sessionStorage.setItem(STORAGE_KEY, encrypted);
}

export function loadKey(): string | null {
    const encrypted = sessionStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;
    return decryptKey(encrypted);
}

export function clearKey() {
    sessionStorage.removeItem(STORAGE_KEY);
}
