// app.js - Main application script

// Global variables
let currentAccount = null;
let isConnected = false;
let currentTokenId = null;
let isLoadingGallery = false;
let isGeneratingImage = false;
let generatedImageUrl = null;

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App initialized');
    
    // Initialize web3
    try {
        console.log('Initializing web3Service');
        await web3Service.initialize();
    } catch (error) {
        console.error('Failed to initialize web3:', error);
        showToast('Failed to connect to the blockchain', 'error');
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Check if wallet is already connected
    checkConnection();
    
    // Hide loading animation
    setTimeout(() => {
        const loader = document.querySelector('.loader-container');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 1000);
});

// Setup all event listeners
function setupEventListeners() {
    // Connect wallet button
    const connectWalletBtn = document.getElementById('connectWallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }
    
    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }
    
    // Generation mode buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    if (modeBtns) {
        modeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const mode = this.getAttribute('data-mode');
                switchGenerationMode(mode);
            });
        });
    }
    
    // Generate button
    const generateButton = document.getElementById('generateButton');
    if (generateButton) {
        generateButton.addEventListener('click', generateImage);
    }
    
    // Mint button
    const mintButton = document.getElementById('mintButton');
    if (mintButton) {
        mintButton.addEventListener('click', mintNFT);
    }
    
    // Regenerate button
    const regenerateButton = document.getElementById('regenerateButton');
    if (regenerateButton) {
        regenerateButton.addEventListener('click', generateImage);
    }
    
    // NFT selector for messages
    const nftSelector = document.getElementById('nftSelector');
    if (nftSelector) {
        nftSelector.addEventListener('change', function() {
            const tokenId = this.value;
            if (tokenId) {
                currentTokenId = tokenId;
                loadMessages(tokenId);
            }
        });
    }
    
    // Refresh messages button
    const refreshMessagesBtn = document.getElementById('refreshMessages');
    if (refreshMessagesBtn) {
        refreshMessagesBtn.addEventListener('click', function() {
            if (currentTokenId) {
                loadMessages(currentTokenId);
            }
        });
    }
    
    // Create NFT button (in messages tab)
    const createNftBtn = document.querySelector('.create-nft-btn');
    if (createNftBtn) {
        createNftBtn.addEventListener('click', function() {
            switchTab('mint');
        });
    }
    
    // Connect wallet button (in messages tab)
    const connectWalletInMessages = document.querySelector('.connect-wallet-btn');
    if (connectWalletInMessages) {
        connectWalletInMessages.addEventListener('click', connectWallet);
    }
    
    // Gallery filter
    const galleryFilter = document.getElementById('galleryFilter');
    if (galleryFilter) {
        galleryFilter.addEventListener('change', function() {
            loadGallery(this.value);
        });
    }
    
    // Gallery search
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchTerm = document.getElementById('gallerySearch').value;
            searchGallery(searchTerm);
        });
    }
    
    // Leaderboard tabs
    const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
    if (leaderboardTabs) {
        leaderboardTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchLeaderboardTab(tabId);
            });
        });
    }
    
    // Refresh leaderboard button
    const refreshLeaderboardBtn = document.querySelector('.refresh-btn');
    if (refreshLeaderboardBtn) {
        refreshLeaderboardBtn.addEventListener('click', loadLeaderboard);
    }
    
    // NFT Modal close button
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            document.getElementById('nftModal').style.display = 'none';
        });
    }
    
    // Send message button in modal
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', function() {
            const messageForm = document.querySelector('.message-form');
            messageForm.style.display = messageForm.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    // Submit message button in modal
    const submitMessageBtn = document.getElementById('submitMessageBtn');
    if (submitMessageBtn) {
        submitMessageBtn.addEventListener('click', sendMessage);
    }
    
    // Burn NFT button in modal
    const burnNftBtn = document.getElementById('burnNftBtn');
    if (burnNftBtn) {
        burnNftBtn.addEventListener('click', burnNFT);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const nftModal = document.getElementById('nftModal');
        if (event.target == nftModal) {
            nftModal.style.display = 'none';
        }
    });
    
    // Copy buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.copy-btn')) {
            const button = e.target.closest('.copy-btn');
            const type = button.getAttribute('data-copy');
            let textToCopy = '';
            
            if (type === 'owner') {
                textToCopy = document.getElementById('modalOwner').textContent;
            }
            
            if (textToCopy) {
                copyToClipboard(textToCopy);
                showToast('Copied to clipboard!', 'success');
            }
        }
    });
}

