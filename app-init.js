// app-init.js
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Initializing app...');
  
  // Wait for Web3 to be available
  if (typeof Web3 === 'undefined') {
    console.log('Loading Web3 from CDN...');
    await loadWeb3FromCDN();
  }
  
  // Initialize the application
  initializeApp();
});

// Function to dynamically load Web3 from CDN if needed
function loadWeb3FromCDN() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js';
    script.onload = () => {
      console.log('Web3 loaded successfully');
      resolve();
    };
    script.onerror = () => {
      console.error('Failed to load Web3 from CDN');
      reject(new Error('Failed to load Web3'));
    };
    document.head.appendChild(script);
  });
}

// This function will be called by app.js
function initializeApp() {
  // Create a Web3 instance and expose it globally
  if (typeof window.web3Service === 'undefined') {
    console.log('Creating new Web3 service instance');
    
    // Create a simple Web3 service if the module didn't load
    window.web3Service = {
      initialize: async function() {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            return { isConnected: true };
          } catch (error) {
            console.error("User denied account access", error);
            return { isConnected: false };
          }
        } else if (window.web3) {
          new Web3(window.web3.currentProvider);
          return { isConnected: true };
        } else {
          console.log('Non-Ethereum browser detected. Consider using MetaMask!');
          return { isConnected: false };
        }
      },
      
      connectWallet: async function() {
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return { 
              isConnected: true,
              userAccount: accounts[0]
            };
          } catch (error) {
            console.error("Error connecting to MetaMask", error);
            throw error;
          }
        } else {
          throw new Error("MetaMask not installed");
        }
      }
    };
  }
}