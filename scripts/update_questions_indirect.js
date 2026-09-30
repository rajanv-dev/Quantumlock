import fs from 'fs';
import { DEFAULT_20_QUESTIONS } from '../server/defaultQuestions.js';

// Map of indirect, difficult, cinematic Intel 5 and Questions for all 30 rooms
const INDIRECT_INTEL_MAP = {
  Q01: {
    intel5: "A locked corridor where every storage cell sits side-by-side in uninterrupted physical alignment, accessible in a single tick if you know its exact numeric offset from the threshold. Name this foundational contiguous construct.",
    question: "Name the contiguous, index-addressable storage structure that grants instantaneous direct access to any slot."
  },
  Q02: {
    intel5: "A vertical containment silo where the newest energy crystal deposited is the only one you can reach, trapping everything beneath until the summit is cleared. What sacred reverse-order mechanism governs this chamber?",
    question: "Which disciplinary architecture forces the latest arrival to depart before anyone beneath can escape?"
  },
  Q03: {
    intel5: "A conveyor conduit where early arrivals claim total precedence—entrance at the tail, exit at the head, with zero line-jumping permitted under Doom's law. Identify this unyielding transit convention.",
    question: "Identify the orderly conduit where chronological arrival dictates absolute priority of extraction."
  },
  Q04: {
    intel5: "A temporal paradox protocol: the final byte written into the core is the first to be consumed, while the pioneer entry waits at the bottom of time. Enter the 4-letter operational standard.",
    question: "What four-letter operational principle dictates that the newest entry is consumed first?"
  },
  Q05: {
    intel5: "The ancient ethical protocol of computational throughput: whoever knocked on the gate first shall be the first delivered through the breach. Enter the 4-letter acronym.",
    question: "What four-letter scheduling doctrine ensures strict chronological equity for every waiting packet?"
  },
  Q06: {
    intel5: "Disordered cosmic debris lies scattered across the buffer. To align the resonance matrix, every entry must find its strictly monotonic position relative to its neighbors. What transformative algorithmic discipline is required?",
    question: "What systematic procedure transforms chaos into strict monotonic alignment?"
  },
  Q07: {
    intel5: "No indices, no tree branches, no pre-sorted shortcuts—the optic sensor is doomed to inspect every single chamber in raw unbroken sequence from index zero until destiny is found or exhausted. Name this brute-force expedition.",
    question: "What exhaustive inspection routine marches through every item sequentially without skipping?"
  },
  Q08: {
    intel5: "Faced with a billion sorted star-gates, the navigator inspects the exact center, slices the universe in two, discards half of existence in a single cycle, and repeats. Name this swift halving discipline.",
    question: "What logarithmic strategy cuts the search space in half with every single comparison?"
  },
  Q09: {
    intel5: "An infinite mirror chamber where a ritual solves itself by summoning a tinier replica of its own spirit, descending through nested reflections until hitting the bedrock of a base reality. Name this computational ouroboros.",
    question: "What self-referential paradigm resolves grand enigmas by invoking smaller reflections of itself?"
  },
  Q10: {
    intel5: "Within Doom's citizen ledger, no two souls may share this attribute, nor may it ever dissolve into the void of null. It is the unyielding singular anchor of relational identity. Enter its name.",
    question: "What relational constraint acts as the unique, non-null anchor for every row in a table?"
  },
  Q11: {
    intel5: "A legacy protocol encoded in the archetype blueprint: rather than forging newborn sentinels from scratch, offspring constructs automatically receive the armor, weaponry, and traits of their ancestral progenitor. Name this generational transmission pillar.",
    question: "What foundational OOP pillar allows descendant entities to automatically acquire the traits and behaviors of their progenitor?"
  },
  Q12: {
    intel5: "A single command string—'ENGAGE'—is broadcast across the fleet, yet the drone fires lasers, the golem raises a shield, and the phantom vanishes into shadows. One invocation, endless morphing manifestations. Enter the Greek-rooted pillar.",
    question: "What Greek-derived OOP concept allows a single uniform interface to trigger vastly different behaviors depending on the receiving entity?"
  },
  Q13: {
    intel5: "The core reactor vitals are locked inside an impenetrable black-box shell; outsider entities are forbidden direct contact with the internal variables and may only interact through sanctified access valves. Identify this protective fortress pillar.",
    question: "What architectural discipline conceals internal state within a boundary, exposing only guarded interfaces to the outside world?"
  },
  Q14: {
    intel5: "Sentinel Alpha clutches Key A while begging for Key B; Sentinel Beta holds Key B while starving for Key A. Neither will yield, no preemption is allowed, and time freezes in an eternal circular Mexican standoff. Diagnose this paralysis.",
    question: "What catastrophic concurrency paralysis occurs when mutually waiting entities freeze eternally over withheld keys?"
  },
  Q15: {
    intel5: "To eliminate external fragmentation in the memory matrix, Doom's hypervisor carves virtual memory into uniform fixed-size parcels and maps them onto physical hardware frames via translation tables. Name this chunking scheme.",
    question: "What OS memory virtualization scheme maps uniform fixed-size logical partitions directly onto physical frames?"
  },
  Q16: {
    intel5: "A ripple expanding in concentric rings across a star map: it explores every immediate neighbor at distance 1 before daring to set foot on distance 2, guaranteeing the minimum hops in unweighted space. Enter its standard 3-letter acronym.",
    question: "Which 3-letter traversal expands in level-by-level concentric frontiers to guarantee the fewest hops in unweighted graphs?"
  },
  Q17: {
    intel5: "A lone explorer plunges recklessly down a single dark labyrinth branch, hitting dead ends before backtracking step-by-step through the call stack to explore uncharted chasms. Enter its 3-letter acronym.",
    question: "Which 3-letter traversal dives to the absolute depths of each branch before retracing its steps?"
  },
  Q18: {
    intel5: "An imperial Roman obfuscation technique where every glyph in the imperial dispatch is systematically displaced by a fixed circular rotation across the alphabet wheel. Identify this historical substitution cipher.",
    question: "What ancient Roman military cipher obscures messages by shifting every character by a constant uniform distance across the alphabet?"
  },
  Q19: {
    intel5: "The ultimate cryptographic mask: it rewards distinction and punishes conformity, outputting true if and only if the dual inputs disagree. Applied twice with the same key, it resurrects the original plaintext untouched. Name this 3-letter gate.",
    question: "Which reversible 3-letter logic gate yields 1 for disparity, 0 for identity, and acts as the foundation of symmetric masks?"
  },
  Q20: {
    intel5: "Free from the rigid shackles of relational table columns, this polymorphic BSON payload encapsulates nested arrays and key-value attributes as an independent atomic entity in the collection. What is this fundamental NoSQL unit?",
    question: "What schema-flexible, polymorphic BSON entity constitutes the atomic record unit of NoSQL collections?"
  },
  Q21: {
    intel5: "A scattered constellation in heap space where no element knows its neighbors' addresses except through explicit directional pointers embedded in each cargo node. What fragile dynamic chain is this?",
    question: "What dynamic linear collection consists of scattered memory nodes linked solely through pointer references?"
  },
  Q22: {
    intel5: "A dendritic hierarchy rooted at the citadel crown, where every junction point is strictly forbidden from spawning more than a left or right successor. Name this dual-branching arboreal structure.",
    question: "What hierarchical bifurcating structure restricts every parental junction to at most a left and right descendant?"
  },
  Q23: {
    intel5: "A mathematical forge converts arbitrary alphanumeric keys into bucket addresses through a deterministic scramble, bypassing linear scans to seize any item in expected O(1) time. Name this associative powerhouse.",
    question: "What associative data structure harnesses deterministic mathematical scrambling to achieve O(1) expected retrieval?"
  },
  Q24: {
    intel5: "To purge anomalies of insertion, update, and deletion, the grand architect decomposes sprawling monolithic tables into clean relational forms anchored by functional dependencies. Name this purification discipline.",
    question: "What mathematical database restructuring process eliminates redundancy and anomalies by progressing through successive normal forms?"
  },
  Q25: {
    intel5: "A lightweight strand of execution woven inside a heavyweight process boundary, possessing its own stack and registers while freely swimming in the shared address space of its siblings. Identify this CPU scheduling unit.",
    question: "What lightweight schedulable strand of execution shares memory address space with peer workers within a parent process?"
  },
  Q26: {
    intel5: "Dijkstra's ancient railroad signalkeeper: an atomic integer gauge with dual non-divisible rites—one to decrement and sleep if empty (P), and one to increment and awaken a slumbering worker (V). Name this synchronization sentinel.",
    question: "What atomic integer synchronization primitive regulates multi-resource access using classic P (wait) and V (signal) operations?"
  },
  Q27: {
    intel5: "A greedy pathfinder traverses weighted stellar hyperlanes by continuously extracting the minimum tentative distance from a priority queue and relaxing forward edges, forever blind to negative energy anomalies. Name the Dutch computer scientist behind this algorithm.",
    question: "Which famous greedy single-source shortest path algorithm relaxes edge weights using a priority queue, requiring all edge costs to be non-negative?"
  },
  Q28: {
    intel5: "The pilot cockpit reveals only a sleek throttle and heading compass, banishing the millions of fiery hydraulic calculations behind an opaque interface mask. Name this fundamental pillar of complexity reduction.",
    question: "What foundational software design principle distills intricate system realities into simplified, high-level behavioral interfaces?"
  },
  Q29: {
    intel5: "A lightning-fast staging sanctum nestled right against the processor core, exploiting temporal and spatial locality to intercept data requests before the sluggish main memory bus is ever provoked. Name this ultra-fast buffer.",
    question: "What high-speed hardware or software buffer harnesses spatial and temporal locality to prevent costly trips to main storage?"
  },
  Q30: {
    intel5: "A relational bridge across tabular realms: an attribute embedded within one record that points with unyielding referential integrity to the sovereign primary key of a distant table. Enter this cross-table anchor.",
    question: "What relational integrity constraint embeds a pointer in a child table to enforce references to a sovereign primary key in another table?"
  }
};

const updatedQuestions = DEFAULT_20_QUESTIONS.map((q) => {
  const custom = INDIRECT_INTEL_MAP[q.id];
  if (!custom) return q;

  const newStory = [...q.story];
  if (newStory.length > 0) {
    newStory[newStory.length - 1] = custom.intel5;
  }

  return {
    ...q,
    story: newStory,
    question: custom.question
  };
});

const fileContent = `export const DEFAULT_20_QUESTIONS = ${JSON.stringify(updatedQuestions, null, 2)};\n`;
fs.writeFileSync('./server/defaultQuestions.js', fileContent, 'utf8');
console.log('✅ Successfully updated all 30 questions in server/defaultQuestions.js with indirect, cryptic, challenging Intel 5 entries.');
