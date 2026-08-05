// Interactive Incident Commander Simulator - Choice-Based Scenario State Machine

class IncidentSimulator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.state = {
      step: 'start', // 'start', 'alert', 'triage', 'mitigate', 'comms', 'postmortem', 'end'
      metrics: {
        mitigation: 0, // 0 to 100
        prPressure: 10, // 0 to 100 (lower is better)
        teamStress: 20  // 0 to 100 (lower is better)
      },
      log: [],
      score: 0
    };
    
    this.scenarios = {
      start: {
        title: "Incident Commander Simulator",
        description: "Welcome, Engineer. It's Friday at 3:15 PM. You are the designated On-Call Incident Commander for the checkout cluster. A critical P0 alert has just fired. Do you have what it takes to restore uptime before your business collapses?",
        choices: [
          { text: "Acknowledge Alert & Enter War Room", nextState: "alert", score: 10, stress: 10, pr: 0, log: "Entered incident bridge. Initiated incident log." }
        ]
      },
      alert: {
        title: "Step 1: The Alert Fired!",
        description: "Alert: <code>CheckoutService API Gateway latency p99 > 15,000ms</code>. Success rate dropped to 38%. Alerting shows CPU saturation at 100% across all API gateway instances. The checkout buttons on the main app are failing.",
        choices: [
          {
            text: "Page everyone immediately and call an all-hands emergency meeting of 30+ engineers.",
            nextState: "triage",
            score: 5,
            stress: 40,
            pr: 5,
            log: "Paged entire department. War room is crowded and chaotic. High stress."
          },
          {
            text: "Log in directly to a production node and run a profiling tool (strace/gdb) to diagnose the CPU spike.",
            nextState: "triage",
            score: 10,
            stress: 15,
            pr: 10,
            log: "Logged into node API-04. Attempting to run direct debuggers on hot traffic."
          },
          {
            text: "Verify user impact, establish a dedicated incident bridge, and assign the On-Call Engineer as the Operations Lead.",
            nextState: "triage",
            score: 25,
            stress: 10,
            pr: 0,
            log: "Incident bridge established. Ops lead assigned. Structured communication initiated."
          }
        ]
      },
      triage: {
        title: "Step 2: Diagnosis & Triage",
        description: "Your Operations Lead runs a check of active logs and telemetry. They discover the CPU spike coincided exactly with a release pushed 10 minutes ago: a new security Web Application Firewall (WAF) rule to block cross-site scripting (XSS) inputs. The WAF engine is consuming 99.8% CPU.",
        choices: [
          {
            text: "Command the developers to immediately review the deployed WAF rule lines and debug the regular expressions.",
            nextState: "mitigate",
            score: 10,
            stress: 20,
            pr: 20,
            log: "Developers are scanning lines of code. Customers are encountering timeout errors. Public pressure mounting."
          },
          {
            text: "Execute the WAF emergency bypass circuit breaker, disabling deep packet scanning temporarily at the edge CDN.",
            nextState: "mitigate",
            score: 30,
            stress: -5,
            pr: -10,
            log: "Emergency bypass triggered. Traffic routing resumes immediately. Latency drops back to 40ms. Mitigation complete!"
          },
          {
            text: "Launch a shell script to continuously reboot the saturated API Gateway servers to clear their memory cache.",
            nextState: "mitigate",
            score: 5,
            stress: 30,
            pr: 30,
            log: "Servers rebooting. Thundering herd triggers immediately upon startup, saturating nodes again. Uptime drops further."
          }
        ]
      },
      mitigate: {
        title: "Step 3: Managing the Stakeholders",
        description: "While you are actively troubleshooting, the Vice President of Sales and Customer Support teams are flooding the Slack channel. Customers are posting about checkout failures on social media. The VP demands an immediate phone call to explain when it will be fixed.",
        choices: [
          {
            text: "Stop technical coordination to jump onto a call with the VP and detail the technical bugs.",
            nextState: "comms",
            score: 5,
            stress: 25,
            pr: 10,
            log: "Incident Commander left bridge to placate executives. Coordination stalls."
          },
          {
            text: "Ignore the Slack channel entirely and shut down the customer support channels to focus 100% on code.",
            nextState: "comms",
            score: 10,
            stress: -10,
            pr: 40,
            log: "Customer service blackout. Users are screaming. Social media panic."
          },
          {
            text: "Appoint a Communications Lead ( scribe ) to handle updates. Publish a high-level status message: 'Investigating API latency, actively mitigating, updates every 15m'.",
            nextState: "comms",
            score: 30,
            stress: -10,
            pr: -20,
            log: "Communications lead appointed. Public status page updated. Executive pressure dissipated."
          }
        ]
      },
      comms: {
        title: "Step 4: Safe Re-Enablement",
        description: "You bypassed the WAF rule to restore checkout operations, but your system is now vulnerable to injection attacks. The developers have identified the bug: a nested regex quantifier (catastrophic backtracking) that hung on empty body inputs. They have written a patch.",
        choices: [
          {
            text: "Apply the regex patch directly to production and re-enable WAF globally to restore full security.",
            nextState: "postmortem",
            score: 15,
            stress: 20,
            pr: 10,
            log: "Deploys directly to production. CPU spikes slightly but returns to normal. High-risk deploy."
          },
          {
            text: "Deploy the patched WAF rules to a canary node with 2% traffic. Run synthetic load tests, then slowly scale promotion globally.",
            nextState: "postmortem",
            score: 30,
            stress: 5,
            pr: 0,
            log: "Canary deployment verified. CPU remains low. Clean rollout to production."
          },
          {
            text: "Keep WAF disabled forever. Uptime is restored, security can wait until next quarter.",
            nextState: "postmortem",
            score: -10,
            stress: -20,
            pr: 30,
            log: "Security vulnerability left unpatched. Auditor triggers warnings."
          }
        ]
      },
      postmortem: {
        title: "Step 5: Conducting the Blameless Postmortem",
        description: "Uptime is 100%, systems are secure. You gather the team on Monday morning for the postmortem. The atmosphere is tense; people are worried about getting blamed for the weekend alert.",
        choices: [
          {
            text: "Point out that the developer who wrote the regex should have tested it better. Add a rule that all commits by that developer need senior management review.",
            nextState: "end",
            score: -20,
            stress: 30,
            pr: 0,
            log: "Blame assigned. Morale plummets. Engineers are now afraid to deploy changes."
          },
          {
            text: "Write down the timeline, analyze the regex backtracking mechanics, and assign tasks to implement regex compilation timeouts, canary testing steps, and a permanent automated CDN bypass switch.",
            nextState: "end",
            score: 35,
            stress: -10,
            pr: 0,
            log: "Blameless postmortem published. Structural guardrails created. System is stronger."
          }
        ]
      }
    };
    
    this.render();
  }
  
  render() {
    const s = this.scenarios[this.state.step];
    if (!s) return;
    
    const mitigationProgress = this.state.step === 'start' ? 0 : 
                             this.state.step === 'alert' ? 20 :
                             this.state.step === 'triage' ? 45 :
                             this.state.step === 'mitigate' ? 70 :
                             this.state.step === 'comms' ? 90 : 100;
                             
    this.state.metrics.mitigation = mitigationProgress;
    
    // Draw layout
    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Simulator Narrative -->
        <div class="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl flex flex-col justify-between min-h-[350px]">
          <div>
            <div class="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 class="text-xl font-bold text-slate-100">${s.title}</h3>
              <span class="text-xs font-mono bg-slate-800 text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider">Phase: ${this.state.step}</span>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6 text-sm md:text-base">${s.description}</p>
            
            <div class="space-y-3">
              ${this.state.step !== 'end' ? 
                s.choices.map((c, idx) => `
                  <button class="incident-choice-btn w-full text-left p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/50 text-slate-200 transition-all text-sm flex items-start space-x-3"
                          data-idx="${idx}">
                    <span class="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded mr-2 font-mono">${idx+1}</span>
                    <span>${c.text}</span>
                  </button>
                `).join('') 
                : 
                `<button id="restart-incident-sim" class="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all">Restart Simulator</button>`
              }
            </div>
          </div>
        </div>
        
        <!-- Live Dashboard Metrics -->
        <div class="space-y-6">
          <div class="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl">
            <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Commander Status Board</h4>
            
            <!-- Mitigation -->
            <div class="mb-4">
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-slate-400">Mitigation Level</span>
                <span class="text-emerald-400">${this.state.metrics.mitigation}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="bg-emerald-500 h-full transition-all duration-500" style="width: ${this.state.metrics.mitigation}%"></div>
              </div>
            </div>
            
            <!-- PR Impact -->
            <div class="mb-4">
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-slate-400">PR / Customer Pressure</span>
                <span class="${this.state.metrics.prPressure > 70 ? 'text-rose-400' : this.state.metrics.prPressure > 40 ? 'text-amber-400' : 'text-emerald-400'}">${this.state.metrics.prPressure}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="h-full transition-all duration-500 ${this.state.metrics.prPressure > 70 ? 'bg-rose-500' : this.state.metrics.prPressure > 40 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${this.state.metrics.prPressure}%"></div>
              </div>
            </div>
            
            <!-- Stress -->
            <div class="mb-4">
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-slate-400">Team Stress Level</span>
                <span class="${this.state.metrics.teamStress > 70 ? 'text-rose-400' : this.state.metrics.teamStress > 40 ? 'text-amber-400' : 'text-emerald-400'}">${this.state.metrics.teamStress}%</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div class="h-full transition-all duration-500 ${this.state.metrics.teamStress > 70 ? 'bg-rose-500' : this.state.metrics.teamStress > 40 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${this.state.metrics.teamStress}%"></div>
              </div>
            </div>
          </div>
          
          <!-- Incident Logs -->
          <div class="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-xl min-h-[175px]">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Incident Operations Log</h4>
            <div class="h-[150px] overflow-y-auto space-y-2 font-mono text-xs text-slate-400 pr-1 scrollbar-thin">
              ${this.state.log.length === 0 ? `<div class="text-slate-600 italic">Bridge waiting to connect...</div>` : ''}
              ${this.state.log.map(item => `
                <div class="border-l-2 border-slate-700 pl-2 py-0.5">
                  <span class="text-slate-500 font-semibold">[OPS]</span> ${item}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.bindEvents(s);
  }
  
  bindEvents(currentScenario) {
    const choiceButtons = this.container.querySelectorAll('.incident-choice-btn');
    choiceButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const choice = currentScenario.choices[idx];
        
        // Update stats
        this.state.score += choice.score;
        this.state.metrics.prPressure = Math.min(100, Math.max(0, this.state.metrics.prPressure + choice.pr));
        this.state.metrics.teamStress = Math.min(100, Math.max(0, this.state.metrics.teamStress + choice.stress));
        this.state.log.push(choice.log);
        
        // Progress state
        this.state.step = choice.nextState;
        
        this.render();
      });
    });
    
    const restartBtn = document.getElementById('restart-incident-sim');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.state = {
          step: 'start',
          metrics: {
            mitigation: 0,
            prPressure: 10,
            teamStress: 20
          },
          log: [],
          score: 0
        };
        this.render();
      });
    }
    
    // Custom handling for end game evaluation
    if (this.state.step === 'end') {
      this.evaluateGame();
    }
  }
  
  evaluateGame() {
    let rank = "Chaos Monkey";
    let message = "";
    const totalScore = this.state.score;
    const finalStress = this.state.metrics.teamStress;
    const finalPR = this.state.metrics.prPressure;
    
    if (totalScore >= 130 && finalStress < 40 && finalPR < 30) {
      rank = "Principal Site Reliability Engineer";
      message = "Flawless incident management! You mitigated user impact in seconds, established structured channels, kept stress low, and successfully implemented systemic blameless automation preventions. Google SRE founder Ben Sloss would be proud.";
    } else if (totalScore >= 100) {
      rank = "Reliability Engineer";
      message = "Solid operational response. You successfully brought the site back online, mitigated stakeholder noise, and avoided placing blame. Next time, try to minimize team stress levels and prioritize canary rollouts earlier.";
    } else if (totalScore >= 70) {
      rank = "Traditional Ops Administrator";
      message = "You restored services, but the recovery was slow, stressful, and chaotic. You logged directly onto staging nodes, let customer support blackouts persist, or bypassed security configurations without a postmortem roadmap. Transition to automated checks to reduce toil.";
    } else {
      rank = "Chaos Agent / Toil Generator";
      message = "The outage was resolved, but at what cost? You assigned blame to devs, triggered circular thundering herds, or ignored alerts. The team is burning out and security alerts are critical. Time to study the SRE Workbook!";
    }
    
    // Inject evaluation message into the end state layout
    const containerEnd = this.container.querySelector('.bg-slate-900/60');
    if (containerEnd) {
      const targetDiv = document.createElement('div');
      targetDiv.className = 'mt-6 p-4 rounded-xl border border-blue-500/30 bg-blue-950/40 text-slate-200';
      targetDiv.innerHTML = `
        <h4 class="text-md font-bold text-blue-400 mb-1">Incident Commander Rank Assigned:</h4>
        <div class="text-xl font-extrabold text-white tracking-wide uppercase mb-3">${rank}</div>
        <p class="text-sm text-slate-300 leading-relaxed mb-3">${message}</p>
        <div class="text-xs font-mono text-slate-400">Total Operational Score: ${totalScore} | Final Stress: ${finalStress}% | Final PR Pressure: ${finalPR}%</div>
      `;
      containerEnd.insertBefore(targetDiv, containerEnd.querySelector('.space-y-3'));
    }
  }
}

if (typeof window !== 'undefined') {
  window.IncidentSimulator = IncidentSimulator;
}
