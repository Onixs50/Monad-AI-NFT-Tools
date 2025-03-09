// Animation script for the AI NFT Platform

// SVG definitions - these replace image dependencies
const svgIcons = {
    wallet: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4z"></path></svg>`,
    
    nft: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,
    
    message: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    
    loading: `<svg viewBox="0 0 50 50" width="50" height="50"><circle cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="rgba(108, 92, 231, 0.8)" stroke-dasharray="100" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" dur="2s" from="0 25 25" to="360 25 25" repeatCount="indefinite"/></circle></svg>`,
    
    logo: `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="45" fill="rgba(108, 92, 231, 0.2)" stroke="rgba(108, 92, 231, 0.8)" stroke-width="2"/><path d="M30,30 L70,30 L70,70 L30,70 Z" fill="none" stroke="rgba(108, 92, 231, 0.8)" stroke-width="3"/><circle cx="40" cy="40" r="8" fill="rgba(253, 121, 168, 0.8)"/><circle cx="60" cy="60" r="8" fill="rgba(0, 184, 148, 0.8)"/><path d="M30,50 L70,50" stroke="white" stroke-width="2" stroke-dasharray="2"/><path d="M50,30 L50,70" stroke="white" stroke-width="2" stroke-dasharray="2"/></svg>`,
    
    placeholder: `<svg viewBox="0 0 200 200" width="200" height="200"><defs><linearGradient id="placeholderGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(108, 92, 231, 0.6)"/><stop offset="100%" stop-color="rgba(253, 121, 168, 0.6)"/></linearGradient></defs><rect width="200" height="200" fill="url(#placeholderGradient)"/><text x="100" y="100" font-family="Arial" font-size="14" fill="white" text-anchor="middle">NFT Image</text></svg>`,
    
    burn: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 5-9 10-9 16a9 9 0 1 0 18 0c0-6-9-11-9-16z"></path></svg>`
};

// Create SVG element from string
function createSvgElement(svgString) {
    const div = document.createElement('div');
    div.innerHTML = svgString.trim();
    return div.firstChild;
}

// Loading animation generator
class LoadingAnimation {
    constructor(parentElement, type = 'spinner') {
        this.parent = parentElement;
        this.type = type;
        this.element = null;
        this.create();
    }
    
    create() {
        const container = document.createElement('div');
        container.className = 'loading-animation';
        
        switch (this.type) {
            case 'dots':
                container.innerHTML = `
                    <div class="loading-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                `;
                break;
                
            case 'svg':
                container.appendChild(createSvgElement(svgIcons.loading));
                break;
                
            default: // spinner
                container.innerHTML = `<div class="loading-spinner"></div>`;
                break;
        }
        
        this.element = container;
        this.parent.appendChild(container);
    }
    
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
    }
}

// Add CSS for loading animations
function addLoadingStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .loading-animation {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100px;
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            border-top-color: rgba(108, 92, 231, 0.8);
            animation: spin 1s linear infinite;
        }
        
        .loading-dots {
            display: flex;
            justify-content: center;
        }
        
        .loading-dots .dot {
            width: 10px;
            height: 10px;
            margin: 0 5px;
            border-radius: 50%;
            background-color: rgba(108, 92, 231, 0.8);
            animation: pulse 1.5s ease-in-out infinite;
        }
        
        .loading-dots .dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .loading-dots .dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(0.5); opacity: 0.3; }
            50% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(styleEl);
}

// Call this function to add the loading styles
addLoadingStyles();

// Variables to handle animation and state
let animationId;
let textElements;
let nftGraphic;
let particles = [];
let connections = [];

// DOM Content Loaded - Replace all image elements with SVGs
document.addEventListener('DOMContentLoaded', () => {
    // Replace wallet icon
    const walletBtn = document.querySelector('#connectWallet');
    if (walletBtn) {
        walletBtn.innerHTML = svgIcons.wallet + '<span>Connect Wallet</span>';
    }
    
    // Setup loading animation for the main loader
    const loaderContainer = document.querySelector('.loader-container');
    if (loaderContainer) {
        // Clear any existing content
        loaderContainer.innerHTML = '';
        // Add SVG loader
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = svgIcons.loading;
        loaderContainer.appendChild(loader);
    }
    
    // Replace logo placeholder with SVG
    const logoPlaceholder = document.querySelector('.logo-placeholder');
    if (logoPlaceholder) {
        logoPlaceholder.innerHTML = svgIcons.logo;
    }
    
    // Add SVG icons to UI elements
    document.querySelectorAll('.fa-magic').forEach(icon => {
        const parent = icon.parentNode;
        parent.removeChild(icon);
        parent.insertAdjacentHTML('afterbegin', svgIcons.nft);
    });
    
    document.querySelectorAll('.fa-envelope, .fa-paper-plane').forEach(icon => {
        const parent = icon.parentNode;
        parent.removeChild(icon);
        parent.insertAdjacentHTML('afterbegin', svgIcons.message);
    });
    
    document.querySelectorAll('.fa-fire').forEach(icon => {
        const parent = icon.parentNode;
        parent.removeChild(icon);
        parent.insertAdjacentHTML('afterbegin', svgIcons.burn);
    });
    
    // Setup intro animation if needed
    setupIntroAnimation();
    
    // Add extra styles
    addExtraStyles();
});

