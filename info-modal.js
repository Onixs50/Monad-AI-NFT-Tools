// info-modal.js - Handles the About This Project button and modal functionality

(function() {
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log("InfoModal: Initializing modal script");
        
        // Get DOM elements
        const infoModal = document.getElementById('infoModal');
        const openInfoBtn = document.getElementById('openInfoModal');
        const closeModalBtns = document.querySelectorAll('.close-info-modal, .close-modal');
        
        // Log element status for debugging
        console.log("InfoModal: Elements found:", {
            modal: infoModal ? true : false,
            button: openInfoBtn ? true : false,
            closeButtons: closeModalBtns.length
        });
        
        if (!infoModal || !openInfoBtn) {
            console.error("InfoModal: Required elements not found!");
            return;
        }
        
        // Make sure button is visible and styled correctly
        openInfoBtn.style.display = 'flex';
        
        // Add direct click handler to button
        openInfoBtn.onclick = function(e) {
            e.preventDefault();
            console.log("InfoModal: Button clicked");
            infoModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        };
        
        // Setup close buttons
        closeModalBtns.forEach(btn => {
            btn.onclick = function() {
                console.log("InfoModal: Close button clicked");
                infoModal.style.display = 'none';
                document.body.style.overflow = ''; // Restore scrolling
            };
        });
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target === infoModal) {
                console.log("InfoModal: Clicked outside modal");
                infoModal.style.display = 'none';
                document.body.style.overflow = ''; // Restore scrolling
            }
        };
        
        // Add ESC key support
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && infoModal.style.display === 'block') {
                console.log("InfoModal: ESC key pressed");
                infoModal.style.display = 'none';
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
        
        console.log("InfoModal: Setup complete");
        
        // Auto-show on first visit (optional)
        if (!localStorage.getItem('infoModalShown')) {
            console.log("InfoModal: First visit, showing automatically");
            setTimeout(() => {
                infoModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                localStorage.setItem('infoModalShown', 'true');
            }, 2000);
        }
    });
    
    // Backup initialization for cases where DOMContentLoaded already fired
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log("InfoModal: Backup initialization (page already loaded)");
        setTimeout(initBackup, 500);
    }
    
    function initBackup() {
        const infoModal = document.getElementById('infoModal');
        const openInfoBtn = document.getElementById('openInfoModal');
        
        if (!infoModal || !openInfoBtn) {
            console.error("InfoModal: Elements not found in backup init");
            return;
        }
        
        // Ensure button is visible
        openInfoBtn.style.display = 'flex';
        
        // Direct handler as backup
        openInfoBtn.onclick = function() {
            infoModal.style.display = 'block';
        };
    }
})();