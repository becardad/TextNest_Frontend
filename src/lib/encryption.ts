export const encryptMessage = (text: string): string => {
  if (!text) return text;
  try {
    // Basic Base64 encoding mock for E2EE payload masking
    return "ENC:" + btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    return text;
  }
};

export const decryptMessage = (text: string): string => {
  if (!text || !text.startsWith("ENC:")) return text;
  try {
    const payload = text.slice(4); // Remove "ENC:" prefix
    return decodeURIComponent(escape(atob(payload)));
  } catch (e) {
    return text; // Fallback if decryption fails
  }
};
