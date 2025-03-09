// imageGenerator.js - Simplified with shorter fallback image generation

class ImageGenerator {
  constructor() {
    // API keys - hardcoded to avoid import issues
    this.hfApiKey = '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';
    this.avalaiApiKey = 'aa-jZRY4oEb6yZiOxgeLSnnOghsKPpz7EMRuv87Z4jjJwPiQxlm';
    
    // Models
    this.defaultModel = 'stabilityai/stable-diffusion-xl-base-1.0';
    this.cartoonModels = ['Linaqruf/animagine-xl', 'stablediffusionapi/disney-pixar-cartoon'];
    
    // Parameters
    this.params = {
      width: 512,
      height: 512,
      num_inference_steps: 15,
      guidance_scale: 7.0,
      negative_prompt: "blurry, ugly, bad anatomy, distorted, low quality"
    };
    
    // Fallback images (much shorter URLs)
    this.fallbackImages = [
      'https://i.imgur.com/ZLqt1gg.jpg',
      'https://i.imgur.com/wgGNMHt.jpg',
      'https://i.imgur.com/RizkZJL.jpg',
      'https://i.imgur.com/OyOdEJF.jpg',
      'https://i.imgur.com/jIbWr7W.jpg'
    ];
  }

  // Main generate method that tries all options and always returns an image
  async generateImage(prompt, style = "default") {
    console.log(`Generating ${style} image for prompt: ${prompt}`);
    
    try {
      // First try Hugging Face API
      return await this.generateImageHF(prompt, style);
    } catch (hfError) {
      console.warn('Hugging Face image generation failed:', hfError);
      
      try {
        // Then try AvalAI
        return await this.generateImageAvalAI(prompt);
      } catch (avalaiError) {
        console.warn('AvalAI image generation failed:', avalaiError);
        
        try {
          // If both fail, generate a text-based image
          return this.generateTextImage(prompt);
        } catch (textImageError) {
          console.warn('Text image generation failed:', textImageError);
          
          // Last resort: return a random fallback image
          return this.getRandomFallbackImage();
        }
      }
    }
  }

  // Generate an image from a prompt using Hugging Face API
  async generateImageHF(prompt, style = "default") {
    try {
      console.log(`Generating ${style} image with Hugging Face for prompt: ${prompt}`);
      
      // Select model based on style
      let modelToUse = this.defaultModel;
      if (style === "cartoon" && this.cartoonModels.length > 0) {
        modelToUse = this.cartoonModels[0];
        // Add cartoon-specific terms to the prompt
        prompt = `${prompt}, cartoon style, animated, cute character, vibrant colors`;
      }
      
      // Prepare the data for the API request
      const data = {
        inputs: prompt,
        parameters: {
          ...this.params,
          guidance_scale: 7.5,
          num_inference_steps: 20
        },
        options: {
          use_cache: false,
          wait_for_model: true
        }
      };
      
      // Make the API request to Hugging Face
      const response = await fetch(`https://api-inference.huggingface.co/models/${modelToUse}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Get the image data as blob
      const blob = await response.blob();
      
      // Convert blob to base64 data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating image with Hugging Face:', error);
      throw error;
    }
  }

  // Generate an image from a prompt using AvalAI API
  async generateImageAvalAI(prompt) {
    try {
      console.log(`Generating image with AvalAI for prompt: ${prompt}`);
      
      // Prepare the data for the API request
      const data = {
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: "512x512",
        quality: "standard"
      };
      
      // Make the API request to AvalAI
      const response = await fetch(`https://api.avalai.ir/v1/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.avalaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AvalAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData && responseData.data && responseData.data.length > 0) {
        return responseData.data[0].url || responseData.data[0].b64_json;
      } else {
        throw new Error('No image data returned from AvalAI');
      }
    } catch (error) {
      console.error('Error generating image with AvalAI:', error);
      throw error;
    }
  }

  // Generate text-based image with the NFT name
  generateTextImage(nftName) {
    try {
      console.log("Generating text-based image for:", nftName);
      
      // Extract NFT name from the prompt or use a default
      if (nftName.includes(',')) {
        nftName = nftName.split(',')[0].trim();
      }
      if (nftName.length > 30) {
        nftName = nftName.substring(0, 30) + "...";
      }
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      
      const ctx = canvas.getContext('2d');
      
      // Create a vibrant background with random colors
      const colors = [
        ['#6c5ce7', '#fd79a8'], // Purple to pink
        ['#0984e3', '#00cec9'], // Blue to cyan
        ['#d63031', '#fdcb6e'], // Red to yellow
        ['#6ab04c', '#badc58'], // Green to light green
        ['#e84393', '#74b9ff']  // Pink to light blue
      ];
      
      const randomColorPair = colors[Math.floor(Math.random() * colors.length)];
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, randomColorPair[0]);
      gradient.addColorStop(1, randomColorPair[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add some geometric shapes for visual interest
      for (let i = 0; i < 20; i++) {
        const size = Math.random() * 100 + 50;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.globalAlpha = Math.random() * 0.3 + 0.1;
        
        // Choose random shape
        const shape = Math.floor(Math.random() * 3);
        
        if (shape === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(x, y, size/2, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
        } else if (shape === 1) {
          // Square
          ctx.fillStyle = 'white';
          ctx.fillRect(x - size/2, y - size/2, size, size);
        } else {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(x, y - size/2);
          ctx.lineTo(x + size/2, y + size/2);
          ctx.lineTo(x - size/2, y + size/2);
          ctx.closePath();
          ctx.fillStyle = 'white';
          ctx.fill();
        }
      }
      
      // Reset alpha
      ctx.globalAlpha = 1;
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      
      // Add NFT name
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap text to fit canvas
      const text = nftName || 'AI Generated NFT';
      const maxWidth = 450;
      const lineHeight = 50;
      const words = text.split(' ');
      let line = '';
      let y = canvas.height / 2 - ((words.length - 1) * lineHeight) / 2;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
      
      // Add "NFT" text at the bottom
      ctx.font = 'bold 30px Arial';
      ctx.fillText('NFT on Monad', canvas.width / 2, canvas.height - 60);
      
      // Add decorative border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      // Return data URL
      return canvas.toDataURL('image/png');
    } catch (canvasError) {
      console.error("Error generating canvas image:", canvasError);
      throw canvasError;
    }
  }

  // Get a random fallback image URL
  getRandomFallbackImage() {
    const index = Math.floor(Math.random() * this.fallbackImages.length);
    return this.fallbackImages[index];
  }
}

// Create instance and make it available globally
const imageGenerator = new ImageGenerator();
window.imageGenerator = imageGenerator;

export default imageGenerator;