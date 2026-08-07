# CAP Theorem: Real-World Database Deep Dives

[← Back to CAP Guide](README.md) · [← Back to Main Portal](../README.md)

This document provides production-level analysis of how specific database systems implement their CAP trade-offs, including configuration details, failure behavior, and operational guidance.

---

## 1. Apache Cassandra — The AP Benchmark

### Architecture Overview

Cassandra uses a **peer-to-peer (leaderless)** ring architecture. Every node is equal; there is no single point of failure. Data is partitioned across the ring using consistent hashing, and replicated to `N` nodes (configurable replication factor).

```
           ┌────────┐
      ┌───►│ Node E │───┐
      │    └────────┘   │
 ┌────────┐          ┌────────┐
 │ Node D │          │ Node A │  ←── Client writes key "user:123"
 └────────┘          └────────┘      Hashes to position on ring
      │    ┌────────┐   │            Replicated to next N nodes clockwise
      └───►│ Node B │◄──┘
           └────────┘
           ┌────────┐
           │ Node C │
           └────────┘
```

### Tunable Consistency

Cassandra's killer feature is per-query consistency tuning:

```cql
-- AP read (fast, possibly stale)
SELECT * FROM users WHERE id = 'user123' USING CONSISTENCY ONE;

-- CP read (strong, requires quorum)
SELECT * FROM users WHERE id = 'user123' USING CONSISTENCY QUORUM;

-- Strongest read (all replicas must respond)
SELECT * FROM users WHERE id = 'user123' USING CONSISTENCY ALL;
```

### Partition Behavior

During a network partition:
- **With `ONE` consistency:** Both sides of the partition can read and write independently → AP behavior
- **With `QUORUM` consistency:** Only the partition with majority replicas can read/write → CP behavior
- **Hinted Handoff:** When a target replica is unreachable, the coordinator stores a "hint" and replays it when the node recovers

### Anti-Entropy Repair

After a partition heals, Cassandra reconciles data using:
1. **Read Repair:** During a read, if replicas return different values, the coordinator sends the latest value to stale replicas
2. **Merkle Tree Repair (`nodetool repair`):** Background process compares data hashes across replicas and synchronizes differences
3. **Last-Writer-Wins (LWW):** Conflicts are resolved by timestamp; the write with the highest timestamp wins

### PACELC Classification: **PA/EL**
- During Partition: Available (serves from any replica)
- Else: Low Latency (asynchronous replication by default)

---

## 2. Google Cloud Spanner — The CP Gold Standard

### Architecture Overview

Spanner is the first system to provide **globally distributed, strongly consistent transactions** at scale. It achieves this through two innovations:

1. **TrueTime API:** Uses atomic clocks and GPS receivers in every data center to bound clock uncertainty to ~7ms. This allows Spanner to assign globally meaningful timestamps.
2. **Paxos Groups:** Data is sharded into "splits" (tablets), each replicated across zones/regions using Paxos consensus.

```
┌─────────────────────────────────────────────────────────┐
│                    Spanner Architecture                   │
│                                                           │
│   Zone A (US-East)    Zone B (US-Central)   Zone C (EU)  │
│   ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│   │  Tablet 1    │◄──►│  Tablet 1    │◄──►│  Tablet 1  │ │
│   │  (Leader)    │Pax │  (Replica)   │Pax │  (Replica) │ │
│   └──────────────┘    └──────────────┘    └────────────┘ │
│   ┌──────────────┐    ┌──────────────┐    ┌────────────┐ │
│   │  Tablet 2    │◄──►│  Tablet 2    │◄──►│  Tablet 2  │ │
│   │  (Replica)   │Pax │  (Leader)    │Pax │  (Replica) │ │
│   └──────────────┘    └──────────────┘    └────────────┘ │
│                                                           │
│   TrueTime: [earliest, latest] uncertainty interval       │
│   Commit waits until: latest < commit_timestamp           │
│   Guarantees: If T1 commits before T2 starts,             │
│               then T1.timestamp < T2.timestamp            │
└─────────────────────────────────────────────────────────┘
```

### Partition Behavior

During a partition:
- Tablets in the minority partition cannot achieve Paxos quorum → **become unavailable**
- Tablets in the majority partition continue operating normally
- No stale reads ever occur — consistency is absolute

### Trade-off: Latency

The cost of external consistency is latency:
- **Single-region reads:** ~1-5ms (can read from local leader)
- **Cross-region writes:** ~50-200ms (must achieve Paxos quorum across regions + TrueTime wait)
- **Stale reads (`MAX_STALENESS`):** Spanner allows bounded-stale reads with lower latency if application can tolerate it

### PACELC Classification: **PC/EC**
- During Partition: Consistent (unavailable in minority)
- Else: Consistent (TrueTime synchronization adds latency)

---

## 3. Amazon DynamoDB — AP with Strong Consistency Option

### Architecture Overview

DynamoDB is AWS's managed key-value and document database. Inspired by the original Amazon Dynamo paper (2007), it has evolved significantly.

### Consistency Modes

| Mode | Behavior | Latency | CAP |
| :--- | :--- | :--- | :--- |
| **Eventually Consistent Read** (default) | May return stale data | ~1-5ms | AP |
| **Strongly Consistent Read** | Returns latest committed write | ~5-15ms | CP |
| **Transactional** (TransactWriteItems) | ACID transactions across items | ~10-25ms | CP |

```python
# Eventually consistent read (AP — default)
response = table.get_item(Key={'id': 'user123'})

# Strongly consistent read (CP)
response = table.get_item(
    Key={'id': 'user123'},
    ConsistentRead=True
)
```

