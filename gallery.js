import web3Service from '../src/web3.js';
import ipfsUploader from '../src/ipfsUploader.js';
import messageComponent from './messages.js';
import { shortenAddress } from '../utils/helpers.js';

class GalleryComponent {
  constructor() {
    this.nfts = [];
    this.filteredNfts = [];
    this.galleryElement = null;
    this.isInitialized = false;
    this.selectedNftId = null;
  }

  /**
   * Initialize gallery component
   */
  initialize() {
    if (this.isInitialized) return;
    
    // Find DOM elements
    this.galleryElement = document.getElementById('nftGallery');
    this.galleryFilter = document.getElementById('galleryFilter');
    this.gallerySearch = document.getElementById('gallerySearch');
    this.searchButton = document.getElementById('searchButton');
    this.nftModal = document.getElementById('nftModal');
    this.closeModal = document.querySelector('.close-modal');
    this.modalNftImage = document.getElementById('modalNftImage');
    this.modalTokenId = document.getElementById('modalTokenId');
    this.modalOwner = document.getElementById('modalOwner');
    this.modalDate = document.getElementById('modalDate');
    this.sendMessageBtn = document.getElementById('sendMessageBtn');
    this.burnNftBtn = document.getElementById('burnNftBtn');
    
    // Setup event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.galleryFilter) {
      this.galleryFilter.addEventListener('change', () => this.applyFilters());
    }
    
    if (this.searchButton) {
      this.searchButton.addEventListener('click', () => this.applyFilters());
    }
    
