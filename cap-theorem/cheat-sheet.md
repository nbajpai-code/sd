# CAP Theorem Decision Framework & Cheat Sheet

[← Back to CAP Guide](README.md) · [← Back to Main Portal](../README.md)

---

## Quick Decision Tree

```
Is your system distributed across multiple machines?
│
├── NO → CAP does not apply. Use a single-node database.
│
└── YES → Can your system tolerate network partitions?
    │
    ├── NO → You have a single point of failure. Fix this first.
    │
    └── YES (all real distributed systems) → During a partition:
        │
        ├── "Stale data would cause financial loss, safety risk,
        │    or data corruption"
        │    └── Choose CP → Reject requests during partition
        │        Examples: Banking, inventory, leader election
        │
        └── "Stale data causes minor inconvenience or can be
             merged after partition heals"
             └── Choose AP → Serve stale data during partition
                 Examples: Social feeds, DNS, shopping carts, CDN
```

---

## One-Page Comparison Table

| Dimension | CP Systems | AP Systems |
| :--- | :--- | :--- |
| **During a Partition** | Refuse requests from minority partition | All nodes continue serving |
| **Read Guarantee** | Latest committed write or error | Some value (possibly stale) |
| **Write Guarantee** | Only accepted if quorum reached | Accepted locally; replicated later |
| **Latency (normal)** | Higher (synchronous replication) | Lower (asynchronous replication) |
| **Latency (partition)** | Timeout/error for minority nodes | Unchanged |
| **Conflict Resolution** | Not needed (single source of truth) | Required (LWW, vector clocks, CRDTs) |
| **Data Loss Risk** | Near zero (committed = durable) | Possible (async replica lag) |
| **Use Cases** | Finance, config, coordination, locks | Social, content, IoT, caching |
| **Example Systems** | etcd, ZooKeeper, Spanner, CockroachDB | Cassandra, DynamoDB, Riak, DNS |

---

## PACELC Quick Reference

```
┌────────────────────────────────────────────────────────┐
│                     PACELC Matrix                       │
├────────────┬────────────────┬──────────────────────────┤
│  System    │ During Partition│ During Normal Operation  │
│            │    (P)         │      (E)                 │
├────────────┼────────────────┼──────────────────────────┤
│ Cassandra  │ AP (Available) │ EL (Low Latency)         │
│ DynamoDB   │ AP (Available) │ EL (Low Latency)         │
│ Riak       │ AP (Available) │ EL (Low Latency)         │
│ MongoDB    │ CP (Consistent)│ EC (Consistent)          │
│ Spanner    │ CP (Consistent)│ EC (Consistent)          │
│ CockroachDB│ CP (Consistent)│ EC (Consistent)          │
│ Cosmos DB  │ Configurable   │ Configurable (5 levels)  │
│ PNUTS      │ AP (Available) │ EC (Consistent)          │
└────────────┴────────────────┴──────────────────────────┘
```

---

## Consistency Models Cheat Sheet

```
STRONGEST ──────────────────────────────────────────── WEAKEST

Linearizable     Sequential      Causal        Eventual
    │                │              │              │
 "Real-time       "Total order   "Cause before  "Eventually
  ordering.        across all     effect. No     converges.
  Reads see        processes.     ordering for   No time
  latest write     No real-time   concurrent     guarantee."
  immediately."    guarantee."    operations."
    │                │              │              │
 Spanner         ZooKeeper      MongoDB       Cassandra
 etcd                           (causal        (ONE/ANY)
 CockroachDB                    sessions)      DynamoDB
                                               DNS
```

---

## Quorum Math Quick Reference

For `N` replicas, `W` write acknowledgments, `R` read responses:

| Goal | Formula | Example (N=3) |
| :--- | :--- | :--- |
| Strong consistency | W + R > N | W=2, R=2 |
| Read-optimized | W=N, R=1 | W=3, R=1 (any single read is fresh) |
| Write-optimized | W=1, R=N | W=1, R=3 (fast writes, slow reads) |
| Eventual consistency | W=1, R=1 | W=1, R=1 (fastest, weakest) |
| Fault tolerance (writes) | W ≤ N - f | For f=1 failure: W ≤ 2 |
| Fault tolerance (reads) | R ≤ N - f | For f=1 failure: R ≤ 2 |

**Key insight:** `W + R > N` ensures that the read set and write set always overlap, guaranteeing at least one node has the latest value.

---

## Consensus Protocol Comparison

| Protocol | Invented | Understandability | Performance | Used By |
| :--- | :---: | :---: | :---: | :--- |
| **Paxos** | 1989 | 🔴 Hard | Medium | Chubby, Megastore |
| **Multi-Paxos** | 1989+ | 🔴 Hard | Good | Spanner (original) |
| **Raft** | 2013 | 🟢 Easy | Good | etcd, CockroachDB, Consul, TiKV |
| **ZAB** | 2008 | 🟡 Medium | Good | ZooKeeper |
| **Viewstamped Repl.** | 1988 | 🟡 Medium | Medium | Research systems |
| **PBFT** | 1999 | 🔴 Hard | Low | Byzantine fault tolerant systems |

---

## Interview Pattern: How to Apply CAP in System Design

```
Step 1: "What data am I storing?"
         └── Identify the data model and access patterns

Step 2: "What happens if a user reads stale data?"
         ├── Unacceptable → CP
         └── Tolerable   → AP

Step 3: "What happens if a user cannot write?"
         ├── Unacceptable → AP
         └── Tolerable   → CP

Step 4: "Can different parts of my system make different choices?"
         └── YES! → Most real systems are CP for writes,
                     AP for reads, or tunable per-query

Step 5: "After the partition heals, how do I reconcile?"
         ├── CP: No reconciliation needed (one source of truth)
         └── AP: Need conflict resolution (LWW, CRDTs, app-level merge)

Step 6: "Even without partitions, what's my latency tolerance?"
         └── Apply PACELC: Low latency → EL, Strong consistency → EC
```

---

## Common Misconceptions

| Misconception | Reality |
| :--- | :--- |
| "CAP means pick 2 of 3" | Partition Tolerance is mandatory. The real choice is C vs A **during** a partition. |
| "My system is CA" | CA systems don't exist in practice unless it's a single machine. |
| "Consistency means ACID" | CAP Consistency = linearizability. ACID Consistency = application-level invariants. Different concepts. |
| "AP means data loss" | AP means stale reads, not data loss. Writes are buffered and reconciled after partition. |
| "CP systems are always slow" | CP systems are only slower during replication. With local reads, many CP systems are fast. |
| "You choose once for the whole system" | Different data paths can make different choices. Even per-query (Cassandra). |

---

*Print this page. Tape it to your monitor. You'll need it.*
