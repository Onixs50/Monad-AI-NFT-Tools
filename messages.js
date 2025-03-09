import web3Service from '../src/web3.js';
import cacheService from '../utils/cache.js';

class MessageComponent {
  constructor() {
    this.selectedNft = null;
    this.messagesContainer = null;
    this.messageForm = null;
    this.messageText = null;
    this.submitMessageBtn = null;
    this.messagesList = null;
    this.noMessages = null;
    this.isInitialized = false;
  }

  /**
   * Initialize message component
   */
  initialize() {
    if (this.isInitialized) return;
    
    // Find DOM elements
    this.messagesContainer = document.querySelector('.messages-container');
    this.messageForm = document.querySelector('.message-form');
    this.messageText = document.getElementById('messageText');
    this.submitMessageBtn = document.getElementById('submitMessageBtn');
    this.messagesList = document.getElementById('messagesList');
    this.noMessages = document.querySelector('.no-messages');
    
    // Setup event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.submitMessageBtn) {
      this.submitMessageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }
    
    // Listen for Enter key in message input
    if (this.messageText) {
      this.messageText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }
  }

  /**
   * Open messages for specific NFT
   * @param {Object} nft - NFT object with id and other properties
   */
  async openMessages(nft) {
    this.selectedNft = nft;
    
    if (!this.isInitialized) {
      this.initialize();
    }
    
    // Clear existing messages
    this.messagesList.innerHTML = '';
    
    // Show loading state
    this.noMessages.textContent = 'Loading messages...';
    this.noMessages.style.display = 'block';
    
    try {
      // Get messages from blockchain (with retries for RPC issues)
      const messages = await this.getMessagesWithRetry(nft.id, 3);
      
      // Hide loading and show appropriate UI
      if (messages && messages.length > 0) {
        this.renderMessages(messages);
        this.noMessages.style.display = 'none';
      } else {
        this.noMessages.textContent = 'No messages for this NFT yet.';
        this.noMessages.style.display = 'block';
      }
    } catch (error) {
      console.error(`Error loading messages for NFT #${nft.id}:`, error);
      this.noMessages.textContent = 'Failed to load messages. Please try again.';
      this.noMessages.style.display = 'block';
    }
  }

  /**
   * Get messages with retry logic for RPC issues
   * @param {string|number} tokenId - NFT token ID
   * @param {number} retryCount - Number of retries
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessagesWithRetry(tokenId, retryCount = 3) {
    let lastError;
    
    for (let i = 0; i < retryCount; i++) {
      try {
        // Check cache first
        const cacheKey = `messages_${tokenId}`;
        const cachedMessages = cacheService.get(cacheKey);
        
        if (cachedMessages) {
          return cachedMessages;
        }
        
        // Get from blockchain if not cached
        const messages = await web3Service.getMessages(tokenId);
        
        // Cache results for 5 minutes
        cacheService.set(cacheKey, messages, 5 * 60 * 1000);
        
        return messages;
      } catch (error) {
        console.warn(`Attempt ${i+1} failed to get messages:`, error);
        lastError = error;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw lastError;
  }

  /**
   * Render messages in UI
   * @param {Array} messages - Array of message strings
   */
  renderMessages(messages) {
    this.messagesList.innerHTML = '';
    
    messages.forEach(message => {
      const messageItem = document.createElement('div');
      messageItem.className = 'message-item';
      
      // Parse message to get timestamp if available
      let messageText = message;
      let timestamp = '';
      
      if (message.includes('|')) {
        const parts = message.split('|');
        if (parts.length >= 2) {
          messageText = parts[0].trim();
          timestamp = parts[1].trim();
        }
      }
      
      messageItem.innerHTML = `
        <div class="message-content">${this.escapeHtml(messageText)}</div>
        ${timestamp ? `<div class="message-timestamp">${timestamp}</div>` : ''}
      `;
      
      this.messagesList.appendChild(messageItem);
    });
  }

  /**
   * Send message to selected NFT
   */
  async sendMessage() {
    if (!this.selectedNft || !this.messageText.value.trim()) {
      return;
    }
    
    // Check if wallet is connected
    if (!web3Service.isConnected) {
      alert('Please connect your wallet to send messages.');
      return;
    }
    
    const message = this.messageText.value.trim();
    
    // Add timestamp to message
    const timestamp = new Date().toLocaleString();
    const messageWithTimestamp = `${message} | ${timestamp}`;
    
    // Disable button during transaction
    this.submitMessageBtn.disabled = true;
    this.submitMessageBtn.textContent = 'Sending...';
    
    try {
      // Send message to contract
      await web3Service.sendMessage(this.selectedNft.id, messageWithTimestamp);
      
      // Clear input
      this.messageText.value = '';
      
      // Clear cache for this NFT's messages
      cacheService.remove(`messages_${this.selectedNft.id}`);
      
      // Refresh messages
      await this.openMessages(this.selectedNft);
      
      // Show success notification
      this.showNotification('Message sent successfully!');
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      // Re-enable button
      this.submitMessageBtn.disabled = false;
      this.submitMessageBtn.textContent = 'Send Message';
    }
  }

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success or error)
   */
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} html - String that might contain HTML
   * @returns {string} - Escaped HTML string
   */
  escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
}

export default new MessageComponent();