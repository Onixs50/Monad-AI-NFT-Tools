// ipfsUploader.js - Updated with better error handling and fallbacks
import { IPFS_CONFIG } from './config.js';

class IPFSUploader {
  constructor() {
    this.apiKey = IPFS_CONFIG.PINATA_API_KEY;
    this.secretKey = IPFS_CONFIG.PINATA_SECRET_KEY;
    this.jwtToken = IPFS_CONFIG.PINATA_JWT;
    this.gateway = IPFS_CONFIG.IPFS_GATEWAY;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // ms
  }

  // Convert base64 image to file object
  async base64ToFile(base64String, filename = 'nft-image.png') {
    try {
      // Extract base64 data without the prefix
      const base64Data = base64String.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 string format');
      }
      
      // Convert base64 to binary
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i += 1024) {
        const slice = byteCharacters.slice(i, i + 1024);
        const byteNumbers = new Array(slice.length);
        
        for (let j = 0; j < slice.length; j++) {
          byteNumbers[j] = slice.charCodeAt(j);
        }
        
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      
      // Create file from binary data
      const blob = new Blob(byteArrays, { type: 'image/png' });
      return new File([blob], filename, { type: 'image/png' });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      throw error;
    }
  }

  // Convert URL image to file object
  async urlToFile(url, filename = 'nft-image.png') {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error converting URL to file:', error);
      throw error;
    }
  }

  // Upload file to IPFS with retry logic
  async uploadFileToIPFS(file) {
    let attempts = 0;
    
    while (attempts < this.retryAttempts) {
      try {
        console.log(`Uploading file to IPFS (attempt ${attempts + 1}/${this.retryAttempts})`);
        
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        
        // Call Pinata API
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.jwtToken}`
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Pinata API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('File uploaded to IPFS:', data);
        return data.IpfsHash;
      } catch (error) {
        console.error(`IPFS upload attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        if (attempts < this.retryAttempts) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          // Increase delay for next attempt
          this.retryDelay *= 2;
        } else {
          throw error;
        }
      }
    }
  }

  // Upload JSON metadata to IPFS
  async uploadJSONToIPFS(metadata) {
    let attempts = 0;
    
    while (attempts < this.retryAttempts) {
      try {
        console.log(`Uploading JSON to IPFS (attempt ${attempts + 1}/${this.retryAttempts})`, metadata);
        
        // Call Pinata API
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.jwtToken}`
          },
          body: JSON.stringify(metadata)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Pinata JSON API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('JSON uploaded to IPFS:', data);
        return data.IpfsHash;
      } catch (error) {
        console.error(`IPFS JSON upload attempt ${attempts + 1} failed:`, error);
        attempts++;
        
        if (attempts < this.retryAttempts) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          // Increase delay for next attempt
          this.retryDelay *= 2;
        } else {
          throw error;
        }
      }
    }
  }

  // Main method to upload image (from URL or base64) and return IPFS hash
  async uploadImage(imageSource) {
    try {
      console.log('Preparing image for IPFS upload');
      let file;
      
      if (imageSource.startsWith('data:')) {
        // Base64 image
        file = await this.base64ToFile(imageSource);
      } else {
        // URL image
        file = await this.urlToFile(imageSource);
      }
      
      // Upload to IPFS
      const ipfsHash = await this.uploadFileToIPFS(file);
      return ipfsHash;
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      throw error;
    }
  }

  // Upload metadata with image
  async uploadNFTData(name, description, imageSource) {
    try {
      // First upload the image
      const imageHash = await this.uploadImage(imageSource);
      
      // Then create and upload metadata
      const metadata = {
        name,
        description,
        image: `ipfs://${imageHash}`
      };
      
      const metadataHash = await this.uploadJSONToIPFS(metadata);
      
      return {
        metadataHash,
        imageHash,
        tokenURI: `ipfs://${metadataHash}`
      };
    } catch (error) {
      console.error('Error uploading NFT data:', error);
      throw error;
    }
  }

  // Get gateway URL for an IPFS hash
  getIPFSGatewayURL(ipfsHash) {
    // Remove ipfs:// prefix if present
    if (ipfsHash.startsWith('ipfs://')) {
      ipfsHash = ipfsHash.substring(7);
    }
    
    return `${this.gateway}${ipfsHash}`;
  }
}

const ipfsUploader = new IPFSUploader();
export default ipfsUploader;