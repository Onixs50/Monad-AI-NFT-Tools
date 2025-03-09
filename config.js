// Configuration and constants for the AI NFT platform

// Contract details
export const CONTRACT_ADDRESS = '0xF50abE4a59cB1AbA0F5dAE19a7e8b3D8858Cc011';

// Network configuration
export const NETWORK_CONFIG = {
  MONAD_TESTNET_ID: '0x279f', // 10143 in decimal
  MONAD_RPC_URL: 'https://testnet-rpc.monad.xyz',
  MONAD_CHAIN_PARAMS: {
    chainId: '0x279f',
    chainName: 'Monad Testnet',
    nativeCurrency: {
      name: 'MON',
      symbol: 'MON',
      decimals: 18
    },
    rpcUrls: [
      'https://testnet-rpc.monad.xyz',
      'wss://monad-testnet.drpc.org',
      'https://monad-testnet.drpc.org',
      'https://10143.rpc.thirdweb.com',
      'https://testnet-rpc2.monad.xyz'
    ],
    blockExplorerUrls: ['https://testnet.monadexplorer.com/']
  }
};

// Image generation APIs
export const IMAGE_GENERATION = {
  // Hugging Face configuration
  HF_API_KEY: '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',
  HF_IMAGE_MODEL: 'stabilityai/stable-diffusion-xl-base-1.0',
  
  // AvalAI configuration
  AVALAI_API_KEY: 'aa-jZRY4oEb6yZiOxgeLSnnOghsKPpz7EMRuv87Z4jjJwPiQxlm',
  AVALAI_API_URL: 'https://api.avalai.ir/v1',
  
  // Image generation parameters
  IMAGE_PARAMS: {
    width: 512,
    height: 512,
    num_inference_steps: 15, // Lower for faster generation
    guidance_scale: 7.0,
    negative_prompt: "blurry, ugly, bad anatomy, distorted, low quality"
  },
  
  // Cartoon/Anime models
  CARTOON_MODELS: [
    'Linaqruf/animagine-xl',
    'stablediffusionapi/disney-pixar-cartoon'
  ]
};

// IPFS configuration
export const IPFS_CONFIG = {
  PINATA_API_KEY: '341e9a96ef1294b0f188',
  PINATA_SECRET_KEY: '3be8a56599974c876d3d3b718d5217ae9e6bc2ada877e8127e5491438d5744f5',
  PINATA_JWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhNmRkMDM1MS00MjE4LTQxNjItOTNkMC1mYjQ3MzNjODg4ZmQiLCJlbWFpbCI6InNhZGVnaHNzNTBAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjM0MWU5YTk2ZWYxMjk0YjBmMTg4Iiwic2NvcGVkS2V5U2VjcmV0IjoiM2JlOGE1NjU5OTk3NGM4NzZkM2QzYjcxOGQ1MjE3YWU5ZTZiYzJhZGE4NzdlODEyN2U1NDkxNDM4ZDU3NDRmNSIsImV4cCI6MTc3MjkxNjgyOX0.fzaFQAMom-CLe7vl6qc6zDy63-L5mEE-B4ypDr8zAF4',
  IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/'
};

// UI/UX settings
export const UI_CONFIG = {
  AUTO_PROMPTS: {
    abstract: [
      "Colorful abstract digital waves flowing through cyberspace",
      "Geometric patterns merging with organic forms",
      "Fractal landscapes with vibrant color gradients",
      "Abstract digital neurons connecting in a neural network"
    ],
    futuristic: [
      "Advanced AI robot with glowing circuits",
      "Futuristic cityscape with flying vehicles",
      "Cybernetic enhancements on a humanoid figure",
      "Quantum computer visualization in a digital realm"
    ],
    nature: [
      "Digital forest with data stream leaves",
      "Crystal mountains with binary code rivers",
      "Biomechanical flowers blooming in a tech garden",
      "Sacred geometry integrated into natural landscapes"
    ],
    space: [
      "Cosmic nebula with blockchain constellations",
      "Space station orbiting a digital planet",
      "Astronaut exploring the crypto universe",
      "Interstellar gateway to parallel blockchain worlds"
    ],
    cyberpunk: [
      "Neon-lit hacker in a virtual reality interface",
      "Cyberpunk street scene with holographic advertisements",
      "Digital rebel with augmented reality implants",
      "Dystopian cityscape with glitching reality"
    ],
    cartoon: [
      "Cute cartoon character with big eyes and colorful outfit",
      "Animated landscape with stylized trees and mountains",
      "Whimsical cartoon animal in a fantasy setting",
      "Cheerful cartoon robot with friendly features",
      "Pixar-style 3D character with expressive face"
    ]
  },
  NFT_MODIFIERS: [
    "vibrant colors", 
    "digital art", 
    "NFT style", 
    "Monad blockchain art", 
    "detailed"
  ],
  LOADER_TIMEOUT: 1500
};

export default {
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  IMAGE_GENERATION,
  IPFS_CONFIG,
  UI_CONFIG
};