    if (this.gallerySearch) {
      this.gallerySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.applyFilters();
        }
      });
    }
    
    if (this.closeModal) {
      this.closeModal.addEventListener('click', () => {
        this.nftModal.style.display = 'none';
        document.querySelector('.message-form').style.display = 'none';
      });
    }
    
    if (this.sendMessageBtn) {
      this.sendMessageBtn.addEventListener('click', () => {
        const messageForm = document.querySelector('.message-form');
        messageForm.style.display = messageForm.style.display === 'none' ? 'block' : 'none';
      });
    }
    
    if (this.burnNftBtn) {
      this.burnNftBtn.addEventListener('click', () => this.burnSelectedNft());
    }
    
    // Modal outside click to close
    window.addEventListener('click', (e) => {
      if (e.target === this.nftModal) {
        this.nftModal.style.display = 'none';
        document.querySelector('.message-form').style.display = 'none';
      }
    });
  }

  /**
   * Load NFTs from blockchain
   */
  async loadNFTs() {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    // Show loading state
    this.galleryElement.innerHTML = '<div class="loading-gallery">Loading NFTs...</div>';
    
    try {
      const filter = this.galleryFilter ? this.galleryFilter.value : 'all';
      
      let tokenIds = [];
      
      if (filter === 'owned' && web3Service.isConnected) {
        // Get owned NFTs
        tokenIds = await web3Service.getOwnedNFTs(web3Service.userAccount);
      } else {
        // TODO: Implement loading all NFTs (need contract method or event listening)
        // For now, just use the next token ID to get all minted NFTs
        const nextTokenId = await web3Service.contract.methods.nextTokenId().call();
        tokenIds = Array.from({ length: nextTokenId }, (_, i) => i.toString());
      }
      
      // Reset NFTs array
      this.nfts = [];
      
      // Load details for each NFT
      for (const tokenId of tokenIds) {
        try {
          // Check if token exists (owner is not zero address)
          const owner = await web3Service.contract.methods.ownerOf(tokenId).call().catch(() => null);
          
          if (owner) {
            // Get token URI
            const tokenURI = await web3Service.getTokenURI(tokenId);
            
            // Get NFT name
            const name = await web3Service.getNFTName(tokenId);
            
            // Add to NFTs array
            this.nfts.push({
              id: tokenId,
              uri: tokenURI,
              owner: owner,
              name: name || `NFT #${tokenId}`,
              metadata: null, // To be loaded later
              image: null,    // To be loaded later
            });
          }
        } catch (error) {
          console.warn(`Error loading NFT #${tokenId}:`, error);
        }
      }
      
      // Apply filters and render
      this.applyFilters();
      
    } catch (error) {
      console.error('Error loading NFTs:', error);
      this.galleryElement.innerHTML = '<div class="error-gallery">Failed to load NFTs. Please try again.</div>';
    }
  }

  /**
   * Apply filters to NFTs
   */
  applyFilters() {
    const filter = this.galleryFilter ? this.galleryFilter.value : 'all';
    const searchTerm = this.gallerySearch ? this.gallerySearch.value.toLowerCase() : '';
    
    this.filteredNfts = this.nfts.filter(nft => {
      // Apply ownership filter
      if (filter === 'owned' && nft.owner !== web3Service.userAccount) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm && !nft.id.includes(searchTerm) && 
          !(nft.name && nft.name.toLowerCase().includes(searchTerm)) &&
          !nft.owner.toLowerCase().includes(searchTerm)) {
        return false;
      }
      
      return true;
    });
    
    // Render filtered NFTs
    this.renderNFTs();
  }

  /**
   * Render NFTs in gallery
   */
  async renderNFTs() {
    if (this.filteredNfts.length === 0) {
      this.galleryElement.innerHTML = '<div class="empty-gallery">No NFTs found</div>';
      return;
    }
    
    // Clear gallery
    this.galleryElement.innerHTML = '';
    
    // Create gallery items
    for (const nft of this.filteredNfts) {
      try {
        // Create NFT card element
        const nftCard = document.createElement('div');
        nftCard.className = 'nft-card';
        nftCard.dataset.tokenId = nft.id;
        
        // Set initial content with loading state
        nftCard.innerHTML = `
          <div class="nft-image-container">
            <div class="loading-image">Loading...</div>
          </div>
          <div class="nft-info">
            <h3>${nft.name || `NFT #${nft.id}`}</h3>
            <p>ID: ${nft.id}</p>
          </div>
        `;
        
        // Add to gallery
        this.galleryElement.appendChild(nftCard);
        
        // Load image asynchronously
        this.loadNFTImage(nft, nftCard);
        
        // Add click event
        nftCard.addEventListener('click', () => this.openNftDetails(nft));
        
      } catch (error) {
        console.error(`Error rendering NFT #${nft.id}:`, error);
      }
    }
  }

  /**
   * Load NFT image and metadata
   * @param {Object} nft - NFT object
   * @param {HTMLElement} nftCard - NFT card element
   */
  async loadNFTImage(nft, nftCard) {
    try {
      if (!nft.metadata) {
        // Fetch metadata from IPFS
        const url = ipfsUploader.resolveIPFSUrl(nft.uri);
        
        // Add cache-busting parameter for IPFS gateways
        const cacheBuster = `?timestamp=${Date.now()}`;
        const response = await fetch(url + cacheBuster);
        
        if (response.ok) {
          nft.metadata = await response.json();
        } else {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
      }
      
      // Get image URL from metadata
      if (nft.metadata && nft.metadata.image) {
        const imageUrl = ipfsUploader.resolveIPFSUrl(nft.metadata.image);
        
        // Update card with image
        const imageContainer = nftCard.querySelector('.nft-image-container');
        imageContainer.innerHTML = `<img src="${imageUrl}" alt="${nft.name}" class="nft-image">`;
        
        // Store image URL
        nft.image = imageUrl;
      }
    } catch (error) {
      console.error(`Error loading image for NFT #${nft.id}:`, error);
      
      // Show error placeholder
      const imageContainer = nftCard.querySelector('.nft-image-container');
      imageContainer.innerHTML = `
        <div class="error-image">
          <p>Image Unavailable</p>
        </div>
      `;
    }
  }

  /**
   * Open NFT details modal
   * @param {Object} nft - NFT object
   */
  async openNftDetails(nft) {
    this.selectedNftId = nft.id;
    
    // Set modal content
    this.modalTokenId.textContent = nft.id;
    this.modalOwner.textContent = shortenAddress(nft.owner);
    
    // Set image if available, otherwise show loading
    if (nft.image) {
      this.modalNftImage.src = nft.image;
    } else {
      this.modalNftImage.src = 'https://via.placeholder.com/500?text=Loading...';
      
      // Try to load image if not already loaded
      try {
        if (!nft.metadata) {
          const url = ipfsUploader.resolveIPFSUrl(nft.uri);
          const response = await fetch(url);
          
          if (response.ok) {
            nft.metadata = await response.json();
            
            if (nft.metadata.image) {
              const imageUrl = ipfsUploader.resolveIPFSUrl(nft.metadata.image);
              nft.image = imageUrl;
              this.modalNftImage.src = imageUrl;
            }
          }
        }
      } catch (error) {
        console.error(`Error loading image for modal:`, error);
        this.modalNftImage.src = 'https://via.placeholder.com/500?text=Image+Unavailable';
      }
    }
    
    // Set creation date if available
    if (nft.metadata && nft.metadata.attributes) {
      const creationAttr = nft.metadata.attributes.find(
        attr => attr.trait_type === 'Creation Date'
      );
      
      if (creationAttr && creationAttr.value) {
        const date = new Date(creationAttr.value);
        this.modalDate.textContent = date.toLocaleDateString();
      } else {
        this.modalDate.textContent = 'Unknown date';
      }
    } else {
      this.modalDate.textContent = 'Unknown date';
    }
    
    // Show/hide burn button based on ownership
    if (web3Service.isConnected && nft.owner === web3Service.userAccount) {
      this.burnNftBtn.style.display = 'block';
    } else {
      this.burnNftBtn.style.display = 'none';
    }
    
    // Show modal
    this.nftModal.style.display = 'block';
    
    // Load messages for this NFT
    messageComponent.openMessages(nft);
  }

  /**
   * Burn selected NFT
   */
  async burnSelectedNft() {
    if (!this.selectedNftId || !web3Service.isConnected) {
      return;
    }
    
    // Confirm burn
    const confirm = window.confirm(`Are you sure you want to burn NFT #${this.selectedNftId}? This action cannot be undone.`);
    
    if (!confirm) {
      return;
    }
    
    try {
      // Burn NFT
      await web3Service.burnNFT(this.selectedNftId);
      
      // Close modal
      this.nftModal.style.display = 'none';
      
      // Refresh gallery
      this.loadNFTs();
      
      // Show success notification
      this.showNotification('NFT burned successfully!');
      
    } catch (error) {
      console.error('Error burning NFT:', error);
      this.showNotification('Failed to burn NFT. Please try again.', 'error');
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
}

export default new GalleryComponent();