// Check if wallet is already connected
async function checkConnection() {
    try {
        const status = await web3Service.initialize();
        
        if (status && status.isConnected && status.userAccount) {
            handleAccountConnected(status.userAccount);
        }
    } catch (error) {
        console.error('Error checking connection:', error);
    }
}

// Connect wallet
async function connectWallet() {
    try {
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.disabled = true;
            connectBtn.querySelector('span').textContent = 'Connecting...';
        }
        
        const status = await web3Service.connectWallet();
        
        if (status && status.isConnected && status.userAccount) {
            handleAccountConnected(status.userAccount);
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showToast('Failed to connect wallet: ' + getReadableError(error), 'error');
    } finally {
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.disabled = false;
            connectBtn.querySelector('span').textContent = 'Connect Wallet';
        }
    }
}

// Handle account connected
function handleAccountConnected(account) {
    currentAccount = account;
    isConnected = true;
    
    // Update UI
    const connectBtn = document.getElementById('connectWallet');
    const walletInfo = document.getElementById('walletInfo');
    const userAddress = document.getElementById('userAddress');
    
    if (connectBtn && walletInfo && userAddress) {
        connectBtn.style.display = 'none';
        walletInfo.style.display = 'flex';
        userAddress.textContent = shortenAddress(account);
    }
    
    // Check network
    checkAndDisplayNetwork();
    
    // Load user data
    loadUserNFTs();
    loadGallery();
    loadLeaderboard();
    
    showToast('Wallet connected successfully!', 'success');
}

// Check and display network
async function checkAndDisplayNetwork() {
    try {
        const isCorrectNetwork = await web3Service.checkNetwork();
        const networkNameElement = document.getElementById('networkName');
        
        if (networkNameElement) {
            if (isCorrectNetwork) {
                networkNameElement.textContent = 'Monad Testnet';
                networkNameElement.classList.add('correct-network');
                networkNameElement.classList.remove('wrong-network');
            } else {
                networkNameElement.textContent = 'Wrong Network';
                networkNameElement.classList.add('wrong-network');
                networkNameElement.classList.remove('correct-network');
                
                // Show switch network dialog
                showToast('Please switch to Monad Testnet', 'warning');
                
                // Try to switch network
                await switchToMonadNetwork();
            }
        }
    } catch (error) {
        console.error('Error checking network:', error);
    }
}

// Switch to Monad network
async function switchToMonadNetwork() {
    try {
        const success = await web3Service.switchToMonadNetwork();
        
        if (success) {
            showToast('Successfully switched to Monad network!', 'success');
            checkAndDisplayNetwork();
        }
    } catch (error) {
        console.error('Error switching network:', error);
        showToast('Failed to switch network: ' + getReadableError(error), 'error');
    }
}

// Switch between tabs
function switchTab(tabId) {
    // Hide all tab contents
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabId);
    const selectedTabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    if (selectedTabBtn) {
        selectedTabBtn.classList.add('active');
    }
    
    // Special handling for certain tabs
    if (tabId === 'gallery') {
        loadGallery();
    } else if (tabId === 'messages') {
        updateMessagesTab();
    } else if (tabId === 'leaderboard') {
        loadLeaderboard();
    }
}

// Switch generation mode
function switchGenerationMode(mode) {
    const manualMode = document.getElementById('manual-mode');
    const autoMode = document.getElementById('auto-mode');
    const manualBtn = document.querySelector('.mode-btn[data-mode="manual"]');
    const autoBtn = document.querySelector('.mode-btn[data-mode="auto"]');
    
    if (mode === 'manual') {
        manualMode.style.display = 'block';
        autoMode.style.display = 'none';
        manualBtn.classList.add('active');
        autoBtn.classList.remove('active');
    } else {
        manualMode.style.display = 'none';
        autoMode.style.display = 'block';
        manualBtn.classList.remove('active');
        autoBtn.classList.add('active');
    }
}