### Global Tables (Multi-Region)

DynamoDB Global Tables replicate data across multiple AWS regions with:
- **Multi-active (multi-leader):** All regions can accept writes
- **Last-Writer-Wins:** Conflicts resolved by timestamp
- **Replication Lag:** Typically < 1 second, but not guaranteed during partitions

### PACELC Classification: **PA/EL** (default), configurable to **PC/EC** per-read

---

## 4. etcd — The Kubernetes Backbone

### Architecture Overview

etcd is a distributed key-value store that uses **Raft consensus** for strong consistency. It is the control plane data store for Kubernetes (storing all cluster state: pods, services, configs).

### Why etcd Must Be CP

Kubernetes depends on etcd for:
- **Leader election** (controller manager, scheduler)
- **Configuration consistency** (pod specs, service definitions)
- **Watch mechanism** (controllers react to state changes)

If etcd returned stale data, Kubernetes could schedule pods on deleted nodes, or run duplicate replicas of singleton services.

### Partition Behavior

```
etcd cluster: 5 nodes (3-node quorum required)

Partition:
  Majority side (3 nodes): Continues serving reads & writes
  Minority side (2 nodes): Returns error for all operations

Recovery:
  When partition heals, minority nodes sync from the Raft log leader
```

### Operational Limits

| Parameter | Recommended Limit |
| :--- | :--- |
| Cluster size | 3, 5, or 7 nodes (odd numbers for quorum) |
| Max key-value size | 1.5 MB per key |
| Total database size | < 8 GB (beyond this, compaction struggles) |
| Heartbeat interval | 100-500ms |
| Election timeout | 1000-5000ms |

### PACELC Classification: **PC/EC**

---

## 5. MongoDB — The CP Journey

### Replica Set Architecture

MongoDB uses a **single-leader (primary)** replication model:

```
┌─────────┐     Oplog Repl.     ┌───────────────┐
│ PRIMARY  │ ──────────────────► │  SECONDARY 1   │
│ (Reads & │                     └───────────────┘
│  Writes) │     Oplog Repl.     ┌───────────────┐
│          │ ──────────────────► │  SECONDARY 2   │
└─────────┘                     └───────────────┘
```

### Read Preference Options

| Read Preference | Consistency | Availability | Use Case |
| :--- | :--- | :--- | :--- |
| `primary` (default) | Strong (CP) | Lower (primary must be reachable) | Transactions, critical reads |
| `primaryPreferred` | Strong when possible, stale if primary is down | Higher | Best-effort consistency |
| `secondary` | Eventual (AP) | Highest (any secondary can serve) | Analytics, reporting |
| `nearest` | Eventual | Lowest latency | Geo-distributed reads |

### Causal Consistency Sessions (MongoDB 3.6+)

MongoDB introduced causal consistency sessions, guaranteeing:
- **Read your own writes:** After writing, you always see your write
- **Monotonic reads:** Reads never go backward in time
- **Causal ordering:** If operation A causally precedes B, all clients see A before B

```javascript
const session = client.startSession({ causalConsistency: true });
const coll = session.getDatabase('mydb').getCollection('users');

// Write
coll.insertOne({ _id: 1, name: "Niraj" }, { session });

// Guaranteed to see the write above (even reading from a secondary)
const user = coll.findOne({ _id: 1 }, { session });
```

### PACELC Classification: **PC/EC** (with `primary` reads), **PA/EL** (with `secondary` reads)

---

## 6. CockroachDB — Raft-Based Distributed SQL

### How CockroachDB Achieves CP + SQL

CockroachDB provides serializable SQL transactions across a distributed cluster using:

1. **Data is split into ranges** (~512 MB each)
2. **Each range is a Raft group** with a leader and followers
3. **Transactions use MVCC** (Multi-Version Concurrency Control) with hybrid logical clocks
4. **Writes require Raft consensus** (majority acknowledgment)

### CAP Behavior

- **During partition:** Ranges in the minority partition become unavailable. The majority partition continues.
- **No stale reads:** All reads go through the Raft leader (or leaseholder) and reflect the latest committed state.
- **Trade-off:** Cross-region transactions have higher latency (~100-300ms) due to Raft quorum across regions.

### PACELC Classification: **PC/EC**

---

## Comparison Matrix: All Systems

| System | Model | CAP | PACELC | Consistency Level | Conflict Resolution | Best For |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **Cassandra** | Leaderless | AP* | PA/EL | Tunable | LWW, Read Repair | High-write IoT, time-series |
| **DynamoDB** | Managed | AP* | PA/EL | Tunable | LWW | Serverless, web apps |
| **Spanner** | Paxos Groups | CP | PC/EC | External | N/A (single truth) | Global finance, inventory |
| **CockroachDB** | Raft Ranges | CP | PC/EC | Serializable | N/A (single truth) | Distributed SQL |
| **etcd** | Raft | CP | PC/EC | Linearizable | N/A (single truth) | K8s, config, coordination |
| **MongoDB** | Single-Leader | CP* | PC/EC | Causal (sessions) | Primary wins | General purpose |
| **Riak** | Leaderless | AP | PA/EL | Eventual | CRDTs, Vector Clocks | High availability, IoT |
| **Redis Cluster** | Multi-Leader | AP* | PA/EL | Eventual | LWW | Caching, sessions |
| **ZooKeeper** | ZAB | CP | PC/EC | Sequential | N/A | Coordination, locks |

*\* Tunable — default behavior shown, can be configured differently per query.*

---

*[← Back to CAP Guide](README.md) · [← Back to Main Portal](../README.md)*