// Setup intro animation if canvas element exists
function setupIntroAnimation() {
    const canvas = document.getElementById('introAnimation');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match window size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Update text positions when canvas is resized
        if (typeof textElements !== 'undefined' && textElements) {
            textElements[0].x = canvas.width / 2;
            textElements[0].y = canvas.height / 2 - 120;
            
            textElements[1].x = canvas.width / 2;
            textElements[1].y = canvas.height / 2 - 80;
            
            textElements[2].x = canvas.width / 2;
            textElements[2].y = canvas.height / 2 + 120;
        }
        
        // Update NFT graphic position
        if (typeof nftGraphic !== 'undefined' && nftGraphic) {
            nftGraphic.x = canvas.width / 2;
            nftGraphic.y = canvas.height / 2;
        }
    }

    // Initial setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 2;
            this.speedY = (Math.random() - 0.5) * 2;
            this.color = this.getRandomColor();
            this.opacity = Math.random() * 0.5 + 0.1;
            this.connectedParticles = [];
        }

        getRandomColor() {
            const colors = [
                '108, 92, 231', // primary color
                '162, 155, 254', // secondary color
                '253, 121, 168', // accent color
                '0, 184, 148',   // success color
                '253, 203, 110'  // warning color
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Connection animation between particles
    class Connection {
        constructor(particleA, particleB) {
            this.particleA = particleA;
            this.particleB = particleB;
            this.distance = this.calculateDistance();
            this.opacity = 0;
            this.active = false;
            this.activationDelay = Math.random() * 2000; // Random delay for connection appearance
            this.activationTime = Date.now() + this.activationDelay;
        }

        calculateDistance() {
            const dx = this.particleA.x - this.particleB.x;
            const dy = this.particleA.y - this.particleB.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        update() {
            this.distance = this.calculateDistance();
            
            // Check if it's time to activate this connection
            if (!this.active && Date.now() > this.activationTime) {
                this.active = true;
            }
            
            // Update opacity based on activation state
            if (this.active) {
                if (this.distance < 150 && this.opacity < 0.8) {
                    this.opacity += 0.01;
                } else if (this.distance >= 150 || this.distance < 30) {
                    this.opacity -= 0.01;
                }
            }
            
            this.opacity = Math.max(0, Math.min(0.8, this.opacity));
        }

        draw() {
            if (this.opacity <= 0) return;
            
            ctx.beginPath();
            ctx.moveTo(this.particleA.x, this.particleA.y);
            ctx.lineTo(this.particleB.x, this.particleB.y);
            
            // Create gradient for the line
            const gradient = ctx.createLinearGradient(
                this.particleA.x, this.particleA.y, 
                this.particleB.x, this.particleB.y
            );
            gradient.addColorStop(0, `rgba(${this.particleA.color}, ${this.opacity})`);
            gradient.addColorStop(1, `rgba(${this.particleB.color}, ${this.opacity})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Main NFT graphic (representing an NFT)
    class NFTGraphic {
        constructor() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.size = 80;
            this.rotation = 0;
            this.opacity = 0;
            this.active = false;
            this.activationTime = Date.now() + 2500; // Delay before NFT appears
            
            // Generate random colors for this NFT
            this.colors = {
                primary: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                secondary: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                accent: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
            };
        }

        update() {
            // Check if it's time to activate the NFT
            if (!this.active && Date.now() > this.activationTime) {
                this.active = true;
            }
            
            // Fade in
            if (this.active && this.opacity < 1) {
                this.opacity += 0.01;
            }
            
            // Rotate slowly
            this.rotation += 0.005;
            
            // Gentle floating movement
            this.y += Math.sin(Date.now() / 800) * 0.3;
        }

        draw() {
            if (this.opacity <= 0) return;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            
            // Draw NFT frame
            ctx.beginPath();
            ctx.rect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.fillStyle = 'rgba(30, 39, 46, 0.8)';
            ctx.strokeStyle = 'rgba(108, 92, 231, 0.8)';
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();
            
            // Draw NFT content (abstract art)
            this.drawNFTContent();
            
            // Draw glow effect
            ctx.shadowColor = 'rgba(108, 92, 231, 0.8)';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = 'rgba(108, 92, 231, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(-this.size/2 - 5, -this.size/2 - 5, this.size + 10, this.size + 10);
            
            ctx.restore();
        }
        
        drawNFTContent() {
            // Draw abstract art inside the NFT
            ctx.beginPath();
            ctx.arc(0, 0, this.size/3, 0, Math.PI * 2);
            ctx.fillStyle = this.colors.primary;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(-this.size/5, -this.size/5, this.size/6, 0, Math.PI * 2);
            ctx.fillStyle = this.colors.secondary;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(this.size/4, this.size/4, this.size/8, 0, Math.PI * 2);
            ctx.fillStyle = this.colors.accent;
            ctx.fill();
            
            // Draw some lines
            ctx.beginPath();
            ctx.moveTo(-this.size/2 + 10, -this.size/2 + 10);
            ctx.lineTo(this.size/2 - 10, this.size/2 - 10);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-this.size/2 + 10, this.size/2 - 10);
            ctx.lineTo(this.size/2 - 10, -this.size/2 + 10);
            ctx.stroke();
        }
    }

    // Create particles
    particles = [];
    const numParticles = Math.min(50, Math.floor(window.innerWidth / 30)); // Responsive number of particles
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }

    // Create connections between particles
    connections = [];
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            connections.push(new Connection(particles[i], particles[j]));
        }
    }

    // Create NFT graphic
    nftGraphic = new NFTGraphic();

    // Text elements for the animation
    textElements = [
        { text: "Welcome to", x: canvas.width / 2, y: canvas.height / 2 - 120, opacity: 0, delay: 500 },
        { text: "AI NFT Generator", x: canvas.width / 2, y: canvas.height / 2 - 80, opacity: 0, delay: 1000, fontSize: 34 },
        { text: "CREATE • MINT • SHARE", x: canvas.width / 2, y: canvas.height / 2 + 120, opacity: 0, delay: 1500 }
    ];

    // Animation start time
    const animationStartTime = Date.now();
    const animationDuration = 6000; // 6 seconds

    // Animation loop
    function animate() {
        // Clear canvas with semi-transparent background for trail effect
        ctx.fillStyle = 'rgba(26, 26, 46, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw connections
        connections.forEach(connection => {
            connection.update();
            connection.draw();
        });
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Update and draw NFT graphic
        nftGraphic.update();
        nftGraphic.draw();
        
        // Update and draw text elements
        textElements.forEach(element => {
            // Calculate opacity based on time
            const currentTime = Date.now();
            if (currentTime > animationStartTime + element.delay && element.opacity < 1) {
                element.opacity += 0.02;
            }
            
            // Draw text
            ctx.save();
            ctx.globalAlpha = element.opacity;
            ctx.font = `${element.fontSize || 24}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Add shadow for better visibility
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            ctx.fillText(element.text, element.x, element.y);
            ctx.restore();
        });
        
        // Continue animation
        animationId = requestAnimationFrame(animate);
        
        // Check if animation should end
        if (Date.now() - animationStartTime > animationDuration) {
            fadeOutAnimation();
        }
    }

    // Fade out animation
    function fadeOutAnimation() {
        canvas.style.opacity = canvas.style.opacity === '' ? 1 : parseFloat(canvas.style.opacity);
        
        if (canvas.style.opacity > 0) {
            canvas.style.opacity -= 0.02;
            setTimeout(fadeOutAnimation, 50);
        } else {
            // End animation and show main content
            cancelAnimationFrame(animationId);
            canvas.style.display = 'none';
            document.querySelector('.container').classList.add('visible');
        }
    }

    // Start animation
    animate();

    // Handle animation skip
    document.addEventListener('click', () => {
        if (canvas.style.display !== 'none') {
            cancelAnimationFrame(animationId);
            canvas.style.display = 'none';
            document.querySelector('.container').classList.add('visible');
        }
    });

    // Add key press handler to skip animation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
            if (canvas.style.display !== 'none') {
                cancelAnimationFrame(animationId);
                canvas.style.display = 'none';
                document.querySelector('.container').classList.add('visible');
            }
        }
    });
}

