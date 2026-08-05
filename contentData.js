// Comprehensive Data for Site Reliability & System Design Resource Portal

const contentData = {
  books: [
    {
      id: "ds-foundations",
      title: "Distributed Systems Foundation",
      subtitle: "Designing Resilient Infrastructures at Scale",
      author: "Niraj Bajpai",
      description: "A deep dive into latency, horizontal sharding, CAP/PACELC trade-offs, and critical resiliency patterns for large-scale production deployments.",
      chapters: [
        {
          id: "ds-ch1",
          title: "Chapter 1: Latency, Throughput & Tail Performance",
          content: `
            <h3>Understanding Performance Metrics</h3>
            <p>In distributed systems, performance is typically measured through two primary metrics: <strong>latency</strong> (the time taken to service a request) and <strong>throughput</strong> (the number of requests processed per unit of time). However, looking at average or median latency can be highly misleading in production.</p>
            
            <h4>The Tail Latency Problem</h4>
            <p>Tail latency—represented by the 95th, 99th, and 99.9th percentiles (p95, p99, p99.9)—describes the experience of the slowest requests. If your p99 latency is 2 seconds, it means 1% of your users experience a latency of at least 2 seconds. When a single page load triggers dozens of internal sub-requests in parallel, a user's overall response time is bound to the slowest sub-request (the weakest link). Thus, even if individual services have 99% fast responses, the aggregate page load will frequently hit tail latencies.</p>
            
            <h4>Mitigating Tail Latency</h4>
            <ul>
              <li><strong>Hedging Requests:</strong> If a sub-request takes longer than a p95 threshold, spawn an identical request to a different replica and use the response of whoever returns first.</li>
              <li><strong>Flow Control & Backpressure:</strong> Prevent overloaded services from cascading failures by rejecting requests early when saturation queues are full.</li>
              <li><strong>Micro-batching & Connection Pooling:</strong> Batch database operations and keep active connections warm to eliminate the overhead of TCP handshakes.</li>
            </ul>
          `
        },
        {
          id: "ds-ch2",
          title: "Chapter 2: Horizontal Scaling & Consistent Sharding",
          content: `
            <h3>Vertical vs. Horizontal Scaling</h3>
            <p>Vertical scaling (scaling up) involves adding more CPU, RAM, or storage to a single server. It is constrained by physical hardware limits and introduces a single point of failure. Horizontal scaling (scaling out) adds more commodity servers. To scale horizontally, data must be distributed across nodes.</p>
            
            <h4>Database Partitioning (Sharding)</h4>
            <p>Sharding splits a database into smaller, faster pieces called shards. Common sharding strategies include:</p>
            <ul>
              <li><strong>Range-Based:</strong> Partitioning data based on ranges of an attribute (e.g., last names A-M, N-Z). This can cause hotspot issues if data is unevenly distributed.</li>
              <li><strong>Hash-Based:</strong> Applying a hash function to a shard key (e.g., <code>hash(user_id) % number_of_shards</code>). While it distributes data evenly, changing the number of shards requires redistributing almost all data.</li>
            </ul>
            
            <h4>Consistent Hashing</h4>
            <p>Consistent hashing solves the redistribution problem by mapping both servers and keys to a circular ring (hash ring). A key is assigned to the next closest server on the ring. When a server is added or removed, only a fraction of the keys (<code>1/n</code>, where <code>n</code> is the number of servers) need to be remapped. <strong>Virtual Nodes (vnodes)</strong> are introduced to distribute keys even more uniformly, preventing statistical hotspots on individual hardware nodes.</p>
          `
        },
        {
          id: "ds-ch3",
          title: "Chapter 3: High Availability, Split-Brain & CAP Theorem",
          content: `
            <h3>The CAP Theorem</h3>
            <p>Formulated by Eric Brewer, the CAP theorem states that any distributed data store can simultaneously provide at most two of the following three guarantees:</p>
            <ul>
              <li><strong>Consistency (C):</strong> Every read receives the most recent write or an error.</li>
              <li><strong>Availability (A):</strong> Every non-failing node returns a non-error response, without guaranteeing it contains the most recent write.</li>
              <li><strong>Partition Tolerance (P):</strong> The system continues to operate despite arbitrary network partition events (packet drops or delays).</li>
            </ul>
            <p>Because physical networks are inherently prone to partitions, distributed systems MUST choose between Consistency (CP) or Availability (AP) during a network split.</p>
            
            <h4>PACELC Theorem</h4>
            <p>An extension to CAP, PACELC states: If there is a <strong>Partition (P)</strong>, trade off <strong>Availability (A)</strong> or <strong>Consistency (C)</strong>; <strong>Else (E)</strong>, trade off <strong>Latency (L)</strong> or <strong>Consistency (C)</strong>. Even under normal conditions, replicating data for consistency introduces network latency.</p>
            
            <h4>The Split-Brain Problem & Consensus</h4>
            <p>When a network partition cuts a cluster in half, both halves might believe the other is dead. If both partitions continue writing independently, the database drifts into an irreconcilable split-brain state. To prevent this, systems use distributed consensus protocols like <strong>Raft</strong> or <strong>Paxos</strong>. Consensus requires a strict quorum (majority: <code>N/2 + 1</code> nodes) to commit writes or elect leaders. The partition containing the minority of nodes will automatically transition to read-only or reject writes, maintaining system-wide consistency.</p>
          `
        },
        {
          id: "ds-ch4",
          title: "Chapter 4: Resiliency Patterns (Timeout, Retry, Circuit Breaker)",
          content: `
            <h3>Building Fault-Tolerant Systems</h3>
            <p>In a large-scale system, failures are inevitable. Resiliency patterns prevent localized failures from cascading and taking down the entire infrastructure.</p>
            
            <h4>1. Timeouts</h4>
            <p>Never wait indefinitely for a response. Set strict timeout thresholds. This frees up execution threads and prevents resource exhaustion (e.g., thread pool starvation) in calling services.</p>
            
            <h4>2. Retries with Exponential Backoff and Jitter</h4>
            <p>If a request fails due to a transient network issue, retrying can fix it. However, immediate retries can create a "thundering herd" effect, overloading a struggling downstream service. The remedy is:</p>
            <ul>
              <li><strong>Exponential Backoff:</strong> Double the delay after each failed attempt (e.g., 100ms, 200ms, 400ms, 800ms).</li>
              <li><strong>Jitter:</strong> Add random noise to the delay to stagger retry times among competing clients.</li>
            </ul>
            
            <h4>3. Circuit Breaker Pattern</h4>
            <p>Like electrical circuit breakers, this pattern monitors failures. It transitions through three states:</p>
            <ul>
              <li><strong>Closed:</strong> Normal operation; requests pass through.</li>
              <li><strong>Open:</strong> When error rate crosses a threshold, the breaker trips. Requests fail instantly (fast-fail) without invoking the downstream service, letting the service recover.</li>
              <li><strong>Half-Open:</strong> After a cooldown, a limited number of requests are sent. If they succeed, the breaker closes. If they fail, the breaker re-opens.</li>
            </ul>
            
            <h4>4. Bulkheads</h4>
            <p>Isolate resources (thread pools, memory, servers) into bounded compartments. If one pool is exhausted by a slow API, other APIs running on separate thread pools remain operational.</p>
          `
        }
      ]
    },
    {
      id: "sre-handbook",
      title: "Site Reliability Engineering Guide",
      subtitle: "Operations as a Software Engineering Discipline",
      author: "Niraj Bajpai",
      description: "How to manage production operations using software principles. Focuses on defining SLOs, managing error budgets, eliminating toil, and building a blameless culture.",
      chapters: [
        {
          id: "sre-ch1",
          title: "Chapter 1: Defining SLIs, SLOs, and SLAs",
          content: `
            <h3>The Language of Reliability</h3>
            <p>To measure and improve system reliability, SREs define clear quantitative indicators and targets.</p>
            
            <h4>1. Service Level Indicator (SLI)</h4>
            <p>A compliance metric representing the service level provided. It is typically expressed as:
            <br><code>SLI = (Good Events / Total Events) * 100</code>
            <br>Examples: The ratio of successful HTTP requests (2xx/3xx) to total requests, or requests completed in under 200ms.</p>
            
            <h4>2. Service Level Objective (SLO)</h4>
            <p>A target reliability level set for an SLI, agreed upon by product, SRE, and business teams. E.g., "The HTTP success rate will be at least 99.9% over a rolling 30-day window." Setting the SLO too high (e.g., 100%) increases costs exponentially and slows down feature velocity unnecessarily.</p>
            
            <h4>3. Service Level Agreement (SLA)</h4>
            <p>A legal/business commitment to users, detailing financial or operational consequences (e.g., credits or refunds) if the SLO is not met. Typically, the internal SLO is significantly stricter than the external SLA to provide a safety buffer.</p>
            
            <h4>Designing Good Objectives</h4>
            <p>Focus on user journeys. An API gateway should measure endpoint success. An asynchronous queue processor should measure worker processing delay (freshness) rather than simple CPU load.</p>
          `
        },
        {
          id: "sre-ch2",
          title: "Chapter 2: Error Budget Policies & Burn Rates",
          content: `
            <h3>The Concept of Error Budgets</h3>
            <p>The error budget is the remainder of your SLO target: <code>Error Budget = 100% - SLO</code>. For a 99.9% SLO, the budget is 0.1%. This represents the allowed failure rate. It is a shared resource between Product (wants velocity and features) and SRE (wants stability).</p>
            
            <h4>Applying the Budget</h4>
            <ul>
              <li>If the system operates with plenty of remaining budget, product engineering can release risky features and deploy frequently.</li>
              <li>If the error budget is exhausted, the <strong>Error Budget Policy</strong> is triggered. Feature deployments are frozen, and engineering resources are redirected to reliability improvements, technical debt reduction, and bug fixes.</li>
            </ul>
            
            <h4>Burn Rates</h4>
            <p>Burn rate is the speed at which a service consumes its error budget. A burn rate of 1 means the service will exhaust exactly 100% of its budget over the given window (e.g., 30 days). A burn rate of 14.4 means the budget will be fully consumed in 50 hours. SREs set alerting rules based on burn rates to catch catastrophic events early (e.g., page instantly on a high burn rate) while preventing alert fatigue for slow budget erosion.</p>
          `
        },
        {
          id: "sre-ch3",
          title: "Chapter 3: Eliminating Toil through Automation",
          content: `
            <h3>What is Toil?</h3>
            <p>In SRE, toil is not simply "work I don't like." It is operational work that exhibits specific characteristics:</p>
            <ul>
              <li><strong>Manual:</strong> Running scripts manually or performing manual steps in a dashboard.</li>
              <li><strong>Repetitive:</strong> Performing the same task week after week.</li>
              <li><strong>Automatable:</strong> A task that can be replaced by writing software or configuring tools.</li>
              <li><strong>Tactical:</strong> Reacting to an alert rather than strategically designing out the failure mode.</li>
              <li><strong>No Enduring Value:</strong> Completing the task leaves the system state unchanged long-term.</li>
            </ul>
            
            <h4>The 50% Rule</h4>
            <p>Google SRE limits toil to a maximum of 50% of an engineer's time. The remaining 50% must be spent on software engineering project work (developing tools, architectural design, scaling infrastructure, writing automated tests). If toil exceeds 50%, the SRE team becomes overwhelmed, leading to burn-out, critical outages, and scaling bottlenecks.</p>
            
            <h4>Automation Principles</h4>
            <p>Write tools, not scripts. A script requires human execution and error-prone arguments. An automated system (like an operator in Kubernetes or auto-remediation daemon) senses the system state and acts without intervention, reporting results to audit logs.</p>
          `
        },
        {
          id: "sre-ch4",
          title: "Chapter 4: SLO-Based Alerting & Incident Response",
          content: `
            <h3>Modern Alerting Philosophy</h3>
            <p>Traditional monitoring alerted on static thresholds (e.g., "CPU utilization > 80%"). This leads to alert fatigue because high CPU might be normal during batch runs and doesn't directly impact user experience. Modern SRE alerts on <strong>SLO burn rates</strong>.</p>
            
            <h4>The Four Golden Signals</h4>
            <p>If you can only measure four metrics, prioritize these:</p>
            <ol>
              <li><strong>Latency:</strong> Time taken to service a request (split by success and error).</li>
              <li><strong>Traffic:</strong> Demand placed on the system (e.g., HTTP requests/sec, network bandwidth).</li>
              <li><strong>Errors:</strong> Rate of requests that fail (explicit 500s, implicit error payloads, or timeouts).</li>
              <li><strong>Saturation:</strong> How "full" the service is, measuring resources like memory, thread pools, or disk I/O.</li>
            </ol>
            
            <h4>Incident Response Lifecycle</h4>
            <ul>
              <li><strong>Triage:</strong> Detect the incident, verify user impact, and declare severity.</li>
              <li><strong>Mitigate:</strong> Focus on restoring service quickly (e.g., roll back the last deploy, failover to another region, scale up resources) rather than debugging the root cause on the spot.</li>
              <li><strong>Postmortem:</strong> Analyze the root cause after the system is stable.</li>
            </ul>
          `
        },
        {
          id: "sre-ch5",
          title: "Chapter 5: Cultivating a Blameless Postmortem Culture",
          content: `
            <h3>Psychological Safety in Operations</h3>
            <p>A blameless postmortem assumes that engineers are qualified, well-intentioned, and made the best decisions based on the information they had at the time. Writing a postmortem is not about finding "who did it" but "why did the system allow a human to cause an outage?"</p>
            
            <h4>Structure of a Postmortem</h4>
            <ul>
              <li><strong>Metadata:</strong> Owner, status, date, severity.</li>
              <li><strong>Executive Summary:</strong> A high-level description of what happened, user impact, and resolution.</li>
              <li><strong>Timeline:</strong> Step-by-step chronology from the first warning signal, to detection, communication, mitigation, and recovery.</li>
              <li><strong>Root Cause Analysis:</strong> Detailed explanation of the technical failure mode. Use the "Five Whys" technique to trace back to systemic gaps.</li>
              <li><strong>Action Items (Preventative Tasks):</strong> Concrete tasks to prevent recurrence, assigned to specific teams with due dates. Track these with high priority.</li>
            </ul>
            <p>By removing blame, team members freely share details about mistakes, leading to faster detection and systemic architectural hardening.</p>
          `
        }
      ]
    },
    {
      id: "security-reliability",
      title: "Secure & Resilient Architecture",
      subtitle: "Designing Intrusion-Proof High Availability Services",
      author: "Niraj Bajpai",
      description: "Explores the overlap between system reliability and infrastructure security, including Zero Trust models, secure CI/CD, rate limiting, and audit observability.",
      chapters: [
        {
          id: "sec-ch1",
          title: "Chapter 1: Zero Trust Networking & Micro-segmentation",
          content: `
            <h3>The Demise of the Perimeter Model</h3>
            <p>Traditional security relied on the "castle-and-moat" strategy: secure the outer boundary (firewalls) and trust everything inside. If an attacker breaches the perimeter, they gain unrestricted lateral access. <strong>Zero Trust</strong> operates under the assumption of breach: "never trust, always verify."</p>
            
            <h4>Core Zero Trust Principles</h4>
            <ul>
              <li><strong>Verify Explicitly:</strong> Authenticate and authorize every request based on user identity, device health, service context, and data classification, not network location.</li>
              <li><strong>Least Privilege Access:</strong> Limit user and service access with Just-In-Time (JIT) and Just-Enough-Access (JEA) policies.</li>
              <li><strong>Micro-segmentation:</strong> Break the network down into small, isolated segments. If a database-proxy service is compromised, network firewalls and mutual TLS (mTLS) configurations prevent it from talking to billing interfaces or out-of-band monitoring channels.</li>
            </ul>
          `
        },
        {
          id: "sec-ch2",
          title: "Chapter 2: Secure Software Supply Chains",
          content: `
            <h3>Protecting the Deployment Pipeline</h3>
            <p>Attackers increasingly target CI/CD pipelines to inject malicious code into trusted software (e.g., the SolarWinds compromise). Securing your supply chain is critical to both security and system stability.</p>
            
            <h4>Pipeline Hardening Steps</h4>
            <ol>
              <li><strong>Vulnerability Scanning:</strong> Automatically scan code dependencies (Software Composition Analysis) and container layers for known CVEs during build time. Block builds that introduce critical vulnerabilities.</li>
              <li><strong>Reproducible/Hermetic Builds:</strong> Ensure build outputs are deterministic. Run builds in isolated environments without arbitrary internet access to prevent dependency hijacking.</li>
              <li><strong>Cryptographic Signing:</strong> Sign build artifacts (using tools like Cosign). The production cluster (e.g., Kubernetes admission controller) will only deploy container images signed by the verified CI runner.</li>
              <li><strong>Infrastructure as Code (IaC) Auditing:</strong> Treat configurations (Terraform, Ansible) like code. Scan them for open ports, public storage buckets, and weak encryption before provisioning.</li>
            </ol>
          `
        },
        {
          id: "sec-ch3",
          title: "Chapter 3: DDoS Mitigation & Rate Limiting Algorithms",
          content: `
            <h3>Distributed Denial of Service (DDoS)</h3>
            <p>DDoS attacks aim to exhaust system resources (network bandwidth, CPU, database connections) to make the system unavailable to legitimate users. Mitigation requires multi-layered filtering.</p>
            
            <h4>Rate Limiting Algorithms</h4>
            <p>Rate limiting protects backends from brute force and abusive API traffic. Common algorithms include:</p>
            <ul>
              <li><strong>Token Bucket:</strong> A bucket holds up to <code>max_tokens</code>. Tokens accumulate at a constant fill rate. Each request consumes a token. Allows bursts of traffic while enforcing a strict long-term limit.</li>
              <li><strong>Leaky Bucket:</strong> Requests enter a queue and leak out at a constant, smooth rate. Good for smoothing out traffic spikes, but introduces queue latency for bursts.</li>
              <li><strong>Sliding Window Log:</strong> Logs timestamps of all requests in memory. Accurate but memory-intensive.</li>
              <li><strong>Sliding Window Counter:</strong> Combines current window counters and previous window counters. Low memory footprint, high performance, and prevents border spikes.</li>
            </ul>
            
            <h4>Architectural Layering</h4>
            <p>Deploy rate limiters at the Edge (CDN or API Gateway) to stop malicious requests before they consume costly database or application server resources.</p>
          `
        },
        {
          id: "sec-ch4",
          title: "Chapter 4: Security Observability & Audit Pipelines",
          content: `
            <h3>Observing the Unknowns</h3>
            <p>Traditional monitoring looks for metrics (CPU, latency). Security observability looks for patterns of abuse, privilege escalations, and exfiltration attempts.</p>
            
            <h4>Structuring Secure Logs</h4>
            <p>Logs must contain high fidelity context but exclude sensitive personal data (PII) or secrets. Implement automated log-scrubbing filters. Ensure log pipelines are write-once-read-many (WORM) and stored in dedicated, immutable audit accounts. If an attacker gains administrative control of a cluster, they cannot delete their audit trails.</p>
            
            <h4>Distributed Tracing for Security</h4>
            <p>Use correlation IDs to trace requests as they navigate microservices. If a public-facing service suddenly makes direct queries to a low-level authentication database without an upstream credential header, security rules should raise high-priority alerts.</p>
          `
        }
      ]
    }
  ],
  
  outages: [
    {
      id: "knight-capital",
      title: "The Knight Capital Collapse",
      date: "August 1, 2012",
      impact: "$440 Million loss in 45 minutes; bankruptcy within days.",
      summary: "A defunct code path (Power Peg) was reactivated during a manual software deployment to 8 production servers. One server was skipped, causing it to send millions of market orders without validation.",
      timeline: [
        { time: "08:00 AM", event: "Manual deployment of new trading code to 8 servers." },
        { time: "08:30 AM", event: "Engineers miss deploying the update to the 8th server (SMARS server 8)." },
        { time: "09:30 AM", event: "US Market Opens. Active clients request execution. Server 8 receives the requests, but runs the old 'Power Peg' code, which continuously buys and sells without limits." },
        { time: "09:40 AM", event: "Engineers see market anomalies. In a panic, they roll back the working code on the other 7 servers to the old version, which reactivates Power Peg on ALL servers." },
        { time: "10:15 AM", event: "The rogue trading is manually terminated, but Knight Capital has accumulated massive unwanted stock positions." }
      ],
      cause: "Catastrophic combination of dead code reactivation, manual multi-server deployments without synchronization, failure to verify deployment completion across all nodes, and rolling back code without diagnosing the active error state.",
      lessons: [
        "<strong>Eliminate Dead Code:</strong> Actively purge deprecated paths from the codebase.",
        "<strong>Automated Deployments:</strong> Use configuration management to ensure atomic, verified, and consistent deploys across all servers.",
        "<strong>Feature Flags Safety:</strong> Use explicit configuration frameworks instead of repurposing old system variables.",
        "<strong>Rollback Safely:</strong> Never roll back code blindly during an outage without understanding the systemic configuration triggers."
      ]
    },
    {
      id: "aws-s3-2017",
      title: "The Great AWS S3 Outage",
      date: "February 28, 2017",
      impact: "High-latency and outages across hundreds of major websites and SaaS tools for 4+ hours.",
      summary: "An authorized S3 team member executing a routine debugging script manually entered an incorrect parameter, causing the deletion of a larger set of servers than intended, including core index and placement nodes.",
      timeline: [
        { time: "12:35 PM EST", event: "An operator debugging an S3 billing issue runs a script to remove a small cluster of billing servers." },
        { time: "12:37 PM EST", event: "A typo in the command arguments targets a much wider range of servers, removing metadata servers for two crucial S3 subsystems (US-EAST-1 index and placement servers)." },
        { time: "12:45 PM EST", event: "S3 services degrade. Websites relying on S3 storage fail to load assets, and other AWS services (like EC2 and EBS) dependent on S3 cannot provision." },
        { time: "01:30 PM EST", event: "Engineers begin a full recovery process. Because S3 had not undergone a cold reboot of this scale in years, verification, filesystem checks, and index rebuilding take hours." },
        { time: "04:45 PM EST", event: "All S3 index metadata systems are fully restored, and traffic returns to baseline." }
      ],
      cause: "Human error during manual operational scripting, exacerbated by broad system privileges (lack of safety limits on destructive commands) and slow system boot times for critical metadata subsystems.",
      lessons: [
        "<strong>Destructive Guardrails:</strong> Commands that delete resources must have safety checks, dry-run modes, and maximum threshold limits (e.g. max 5% of nodes).",
        "<strong>Accelerate Cold Boots:</strong> Regularly test and optimize the startup performance of critical infrastructure nodes.",
        "<strong>Decouple Internal Dependencies:</strong> Ensure core status indicators and console UIs do not depend on the services they are monitoring."
      ]
    },
    {
      id: "cloudflare-regex",
      title: "The Cloudflare CPU Exhaustion",
      date: "July 2, 2019",
      impact: "Worldwide outage of Cloudflare edge services for 27 minutes, dropping 82% of traffic.",
      summary: "A software deployment containing a poorly written regular expression used for Web Application Firewall (WAF) rule detection triggered catastrophic backtracking, driving CPU core utilization to 100% globally.",
      timeline: [
        { time: "13:42 UTC", event: "A new WAF firewall rule is deployed to block inline credentials." },
        { time: "13:43 UTC", event: "WAF CPU usage spikes to 100% on edge nodes globally. Servers stop responding to HTTP requests." },
        { time: "13:52 UTC", event: "Cloudflare engineers declare a global P0 incident and assemble an emergency war room." },
        { time: "14:02 UTC", event: "Engineers identify the WAF engine as the source. They execute a global bypass rule to disable the WAF." },
        { time: "14:09 UTC", event: "CPU utilization returns to normal; WAF rule is rolled back and services stabilize." }
      ],
      cause: "A regular expression containing a nested quantifier (e.g., <code>.*(?:.*=.*)</code>) matching an edge-case input string caused the engine to perform exponential searches (catastrophic backtracking), locking up CPU threads.",
      lessons: [
        "<strong>Regex Timeout Limits:</strong> Configure regex engines with strict timeouts to interrupt runaway computations.",
        "<strong>Canary Deployments:</strong> Never deploy configurations globally. Use canary staging to test rules on a fraction of traffic.",
        "<strong>Automated Safe Bypass:</strong> Implement automated circuit breakers that disable non-critical subsystems (like deep packet inspection) if they saturate system resources."
      ]
    },
    {
      id: "facebook-bgp-2021",
      title: "The Facebook Global Blackout",
      date: "October 4, 2021",
      impact: "Facebook, Instagram, WhatsApp, and internal tooling offline for 6 hours.",
      summary: "A routine maintenance command disconnected Facebook's backbone network. This caused their DNS servers to withdraw BGP routing advertisements, making their entire domain unreachable.",
      timeline: [
        { time: "15:39 UTC", event: "An engineer runs a routine command to assess global backbone capacity." },
        { time: "15:40 UTC", event: "The command inadvertently disconnects all connections in the backbone network, isolating data centers." },
        { time: "15:41 UTC", event: "DNS name servers detect isolation and withdraw Border Gateway Protocol (BGP) routes, making Facebook IP space invisible to the Internet." },
        { time: "16:30 UTC", event: "Engineers attempt remote remediation, but out-of-band access, SSH, and electronic office access badges fail because they depend on the offline network." },
        { time: "18:00 UTC", event: "Physical response teams arrive at the Santa Clara data center. Security clearance and cage access are delayed due to offline verification systems." },
        { time: "21:28 UTC", event: "Backbone router is manually reset. BGP routes reappear, and services slowly recover." }
      ],
      cause: "A configuration command cut data centers off from the backbone. Lack of out-of-band communication paths independent of the production network delayed mitigation.",
      lessons: [
        "<strong>Configuration Guardrails:</strong> Build static analysis tools into network management interfaces to block commands that partition the network.",
        "<strong>Isolated Out-of-Band Access:</strong> Maintain physically independent networks for emergency administrator access.",
        "<strong>Physical Outage Playbooks:</strong> Ensure datacenter access, keys, and credentials work during total network blackouts."
      ]
    }
  ],

  prodverbs: [
    { quote: "If a human operator needs to touch your system during normal operations, you have a bug.", author: "SRE Wisdom" },
    { quote: "Hope is not a strategy.", author: "Benjamin Treynor Sloss (Google SRE Founder)" },
    { quote: "Uptime is a lagging indicator. Your error budget is the leading metric that keeps you honest.", author: "Site Reliability Workbook" },
    { quote: "Today's manual operational workaround is tomorrow's structural bottleneck.", author: "Systems Architect" },
    { quote: "A system is not truly reliable until it has survived the sudden removal of its main engineer.", author: "Production Maxim" },
    { quote: "Failures are inevitable, but cascading outages are an engineering design choice.", author: "Distributed Systems Rule" },
    { quote: "If you don't actively manage your toil, toil will manage your career.", author: "SRE Proverb" },
    { quote: "Adding capacity to a broken architecture is just buying an expensive ticket to a larger outage.", author: "Scale Principle" },
    { quote: "The fastest code is the code that doesn't run. The most reliable server is the one you don't provision.", author: "Efficiency Guide" },
    { quote: "An incident postmortem without action items is just a very expensive creative writing exercise.", author: "Incident Command" },
    { quote: "A database partition will happen. Whether you choose consistency or availability is a business decision, not a network fluke.", author: "PACELC Truth" },
    { quote: "Automation is not about doing tasks faster. It is about removing the human error out of doing tasks at all.", author: "Ops Logic" },
    { quote: "Alert on symptoms that affect customers, not on infrastructure indicators that look scary on a graph.", author: "Monitoring Standard" },
    { quote: "Complexity is the enemy of reliability. Build simple systems and let them scale naturally.", author: "Design Guideline" }
  ],

  readinessChecklist: [
    {
      category: "Architecture & Design",
      items: [
        "No single point of failure (SPOF) exists in the critical path.",
        "System supports graceful degradation (features fail silently or disable when overloaded).",
        "Consistent hashing or appropriate routing keys are configured for stateful shards.",
        "Microservice boundaries utilize circuit breakers and timeouts on all outbound calls."
      ]
    },
    {
      category: "Capacity & Operations",
      items: [
        "Auto-scaling policies are defined and validated under load.",
        "Max connection limits, thread pools, and queue lengths are tuned and documented.",
        "Database migrations can be applied and rolled back with zero downtime.",
        "Rate limiters protect downstream resources from thundering herds."
      ]
    },
    {
      category: "Telemetry & Alerting",
      items: [
        "The Four Golden Signals (Latency, Traffic, Errors, Saturation) are instrumented.",
        "Alerting is based on SLO burn rates, not static CPU or Memory thresholds.",
        "Logs include unique Correlation IDs for tracking requests across microservices.",
        "Dashboards distinguish between internal background tasks and customer-facing requests."
      ]
    },
    {
      category: "Incident Response",
      items: [
        "An on-call schedule is established with primary and secondary engineers.",
        "Runbooks are written and linked to all paging alerts.",
        "An Incident Commander role is defined for high-severity P0/P1 incidents.",
        "Log files are stored in an immutable, searchable database with scrubbing of PII."
      ]
    }
  ]
};

// Export to window object for browser access
if (typeof window !== 'undefined') {
  window.contentData = contentData;
}
if (typeof module !== 'undefined') {
  module.exports = contentData;
}
