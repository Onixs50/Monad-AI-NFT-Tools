class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.prefix = 'ai_nft_';
    this.ttl = 3600000; // Default TTL: 1 hour
  }

  /**
   * Set cache item with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in ms (optional)
   */
  set(key, value, ttl = this.ttl) {
    const prefixedKey = this.prefix + key;
    const item = {
      value,
      expiry: Date.now() + ttl
    };

    // Try localStorage first
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(item));
    } catch (e) {
      console.warn('localStorage failed, using memory cache:', e);
      // Fallback to memory cache if localStorage fails
      this.memoryCache.set(prefixedKey, item);
    }
    
    return true;
  }

  /**
   * Get cache item
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    const prefixedKey = this.prefix + key;
    let item;
    
    // Try localStorage first
    try {
      const storedItem = localStorage.getItem(prefixedKey);
      if (storedItem) {
        item = JSON.parse(storedItem);
      }
    } catch (e) {
      console.warn('localStorage read failed:', e);
    }
    
    // If not in localStorage, try memory cache
    if (!item) {
      item = this.memoryCache.get(prefixedKey);
    }
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Check if expired
    if (item.expiry < Date.now()) {
      this.remove(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Remove cache item
   * @param {string} key - Cache key
   */
  remove(key) {
    const prefixedKey = this.prefix + key;
    
    try {
      localStorage.removeItem(prefixedKey);
    } catch (e) {
      console.warn('localStorage remove failed:', e);
    }
    
    this.memoryCache.delete(prefixedKey);
  }

  /**
   * Clear all cache items
   */
  clear() {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear localStorage items with prefix
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('localStorage clear failed:', e);
    }
  }

  /**
   * Store binary data (like image blobs)
   * @param {string} key - Cache key
   * @param {Blob} blob - Blob data to store
   * @param {number} ttl - Time to live in ms (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async setBinaryData(key, blob, ttl = this.ttl) {
    try {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          this.set(key, base64data, ttl);
          resolve(true);
        };
        reader.onerror = () => {
          console.error('FileReader failed to read blob');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('Error storing binary data:', error);
      return false;
    }
  }

  /**
   * Retrieve binary data
   * @param {string} key - Cache key
   * @returns {Promise<Blob|null>} - Retrieved blob or null
   */
  async getBinaryData(key) {
    const base64data = this.get(key);
    
    if (!base64data) return null;
    
    try {
      // Convert base64 back to blob
      const response = await fetch(base64data);
      return await response.blob();
    } catch (error) {
      console.error('Error converting cached data to blob:', error);
      return null;
    }
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} - True if exists and valid
   */
  has(key) {
    return this.get(key) !== null;
  }
}

export default new CacheService();