// Add extra styles for animations and SVGs
function addExtraStyles() {
    const extraStyles = document.createElement('style');
    extraStyles.textContent = `
        .pulse-animation {
            animation: pulse 0.8s ease-out;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .loader {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }
        
        .loader svg {
            width: 60px;
            height: 60px;
        }
        
        .fade-in {
            opacity: 0;
            animation: fadeIn 0.5s forwards;
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
        
        .bounce-in {
            transform: scale(0.8);
            opacity: 0;
            animation: bounceIn 0.5s forwards;
        }
        
        @keyframes bounceIn {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* SVG styling */
        .logo-placeholder svg {
            width: 50px;
            height: 50px;
        }
        
        #connectWallet svg {
            margin-right: 8px;
            vertical-align: middle;
        }
        
        .btn svg {
            vertical-align: middle;
            margin-right: 5px;
        }
        
        /* NFT placeholder */
        .nft-gallery .nft-item .placeholder-svg {
            width: 100%;
            height: 100%;
            min-height: 200px;
        }
    `;
    document.head.appendChild(extraStyles);
}

// Helper function to create placeholder NFT images
function createNFTPlaceholder(container) {
    container.innerHTML = svgIcons.placeholder;
    return container.firstChild;
}

// Helper function for wallet-related animations
function animateWalletConnection() {
    const walletBtn = document.querySelector('#connectWallet');
    if (walletBtn) {
        walletBtn.classList.add('pulse-animation');
        setTimeout(() => {
            walletBtn.classList.remove('pulse-animation');
        }, 1000);
    }
}

// Expose functions to window for use in HTML
window.LoadingAnimation = LoadingAnimation;
window.svgIcons = svgIcons;
window.createNFTPlaceholder = createNFTPlaceholder;
window.animateWalletConnection = animateWalletConnection;