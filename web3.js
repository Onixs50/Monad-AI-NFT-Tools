// web3Service.js - Loads ABI from JSON file

class Web3Service {
  constructor() {
    // Contract info
    this.contractAddress = '0x5C8BbC7e9c47785F89F02fb01966468d30d9476D';
    this.abi = null; // Will be loaded from JSON file
    
    // Web3 state
    this.web3 = null;
    this.contract = null;
    this.isInitialized = false;
    this.userAccount = null;
    
    // Network settings
    this.networkName = 'Monad Testnet';
    this.networkId = '10143'; // Monad Testnet ID
    this.networkConfig = {
      chainId: '0x279f', // Hex version of 1287
      chainName: 'Monad Testnet',
      nativeCurrency: {
        name: 'Monad',
        symbol: 'MONAD',
        decimals: 18
      },
      rpcUrls: ['https://rpc.monad.xyz/testnet'],
      blockExplorerUrls: ['https://explorer.monad.network/testnet']
    };

    // Load contract ABI
    this.loadABI();
  }

  // Load ABI from JSON file
  async loadABI() {
    try {
      // Directly embed the ABI to avoid loading issues
      this.abi = [
        // Minimal version with essential functions
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "nextTokenId",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "string", "name": "_tokenURI", "type": "string"}, {"internalType": "string", "name": "_name", "type": "string"}],
          "name": "mintNFT",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
          "name": "burnNFT",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}, {"internalType": "string", "name": "_message", "type": "string"}],
          "name": "sendMessage",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
          "name": "getMessages",
          "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
          "name": "getOwnedNFTs",
          "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
          "name": "getNFTName",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getTopSender",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getTopReceiver",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
          "name": "tokenByIndex",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
          "name": "tokenURI",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
          "name": "ownerOf",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // Try to fetch the complete ABI asynchronously (for future use)
      fetch('contractABI.json')
        .then(response => response.json())
        .then(data => {
          console.log('Full ABI loaded from JSON file');
          this.abi = data; // Update with full ABI
          
          // Reinitialize contract if already set up
          if (this.web3 && this.contract) {
            this.contract = new this.web3.eth.Contract(this.abi, this.contractAddress);
          }
        })
        .catch(error => {
          console.warn('Could not load full ABI from JSON, using embedded minimal ABI', error);
        });
    } catch (error) {
      console.error('Failed to load ABI:', error);
    }
  }

  // Initialize web3
  async initialize() {
    try {
      // Check if Web3 is already injected by something like MetaMask
      if (window.ethereum) {
        console.log('Using injected web3 provider from wallet');
        this.web3 = new Web3(window.ethereum);
        
        // Check if already connected
        const accounts = await this.web3.eth.getAccounts();
        if (accounts.length > 0) {
          this.userAccount = accounts[0];
          this.isInitialized = true;
          await this.setupContract();
          return { isConnected: true, userAccount: this.userAccount };
        }
      } else {
        console.log('No injected web3 provider detected');
      }
      
      return { isConnected: false, userAccount: null };
    } catch (error) {
      console.error('Error initializing web3:', error);
      return { isConnected: false, userAccount: null };
    }
  }

  // Connect wallet and request accounts
  async connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider detected. Please install MetaMask or another wallet.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        this.userAccount = accounts[0];
        this.web3 = new Web3(window.ethereum);
        this.isInitialized = true;
        
        // Setup event listeners for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            this.userAccount = accounts[0];
            // Refresh UI when account changes
            window.location.reload();
          } else {
            this.userAccount = null;
          }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
        
        // Setup the contract with the connected wallet
        await this.setupContract();
        
        return { isConnected: true, userAccount: this.userAccount };
      } else {
        throw new Error('No accounts found. Please unlock your wallet.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  // Setup contract instance
  async setupContract() {
    try {
      if (!this.web3) {
        throw new Error('Web3 not initialized');
      }
      
      if (!this.abi) {
        await this.loadABI(); // Try loading ABI again if it's not available
        if (!this.abi) {
          throw new Error('ABI not available');
        }
      }
      
      this.contract = new this.web3.eth.Contract(
        this.abi,
        this.contractAddress
      );
      
      // Verify contract is working by checking for critical methods
      try {
        // Try nextTokenId first (from your custom contract)
        if (this.contract.methods.nextTokenId) {
          await this.contract.methods.nextTokenId().call();
          console.log('Contract verified with nextTokenId method');
          return true;
        }
        
        // Fall back to totalSupply (from ERC721Enumerable)
        if (this.contract.methods.totalSupply) {
          await this.contract.methods.totalSupply().call();
          console.log('Contract verified with totalSupply method');
          return true;
        }
        
        throw new Error('Contract does not have required methods');
      } catch (methodError) {
        console.error('Contract verification failed:', methodError);
        throw methodError;
      }
    } catch (error) {
      console.error('Error setting up contract:', error);
      throw error;
    }
  }

  // Rest of your methods remain the same...
  // (Check if connected to the correct network, switch networks, etc.)

  // Safe contract call with retry
  async safeContractCall(methodName, ...args) {
    if (!this.contract || !this.isInitialized) {
      throw new Error('Contract not initialized');
    }
    
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check if method exists
        if (!this.contract.methods[methodName]) {
          throw new Error(`Method ${methodName} does not exist on contract`);
        }
        
        // Call the method
        return await this.contract.methods[methodName](...args).call({ from: this.userAccount });
      } catch (error) {
        console.warn(`Attempt ${attempt + 1}/${maxRetries} failed for ${methodName}:`, error);
        lastError = error;
        
        // Wait before retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError || new Error(`Failed to call ${methodName} after ${maxRetries} attempts`);
  }

  // Mint a new NFT
  async mintNFT(tokenURI, name) {
    if (!this.contract || !this.isInitialized) {
      throw new Error('Contract not initialized');
    }
    
    try {
      console.log(`Minting NFT with URI: ${tokenURI} and name: ${name}`);
      const result = await this.contract.methods.mintNFT(tokenURI, name)
        .send({ from: this.userAccount });
      
      console.log('Mint transaction result:', result);
      
      // Try to extract token ID from the event
      let tokenId;
      if (result.events && result.events.NFTMinted) {
        tokenId = result.events.NFTMinted.returnValues.tokenId;
        console.log('Token ID extracted from NFTMinted event:', tokenId);
      } else if (result.events && result.events.Transfer) {
        // Standard ERC721 Transfer event
        tokenId = result.events.Transfer.returnValues.tokenId;
        console.log('Token ID extracted from Transfer event:', tokenId);
      } else if (result.logs && result.logs.length > 0) {
        // Try to get the nextTokenId and subtract 1
        try {
          const nextId = await this.safeContractCall('nextTokenId');
          tokenId = parseInt(nextId) - 1;
          console.log('Token ID estimated from nextTokenId:', tokenId);
        } catch (nextIdError) {
          console.warn('Could not get nextTokenId:', nextIdError);
        }
      }
      
      return { 
        success: true, 
        transactionHash: result.transactionHash, 
        tokenId,
        events: result.events 
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  // Send a message to an NFT
  async sendMessage(tokenId, message) {
    if (!this.contract || !this.isInitialized) {
      throw new Error('Contract not initialized');
    }
    
    try {
      console.log(`Sending message to token ${tokenId}: ${message}`);
      const result = await this.contract.methods.sendMessage(tokenId, message)
        .send({ from: this.userAccount });
      
      return { success: true, transactionHash: result.transactionHash };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get messages for a token
  async getMessages(tokenId) {
    try {
      console.log(`Getting messages for token ${tokenId}`);
      const messages = await this.safeContractCall('getMessages', tokenId);
      
      // Format messages for display
      return messages.map((message, index) => {
        return {
          content: message,
          sender: this.userAccount,
          timestamp: Math.floor(Date.now() / 1000) - (index * 600) // Mock timestamps
        };
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Burn an NFT
  async burnNFT(tokenId) {
    if (!this.contract || !this.isInitialized) {
      throw new Error('Contract not initialized');
    }
    
    try {
      console.log(`Burning token ${tokenId}`);
      const result = await this.contract.methods.burnNFT(tokenId)
        .send({ from: this.userAccount });
      
      return { success: true, transactionHash: result.transactionHash };
    } catch (error) {
      console.error('Error burning NFT:', error);
      throw error;
    }
  }

  // Get NFTs owned by the current user
  async getOwnedNFTs() {
    try {
      if (!this.userAccount) {
        throw new Error('No connected account');
      }
      
      console.log(`Getting NFTs owned by ${this.userAccount}`);
      const tokenIds = await this.safeContractCall('getOwnedNFTs', this.userAccount);
      return tokenIds.map(id => id.toString());
    } catch (error) {
      console.error('Error getting owned NFTs:', error);
      throw error;
    }
  }

  // Get total supply
  async getTotalSupply() {
    try {
      console.log('Getting total supply');
      // Try totalSupply first
      try {
        const supply = await this.safeContractCall('totalSupply');
        return supply;
      } catch (totalSupplyError) {
        console.warn('totalSupply failed, trying nextTokenId:', totalSupplyError);
        // Fall back to nextTokenId
        return await this.safeContractCall('nextTokenId');
      }
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw error;
    }
  }

  // Shorten address for display
  shortenAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
  }

  // Check if connected to the correct network
  async checkNetwork() {
    try {
      const chainId = await this.web3.eth.getChainId();
      return chainId.toString() === this.networkId;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  // Switch to Monad network
  async switchToMonadNetwork() {
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider detected');
      }
      
      try {
        // First try to switch to the network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.networkConfig.chainId }],
        });
        return true;
      } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [this.networkConfig],
            });
            return true;
          } catch (addError) {
            throw new Error('Failed to add network: ' + addError.message);
          }
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const web3Service = new Web3Service();
window.web3Service = web3Service; // For global access

export default web3Service;