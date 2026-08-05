// Interactive Simulators for Load Balancer and SLO Calculator

class LoadBalancerSim {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Servers Setup
    this.servers = [
      { id: 'A', name: 'Server-Alpha', x: 150, y: 350, status: 'online', weight: 1, activeConns: 0, color: '#3b82f6', latency: 300, totalProcessed: 0, failed: 0 },
      { id: 'B', name: 'Server-Beta', x: 400, y: 350, status: 'online', weight: 1, activeConns: 0, color: '#10b981', latency: 600, totalProcessed: 0, failed: 0 },
      { id: 'C', name: 'Server-Gamma', x: 650, y: 350, status: 'online', weight: 1, activeConns: 0, color: '#8b5cf6', latency: 450, totalProcessed: 0, failed: 0 }
    ];
    
    // Load Balancer Node
    this.lb = { x: 400, y: 150 };
    
    // Clients
    this.clients = [
      { x: 200, y: 50 },
      { x: 400, y: 50 },
      { x: 600, y: 50 }
    ];
    
    // Animation Arrays
    this.particles = [];
    this.algorithm = 'round-robin'; // 'round-robin', 'least-conn', 'random'
    this.trafficRate = 0; // 0 = off, 1 = slow, 2 = medium, 3 = fast
    this.trafficInterval = null;
    this.lastServerIndex = 0;
    
    // Statistics
    this.stats = {
      totalRequests: 0,
      successful: 0,
      failed: 0
    };
    
