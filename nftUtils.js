/**
 * NFT Utility Functions
 * Handles NFT-related operations including metadata formatting, image loading, and prompt generation
 */

import { resolveIPFSUrl, shortenPrompt } from './helpers.js';
import { NFT_STYLES, NFT_MODIFIERS } from './config.js';
import { imageCache, metadataCache } from './cache.js';

/**
 * Format NFT data for display
 * @param {Object} nft - Raw NFT data from contract
 * @returns {Object} Formatted NFT data
 */
export function formatNFTData(nft) {
  return {
    id: nft.id || 0,
    name: nft.name || `NFT #${nft.id || 0}`,
    description: nft.metadata?.description || 'No description available',
    image: nft.image || nft.metadata?.image || null,
    owner: nft.owner || '0x0000000000000000000000000000000000000000',
    tokenURI: nft.uri || '',
    creationDate: extractCreationDate(nft.metadata) || 'Unknown date',
    attributes: formatAttributes(nft.metadata?.attributes || [])
  };
}

/**
 * Extract creation date from NFT metadata
 * @param {Object} metadata - NFT metadata
 * @returns {string} Formatted creation date or null
 */
export function extractCreationDate(metadata) {
  if (!metadata || !metadata.attributes) return null;
  
  // Find creation date attribute
  const creationDateAttr = metadata.attributes.find(
    attr => attr.trait_type === 'Creation Date' || attr.trait_type === 'creation_date'
  );
  
  if (creationDateAttr && creationDateAttr.value) {
    try {
      const date = new Date(creationDateAttr.value);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return creationDateAttr.value;
    }
  }
  
  // Fallback to metadata timestamp if available
  if (metadata.created_at) {
    try {
      const date = new Date(metadata.created_at);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return null;
    }
  }
  
  return null;
}

/**
 * Format NFT attributes for display
 * @param {Array} attributes - NFT attributes from metadata
 * @returns {Object} Formatted attributes
 */
export function formatAttributes(attributes) {
  if (!Array.isArray(attributes)) return {};
  
  const formatted = {};
  attributes.forEach(attr => {
    if (attr.trait_type && attr.value) {
      formatted[attr.trait_type] = attr.value;
    }
  });
  
  return formatted;
}

/**
 * Load NFT image and update cache
 * @param {Object} nft - NFT object with metadata
 * @returns {Promise<string>} Image URL
 */
export async function loadNFTImage(nft) {
  try {
    // Check if we already have the image URL
    if (nft.image) return nft.image;
    
    // Check metadata for image
    if (!nft.metadata) {
      // Try to get metadata from cache or fetch it
      nft.metadata = metadataCache.retrieveMetadata(nft.id);
      
      if (!nft.metadata && nft.uri) {
        nft.metadata = await fetchMetadata(nft.uri);
        if (nft.metadata) {
          metadataCache.storeMetadata(nft.id, nft.metadata);
        }
      }
    }
    
    // If we have metadata with image, resolve the URL
    if (nft.metadata && nft.metadata.image) {
      const imageUrl = resolveIPFSUrl(nft.metadata.image);
      return imageUrl;
    }
    
    // Fallback to placeholder
    return `https://via.placeholder.com/500?text=NFT+${nft.id}`;
  } catch (error) {
    console.error(`Error loading image for NFT #${nft.id}:`, error);
    return `https://via.placeholder.com/500?text=Error+Loading+Image`;
  }
}

/**
 * Fetch metadata from token URI
 * @param {string} tokenURI - NFT token URI
 * @returns {Promise<Object>} NFT metadata
 */
export async function fetchMetadata(tokenURI) {
  try {
    const url = resolveIPFSUrl(tokenURI);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      name: "Unknown NFT",
      description: "Metadata unavailable",
      image: "https://via.placeholder.com/500?text=Metadata+Unavailable"
    };
  }
}

/**
 * Generate an automatic prompt based on selected style
 * @param {string} style - The style category to use
 * @returns {string} A generated prompt
 */
export function generateAutoPrompt(style) {
  // Get prompts for the selected style
  const stylePrompts = NFT_STYLES[style]?.prompts || [];
  
  // If no prompts available, return a default prompt
  if (!stylePrompts.length) {
    return "Digital art in vibrant colors, perfect for NFT";
  }
  
  // Select a random prompt from the chosen style
  return stylePrompts[Math.floor(Math.random() * stylePrompts.length)];
}

/**
 * Enhance a prompt with NFT-specific modifiers
 * @param {string} prompt - The original prompt
 * @returns {string} Enhanced prompt
 */
export function enhancePromptForNFT(prompt) {
  if (!prompt) return "Digital art NFT with vibrant colors";
  
  // Get random number of modifiers (2-4)
  const modifierCount = 2 + Math.floor(Math.random() * 3);
  
  // Shuffle modifiers array
  const shuffled = [...NFT_MODIFIERS].sort(() => 0.5 - Math.random());
  
  // Select random modifiers
  const selectedModifiers = shuffled.slice(0, modifierCount);
  
  // Add modifiers to prompt
  return `${prompt}, ${selectedModifiers.join(", ")}`;
}

/**
 * Create a local placeholder image
 * @param {string} prompt - The prompt to use for the placeholder
 * @param {number} width - Width of the image
 * @param {number} height - Height of the image
 * @returns {Promise<Blob>} Image blob
 */
export function createLocalPlaceholder(prompt, width = 512, height = 512) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Generate colors based on prompt hash
    const hash = hashString(prompt);
    const color1 = '#' + hash.substring(0, 6);
    const color2 = '#' + hash.substring(6, 12);
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI NFT Placeholder', width/2, height/2);
    ctx.fillText(shortenPrompt(prompt), width/2, height/2 + 30);
    
    // Convert to blob
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * Create a hash from a string
 * @param {string} str - String to hash
 * @returns {string} Hex hash
 */
export function hashString(str) {
  let hash = 0;
  if (!str) return '000000000000';
  
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex string and ensure it's long enough
  const hexHash = Math.abs(hash).toString(16).padStart(12, '0');
  return hexHash;
}

export default {
  formatNFTData,
  extractCreationDate,
  formatAttributes,
  loadNFTImage,
  fetchMetadata,
  generateAutoPrompt,
  enhancePromptForNFT,
  createLocalPlaceholder,
  hashString
};