// Generate image
async function generateImage() {
    if (isGeneratingImage) return;
    
    // Check if connected
    if (!isConnected) {
        showToast('Please connect your wallet first', 'warning');
        return;
    }
    
    const manualBtn = document.querySelector('.mode-btn[data-mode="manual"]');
    const isManualMode = manualBtn.classList.contains('active');
    
    let prompt = '';
    if (isManualMode) {
        prompt = document.getElementById('prompt').value.trim();
        if (!prompt) {
            showToast('Please enter a prompt', 'warning');
            return;
        }
    } else {
        const style = document.getElementById('promptStyle').value;
        prompt = getAutoPrompt(style);
    }
    
    try {
        isGeneratingImage = true;
        
        // Show loading state
        const generateButton = document.getElementById('generateButton');
        if (generateButton) {
            generateButton.disabled = true;
            generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        }
        
        // Call image generation service
        const imageUrl = await generateAIImage(prompt);
        
        // Display the generated image
        const generatedImage = document.getElementById('generatedImage');
        const previewContainer = document.querySelector('.image-preview-container');
        
        if (generatedImage && previewContainer) {
            generatedImage.src = imageUrl;
            previewContainer.style.display = 'block';
            
            // Store the image URL for minting
            generatedImageUrl = imageUrl;
            
            // Set a suggested name based on the prompt
            const nftName = document.getElementById('nftName');
            if (nftName && (!nftName.value || nftName.value.trim() === '')) {
                nftName.value = suggestNameFromPrompt(prompt);
            }
        }
        
        showToast('Image generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating image:', error);
        showToast('Failed to generate image: ' + getReadableError(error), 'error');
    } finally {
        isGeneratingImage = false;
        
        // Reset button state
        const generateButton = document.getElementById('generateButton');
        if (generateButton) {
            generateButton.disabled = false;
            generateButton.innerHTML = '<i class="fas fa-magic"></i> Generate Image';
        }
    }
}

// Generate AI image
async function generateAIImage(prompt) {
    // This function simulates AI image generation
    // In a real app, this would call an AI service API
    
    // For demo, return a placeholder image
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate random placeholder from Lorem Picsum
            const width = 512;
            const height = 512;
            const randomId = Math.floor(Math.random() * 1000);
            resolve(`https://picsum.photos/seed/${randomId}/${width}/${height}`);
        }, 1500);
    });
}

// Mint NFT
async function mintNFT() {
    if (!isConnected) {
        showToast('Please connect your wallet first', 'warning');
        return;
    }
    
    if (!generatedImageUrl) {
        showToast('Please generate an image first', 'warning');
        return;
    }
    
    const name = document.getElementById('nftName').value.trim();
    if (!name) {
        showToast('Please enter a name for your NFT', 'warning');
        return;
    }
    
    try {
        // Show minting status
        const mintingStatus = document.querySelector('.minting-status');
        const imagePreview = document.querySelector('.image-preview-container');
        
        if (mintingStatus && imagePreview) {
            mintingStatus.style.display = 'flex';
            imagePreview.style.display = 'none';
        }
        
        // In a real app, upload to IPFS first
        const tokenURI = await mockUploadToIPFS(generatedImageUrl);
        
        // Mint the NFT
        const result = await web3Service.mintNFT(tokenURI, name);
        
        if (result && result.success) {
            // Show success message
            const mintedSuccess = document.querySelector('.minted-success');
            const mintedTokenId = document.getElementById('mintedTokenId');
            const mintedNftName = document.getElementById('mintedNftName');
            const viewOnExplorer = document.getElementById('viewOnExplorer');
            
            if (mintedSuccess && mintedTokenId && mintedNftName && viewOnExplorer) {
                mintedSuccess.style.display = 'block';
                mintingStatus.style.display = 'none';
                
                mintedTokenId.textContent = result.tokenId || 'N/A';
                mintedNftName.textContent = name;
                
                // Set explorer link
                const explorerUrl = `https://testnet.monadexplorer.com/tx/${result.transactionHash}`;
                viewOnExplorer.href = explorerUrl;
            }
            
            // Reset for next minting
            generatedImageUrl = null;
            
            showToast('NFT minted successfully!', 'success');
            
            // Refresh gallery and user NFTs
            setTimeout(() => {
                loadGallery();
                loadUserNFTs();
            }, 2000);
        }
    } catch (error) {
        console.error('Error minting NFT:', error);
        showToast('Failed to mint NFT: ' + getReadableError(error), 'error');
        
        // Reset UI
        const mintingStatus = document.querySelector('.minting-status');
        const imagePreview = document.querySelector('.image-preview-container');
        
        if (mintingStatus && imagePreview) {
            mintingStatus.style.display = 'none';
            imagePreview.style.display = 'block';
        }
    }
}

