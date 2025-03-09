/**
 * Various helper functions for the AI NFT Platform
 */

// Shorten address for display
export function shortenAddress(address, startLength = 6, endLength = 4) {
    if (!address) return '';
    return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
}

// Shorten prompt for display
export function shortenPrompt(prompt, maxLength = 30) {
    if (!prompt) return '';
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength - 3) + '...';
}

// Generate a hash from a string
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

// Format date
export function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'Invalid date';
    }
}

// Delay function (useful for animations and timed operations)
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy text to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        return false;
    }
}

// Resolve IPFS URL to HTTP URL for fetching
export function resolveIPFSUrl(ipfsUrl) {
    if (!ipfsUrl) return '';
    
    // Handle ipfs:// protocol URLs
    if (ipfsUrl.startsWith('ipfs://')) {
        // Use Cloudflare IPFS gateway
        return ipfsUrl.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
    }
    
    // Handle /ipfs/ path URLs
    if (ipfsUrl.startsWith('/ipfs/')) {
        return `https://cloudflare-ipfs.com${ipfsUrl}`;
    }
    
    // Return as is if already HTTP/HTTPS or another protocol
    return ipfsUrl;
}

// Extract file extension from filename or URL
export function getFileExtension(filename) {
    if (!filename) return '';
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

// Format file size for display
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Parse error message from transaction error
export function parseTransactionError(error) {
    if (!error) return "Unknown error";
    
    // Try to extract the revert reason from the error message
    const revertReasonMatch = error.message?.match(/reason="([^"]+)"/);
    if (revertReasonMatch && revertReasonMatch[1]) {
        return revertReasonMatch[1];
    }
    
    // Check for common error patterns
    if (error.message?.includes('insufficient funds')) {
        return 'Insufficient funds for transaction';
    }
    
    if (error.message?.includes('user rejected')) {
        return 'Transaction rejected by user';
    }
    
    // Return the original error message if no patterns match
    return error.message || "Unknown error occurred";
}

// Format gas price to Gwei
export function formatGwei(wei) {
    return parseFloat(wei) / 1e9;
}

// Generate a random color
export function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Debounce function to limit how often a function can be called
export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Throttle function to limit execution rate
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Safe JSON parsing
export function safeJsonParse(jsonString, fallback = {}) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("JSON parsing error:", error);
        return fallback;
    }
}

// Generate random ID
export function generateId(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Format account balance
export function formatBalance(balance, decimals = 18) {
    if (!balance) return '0';
    
    // Convert from wei to eth units
    const balanceInEth = parseFloat(balance) / Math.pow(10, decimals);
    
    // Format the number with appropriate decimal places
    if (balanceInEth < 0.001) {
        return '< 0.001';
    } else if (balanceInEth < 1) {
        return balanceInEth.toFixed(4);
    } else {
        return balanceInEth.toFixed(2);
    }
}

// Check if URL is valid
export function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Get query parameter from URL
export function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set query parameter in URL without page reload
export function setQueryParam(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.history.replaceState({}, '', url);
}

export default {
    shortenAddress,
    shortenPrompt,
    hashString,
    formatDate,
    delay,
    copyToClipboard,
    resolveIPFSUrl,
    getFileExtension,
    formatFileSize,
    parseTransactionError,
    formatGwei,
    randomColor,
    debounce,
    throttle,
    safeJsonParse,
    generateId,
    formatBalance,
    isValidUrl,
    getQueryParam,
    setQueryParam
};