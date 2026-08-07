# Site Reliability & System Design Resource Portal (sd)

Welcome to the **Site Reliability & System Design Resource Portal**, a comprehensive, interactive digital library and tool suite inspired by [Google SRE Resources](https://sre.google/resources/). This portal is designed to bridge the gap between theoretical distributed systems architecture and real-world production reliability.

## 🚀 Key Features

1. **Digital Library & Book Reader**
   - Contains three comprehensive books covering *Distributed Systems Foundation*, *Site Reliability Engineering Guide*, and *Secure & Resilient Architecture*.
   - Features an interactive chapter drawer for focused, high-readability study.

2. **Interactive Load Balancer & Traffic Simulator**
   - A visual particle-based traffic simulation representing client requests entering a gateway.
   - Test routing algorithms: *Round Robin*, *Least Connections*, and *Random Selection*.
   - Dynamically adjust replica health parameters (toggle online/offline) and server latency weights.
   - Monitor real-time stats (Total requests, successful returns, 50x errors, and live uptime rates).

3. **SLO & Error Budget Calculator**
   - Interactively adjust SLO availability percentages (e.g. `99.9%` to `99.999%`).
   - Computes allowed downtime metrics over Daily, Weekly, Monthly, and Yearly windows.
   - Dynamically tracks remaining monthly error budgets based on active request volumes.

4. **Museum of Broken Architectures (MOBA)**
   - Retrospective analyses of famous high-severity historical outages: *Knight Capital Collapse (2012)*, *AWS S3 Metadata Failure (2017)*, *Cloudflare CPU Backtracking (2019)*, and *Facebook BGP Blackout (2021)*.
   - Includes detailed root-cause writeups, chronologies of event timelines, and core SRE takeaways.

5. **Incident Commander Role-Play Simulator**
   - A choice-based outage response training module.
   - Step into the shoes of the Incident Commander during a critical P0 outage.
   - Manage team stress levels, public relations pressure, and mitigation progress. Learn how to delegate communications, rollback safely, and write blameless postmortems.

6. **Production Readiness Checklist**
   - A structured checklist tool to audit services across architecture, capacity, alerting telemetry, and incident readiness before shipping to production.

7. **[CAP Theorem Comprehensive Guide](cap-theorem/README.md)**
   - Complete coverage of the CAP theorem: formal proof origins, the three guarantees explained, CP vs AP system classifications, and the PACELC extension.
   - [Decision Framework & Cheat Sheet](cap-theorem/cheat-sheet.md) — quick-reference decision trees, quorum math, consensus protocol comparison, and interview patterns.
   - [Real-World Database Deep Dives](cap-theorem/database-deep-dives.md) — production-level analysis of Cassandra, Spanner, DynamoDB, etcd, MongoDB, and CockroachDB with architecture diagrams and configuration details.

8. **Kubernetes Batch Computing & Job Orchestration** *(NEW — inspired by [Netflix Kueue Tech Blog](https://netflixtechblog.com/))*
   - Four-chapter book covering batch vs. service workloads, Kueue architecture (ClusterQueue, LocalQueue, ResourceFlavor, Cohort), preemption & fair sharing, and the Netflix CMB-to-Kueue migration case study.
   - New Museum of Outages entry: *"The Batch Quota Exhaustion Cascade"* — a composite case study on resource starvation in batch systems lacking preemption.
   - Five new Systems Prodverbs on batch computing, resource management, and multi-tenant infrastructure economics.

---

## 🛠️ Technology Stack

- **Core**: Semantic HTML5 markup
- **Styling**: Modern Vanilla CSS3 with HSL tailored variables, Glassmorphism backdrop-filters, custom scrollbars, and fluid animations.
- **Logic**: Vanilla ES6 JavaScript (zero external dependencies, ensuring 100% offline support and sub-millisecond load speeds).
- **Typography**: Inter, Outfit, Fira Code, and Lora fonts imported dynamically.

---

## 💻 How to Run Locally

Since this portal is a lightweight, dependency-free static application, it can be launched instantly in any modern web browser:

### Option 1: Direct Open
Double-click `index.html` or drag it into any web browser.

### Option 2: Local Web Server
For optimal performance and search functionality, launch a simple local development server:

**Using Python:**
```bash
python3 -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

**Using Node.js / NPM:**
```bash
npx http-server -p 8000
```

---

## 🌐 Deployment to GitHub Pages

To host this portal publicly on your GitHub profile:
1. Push the code to your repository: `nbajpai-code/sd`.
2. Go to the repository settings on GitHub.
3. Navigate to **Pages** in the sidebar.
4. Set the source branch to `main` (or `master`) and select `/ (root)` as the folder.
5. Click **Save**. Your portal will be live at `https://nbajpai-code.github.io/sd/`!