// Mock upload to IPFS (in a real app, this would actually upload to IPFS)
async function mockUploadToIPFS(imageUrl) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Create a mock IPFS hash
            const hash = 'ipfs://Qm' + Math.random().toString(36).substr(2, 32);
            resolve(hash);
        }, 1000);
    });
}

// Load gallery
async function loadGallery(filter = 'all') {
    if (isLoadingGallery) return;
    
    const galleryContainer = document.getElementById('nftGallery');
    if (!galleryContainer) return;
    
    try {
        isLoadingGallery = true;
        
        // Show loading state
        galleryContainer.innerHTML = '<div class="gallery-loader">Loading NFTs...</div>';
        
        // Get total supply
        let totalSupply;
        try {
            totalSupply = await web3Service.getTotalSupply();
        } catch (error) {
            console.error('Error getting total supply:', error);
            galleryContainer.innerHTML = '<div class="gallery-error">Error loading NFTs. Please try again.</div>';
            return;
        }
        
        if (totalSupply && parseInt(totalSupply) > 0) {
            // Get NFT data
            const nfts = await fetchNFTsData(parseInt(totalSupply), filter);
            
            if (nfts.length === 0) {
                galleryContainer.innerHTML = '<div class="no-nfts">No NFTs found</div>';
                return;
            }
            
            // Display NFTs
            galleryContainer.innerHTML = '';
            
            nfts.forEach(nft => {
                const nftCard = createNFTCard(nft);
                galleryContainer.appendChild(nftCard);
            });
        } else {
            galleryContainer.innerHTML = '<div class="no-nfts">No NFTs have been minted yet</div>';
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        galleryContainer.innerHTML = '<div class="gallery-error">Error loading NFTs. Please try again.</div>';
    } finally {
        isLoadingGallery = false;
    }
}

// Fetch NFTs data
async function fetchNFTsData(totalSupply, filter) {
    const nfts = [];
    
    // For filter=owned, get user's NFTs
    if (filter === 'owned' && isConnected) {
        try {
            const tokenIds = await web3Service.getOwnedNFTs();
            
            for (const tokenId of tokenIds) {
                try {
                    const nftData = await fetchNFTData(tokenId);
                    nfts.push(nftData);
                } catch (error) {
                    console.error(`Error fetching NFT ${tokenId}:`, error);
                }
            }
            
            return nfts;
        } catch (error) {
            console.error('Error getting owned NFTs:', error);
            return [];
        }
    }
    
    // For all NFTs, fetch the latest ones (up to 10)
    const count = Math.min(parseInt(totalSupply), 10);
    for (let i = parseInt(totalSupply) - 1; i >= Math.max(0, parseInt(totalSupply) - count); i--) {
        try {
            const tokenId = i.toString();
            const nftData = await fetchNFTData(tokenId);
            nfts.push(nftData);
        } catch (error) {
            console.error(`Error fetching NFT ${i}:`, error);
            // Continue to next token
        }
    }
    
    return nfts;
}

// Fetch data for a single NFT
async function fetchNFTData(tokenId) {
    try {
        // Get token data from contract
        const tokenURI = await web3Service.safeContractCall('tokenURI', tokenId);
        const owner = await web3Service.safeContractCall('ownerOf', tokenId);
        const name = await web3Service.safeContractCall('getNFTName', tokenId);
        
        // Parse token URI
        let imageUrl = tokenURI;
        if (tokenURI && tokenURI.startsWith('ipfs://')) {
            // In a real app, use an IPFS gateway
            const ipfsHash = tokenURI.replace('ipfs://', '');
            imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
            
            // For demo, use a placeholder image
            imageUrl = `https://picsum.photos/seed/${tokenId}/512/512`;
        }
        
        // Create NFT object
        return {
            tokenId,
            name: name || `NFT #${tokenId}`,
            owner,
            imageUrl,
            tokenURI,
            isOwnedByUser: isConnected && owner.toLowerCase() === currentAccount.toLowerCase()
        };
    } catch (error) {
        console.error(`Error fetching NFT ${tokenId}:`, error);
        throw error;
    }
}

// Create NFT card element
function createNFTCard(nft) {
    const card = document.createElement('div');
    card.className = 'nft-card';
    card.dataset.tokenId = nft.tokenId;
    
    card.innerHTML = `
        <div class="nft-image">
            <img src="${nft.imageUrl}" alt="${nft.name}" onerror="this.src='https://via.placeholder.com/512?text=NFT'">
        </div>
        <div class="nft-details">
            <h3>${nft.name}</h3>
            <p class="nft-id">Token ID: ${nft.tokenId}</p>
            <p class="nft-owner">Owner: ${shortenAddress(nft.owner)}</p>
        </div>
        ${nft.isOwnedByUser ? '<div class="owned-badge">Owned</div>' : ''}
    `;
    
    // Add click event to open modal
    card.addEventListener('click', () => {
        openNFTModal(nft);
    });
    
    return card;
}

// Open NFT modal
function openNFTModal(nft) {
    const modal = document.getElementById('nftModal');
    const modalImg = document.getElementById('modalNftImage');
    const modalName = document.getElementById('modalName');
    const modalTokenId = document.getElementById('modalTokenId');
    const modalOwner = document.getElementById('modalOwner');
    const modalDate = document.getElementById('modalDate');
    const burnNftBtn = document.getElementById('burnNftBtn');
    const messagesList = document.getElementById('modalMessagesList');
    
    if (modal && modalImg && modalName && modalTokenId && modalOwner && modalDate && burnNftBtn && messagesList) {
        // Set modal content
        modalImg.src = nft.imageUrl;
        modalName.textContent = nft.name;
        modalTokenId.textContent = nft.tokenId;
        modalOwner.textContent = nft.owner;
        
        // Set creation date (mock data)
        const mockDate = new Date();
        mockDate.setDate(mockDate.getDate() - Math.floor(Math.random() * 30));
        modalDate.textContent = mockDate.toLocaleDateString();
        
        // Show/hide burn button based on ownership
        burnNftBtn.style.display = nft.isOwnedByUser ? 'block' : 'none';
        
        // Store current token ID for message sending
        currentTokenId = nft.tokenId;
        
        // Load messages
        loadModalMessages(nft.tokenId);
        
        // Show modal
        modal.style.display = 'block';
    }
}

// Load messages in modal
async function loadModalMessages(tokenId) {
    const messagesList = document.getElementById('modalMessagesList');
    
    if (messagesList) {
        messagesList.innerHTML = '<div class="loading-messages">Loading messages...</div>';
        
        try {
            // Check if user owns this NFT
            let messages = [];
            
            try {
                messages = await web3Service.getMessages(tokenId);
            } catch (error) {
                console.error('Error getting messages:', error);
                messages = [];
            }
            
            if (messages.length > 0) {
                messagesList.innerHTML = '';
                
                messages.forEach(msg => {
                    const messageEl = document.createElement('div');
                    messageEl.className = 'message-item';
                    
                    messageEl.innerHTML = `
                        <div class="message-sender">${shortenAddress(msg.sender)}</div>
                        <div class="message-content">${msg.content}</div>
                        <div class="message-time">${formatTimestamp(msg.timestamp)}</div>
                    `;
                    
                    messagesList.appendChild(messageEl);
                });
            } else {
                messagesList.innerHTML = '<div class="no-messages">No messages for this NFT yet</div>';
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            messagesList.innerHTML = '<div class="messages-error">Error loading messages</div>';
        }
    }
}

// Send message to NFT
async function sendMessage() {
    if (!isConnected) {
        showToast('Please connect your wallet first', 'warning');
        return;
    }
    
    if (!currentTokenId) {
        showToast('No NFT selected', 'warning');
        return;
    }
    
    const messageText = document.getElementById('messageText').value.trim();
    if (!messageText) {
        showToast('Please enter a message', 'warning');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('submitMessageBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }
        
        // Send message
        const result = await web3Service.sendMessage(currentTokenId, messageText);
        
        if (result && result.success) {
            showToast('Message sent successfully!', 'success');
            
            // Clear message input
            document.getElementById('messageText').value = '';
            
            // Hide message form
            document.querySelector('.message-form').style.display = 'none';
            
            // Refresh messages
            loadModalMessages(currentTokenId);
            
            // If in messages tab, also refresh there
            if (document.getElementById('messages').classList.contains('active')) {
                loadMessages(currentTokenId);
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Failed to send message: ' + getReadableError(error), 'error');
    } finally {
        // Reset button
        const submitBtn = document.getElementById('submitMessageBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send';
        }
    }
}

// Burn NFT
async function burnNFT() {
    if (!isConnected) {
        showToast('Please connect your wallet first', 'warning');
        return;
    }
    
    if (!currentTokenId) {
        showToast('No NFT selected', 'warning');
        return;
    }
    
    // Confirm before burning
    if (!confirm('Are you sure you want to burn this NFT? This action cannot be undone!')) {
        return;
    }
    
    try {
        // Show loading state
        const burnBtn = document.getElementById('burnNftBtn');
        if (burnBtn) {
            burnBtn.disabled = true;
            burnBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Burning...';
        }
        
        // Burn NFT
        const result = await web3Service.burnNFT(currentTokenId);
        
        if (result && result.success) {
            showToast('NFT burned successfully!', 'success');
            
            // Close modal
            document.getElementById('nftModal').style.display = 'none';
            
            // Refresh gallery and user NFTs
            setTimeout(() => {
                loadGallery();
                loadUserNFTs();
            }, 2000);
        }
    } catch (error) {
        console.error('Error burning NFT:', error);
        showToast('Failed to burn NFT: ' + getReadableError(error), 'error');
    } finally {
        // Reset button
        const burnBtn = document.getElementById('burnNftBtn');
        if (burnBtn) {
            burnBtn.disabled = false;
            burnBtn.innerHTML = '<i class="fas fa-fire"></i> Burn NFT';
        }
    }
}

// Load user NFTs
async function loadUserNFTs() {
    if (!isConnected) return;
    
    try {
        // Get user's NFTs
        const tokenIds = await web3Service.getOwnedNFTs();
        
        // Update NFT selector in messages tab
        const nftSelector = document.getElementById('nftSelector');
        if (nftSelector) {
            nftSelector.innerHTML = '<option value="">Select an NFT</option>';
            
            if (tokenIds.length > 0) {
                // Populate selector with user's NFTs
                for (const tokenId of tokenIds) {
                    try {
                        const name = await web3Service.safeContractCall('getNFTName', tokenId);
                        
                        const option = document.createElement('option');
                        option.value = tokenId;
                        option.textContent = `${name || 'NFT'} (#${tokenId})`;
                        nftSelector.appendChild(option);
                    } catch (error) {
                        console.error(`Error getting name for token ${tokenId}:`, error);
                    }
                }
            }
        }
        
        return tokenIds;
    } catch (error) {
        console.error('Error loading user NFTs:', error);
        return [];
    }
}

// Update messages tab based on connection state
function updateMessagesTab() {
    const noNftsMessage = document.querySelector('.no-nfts-message');
    const notConnectedMessage = document.querySelector('.not-connected-message');
    const noMessagesSelected = document.querySelector('.no-messages-selected');
    const messagesList = document.getElementById('messagesList');
    const nftSelectorContainer = document.querySelector('.nft-selector-container');
    
    // Hide all message states initially
    if (noNftsMessage) noNftsMessage.style.display = 'none';
    if (notConnectedMessage) notConnectedMessage.style.display = 'none';
    if (noMessagesSelected) noMessagesSelected.style.display = 'none';
    if (messagesList) messagesList.innerHTML = '';
    
    if (!isConnected) {
        // Not connected state
        if (notConnectedMessage) notConnectedMessage.style.display = 'block';
        if (nftSelectorContainer) nftSelectorContainer.style.display = 'none';
    } else {
        // Connected state
        if (nftSelectorContainer) nftSelectorContainer.style.display = 'flex';
        
        // Check if user has NFTs
        loadUserNFTs().then(tokenIds => {
            if (!tokenIds || tokenIds.length === 0) {
                if (noNftsMessage) noNftsMessage.style.display = 'block';
            } else {
                if (noMessagesSelected) noMessagesSelected.style.display = 'block';
            }
        });
    }
}

// Load messages for a token in messages tab
async function loadMessages(tokenId) {
    const messagesList = document.getElementById('messagesList');
    const noMessagesSelected = document.querySelector('.no-messages-selected');
    const noMessages = document.querySelector('.no-messages');
    const messagesLoading = document.querySelector('.messages-loading');
    const messagesError = document.querySelector('.messages-error');
    
    if (!messagesList) return;
    
    // Hide all states
    if (noMessagesSelected) noMessagesSelected.style.display = 'none';
    if (noMessages) noMessages.style.display = 'none';
    if (messagesError) messagesError.style.display = 'none';
    messagesList.innerHTML = '';
    
    // Show loading
    if (messagesLoading) messagesLoading.style.display = 'block';
    
    try {
        // Get messages
        const messages = await web3Service.getMessages(tokenId);
        
        // Hide loading
        if (messagesLoading) messagesLoading.style.display = 'none';
        
        if (messages.length > 0) {
            messagesList.innerHTML = '';
            
            messages.forEach(msg => {
                const messageEl = document.createElement('li');
                messageEl.className = 'message-item';
                
                messageEl.innerHTML = `
                    <div class="message-sender">${shortenAddress(msg.sender)}</div>
                    <div class="message-content">${msg.content}</div>
                    <div class="message-time">${formatTimestamp(msg.timestamp)}</div>
                `;
                
                messagesList.appendChild(messageEl);
            });
        } else {
            if (noMessages) noMessages.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        if (messagesLoading) messagesLoading.style.display = 'none';
        if (messagesError) messagesError.style.display = 'block';
    }
}

// Load leaderboard data
async function loadLeaderboard() {
    const sendersLoading = document.getElementById('senders-loading');
    const sendersError = document.getElementById('senders-error');
    const sendersList = document.getElementById('senders-list');
    
    const receiversLoading = document.getElementById('receivers-loading');
    const receiversError = document.getElementById('receivers-error');
    const receiversList = document.getElementById('receivers-list');
    
    const updateTime = document.getElementById('update-time');
    
    if (!sendersLoading || !sendersError || !sendersList || 
        !receiversLoading || !receiversError || !receiversList) {
        return;
    }
    
    // Show loading states
    sendersLoading.style.display = 'block';
    receiversLoading.style.display = 'block';
    
    // Hide errors
    sendersError.style.display = 'none';
    receiversError.style.display = 'none';
    
    // Clear previous data
    sendersList.innerHTML = '';
    receiversList.innerHTML = '';
    
    try {
        // Get top sender
        const topSender = await web3Service.safeContractCall('getTopSender');
        
        // Hide loading
        sendersLoading.style.display = 'none';
        
        if (topSender && topSender !== '0x0000000000000000000000000000000000000000') {
            const sentCount = await web3Service.safeContractCall('sentMessagesCount', topSender);
            
            sendersList.innerHTML = `
                <div class="leaderboard-item">
                    <div class="rank">??</div>
                    <div class="address">${shortenAddress(topSender)}</div>
                    <div class="count">${sentCount} messages</div>
                </div>
            `;
        } else {
            sendersList.innerHTML = '<div class="no-data">No message senders yet</div>';
        }
    } catch (error) {
        console.error('Error loading top sender:', error);
        sendersLoading.style.display = 'none';
        sendersError.style.display = 'block';
        sendersError.textContent = 'Error loading data';
    }
    
    try {
        // Get top receiver
        const topReceiver = await web3Service.safeContractCall('getTopReceiver');
        
        // Hide loading
        receiversLoading.style.display = 'none';
        
        if (topReceiver && topReceiver !== '0x0000000000000000000000000000000000000000') {
            const receivedCount = await web3Service.safeContractCall('receivedMessagesCount', topReceiver);
            
            receiversList.innerHTML = `
                <div class="leaderboard-item">
                    <div class="rank">??</div>
                    <div class="address">${shortenAddress(topReceiver)}</div>
                    <div class="count">${receivedCount} messages</div>
                </div>
            `;
        } else {
            receiversList.innerHTML = '<div class="no-data">No message receivers yet</div>';
        }
    } catch (error) {
        console.error('Error loading top receiver:', error);
        receiversLoading.style.display = 'none';
        receiversError.style.display = 'block';
        receiversError.textContent = 'Error loading data';
    }
    
    // Update time
    if (updateTime) {
        updateTime.textContent = new Date().toLocaleTimeString();
    }
}

// Switch leaderboard tab
function switchLeaderboardTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.leaderboard-tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabBtns = document.querySelectorAll('.leaderboard-tab');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabId}-content`);
    const selectedTabBtn = document.querySelector(`.leaderboard-tab[data-tab="${tabId}"]`);
    
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    if (selectedTabBtn) {
        selectedTabBtn.classList.add('active');
    }
}

// Search gallery
function searchGallery(term) {
    if (!term) {
        loadGallery(document.getElementById('galleryFilter').value);
        return;
    }
    
    const cards = document.querySelectorAll('.nft-card');
    let found = false;
    
    cards.forEach(card => {
        const tokenId = card.dataset.tokenId;
        const name = card.querySelector('h3').textContent.toLowerCase();
        const owner = card.querySelector('.nft-owner').textContent.toLowerCase();
        
        if (tokenId.includes(term) || name.includes(term.toLowerCase()) || owner.includes(term.toLowerCase())) {
            card.style.display = 'block';
            found = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    if (!found) {
        const gallery = document.getElementById('nftGallery');
        if (gallery) {
            if (cards.length > 0) {
                // Add a message but keep the cards hidden
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.textContent = 'No NFTs found matching your search';
                gallery.prepend(noResults);
                
                // Remove message when changing search
                setTimeout(() => {
                    const oldMessage = gallery.querySelector('.no-results');
                    if (oldMessage) {
                        oldMessage.remove();
                    }
                }, 3000);
            } else {
                gallery.innerHTML = '<div class="no-results">No NFTs found matching your search</div>';
            }
        }
    }
}

// Get auto-generated prompt based on style
function getAutoPrompt(style) {
    const prompts = {
        'abstract': 'Vibrant abstract digital art with flowing colors and geometric patterns, NFT style',
        'futuristic': 'Futuristic cityscape with neon lights and flying vehicles, cyberpunk style NFT',
        'nature': 'Magical forest landscape with glowing plants and mystical creatures, fantasy NFT',
        'space': 'Deep space nebula with colorful cosmic clouds and distant stars, space exploration NFT',
        'cyberpunk': 'Cyberpunk character with tech implants in a neon-lit dystopian city, digital art NFT'
    };
    
    return prompts[style] || prompts['abstract'];
}

// Suggest NFT name from prompt
function suggestNameFromPrompt(prompt) {
    // Extract first few words
    const words = prompt.split(' ').slice(0, 3);
    let name = words.join(' ');
    
    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    return name;
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

// Shorten address for display
function shortenAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = document.createElement('i');
    switch (type) {
        case 'success':
            icon.className = 'fas fa-check-circle';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            icon.className = 'fas fa-info-circle';
    }
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(messageSpan);
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// Get readable error message
function getReadableError(error) {
    if (!error) return 'Unknown error';
    
    if (error.message) {
        if (error.message.includes('User denied transaction')) {
            return 'Transaction rejected in wallet';
        }
        
        if (error.message.includes('execution reverted')) {
            return 'Transaction failed - check if you have sufficient funds';
        }
        
        if (error.message.includes('insufficient funds')) {
            return 'Insufficient funds for transaction';
        }
        
        return error.message;
    }
    
    return 'Operation failed';
}