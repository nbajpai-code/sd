// Main App Controller - Tab Navigation, Search, and Event Wiring

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Global Components
  initTabs();
  initSearch();
  renderLibrary();
  renderMuseum();
  renderProdverbs();
  renderChecklist();
  
  // Initialize Simulators & Games
  if (window.LoadBalancerSim) {
    window.lbSimulator = new window.LoadBalancerSim('lb-canvas');
  }
  if (window.initSLOCalculator) {
    window.initSLOCalculator();
  }
  if (window.IncidentSimulator) {
    window.incidentSim = new window.IncidentSimulator('incident-sim-container');
  }
  
  // Live Header Uptime Simulation
  animateLiveUptime();
});

// Tab Routing & Screen Switching
function initTabs() {
  const tabs = document.querySelectorAll('[data-tab]');
  const screens = document.querySelectorAll('.tab-screen');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetScreenId = tab.getAttribute('data-tab');
      
      // Update Tab CSS
      tabs.forEach(t => {
        t.classList.remove('bg-blue-600', 'text-white', 'font-semibold');
        t.classList.add('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/40');
      });
      tab.classList.add('bg-blue-600', 'text-white', 'font-semibold');
      tab.classList.remove('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/40');
      
      // Update Screen Visibility
      screens.forEach(screen => {
        if (screen.id === `${targetScreenId}-screen`) {
          screen.classList.remove('hidden');
        } else {
          screen.classList.add('hidden');
        }
      });
      
      // Canvas re-sizing backup if Load Balancer is displayed
      if (targetScreenId === 'classroom' && window.lbSimulator) {
        // Redraw triggers automatically in requestAnimationFrame
      }
    });
  });
}

// Live Uptime Display Animation
function animateLiveUptime() {
  const uptimeEl = document.getElementById('header-uptime-stat');
  if (!uptimeEl) return;
  
  setInterval(() => {
    const variance = (Math.random() * 0.005) - 0.0025;
    const base = 99.987;
    const current = Math.min(100, Math.max(99, base + variance));
    uptimeEl.textContent = `${current.toFixed(3)}%`;
  }, 4000);
}