    // Initialize Resize & Rendering
    this.setupListeners();
    this.animate();
  }
  
  setupListeners() {
    // UI controls mapping
    const algSelect = document.getElementById('lb-algorithm');
    if (algSelect) {
      algSelect.addEventListener('change', (e) => {
        this.algorithm = e.target.value;
      });
    }
    
    const rateSelect = document.getElementById('traffic-rate');
    if (rateSelect) {
      rateSelect.addEventListener('change', (e) => {
        this.setTrafficRate(parseInt(e.target.value, 10));
      });
    }
    
    const sendBtn = document.getElementById('send-single-req');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.spawnRequest();
      });
    }
    
    const resetBtn = document.getElementById('reset-lb-stats');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetStats();
      });
    }
    
    // Set up Server configuration changes via dynamic button clicks
    this.servers.forEach(server => {
      const toggleBtn = document.getElementById(`toggle-server-${server.id.toLowerCase()}`);
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          if (server.status === 'online') {
            server.status = 'offline';
            toggleBtn.textContent = 'Revive Server';
            toggleBtn.classList.remove('bg-emerald-500');
            toggleBtn.classList.add('bg-rose-500');
          } else {
            server.status = 'online';
            toggleBtn.textContent = 'Fail Server';
            toggleBtn.classList.remove('bg-rose-500');
            toggleBtn.classList.add('bg-emerald-500');
          }
        });
      }
      
      const latencySelect = document.getElementById(`latency-server-${server.id.toLowerCase()}`);
      if (latencySelect) {
        latencySelect.addEventListener('change', (e) => {
          server.latency = parseInt(e.target.value, 10);
        });
      }
    });
  }
  
  setTrafficRate(rate) {
    this.trafficRate = rate;
    if (this.trafficInterval) {
      clearInterval(this.trafficInterval);
      this.trafficInterval = null;
    }
    
    if (rate === 1) { // Slow
      this.trafficInterval = setInterval(() => this.spawnRequest(), 1200);
    } else if (rate === 2) { // Medium
      this.trafficInterval = setInterval(() => this.spawnRequest(), 500);
    } else if (rate === 3) { // Fast
      this.trafficInterval = setInterval(() => this.spawnRequest(), 150);
    }
  }
  
  resetStats() {
    this.stats.totalRequests = 0;
    this.stats.successful = 0;
    this.stats.failed = 0;
    this.servers.forEach(s => {
      s.totalProcessed = 0;
      s.failed = 0;
      s.activeConns = 0;
    });
    this.particles = [];
    this.updateStatsUI();
  }
  
  spawnRequest() {
    // Pick random client
    const client = this.clients[Math.floor(Math.random() * this.clients.length)];
    
    // Create request particle: Client -> Load Balancer
    this.particles.push({
      x: client.x,
      y: client.y,
      targetX: this.lb.x,
      targetY: this.lb.y,
      phase: 1, // Phase 1: client to LB. Phase 2: LB to Server. Phase 3: Server return to Client.
      speed: 4,
      color: '#e2e8f0',
      serverId: null,
      success: true,
      clientOrigin: client
    });
  }
  
  selectServer() {
    const onlineServers = this.servers.filter(s => s.status === 'online');
    // If all servers are down, we route to a server anyway but it will fail
    const targetServers = this.servers;
    
    if (this.algorithm === 'round-robin') {
      let index = this.lastServerIndex;
      this.lastServerIndex = (this.lastServerIndex + 1) % this.servers.length;
      return this.servers[index];
    } else if (this.algorithm === 'least-conn') {
      // Find server with fewest active connections
      let minConns = Infinity;
      let selected = this.servers[0];
      this.servers.forEach(s => {
        if (s.status === 'online' && s.activeConns < minConns) {
          minConns = s.activeConns;
          selected = s;
        }
      });
      // Fallback if all offline
      if (minConns === Infinity) {
        return this.servers[Math.floor(Math.random() * this.servers.length)];
      }
      return selected;
    } else { // Random
      return this.servers[Math.floor(Math.random() * this.servers.length)];
    }
  }
  
  updateStatsUI() {
    const totalEl = document.getElementById('lb-total-reqs');
    const successEl = document.getElementById('lb-success-reqs');
    const failedEl = document.getElementById('lb-failed-reqs');
    const rateEl = document.getElementById('lb-uptime-rate');
    
    if (totalEl) totalEl.textContent = this.stats.totalRequests;
    if (successEl) successEl.textContent = this.stats.successful;
    if (failedEl) failedEl.textContent = this.stats.failed;
    
    if (rateEl) {
      if (this.stats.totalRequests === 0) {
        rateEl.textContent = '100.00%';
        rateEl.style.color = '#10b981';
      } else {
        const rate = (this.stats.successful / this.stats.totalRequests) * 100;
        rateEl.textContent = `${rate.toFixed(2)}%`;
        if (rate >= 99) {
          rateEl.style.color = '#10b981';
        } else if (rate >= 90) {
          rateEl.style.color = '#f59e0b';
        } else {
          rateEl.style.color = '#ef4444';
        }
      }
    }
    
    // Update individual server counters in HTML
    this.servers.forEach(s => {
      const activeEl = document.getElementById(`server-${s.id.toLowerCase()}-active`);
      const totalEl = document.getElementById(`server-${s.id.toLowerCase()}-processed`);
      const errEl = document.getElementById(`server-${s.id.toLowerCase()}-errors`);
      const nodeStatus = document.getElementById(`server-node-status-${s.id.toLowerCase()}`);
      
      if (activeEl) activeEl.textContent = s.activeConns;
      if (totalEl) totalEl.textContent = s.totalProcessed;
      if (errEl) errEl.textContent = s.failed;
      if (nodeStatus) {
        if (s.status === 'online') {
          nodeStatus.textContent = 'ONLINE';
          nodeStatus.className = 'text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400';
        } else {
          nodeStatus.textContent = 'OFFLINE';
          nodeStatus.className = 'text-xs px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-400';
        }
      }
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.drawConnections();
    this.drawNodes();
    this.updateAndDrawParticles();
  }
  
  drawConnections() {
    this.ctx.lineWidth = 2;
    
    // Clients to LB
    this.clients.forEach(c => {
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.beginPath();
      this.ctx.moveTo(c.x, c.y);
      this.ctx.lineTo(this.lb.x, this.lb.y);
      this.ctx.stroke();
    });
    
    // LB to Servers
    this.servers.forEach(s => {
      this.ctx.strokeStyle = s.status === 'online' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(239, 68, 68, 0.2)';
      this.ctx.beginPath();
      this.ctx.moveTo(this.lb.x, this.lb.y);
      this.ctx.lineTo(s.x, s.y);
      this.ctx.stroke();
    });
  }
  
  drawNodes() {
    // Draw Clients
    this.clients.forEach((c, index) => {
      this.ctx.fillStyle = '#64748b';
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '10px Inter';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Client ${index + 1}`, c.x, c.y - 15);
    });
    
    // Draw Load Balancer
    const pulseRadius = 24 + Math.sin(Date.now() / 150) * 2;
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    this.ctx.beginPath();
    this.ctx.arc(this.lb.x, this.lb.y, pulseRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#3b82f6';
    this.ctx.beginPath();
    this.ctx.arc(this.lb.x, this.lb.y, 18, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 11px Inter';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LB', this.lb.x, this.lb.y + 4);
    
    // Draw Servers
    this.servers.forEach(s => {
      // Glow Ring if active
      if (s.activeConns > 0 && s.status === 'online') {
        const glow = 25 + Math.sin(Date.now() / 100) * 4;
        this.ctx.fillStyle = `${s.color}15`;
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, glow, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Node circle
      this.ctx.fillStyle = s.status === 'online' ? s.color : '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, 22, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Label text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px Inter';
      this.ctx.fillText(s.id, s.x, s.y + 4);
      
      // Secondary server descriptions
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.font = '10px Inter';
      this.ctx.fillText(`${s.name}`, s.x, s.y + 38);
      
      const details = s.status === 'online' ? `${s.latency}ms latency` : 'DOWN (500 Error)';
      this.ctx.fillStyle = s.status === 'online' ? '#64748b' : '#f87171';
      this.ctx.fillText(details, s.x, s.y + 50);
    });
  }
  
  updateAndDrawParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Move particle towards target
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < p.speed) {
        // Arrived at target! Trigger next phase
        if (p.phase === 1) {
          // Arrived at Load Balancer. Route to a server.
          const server = this.selectServer();
          p.serverId = server.id;
          p.targetX = server.x;
          p.targetY = server.y;
          p.phase = 2;
          p.color = '#38bdf8'; // Routing color
          
          this.stats.totalRequests++;
          server.totalProcessed++;
          
          if (server.status === 'online') {
            server.activeConns++;
            p.success = true;
          } else {
            p.success = false;
            p.color = '#ef4444'; // Error color
          }
          
          this.updateStatsUI();
        } else if (p.phase === 2) {
          // Arrived at Server! Process logic.
          const server = this.servers.find(s => s.id === p.serverId);
          
          if (p.success) {
            // Server completes work after its simulated latency.
            // Move back returning to client.
            p.phase = 3;
            p.targetX = p.clientOrigin.x;
            p.targetY = p.clientOrigin.y;
            p.color = '#10b981'; // Success response color
            
            setTimeout(() => {
              if (server) {
                server.activeConns = Math.max(0, server.activeConns - 1);
                this.updateStatsUI();
              }
            }, server.latency);
          } else {
            // Server failed immediately. Return error.
            p.phase = 3;
            p.targetX = p.clientOrigin.x;
            p.targetY = p.clientOrigin.y;
            p.color = '#f87171'; // Error response color
            server.failed++;
            this.stats.failed++;
            this.updateStatsUI();
          }
        } else if (p.phase === 3) {
          // Returned back to client. Complete lifecycle.
          if (p.success) {
            this.stats.successful++;
          }
          this.updateStatsUI();
          this.particles.splice(i, 1);
        }
      } else {
        // Advance position
        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;
        
        // Draw particle
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.phase === 3 ? 5 : 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}

// SLO Calculator Engine
function initSLOCalculator() {
  const targetSlider = document.getElementById('slo-target-slider');
  const targetInput = document.getElementById('slo-target-val');
  const requestsInput = document.getElementById('slo-requests-input');
  const errorCountInput = document.getElementById('slo-current-errors');
  
  // Output nodes
  const budgetValEl = document.getElementById('slo-budget-percentage');
  const allowedDowntimeDay = document.getElementById('slo-downtime-day');
  const allowedDowntimeWeek = document.getElementById('slo-downtime-week');
  const allowedDowntimeMonth = document.getElementById('slo-downtime-month');
  const allowedDowntimeYear = document.getElementById('slo-downtime-year');
  const reqBudgetEl = document.getElementById('slo-req-budget');
  const burnedBudgetEl = document.getElementById('slo-budget-burned');
  const statusEl = document.getElementById('slo-status-verdict');
  
  if (!targetSlider) return;

  function calculateSLO() {
    const sloTarget = parseFloat(targetInput.value);
    const monthlyRequests = parseInt(requestsInput.value, 10) || 1000000;
    const currentErrors = parseInt(errorCountInput.value, 10) || 0;
    
    const errorBudgetPercent = 100 - sloTarget;
    budgetValEl.textContent = `${errorBudgetPercent.toFixed(4)}%`;
    
    // Downtime Calculations (Seconds in Day = 86400, Week = 604800, Month(30) = 2592000, Year(365) = 31536000)
    const formatDowntime = (seconds) => {
      if (seconds < 60) return `${seconds.toFixed(1)} sec`;
      const mins = seconds / 60;
      if (mins < 60) return `${mins.toFixed(1)} min`;
      const hrs = mins / 60;
      if (hrs < 24) return `${hrs.toFixed(1)} hrs`;
      const days = hrs / 24;
      return `${days.toFixed(1)} days`;
    };
    
    const budgetFraction = errorBudgetPercent / 100;
    allowedDowntimeDay.textContent = formatDowntime(86400 * budgetFraction);
    allowedDowntimeWeek.textContent = formatDowntime(604800 * budgetFraction);
    allowedDowntimeMonth.textContent = formatDowntime(2592000 * budgetFraction);
    allowedDowntimeYear.textContent = formatDowntime(31536000 * budgetFraction);
    
    // Error budget quantity (requests)
    const allowedErrorCount = Math.floor(monthlyRequests * budgetFraction);
    reqBudgetEl.textContent = allowedErrorCount.toLocaleString();
    
    // Burned calculations
    const burnedPercent = (currentErrors / allowedErrorCount) * 100;
    burnedBudgetEl.textContent = isNaN(burnedPercent) ? '0.0%' : `${burnedPercent.toFixed(1)}%`;
    
    // Verdict
    if (currentErrors > allowedErrorCount) {
      statusEl.textContent = 'DEPLOY FREEZE! Error budget is exhausted. Focus entirely on stability and hotfixes.';
      statusEl.className = 'p-3 rounded-lg text-sm font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30';
    } else if (burnedPercent >= 75) {
      statusEl.textContent = 'CRITICAL WARNING: Over 75% of your monthly budget is burned. Limit risky deploys.';
      statusEl.className = 'p-3 rounded-lg text-sm font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30';
    } else if (burnedPercent >= 50) {
      statusEl.textContent = 'CAUTION: 50% budget consumed. Alert thresholds adjusted. Monitor release quality closely.';
      statusEl.className = 'p-3 rounded-lg text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30';
    } else {
      statusEl.textContent = 'HEALTHY: System is operating well within reliability tolerances. Feature velocity allowed.';
      statusEl.className = 'p-3 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
  }
  
  targetSlider.addEventListener('input', (e) => {
    targetInput.value = e.target.value;
    calculateSLO();
  });
  
  targetInput.addEventListener('input', (e) => {
    targetSlider.value = e.target.value;
    calculateSLO();
  });
  
  requestsInput.addEventListener('input', calculateSLO);
  errorCountInput.addEventListener('input', calculateSLO);
  
  // Run initial calculation
  calculateSLO();
}

// Initializer export
if (typeof window !== 'undefined') {
  window.LoadBalancerSim = LoadBalancerSim;
  window.initSLOCalculator = initSLOCalculator;
}
