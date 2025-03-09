import web3Service from '../src/web3.js';

class LeaderboardComponent {
  constructor() {
    this.leaderboardElement = document.getElementById('leaderboardTab');
    this.isInitialized = false;
    this.topSenders = [];
    this.topReceivers = [];
    this.initialized = false;
  }

  /**
   * Initialize the leaderboard component
   */
  async initialize() {
    if (this.initialized) return;
    
    // Create leaderboard UI if it doesn't exist
    if (!this.leaderboardElement) {
      this.createLeaderboardUI();
    }
    
    // Set initialized flag
    this.initialized = true;
    
    // Load leaderboard data
    await this.loadLeaderboardData();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Create leaderboard UI elements
   */
  createLeaderboardUI() {
    // Create leaderboard tab if it doesn't exist
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer.querySelector('[data-tab="leaderboardTab"]')) {
      const leaderboardTabBtn = document.createElement('button');
      leaderboardTabBtn.classList.add('tab-btn');
      leaderboardTabBtn.setAttribute('data-tab', 'leaderboardTab');
      leaderboardTabBtn.textContent = 'Leaderboard';
      tabsContainer.appendChild(leaderboardTabBtn);
    }
    
    // Create leaderboard content container if it doesn't exist
    if (!document.getElementById('leaderboardTab')) {
      const mainContainer = document.querySelector('.tab-content');
      
      this.leaderboardElement = document.createElement('div');
      this.leaderboardElement.id = 'leaderboardTab';
      this.leaderboardElement.className = 'tab-pane';
      
      this.leaderboardElement.innerHTML = `
        <div class="leaderboard-container">
          <h2>NFT Messaging Leaderboard</h2>
          
          <div class="leaderboard-refresh">
            <button id="refreshLeaderboard" class="btn">Refresh Leaderboard</button>
          </div>
          
          <div class="leaderboard-sections">
            <div class="leaderboard-section">
              <h3>Top Message Senders</h3>
              <div class="leaderboard-list" id="topSendersList">
                <div class="leaderboard-loading">Loading top senders...</div>
              </div>
            </div>
            
            <div class="leaderboard-section">
              <h3>Top Message Receivers</h3>
              <div class="leaderboard-list" id="topReceiversList">
                <div class="leaderboard-loading">Loading top receivers...</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      mainContainer.appendChild(this.leaderboardElement);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const refreshBtn = document.getElementById('refreshLeaderboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadLeaderboardData());
    }
    
    // Add tab click handler
    const leaderboardTabBtn = document.querySelector('[data-tab="leaderboardTab"]');
    if (leaderboardTabBtn) {
      leaderboardTabBtn.addEventListener('click', () => {
        // Show leaderboard tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active');
        });
        leaderboardTabBtn.classList.add('active');
        
        // Show leaderboard content
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.remove('active');
        });
        this.leaderboardElement.classList.add('active');
        
        // Refresh data when tab is shown
        this.loadLeaderboardData();
      });
    }
  }

  /**
   * Load leaderboard data from the smart contract
   */
  async loadLeaderboardData() {
    try {
      // Show loading indicators
      document.getElementById('topSendersList').innerHTML = '<div class="leaderboard-loading">Loading top senders...</div>';
      document.getElementById('topReceiversList').innerHTML = '<div class="leaderboard-loading">Loading top receivers...</div>';
      
      // Get top sender from contract
      const topSender = await web3Service.getTopSender();
      const topSenderCount = await web3Service.getSentMessagesCount(topSender);
      
      // Get top receiver from contract
      const topReceiver = await web3Service.getTopReceiver();
      const topReceiverCount = await web3Service.getReceivedMessagesCount(topReceiver);
      
      // Render top senders list
      this.renderTopSenders([
        { address: topSender, count: topSenderCount }
      ]);
      
      // Render top receivers list
      this.renderTopReceivers([
        { address: topReceiver, count: topReceiverCount }
      ]);
      
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      
      // Show error message
      document.getElementById('topSendersList').innerHTML = '<div class="leaderboard-error">Error loading data</div>';
      document.getElementById('topReceiversList').innerHTML = '<div class="leaderboard-error">Error loading data</div>';
    }
  }

  /**
   * Render top senders list
   * @param {Array} senders - List of top senders with address and count
   */
  renderTopSenders(senders) {
    const topSendersList = document.getElementById('topSendersList');
    
    if (senders.length === 0) {
      topSendersList.innerHTML = '<div class="leaderboard-empty">No message senders yet</div>';
      return;
    }
    
    let html = '<ol class="leaderboard-ranking">';
    
    senders.forEach((sender, index) => {
      if (sender.address === '0x0000000000000000000000000000000000000000') {
        return;
      }
      
      html += `
        <li class="leaderboard-item">
          <div class="leaderboard-rank">#${index + 1}</div>
          <div class="leaderboard-address">${web3Service.shortenAddress(sender.address)}</div>
          <div class="leaderboard-count">${sender.count} messages sent</div>
        </li>
      `;
    });
    
    html += '</ol>';
    topSendersList.innerHTML = html;
  }

  /**
   * Render top receivers list
   * @param {Array} receivers - List of top receivers with address and count
   */
  renderTopReceivers(receivers) {
    const topReceiversList = document.getElementById('topReceiversList');
    
    if (receivers.length === 0) {
      topReceiversList.innerHTML = '<div class="leaderboard-empty">No message receivers yet</div>';
      return;
    }
    
    let html = '<ol class="leaderboard-ranking">';
    
    receivers.forEach((receiver, index) => {
      if (receiver.address === '0x0000000000000000000000000000000000000000') {
        return;
      }
      
      html += `
        <li class="leaderboard-item">
          <div class="leaderboard-rank">#${index + 1}</div>
          <div class="leaderboard-address">${web3Service.shortenAddress(receiver.address)}</div>
          <div class="leaderboard-count">${receiver.count} messages received</div>
        </li>
      `;
    });
    
    html += '</ol>';
    topReceiversList.innerHTML = html;
  }
}

export default new LeaderboardComponent();