// Library Rendering & Readers
function renderLibrary() {
  const container = document.getElementById('books-grid');
  if (!container || !window.contentData) return;
  
  container.innerHTML = window.contentData.books.map(book => `
    <div class="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-600/60 hover:shadow-2xl transition-all duration-300 group">
      <div>
        <!-- 3D Book Spine Effect -->
        <div class="relative w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-6 overflow-hidden shadow-inner flex items-center justify-center border-l-8 border-blue-500 group-hover:border-blue-400 transition-colors">
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="p-6 text-center z-10">
            <h4 class="text-sm font-bold uppercase tracking-wider text-blue-400 mb-2">${book.author}</h4>
            <h3 class="text-base md:text-lg font-extrabold text-slate-100 leading-snug font-serif">${book.title}</h3>
            <p class="text-xs text-slate-400 mt-2">${book.subtitle}</p>
          </div>
          <!-- Decorative Lines -->
          <div class="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-black/35"></div>
        </div>
        
        <h3 class="text-xl font-bold text-slate-100 mb-2">${book.title}</h3>
        <p class="text-sm text-slate-400 leading-relaxed mb-6">${book.description}</p>
      </div>
      
      <div>
        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Chapters</h4>
        <div class="space-y-2">
          ${book.chapters.map(ch => `
            <button class="w-full text-left py-2 px-3 rounded-lg text-xs md:text-sm font-medium text-slate-300 hover:bg-blue-600/10 hover:text-blue-400 border border-transparent hover:border-blue-500/20 transition-all flex justify-between items-center"
                    onclick="openChapterReader('${book.id}', '${ch.id}')">
              <span>${ch.title.split(':')[0]}: ${ch.title.split(':').slice(1).join(':')}</span>
              <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// Open Book Reading Modal Drawer
window.openChapterReader = function(bookId, chapterId) {
  const book = window.contentData.books.find(b => b.id === bookId);
  if (!book) return;
  const chapter = book.chapters.find(c => c.id === chapterId);
  if (!chapter) return;
  
  const modal = document.getElementById('reader-modal');
  const bookTitleEl = document.getElementById('modal-book-title');
  const chapterTitleEl = document.getElementById('modal-chapter-title');
  const bodyEl = document.getElementById('modal-body-content');
  
  if (!modal) return;
  
  bookTitleEl.textContent = book.title;
  chapterTitleEl.textContent = chapter.title;
  bodyEl.innerHTML = chapter.content;
  
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
};

window.closeChapterReader = function() {
  const modal = document.getElementById('reader-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
};

// Museum Section Rendering
function renderMuseum() {
  const container = document.getElementById('museum-grid');
  if (!container || !window.contentData) return;
  
  container.innerHTML = window.contentData.outages.map(outage => `
    <div class="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 hover:border-rose-500/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-4">
          <span class="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 font-semibold uppercase tracking-wider">Outage Report</span>
          <span class="text-xs font-mono text-slate-500">${outage.date}</span>
        </div>
        <h3 class="text-xl font-bold text-slate-100 mb-2">${outage.title}</h3>
        <p class="text-xs font-mono text-rose-300 bg-rose-950/20 p-2 rounded mb-4 border border-rose-500/10"><strong>Blast Radius:</strong> ${outage.impact}</p>
        <p class="text-sm text-slate-400 leading-relaxed mb-6">${outage.summary}</p>
      </div>
      
      <button class="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-rose-500 hover:text-white border border-slate-700 hover:border-transparent text-slate-200 transition-all flex items-center justify-center space-x-2"
              onclick="openOutageModal('${outage.id}')">
        <span>Analyze Postmortem</span>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </button>
    </div>
  `).join('');
}

// Open Outage Retrospective Modal
window.openOutageModal = function(outageId) {
  const outage = window.contentData.outages.find(o => o.id === outageId);
  if (!outage) return;
  
  const modal = document.getElementById('outage-modal');
  const titleEl = document.getElementById('outage-modal-title');
  const summaryEl = document.getElementById('outage-modal-summary');
  const causeEl = document.getElementById('outage-modal-cause');
  const timelineEl = document.getElementById('outage-modal-timeline');
  const lessonsEl = document.getElementById('outage-modal-lessons');
  
  if (!modal) return;
  
  titleEl.textContent = outage.title;
  summaryEl.textContent = outage.summary;
  causeEl.textContent = outage.cause;
  
  // Timeline building
  timelineEl.innerHTML = outage.timeline.map(t => `
    <div class="relative pl-6 border-l border-slate-800 pb-4 last:pb-0">
      <div class="absolute left-[-5px] top-[4px] h-2.5 w-2.5 bg-rose-500 rounded-full"></div>
      <div class="text-xs font-mono text-rose-400 font-bold mb-1">${t.time}</div>
      <div class="text-xs md:text-sm text-slate-300">${t.event}</div>
    </div>
  `).join('');
  
  // Lessons building
  lessonsEl.innerHTML = outage.lessons.map(l => `
    <li class="flex items-start space-x-2 text-slate-300 text-xs md:text-sm">
      <span class="text-emerald-400 mt-1 font-bold">✓</span>
      <span>${l}</span>
    </li>
  `).join('');
  
  modal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
};

window.closeOutageModal = function() {
  const modal = document.getElementById('outage-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
};

// Prodverbs Page Logic
function renderProdverbs() {
  const grid = document.getElementById('prodverbs-grid');
  if (!grid || !window.contentData) return;
  
  grid.innerHTML = window.contentData.prodverbs.map((pv, idx) => `
    <div class="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 hover:border-blue-500/20 hover:bg-slate-800/30 transition-all duration-300 flex flex-col justify-between min-h-[160px] group shadow-lg">
      <p class="text-base text-slate-200 italic leading-relaxed font-serif">"${pv.quote}"</p>
      <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/80">
        <span class="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">${pv.author}</span>
        <span class="text-xs text-blue-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">#${idx+1}</span>
      </div>
    </div>
  `).join('');
  
  // Random Prodverb Generator Setup
  const randBtn = document.getElementById('gen-random-prodverb');
  const displayQuote = document.getElementById('random-prodverb-quote');
  const displayAuthor = document.getElementById('random-prodverb-author');
  
  if (randBtn && displayQuote && displayAuthor) {
    const pickRandom = () => {
      const idx = Math.floor(Math.random() * window.contentData.prodverbs.length);
      const pv = window.contentData.prodverbs[idx];
      displayQuote.textContent = `"${pv.quote}"`;
      displayAuthor.textContent = pv.author;
    };
    randBtn.addEventListener('click', pickRandom);
    pickRandom(); // Run once initially
  }
}

// Checklist rendering
function renderChecklist() {
  const container = document.getElementById('checklist-container');
  if (!container || !window.contentData) return;
  
  container.innerHTML = window.contentData.readinessChecklist.map((section, sIdx) => `
    <div class="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6 shadow-xl">
      <h3 class="text-lg font-bold text-slate-100 mb-4 pb-2 border-b border-slate-800 flex items-center space-x-2">
        <span class="h-2 w-2 rounded-full bg-blue-500"></span>
        <span>${section.category}</span>
      </h3>
      <div class="space-y-3">
        ${section.items.map((item, itemIdx) => `
          <label class="flex items-start space-x-3 cursor-pointer group text-slate-300 text-sm md:text-base">
            <input type="checkbox" id="chk-${sIdx}-${itemIdx}" class="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors" />
            <span class="group-hover:text-slate-100 transition-colors leading-relaxed">${item}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Portal Global Search System
function initSearch() {
  const searchInput = document.getElementById('global-search');
  const resultsContainer = document.getElementById('search-results');
  const resultsGrid = document.getElementById('search-results-grid');
  const activeDashboard = document.getElementById('dashboard-main-view');
  
  if (!searchInput || !resultsContainer) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      resultsContainer.classList.add('hidden');
      activeDashboard.classList.remove('hidden');
      return;
    }
    
    // Perform index search
    const matches = [];
    
    // Search Books Chapters
    window.contentData.books.forEach(book => {
      book.chapters.forEach(ch => {
        if (ch.title.toLowerCase().includes(query) || ch.content.toLowerCase().includes(query)) {
          matches.push({
            type: 'Chapter',
            source: book.title,
            title: ch.title,
            action: `openChapterReader('${book.id}', '${ch.id}')`,
            snippet: getSnippet(ch.content, query)
          });
        }
      });
    });
    
    // Search Outages
    window.contentData.outages.forEach(outage => {
      if (outage.title.toLowerCase().includes(query) || outage.summary.toLowerCase().includes(query) || outage.cause.toLowerCase().includes(query)) {
        matches.push({
          type: 'Case Study',
          source: outage.date,
          title: outage.title,
          action: `openOutageModal('${outage.id}')`,
          snippet: outage.summary
        });
      }
    });
    
    // Display matches
    if (matches.length === 0) {
      resultsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-500">
          <p class="text-base font-medium">No resources found matching "${e.target.value}"</p>
          <p class="text-xs mt-1">Try searching for keywords like 'latency', 'WAF', 'consensus', or 'SLO'.</p>
        </div>
      `;
    } else {
      resultsGrid.innerHTML = matches.map(match => `
        <div class="bg-slate-900/80 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-all cursor-pointer"
             onclick="${match.action}">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${match.type === 'Chapter' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${match.type}</span>
            <span class="text-xs font-mono text-slate-500">${match.source}</span>
          </div>
          <h4 class="text-base font-bold text-slate-200 mb-1 hover:text-white">${match.title}</h4>
          <p class="text-xs text-slate-400 leading-relaxed font-mono mt-2 bg-slate-950/40 p-2.5 rounded border border-slate-800/80 line-clamp-3">${match.snippet}</p>
        </div>
      `).join('');
    }
    
    activeDashboard.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
  });
  
  // Close Search Handler (clicking X button)
  const closeSearchBtn = document.getElementById('clear-search-btn');
  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      resultsContainer.classList.add('hidden');
      activeDashboard.classList.remove('hidden');
    });
  }
}

// Helpers
function getSnippet(htmlContent, query) {
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, ' ');
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text.substring(0, 150) + '...';
  
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 110);
  return (start > 0 ? '...' : '') + text.substring(start, end).trim() + (end < text.length ? '...' : '');
}
