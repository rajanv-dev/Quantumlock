export const DEFAULT_20_QUESTIONS = [
  {
    "id": "Q01",
    "title": "ROOM 01: THE DOOM GATE",
    "subtitle": "If-Else Decisions",
    "category": "Programming",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 01</strong>",
      "The resistance strike team breaches a damaged subterranean security outpost situated at the outer perimeter of Doctor Doom's royal citadel. Heavy titanium blast gates seal off the main passage, their locking pins held in place by an active automated power conduit connected to an illuminated diagnostic terminal.",
      "An encrypted maintenance log recovered from a fallen technician's datapad explains that the gate's operating firmware continuously evaluates incoming authorization credentials before deciding on an action. Rather than relying on unpredictable cosmic power, the entire locking mechanism is governed by an automated, deterministic logical evaluation rule.",
      "When the team inserts a valid biometric token into the optical scanner, the hydraulic pins instantly retract with a loud hiss, allowing clearance. However, when an unrecognized token is tested, the terminal flashes crimson, emits a deafening alarm horn, and charges perimeter defense turrets.",
      "A locked corridor where every storage cell sits side-by-side in uninterrupted physical alignment, accessible in a single tick if you know its exact numeric offset from the threshold. Name this foundational contiguous construct."
    ],
    "codeLines": [],
    "question": "Name the contiguous, index-addressable storage structure that grants instantaneous direct access to any slot.",
    "hints": [
      {
        "text": "Focus on the two-branch conditional choice.",
        "penalty": 10
      },
      {
        "text": "Connect the true/false decision behavior to a basic college CS topic.",
        "penalty": 20
      },
      {
        "text": "The answer is IF-ELSE.",
        "penalty": 30
      }
    ],
    "fragment": 1,
    "evidenceTitle": "The Doom Gate Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "IF-ELSE identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "IF-ELSE",
      "IF ELSE",
      "IFELSE",
      "IF",
      "CONDITIONAL"
    ],
    "answer": "IF-ELSE",
    "order": 1,
    "cleanTitle": "THE DOOM GATE"
  },
  {
    "id": "Q02",
    "title": "ROOM 02: THE ENDLESS SIGNAL",
    "subtitle": "Loops",
    "category": "Programming",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 02</strong>",
      "Deep inside an abandoned communications bunker, an automated broadcast tower is pulsing high-voltage energy waves across the ruined sector. Multiple CRT monitors mounted across the central console display a relentless waterfall of telemetry packets cycling without pause.",
      "The team reviews the subsystem telemetry to understand why the transmitter refuses to power down despite the citadel's primary grid failure. A recovered maintenance manual confirms that the broadcast routine was specifically configured to repeat an identical series of instructions autonomously until interrupted.",
      "Oscilloscope readings reveal the exact same sequence executing continuously: preparing transmission buffers, emitting the microwave pulse, decrementing the counter, and immediately checking whether the active signal flag remains set before restarting.",
      "A vertical containment silo where the newest energy crystal deposited is the only one you can reach, trapping everything beneath until the summit is cleared. What sacred reverse-order mechanism governs this chamber?"
    ],
    "codeLines": [],
    "question": "Which disciplinary architecture forces the latest arrival to depart before anyone beneath can escape?",
    "hints": [
      {
        "text": "Focus on the repeated execution cycle.",
        "penalty": 10
      },
      {
        "text": "Think of while, for, or repeat control structures.",
        "penalty": 20
      },
      {
        "text": "The answer is LOOP.",
        "penalty": 30
      }
    ],
    "fragment": 2,
    "evidenceTitle": "The Endless Signal Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "LOOP identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "LOOP",
      "LOOPS",
      "WHILE LOOP",
      "FOR LOOP",
      "ITERATION"
    ],
    "answer": "LOOP",
    "order": 2,
    "cleanTitle": "THE ENDLESS SIGNAL"
  },
  {
    "id": "Q03",
    "title": "ROOM 03: THE NUMBERED VAULT",
    "subtitle": "Arrays",
    "category": "Programming",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 03</strong>",
      "The team enters a heavily reinforced subterranean vault housing rows of glowing plasma canisters. Each storage compartment along the metallic wall is etched with a consecutive numeric identifier starting strictly from position zero across the entire partition.",
      "An automated robotic arm responds to commands typed into the console. The control program does not need to traverse every canister sequentially; entering a specific numeric index allows the arm to calculate the exact physical memory offset and extract the container instantly in constant time.",
      "Technical schematics describe the storage area as a contiguous block in hardware memory where items of uniform size and data type reside side by side in fixed, addressable slots without any gaps.",
      "A conveyor conduit where early arrivals claim total precedence—entrance at the tail, exit at the head, with zero line-jumping permitted under Doom's law. Identify this unyielding transit convention."
    ],
    "codeLines": [],
    "question": "Identify the orderly conduit where chronological arrival dictates absolute priority of extraction.",
    "hints": [
      {
        "text": "Focus on contiguous index-based storage.",
        "penalty": 10
      },
      {
        "text": "Think of indexed list collections accessed with brackets [0].",
        "penalty": 20
      },
      {
        "text": "The answer is ARRAY.",
        "penalty": 30
      }
    ],
    "fragment": 3,
    "evidenceTitle": "The Numbered Vault Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "ARRAY identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "ARRAY",
      "ARRAYS",
      "LIST",
      "INDEXED ARRAY"
    ],
    "answer": "ARRAY",
    "order": 3,
    "cleanTitle": "THE NUMBERED VAULT"
  },
  {
    "id": "Q04",
    "title": "ROOM 04: THE LAST WEAPON",
    "subtitle": "Stack",
    "category": "Data Structures",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 04</strong>",
      "Inside Doom's heavy artillery silo, the resistance discovers a vertical pneumatic launch tube loaded with experimental plasma warheads. The narrow vertical shaft possesses only a single top hatch used for both ammunition loading and launch deployment.",
      "Maintenance schematics explain that whenever a fresh warhead arrives from the factory, it is lowered directly on top of all previously loaded units. When firing commands trigger, the mechanical loader can only eject the uppermost weapon that was loaded most recently.",
      "Technicians cannot retrieve older ordnance resting at the bottom of the tube without first extracting every single warhead placed above them one by one in reverse order of arrival.",
      "A temporal paradox protocol: the final byte written into the core is the first to be consumed, while the pioneer entry waits at the bottom of time. Enter the 4-letter operational standard."
    ],
    "codeLines": [],
    "question": "What four-letter operational principle dictates that the newest entry is consumed first?",
    "hints": [
      {
        "text": "Think about Last-In, First-Out (LIFO) behavior.",
        "penalty": 10
      },
      {
        "text": "Commonly manipulated with push and pop operations.",
        "penalty": 20
      },
      {
        "text": "The answer is STACK.",
        "penalty": 30
      }
    ],
    "fragment": 4,
    "evidenceTitle": "The Last Weapon Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "STACK identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "STACK",
      "STACKS",
      "LIFO"
    ],
    "answer": "STACK",
    "order": 4,
    "cleanTitle": "THE LAST WEAPON"
  },
  {
    "id": "Q05",
    "title": "ROOM 05: THE FIRST SURVIVOR",
    "subtitle": "Queue",
    "category": "Data Structures",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 05</strong>",
      "The squad discovers an automated decontamination airlock where evacuated civilians gather during citadel alert conditions. An automated robotic gatekeeper strictly regulates passage through the narrow processing corridor.",
      "Surveillance records reveal that incoming individuals must join at the rear of the hallway. The exit gate opens solely for the person who has been waiting the longest, processing each occupant in the exact chronological sequence of their arrival.",
      "No line-jumping or backward retrieval is permitted by the system; entry occurs strictly at the rear, while exit occurs strictly from the front without exception, maintaining absolute order.",
      "The ancient ethical protocol of computational throughput: whoever knocked on the gate first shall be the first delivered through the breach. Enter the 4-letter acronym."
    ],
    "codeLines": [],
    "question": "What four-letter scheduling doctrine ensures strict chronological equity for every waiting packet?",
    "hints": [
      {
        "text": "Think about First-In, First-Out (FIFO) processing.",
        "penalty": 10
      },
      {
        "text": "Works exactly like a queue or checkout line in everyday life.",
        "penalty": 20
      },
      {
        "text": "The answer is QUEUE.",
        "penalty": 30
      }
    ],
    "fragment": 5,
    "evidenceTitle": "The First Survivor Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "QUEUE identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "QUEUE",
      "QUEUES",
      "FIFO"
    ],
    "answer": "QUEUE",
    "order": 5,
    "cleanTitle": "THE FIRST SURVIVOR"
  },
  {
    "id": "Q06",
    "title": "ROOM 06: THE MIXED ARCHIVE",
    "subtitle": "Sorting",
    "category": "Algorithms",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 06</strong>",
      "An explosion inside the central records facility scattered thousands of numbered data cartridges across the archive floor in complete disarray. The index catalog is paralyzed until order is restored.",
      "A restoration script initiates on the main console. It methodically examines adjacent pairs of records, swaps their positions when out of sequence, and steadily transforms the chaotic pile into an organized lineup.",
      "After several systematic passes across the dataset, every cartridge sits in ascending numerical sequence from lowest security clearance to highest, making lookups possible again across the citadel network.",
      "Disordered cosmic debris lies scattered across the buffer. To align the resonance matrix, every entry must find its strictly monotonic position relative to its neighbors. What transformative algorithmic discipline is required?"
    ],
    "codeLines": [],
    "question": "What systematic procedure transforms chaos into strict monotonic alignment?",
    "hints": [
      {
        "text": "Think of Quick, Merge, or Bubble algorithms.",
        "penalty": 10
      },
      {
        "text": "The process of arranging unsorted items into order.",
        "penalty": 20
      },
      {
        "text": "The answer is SORTING.",
        "penalty": 30
      }
    ],
    "fragment": 6,
    "evidenceTitle": "The Mixed Archive Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "SORTING identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "SORTING",
      "SORT",
      "SORT ALGORITHM"
    ],
    "answer": "SORTING",
    "order": 6,
    "cleanTitle": "THE MIXED ARCHIVE"
  },
  {
    "id": "Q07",
    "title": "ROOM 07: THE HIDDEN RECORD",
    "subtitle": "Linear Search",
    "category": "Algorithms",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 07</strong>",
      "The resistance needs an emergency override code hidden within an unsorted list of millions of security event logs. The archive completely lacks index trees or pre-sorted keys.",
      "The scanning tool begins at the very first log entry in memory. It compares the target code against record 0, moves to record 1, and continues checking each consecutive record one by one across the entire file.",
      "If the target item is located near the very end, the scanner must inspect every single element before finding a match, producing an O(n) execution time profile across the unsorted entries.",
      "No indices, no tree branches, no pre-sorted shortcuts—the optic sensor is doomed to inspect every single chamber in raw unbroken sequence from index zero until destiny is found or exhausted. Name this brute-force expedition."
    ],
    "codeLines": [],
    "question": "What exhaustive inspection routine marches through every item sequentially without skipping?",
    "hints": [
      {
        "text": "Sequential examination from start to finish.",
        "penalty": 10
      },
      {
        "text": "Has O(n) worst-case time complexity on unsorted lists.",
        "penalty": 20
      },
      {
        "text": "The answer is LINEAR SEARCH.",
        "penalty": 30
      }
    ],
    "fragment": 7,
    "evidenceTitle": "The Hidden Record Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "LINEAR SEARCH identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "LINEAR SEARCH",
      "SEQUENTIAL SEARCH",
      "LINEAR"
    ],
    "answer": "LINEAR SEARCH",
    "order": 7,
    "cleanTitle": "THE HIDDEN RECORD"
  },
  {
    "id": "Q08",
    "title": "ROOM 08: THE HALF MAP",
    "subtitle": "Binary Search",
    "category": "Algorithms",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 08</strong>",
      "A navigational terminal contains a massive sorted database of planetary warp coordinates. Because the dataset is enormous, standard sequential checking is too slow to escape incoming patrol drones.",
      "The scanner jumps directly to the midpoint of the sorted list. If the target frequency is smaller than the middle value, it completely eliminates the upper half; if larger, it discards the lower half.",
      "By repeatedly dividing the remaining search interval in half, the terminal locates any key across a million entries in around twenty steps, demonstrating logarithmic efficiency.",
      "Faced with a billion sorted star-gates, the navigator inspects the exact center, slices the universe in two, discards half of existence in a single cycle, and repeats. Name this swift halving discipline."
    ],
    "codeLines": [],
    "question": "What logarithmic strategy cuts the search space in half with every single comparison?",
    "hints": [
      {
        "text": "Requires a sorted collection and divide-and-conquer logic.",
        "penalty": 10
      },
      {
        "text": "Halves the candidate range at each step (O(log n)).",
        "penalty": 20
      },
      {
        "text": "The answer is BINARY SEARCH.",
        "penalty": 30
      }
    ],
    "fragment": 8,
    "evidenceTitle": "The Half Map Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "BINARY SEARCH identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "BINARY SEARCH",
      "BINARY"
    ],
    "answer": "BINARY SEARCH",
    "order": 8,
    "cleanTitle": "THE HALF MAP"
  },
  {
    "id": "Q09",
    "title": "ROOM 09: THE SMALLER COPY",
    "subtitle": "Recursion",
    "category": "Programming",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 09</strong>",
      "The resistance encounters a nested security cipher consisting of concentric dimensional locks. The outer lock mechanism contains an identical smaller lock inside it, repeating into miniature layers.",
      "The decryption program uses an elegant routine: to solve the puzzle of size N, it calls an instance of itself to solve size N-1, pushing each pending call onto the call stack.",
      "When the inner problem reaches the smallest base case (size 0), the chain stops and returns calculated values back up through the hierarchy to solve the overall problem.",
      "An infinite mirror chamber where a ritual solves itself by summoning a tinier replica of its own spirit, descending through nested reflections until hitting the bedrock of a base reality. Name this computational ouroboros."
    ],
    "codeLines": [],
    "question": "What self-referential paradigm resolves grand enigmas by invoking smaller reflections of itself?",
    "hints": [
      {
        "text": "A self-referencing function that requires a base case to terminate.",
        "penalty": 10
      },
      {
        "text": "Commonly used in tree traversals, factorials, and divide-and-conquer.",
        "penalty": 20
      },
      {
        "text": "The answer is RECURSION.",
        "penalty": 30
      }
    ],
    "fragment": 9,
    "evidenceTitle": "The Smaller Copy Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "RECURSION identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "RECURSION",
      "RECURSIVE",
      "RECURSIVE FUNCTION"
    ],
    "answer": "RECURSION",
    "order": 9,
    "cleanTitle": "THE SMALLER COPY"
  },
  {
    "id": "Q10",
    "title": "ROOM 10: THE UNIQUE ID",
    "subtitle": "Primary Key",
    "category": "DBMS",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 10</strong>",
      "The central garrison relational database catalogues millions of cyborg soldiers and resistance operatives across Battleworld. Many soldiers share identical names, ranks, and unit designations.",
      "To prevent ambiguity and catastrophic data corruption, the database architect established a mandatory column constraint. Every single record is assigned an immutable, non-null value that cannot be duplicated anywhere in the table.",
      "Querying this specific attribute guarantees retrieving exactly one unique row with absolute certainty across the entire relational database system.",
      "Within Doom's citizen ledger, no two souls may share this attribute, nor may it ever dissolve into the void of null. It is the unyielding singular anchor of relational identity. Enter its name."
    ],
    "codeLines": [],
    "question": "What relational constraint acts as the unique, non-null anchor for every row in a table?",
    "hints": [
      {
        "text": "Unique and NOT NULL constraint on a database table column.",
        "penalty": 10
      },
      {
        "text": "The primary identifier used to index rows and create foreign keys.",
        "penalty": 20
      },
      {
        "text": "The answer is PRIMARY KEY.",
        "penalty": 30
      }
    ],
    "fragment": 10,
    "evidenceTitle": "The Unique Id Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "PRIMARY KEY identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "PRIMARY KEY",
      "PRIMARYKEY",
      "PK"
    ],
    "answer": "PRIMARY KEY",
    "order": 10,
    "cleanTitle": "THE UNIQUE ID"
  },
  {
    "id": "Q11",
    "title": "ROOM 11: THE CLASS OF GUARDS",
    "subtitle": "Inheritance",
    "category": "OOP",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 11</strong>",
      "Inside Doom's robotics laboratory, engineers inspect the software blueprints for the citadel's defense automatons. The base architecture defines a parent Sentinel class containing core attributes like armor rating and navigation routines.",
      "When engineers designed specialized units like the FlightSentinel and PlasmaSentinel, they did not rewrite common code from scratch. Instead, the new classes derived directly from the base Sentinel class.",
      "The derived subclasses automatically received all baseline properties while adding their own specialized weapons and behavior overrides.",
      "A legacy protocol encoded in the archetype blueprint: rather than forging newborn sentinels from scratch, offspring constructs automatically receive the armor, weaponry, and traits of their ancestral progenitor. Name this generational transmission pillar."
    ],
    "codeLines": [],
    "question": "What foundational OOP pillar allows descendant entities to automatically acquire the traits and behaviors of their progenitor?",
    "hints": [
      {
        "text": "Parent-child relationship in object-oriented programming.",
        "penalty": 10
      },
      {
        "text": "Uses keywords like 'extends' in Java or ':' in C++.",
        "penalty": 20
      },
      {
        "text": "The answer is INHERITANCE.",
        "penalty": 30
      }
    ],
    "fragment": 11,
    "evidenceTitle": "The Class Of Guards Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "INHERITANCE identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "INHERITANCE",
      "INHERIT"
    ],
    "answer": "INHERITANCE",
    "order": 11,
    "cleanTitle": "THE CLASS OF GUARDS"
  },
  {
    "id": "Q12",
    "title": "ROOM 12: THE MANY GUARDS",
    "subtitle": "Polymorphism",
    "category": "OOP",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 12</strong>",
      "The central defense console dispatches a single broadcast signal: `executeMission()` to an array of different military units including Drone, Turret, and Mech.",
      "Rather than requiring individual commands for every unit type, each distinct object responds appropriately to the exact same method call: the Drone takes flight, the Turret rotates its cannons, and the Mech engages kinetic shields.",
      "The underlying controller interacts with all objects through a uniform interface without needing to know their specific concrete implementations at compile time.",
      "A single command string—'ENGAGE'—is broadcast across the fleet, yet the drone fires lasers, the golem raises a shield, and the phantom vanishes into shadows. One invocation, endless morphing manifestations. Enter the Greek-rooted pillar."
    ],
    "codeLines": [],
    "question": "What Greek-derived OOP concept allows a single uniform interface to trigger vastly different behaviors depending on the receiving entity?",
    "hints": [
      {
        "text": "Greek term meaning 'many forms'.",
        "penalty": 10
      },
      {
        "text": "Achieved via method overriding, interfaces, and dynamic dispatch.",
        "penalty": 20
      },
      {
        "text": "The answer is POLYMORPHISM.",
        "penalty": 30
      }
    ],
    "fragment": 12,
    "evidenceTitle": "The Many Guards Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "POLYMORPHISM identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "POLYMORPHISM",
      "POLYMORPHIC"
    ],
    "answer": "POLYMORPHISM",
    "order": 12,
    "cleanTitle": "THE MANY GUARDS"
  },
  {
    "id": "Q13",
    "title": "ROOM 13: THE LOCKED DATA",
    "subtitle": "Encapsulation",
    "category": "OOP",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 13</strong>",
      "The citadel's primary antimatter reactor is governed by a secure software module. Diagnostic tests show that external scripts cannot directly modify sensitive internal variables like core temperature or fuel pressure.",
      "All critical data fields are marked private and sealed inside the module. Any external subsystem wishing to read or adjust reactor parameters must communicate strictly through designated public getter and setter methods.",
      "This architecture prevents unauthorized tampering and guarantees data validation rules before state changes occur across the subsystem.",
      "The core reactor vitals are locked inside an impenetrable black-box shell; outsider entities are forbidden direct contact with the internal variables and may only interact through sanctified access valves. Identify this protective fortress pillar."
    ],
    "codeLines": [],
    "question": "What architectural discipline conceals internal state within a boundary, exposing only guarded interfaces to the outside world?",
    "hints": [
      {
        "text": "Data hiding and bundling using private variables and public getters/setters.",
        "penalty": 10
      },
      {
        "text": "Protects internal state from external tampering.",
        "penalty": 20
      },
      {
        "text": "The answer is ENCAPSULATION.",
        "penalty": 30
      }
    ],
    "fragment": 13,
    "evidenceTitle": "The Locked Data Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "ENCAPSULATION identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "ENCAPSULATION",
      "DATA HIDING"
    ],
    "answer": "ENCAPSULATION",
    "order": 13,
    "cleanTitle": "THE LOCKED DATA"
  },
  {
    "id": "Q14",
    "title": "ROOM 14: THE TWO WAITING GUARDS",
    "subtitle": "Deadlock",
    "category": "Operating Systems",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 14</strong>",
      "The citadel's automated transport corridor is completely paralyzed. Two heavy construction droids are stationary at a narrow junction, locking up the entire logistics pipeline.",
      "Telemetry logs indicate that Droid 1 has acquired Lock A on the battery station and is waiting for Lock B on the rail system. Simultaneously, Droid 2 has acquired Lock B and is waiting for Lock A.",
      "Neither droid will release its held resource until it acquires the other, creating a permanent circular wait condition where no progress can occur.",
      "Sentinel Alpha clutches Key A while begging for Key B; Sentinel Beta holds Key B while starving for Key A. Neither will yield, no preemption is allowed, and time freezes in an eternal circular Mexican standoff. Diagnose this paralysis."
    ],
    "codeLines": [],
    "question": "What catastrophic concurrency paralysis occurs when mutually waiting entities freeze eternally over withheld keys?",
    "hints": [
      {
        "text": "A permanent freeze caused by circular wait and mutual exclusion.",
        "penalty": 10
      },
      {
        "text": "Classic operating system concurrency condition.",
        "penalty": 20
      },
      {
        "text": "The answer is DEADLOCK.",
        "penalty": 30
      }
    ],
    "fragment": 14,
    "evidenceTitle": "The Two Waiting Guards Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "DEADLOCK identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "DEADLOCK",
      "DEADLOCKS"
    ],
    "answer": "DEADLOCK",
    "order": 14,
    "cleanTitle": "THE TWO WAITING GUARDS"
  },
  {
    "id": "Q15",
    "title": "ROOM 15: THE MEMORY BLOCKS",
    "subtitle": "Paging",
    "category": "Operating Systems",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 15</strong>",
      "The mainframe memory controller manages physical RAM by partitioning hardware space into uniform, fixed-size slots called frames. Simultaneously, virtual memory addresses are divided into equal-sized chunks.",
      "A translation table maps each logical block to any available physical frame in hardware, even if the allocated frames are scattered non-contiguously across physical chips.",
      "This architecture allows large programs to execute without requiring huge contiguous blocks of physical memory, completely avoiding external fragmentation.",
      "To eliminate external fragmentation in the memory matrix, Doom's hypervisor carves virtual memory into uniform fixed-size parcels and maps them onto physical hardware frames via translation tables. Name this chunking scheme."
    ],
    "codeLines": [],
    "question": "What OS memory virtualization scheme maps uniform fixed-size logical partitions directly onto physical frames?",
    "hints": [
      {
        "text": "Fixed-size virtual memory blocks mapped to physical frames via a page table.",
        "penalty": 10
      },
      {
        "text": "Solves external fragmentation in OS memory management.",
        "penalty": 20
      },
      {
        "text": "The answer is PAGING.",
        "penalty": 30
      }
    ],
    "fragment": 15,
    "evidenceTitle": "The Memory Blocks Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "PAGING identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "PAGING",
      "PAGE",
      "PAGES"
    ],
    "answer": "PAGING",
    "order": 15,
    "cleanTitle": "THE MEMORY BLOCKS"
  },
  {
    "id": "Q16",
    "title": "ROOM 16: THE SHORTEST NEARBY PATH",
    "subtitle": "BFS",
    "category": "Data Structures",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 16</strong>",
      "An automated search drone scans the subterranean tunnel network beneath the fortress to discover the quickest escape route for the resistance team.",
      "The drone's navigation algorithm begins at the root chamber and enqueues all immediate adjacent corridors at distance 1. Only after every neighbor at distance 1 has been inspected does it advance to distance 2.",
      "Using a FIFO queue to track discovered chambers, the drone guarantees uncovering the path with the fewest corridor hops.",
      "A ripple expanding in concentric rings across a star map: it explores every immediate neighbor at distance 1 before daring to set foot on distance 2, guaranteeing the minimum hops in unweighted space. Enter its standard 3-letter acronym."
    ],
    "codeLines": [],
    "question": "Which 3-letter traversal expands in level-by-level concentric frontiers to guarantee the fewest hops in unweighted graphs?",
    "hints": [
      {
        "text": "Explores layer by layer using a FIFO queue.",
        "penalty": 10
      },
      {
        "text": "Guarantees finding the shortest path in unweighted graphs.",
        "penalty": 20
      },
      {
        "text": "The answer is BFS.",
        "penalty": 30
      }
    ],
    "fragment": 16,
    "evidenceTitle": "The Shortest Nearby Path Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "BFS identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "BFS",
      "BREADTH FIRST SEARCH",
      "BREADTH-FIRST SEARCH"
    ],
    "answer": "BFS",
    "order": 16,
    "cleanTitle": "THE SHORTEST NEARBY PATH"
  },
  {
    "id": "Q17",
    "title": "ROOM 17: THE DEEPEST ROAD",
    "subtitle": "DFS",
    "category": "Data Structures",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 17</strong>",
      "A reconnaissance droid navigates an intricate maze of ventilation shafts beneath the royal throne room. The droid's goal is to discover hidden sub-level chambers as quickly as possible.",
      "Rather than scanning all nearby branch options, the droid picks a single corridor and follows it aggressively until hitting a dead end. Only when trapped does it backtrack to the most recent fork and explore the next branch.",
      "The traversal uses a recursive call stack to remember unexplored decision junctions during backtracking.",
      "A lone explorer plunges recklessly down a single dark labyrinth branch, hitting dead ends before backtracking step-by-step through the call stack to explore uncharted chasms. Enter its 3-letter acronym."
    ],
    "codeLines": [],
    "question": "Which 3-letter traversal dives to the absolute depths of each branch before retracing its steps?",
    "hints": [
      {
        "text": "Dives as deep as possible before backtracking, using recursion or a stack.",
        "penalty": 10
      },
      {
        "text": "Commonly used for cycle detection and topological sorting.",
        "penalty": 20
      },
      {
        "text": "The answer is DFS.",
        "penalty": 30
      }
    ],
    "fragment": 17,
    "evidenceTitle": "The Deepest Road Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "DFS identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "DFS",
      "DEPTH FIRST SEARCH",
      "DEPTH-FIRST SEARCH"
    ],
    "answer": "DFS",
    "order": 17,
    "cleanTitle": "THE DEEPEST ROAD"
  },
  {
    "id": "Q18",
    "title": "ROOM 18: THE SHIFTED MESSAGE",
    "subtitle": "Caesar Cipher",
    "category": "Cryptography",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 18</strong>",
      "The resistance intercepts a high-priority radio broadcast transmitted between Doom's field commanders. The message appears as scrambled text: 'KHOOR' instead of 'HELLO'.",
      "Analyzing frequency distribution and character offsets reveals an ancient substitution rule: every alphabetic letter in the plaintext message has been shifted forward by exactly three positions in the alphabet.",
      "Wrapping around from Z back to A, the encryption relies purely on a constant numerical shift key shared between sender and receiver.",
      "An imperial Roman obfuscation technique where every glyph in the imperial dispatch is systematically displaced by a fixed circular rotation across the alphabet wheel. Identify this historical substitution cipher."
    ],
    "codeLines": [],
    "question": "What ancient Roman military cipher obscures messages by shifting every character by a constant uniform distance across the alphabet?",
    "hints": [
      {
        "text": "Named after a famous Roman emperor who used it for military dispatches.",
        "penalty": 10
      },
      {
        "text": "Basic shift cipher with a constant numerical key (e.g., ROT13 / shift 3).",
        "penalty": 20
      },
      {
        "text": "The answer is CAESAR CIPHER.",
        "penalty": 30
      }
    ],
    "fragment": 18,
    "evidenceTitle": "The Shifted Message Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "CAESAR CIPHER identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "CAESAR CIPHER",
      "CAESAR",
      "SHIFT CIPHER"
    ],
    "answer": "CAESAR CIPHER",
    "order": 18,
    "cleanTitle": "THE SHIFTED MESSAGE"
  },
  {
    "id": "Q19",
    "title": "ROOM 19: THE SECRET MASK",
    "subtitle": "XOR",
    "category": "Cryptography",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 19</strong>",
      "A hardware security module shields Doom's quantum encryption keys using a high-speed bitwise logic circuit. The circuit combines incoming plaintext data with a secret pseudo-random key stream.",
      "Testing the binary gate reveals clear output rules: when two matching bits are compared (0 and 0, or 1 and 1), the circuit outputs 0. When two differing bits are compared (0 and 1, or 1 and 0), it outputs 1.",
      "Applying the exact same operation a second time with the key perfectly recovers the original data.",
      "The ultimate cryptographic mask: it rewards distinction and punishes conformity, outputting true if and only if the dual inputs disagree. Applied twice with the same key, it resurrects the original plaintext untouched. Name this 3-letter gate."
    ],
    "codeLines": [],
    "question": "Which reversible 3-letter logic gate yields 1 for disparity, 0 for identity, and acts as the foundation of symmetric masks?",
    "hints": [
      {
        "text": "Bitwise exclusive OR operation, returning 1 only when inputs differ.",
        "penalty": 10
      },
      {
        "text": "Represented by the caret symbol (^) in most programming languages.",
        "penalty": 20
      },
      {
        "text": "The answer is XOR.",
        "penalty": 30
      }
    ],
    "fragment": 19,
    "evidenceTitle": "The Secret Mask Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "XOR identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "XOR",
      "EXCLUSIVE OR"
    ],
    "answer": "XOR",
    "order": 19,
    "cleanTitle": "THE SECRET MASK"
  },
  {
    "id": "Q20",
    "title": "ROOM 20: THE FLEXIBLE VAULT",
    "subtitle": "MongoDB Document",
    "category": "DBMS",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 20</strong>",
      "The resistance infiltrates Doctor Doom's modern NoSQL storage cluster, which stores experimental biometric profiles from across the multiverse.",
      "Unlike legacy relational databases that force data into rigid tabular rows and predefined columns, this system stores each individual record as a flexible, hierarchical JSON/BSON object containing key-value pairs.",
      "Records inside the same collection can have entirely different fields, sub-structures, and nested arrays without requiring schema alterations.",
      "Free from the rigid shackles of relational table columns, this polymorphic BSON payload encapsulates nested arrays and key-value attributes as an independent atomic entity in the collection. What is this fundamental NoSQL unit?"
    ],
    "codeLines": [],
    "question": "What schema-flexible, polymorphic BSON entity constitutes the atomic record unit of NoSQL collections?",
    "hints": [
      {
        "text": "The NoSQL equivalent of a single row in relational tables.",
        "penalty": 10
      },
      {
        "text": "Stores data as flexible JSON/BSON key-value structures.",
        "penalty": 20
      },
      {
        "text": "The answer is DOCUMENT.",
        "penalty": 30
      }
    ],
    "fragment": 20,
    "evidenceTitle": "The Flexible Vault Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "DOCUMENT identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "DOCUMENT",
      "DOCUMENTS",
      "BSON DOCUMENT",
      "BSON"
    ],
    "answer": "DOCUMENT",
    "order": 20,
    "cleanTitle": "THE FLEXIBLE VAULT"
  },
  {
    "id": "Q21",
    "title": "ROOM 21: THE CHAIN OF NODES",
    "subtitle": "Linked List",
    "category": "Data Structures",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 21</strong>",
      "Inside the citadel's secondary data relay, the resistance uncovers a sequence of dynamic memory blocks scattered across non-contiguous physical addresses in hardware RAM.",
      "Unlike rigid arrays that require continuous memory partitions, each discrete node in this structure stores its own data payload alongside a memory pointer explicitly referencing the address of the next item in the chain.",
      "Inserting or deleting elements in the middle of the collection requires only updating adjacent pointer links rather than shifting thousands of trailing elements through memory.",
      "A scattered constellation in heap space where no element knows its neighbors' addresses except through explicit directional pointers embedded in each cargo node. What fragile dynamic chain is this?"
    ],
    "codeLines": [],
    "question": "What dynamic linear collection consists of scattered memory nodes linked solely through pointer references?",
    "hints": [
      {
        "text": "Nodes containing data and a next pointer reference.",
        "penalty": 10
      },
      {
        "text": "Non-contiguous dynamic linear data structure.",
        "penalty": 20
      },
      {
        "text": "The answer is LINKED LIST.",
        "penalty": 30
      }
    ],
    "fragment": 21,
    "evidenceTitle": "The Chain Of Nodes Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "LINKED LIST identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "LINKED LIST",
      "LINKEDLIST",
      "SINGLY LINKED LIST"
    ],
    "answer": "LINKED LIST",
    "order": 21,
    "cleanTitle": "THE CHAIN OF NODES"
  },
  {
    "id": "Q22",
    "title": "ROOM 22: THE BRANCHING ARCHIVE",
    "subtitle": "Binary Tree",
    "category": "Data Structures",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 22</strong>",
      "The resistance accesses Doom's hierarchical lineage archives stored in an ancient Latverian databank. At the top of the display sits a single root node that branches downward into left and right sub-structures.",
      "Each node in the architecture maintains at most two direct child pointers, organizing millions of historical records in a balanced hierarchical structure with distinct parent-child relationships.",
      "Searching, inserting, and deleting records takes logarithmic time when the structure is balanced, providing optimal hierarchical traversal across massive data sets.",
      "A dendritic hierarchy rooted at the citadel crown, where every junction point is strictly forbidden from spawning more than a left or right successor. Name this dual-branching arboreal structure."
    ],
    "codeLines": [],
    "question": "What hierarchical bifurcating structure restricts every parental junction to at most a left and right descendant?",
    "hints": [
      {
        "text": "Root node with left and right subtrees.",
        "penalty": 10
      },
      {
        "text": "A tree data structure where each node has at most 2 child nodes.",
        "penalty": 20
      },
      {
        "text": "The answer is BINARY TREE.",
        "penalty": 30
      }
    ],
    "fragment": 22,
    "evidenceTitle": "The Branching Archive Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "BINARY TREE identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "BINARY TREE",
      "BINARY SEARCH TREE",
      "BST",
      "TREE"
    ],
    "answer": "BINARY TREE",
    "order": 22,
    "cleanTitle": "THE BRANCHING ARCHIVE"
  },
  {
    "id": "Q23",
    "title": "ROOM 23: THE FAST LOOKUP",
    "subtitle": "Hash Table",
    "category": "Data Structures",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 23</strong>",
      "The fortress teleportation matrix requires instantaneous O(1) lookups to immediately translate destination planet names into spatial warp coordinate vectors.",
      "Instead of searching through lists or trees, the system passes the key string through a mathematical hash function to compute a direct array bucket index in memory.",
      "Collision handling mechanisms like separate chaining or open addressing guarantee data integrity even when two distinct key strings produce the exact same index position.",
      "A mathematical forge converts arbitrary alphanumeric keys into bucket addresses through a deterministic scramble, bypassing linear scans to seize any item in expected O(1) time. Name this associative powerhouse."
    ],
    "codeLines": [],
    "question": "What associative data structure harnesses deterministic mathematical scrambling to achieve O(1) expected retrieval?",
    "hints": [
      {
        "text": "Uses key-value pairs and hash functions for O(1) average lookup.",
        "penalty": 10
      },
      {
        "text": "Also known as hash map or dictionary.",
        "penalty": 20
      },
      {
        "text": "The answer is HASH TABLE.",
        "penalty": 30
      }
    ],
    "fragment": 23,
    "evidenceTitle": "The Fast Lookup Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "HASH TABLE identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "HASH TABLE",
      "HASH MAP",
      "HASHMAP",
      "HASHTABLE"
    ],
    "answer": "HASH TABLE",
    "order": 23,
    "cleanTitle": "THE FAST LOOKUP"
  },
  {
    "id": "Q24",
    "title": "ROOM 24: THE CLEAN SCHEMA",
    "subtitle": "Normalization",
    "category": "DBMS",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 24</strong>",
      "The citadel logistics database was crippled by massive duplicate records, redundant columns, and catastrophic update anomalies resulting from years of unmonitored data entry across multiple warzones.",
      "Database architects apply systematic formal rules (1NF, 2NF, 3NF) to decompose massive unorganized tables into smaller, well-structured relational entities linked by foreign keys.",
      "This process completely eliminates data redundancy and guarantees that insertion, deletion, and modification operations maintain referential integrity without creating conflicting copies.",
      "To purge anomalies of insertion, update, and deletion, the grand architect decomposes sprawling monolithic tables into clean relational forms anchored by functional dependencies. Name this purification discipline."
    ],
    "codeLines": [],
    "question": "What mathematical database restructuring process eliminates redundancy and anomalies by progressing through successive normal forms?",
    "hints": [
      {
        "text": "Involves stages like 1NF, 2NF, and 3NF (Boyce-Codd).",
        "penalty": 10
      },
      {
        "text": "Eliminates duplicate data and update anomalies.",
        "penalty": 20
      },
      {
        "text": "The answer is NORMALIZATION.",
        "penalty": 30
      }
    ],
    "fragment": 24,
    "evidenceTitle": "The Clean Schema Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "NORMALIZATION identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "NORMALIZATION",
      "DATABASE NORMALIZATION",
      "NORMALIZE"
    ],
    "answer": "NORMALIZATION",
    "order": 24,
    "cleanTitle": "THE CLEAN SCHEMA"
  },
  {
    "id": "Q25",
    "title": "ROOM 25: THE PARALLEL WORKER",
    "subtitle": "Thread",
    "category": "Operating Systems",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 25</strong>",
      "The citadel defense mainframe manages hundreds of simultaneous real-time radar and sensor telemetry streams within a single active running process.",
      "Rather than spawning heavy independent processes with isolated address spaces, the operating system dispatches lightweight execution streams that share the exact same memory space, code section, and global data.",
      "Each individual stream maintains its own program counter, register state, and private call stack, enabling genuine concurrent execution across multi-core processor architectures.",
      "A lightweight strand of execution woven inside a heavyweight process boundary, possessing its own stack and registers while freely swimming in the shared address space of its siblings. Identify this CPU scheduling unit."
    ],
    "codeLines": [],
    "question": "What lightweight schedulable strand of execution shares memory address space with peer workers within a parent process?",
    "hints": [
      {
        "text": "Lightweight execution unit sharing process memory.",
        "penalty": 10
      },
      {
        "text": "Enables multithreading in applications.",
        "penalty": 20
      },
      {
        "text": "The answer is THREAD.",
        "penalty": 30
      }
    ],
    "fragment": 25,
    "evidenceTitle": "The Parallel Worker Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "THREAD identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "THREAD",
      "THREADS",
      "MULTITHREADING"
    ],
    "answer": "THREAD",
    "order": 25,
    "cleanTitle": "THE PARALLEL WORKER"
  },
  {
    "id": "Q26",
    "title": "ROOM 26: THE TRAFFIC SIGNAL",
    "subtitle": "Semaphore",
    "category": "Operating Systems",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 26</strong>",
      "Multiple autonomous defense drones compete simultaneously for access to a limited cluster of three rapid-charging stations inside the fortress bay.",
      "A synchronization variable maintains an integer counter tracking available charging slots. Drones perform atomic wait (P) operations to decrement the counter upon entry and signal (V) operations to increment it upon leaving.",
      "When the counter drops to zero, any additional drones attempting access are placed into a sleep queue until a station is freed, preventing race conditions and hardware collisions.",
      "Dijkstra's ancient railroad signalkeeper: an atomic integer gauge with dual non-divisible rites—one to decrement and sleep if empty (P), and one to increment and awaken a slumbering worker (V). Name this synchronization sentinel."
    ],
    "codeLines": [],
    "question": "What atomic integer synchronization primitive regulates multi-resource access using classic P (wait) and V (signal) operations?",
    "hints": [
      {
        "text": "Invented by Edsger Dijkstra, uses wait (P) and signal (V).",
        "penalty": 10
      },
      {
        "text": "Counting or binary synchronization primitive.",
        "penalty": 20
      },
      {
        "text": "The answer is SEMAPHORE.",
        "penalty": 30
      }
    ],
    "fragment": 26,
    "evidenceTitle": "The Traffic Signal Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "SEMAPHORE identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "SEMAPHORE",
      "SEMAPHORES",
      "COUNTING SEMAPHORE"
    ],
    "answer": "SEMAPHORE",
    "order": 26,
    "cleanTitle": "THE TRAFFIC SIGNAL"
  },
  {
    "id": "Q27",
    "title": "ROOM 27: THE OPTIMAL ROUTE",
    "subtitle": "Dijkstra",
    "category": "Algorithms",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 27</strong>",
      "The resistance needs to plot the safest escape route through Battleworld's weighted network of teleporter nodes. Each connecting corridor possesses a non-negative energy cost.",
      "The navigation computer maintains a priority queue of tentative distances. It greedily selects the unvisited node with the lowest cumulative cost, relaxes neighboring edge weights, and calculates the single-source shortest path to all destinations.",
      "Because no edge weights are negative, the algorithm guarantees discovering the mathematically optimal path in O((V + E) log V) time across the complex weighted graph.",
      "A greedy pathfinder traverses weighted stellar hyperlanes by continuously extracting the minimum tentative distance from a priority queue and relaxing forward edges, forever blind to negative energy anomalies. Name the Dutch computer scientist behind this algorithm."
    ],
    "codeLines": [],
    "question": "Which famous greedy single-source shortest path algorithm relaxes edge weights using a priority queue, requiring all edge costs to be non-negative?",
    "hints": [
      {
        "text": "Named after Dutch computer scientist Edsger Dijkstra.",
        "penalty": 10
      },
      {
        "text": "Uses priority queues and edge relaxation for weighted shortest paths.",
        "penalty": 20
      },
      {
        "text": "The answer is DIJKSTRA.",
        "penalty": 30
      }
    ],
    "fragment": 27,
    "evidenceTitle": "The Optimal Route Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "DIJKSTRA identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "DIJKSTRA",
      "DIJKSTRA ALGORITHM",
      "DIJKSTRA'S ALGORITHM"
    ],
    "answer": "DIJKSTRA",
    "order": 27,
    "cleanTitle": "THE OPTIMAL ROUTE"
  },
  {
    "id": "Q28",
    "title": "ROOM 28: THE HIDDEN COMPLEXITY",
    "subtitle": "Abstraction",
    "category": "OOP",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 28</strong>",
      "The squad discovers the master cockpit of Doom's orbital battle cruiser. The pilot controls provide intuitive buttons like 'Engage Thrusters' and 'Shield Overcharge' on an elegant heads-up display.",
      "Behind the dashboard lie millions of complex hydraulic lines, plasma valves, and microcode routines. The pilot does not need to know how internal valves operate; the interface hides internal implementation details and exposes only essential features.",
      "In software engineering, this pillar allows developers to define clean abstract interfaces without exposing the underlying low-level implementation mechanics.",
      "The pilot cockpit reveals only a sleek throttle and heading compass, banishing the millions of fiery hydraulic calculations behind an opaque interface mask. Name this fundamental pillar of complexity reduction."
    ],
    "codeLines": [],
    "question": "What foundational software design principle distills intricate system realities into simplified, high-level behavioral interfaces?",
    "hints": [
      {
        "text": "One of the 4 pillars of OOP (alongside Encapsulation, Inheritance, Polymorphism).",
        "penalty": 10
      },
      {
        "text": "Achieved using abstract classes and interfaces.",
        "penalty": 20
      },
      {
        "text": "The answer is ABSTRACTION.",
        "penalty": 30
      }
    ],
    "fragment": 28,
    "evidenceTitle": "The Hidden Complexity Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "ABSTRACTION identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "ABSTRACTION",
      "DATA ABSTRACTION"
    ],
    "answer": "ABSTRACTION",
    "order": 28,
    "cleanTitle": "THE HIDDEN COMPLEXITY"
  },
  {
    "id": "Q29",
    "title": "ROOM 29: THE SPEED BUFFER",
    "subtitle": "Cache",
    "category": "Operating Systems",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 29</strong>",
      "The mainframe's central processing unit is experiencing severe performance bottlenecks waiting for critical security data from slow secondary storage drives.",
      "Engineers install a small, ultra-fast high-speed memory layer (SRAM) directly adjacent to the CPU cores. Frequently accessed instructions and recently fetched data are retained in this buffer based on temporal and spatial locality.",
      "When a lookup succeeds (a 'hit'), data arrives in nanoseconds, dramatically reducing CPU idle cycles without fetching from slower main RAM or disk storage.",
      "A lightning-fast staging sanctum nestled right against the processor core, exploiting temporal and spatial locality to intercept data requests before the sluggish main memory bus is ever provoked. Name this ultra-fast buffer."
    ],
    "codeLines": [],
    "question": "What high-speed hardware or software buffer harnesses spatial and temporal locality to prevent costly trips to main storage?",
    "hints": [
      {
        "text": "Fast temporary storage layer (L1, L2, L3).",
        "penalty": 10
      },
      {
        "text": "Stores frequently accessed data to reduce latency.",
        "penalty": 20
      },
      {
        "text": "The answer is CACHE.",
        "penalty": 30
      }
    ],
    "fragment": 29,
    "evidenceTitle": "The Speed Buffer Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "CACHE identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "CACHE",
      "CACHING",
      "CPU CACHE"
    ],
    "answer": "CACHE",
    "order": 29,
    "cleanTitle": "THE SPEED BUFFER"
  },
  {
    "id": "Q30",
    "title": "ROOM 30: THE CROSS REFERENCE",
    "subtitle": "Foreign Key",
    "category": "DBMS",
    "difficulty": "Easy",
    "enabled": true,
    "investigationType": "story",
    "story": [
      "<strong>⚠ BATTLEWORLD INVESTIGATION LOG — CHAMBER 30</strong>",
      "The team reaches the final central vault housing the relationship schemas connecting Doom's global armories with assigned commanding officers across the realm.",
      "The Armory table contains a dedicated column that references the primary key of the Commander table, linking each weapon inventory record to a verified commanding officer.",
      "The database engine enforces referential integrity: no armory can list an invalid or non-existent commander ID, preventing orphan records across the relational system.",
      "A relational bridge across tabular realms: an attribute embedded within one record that points with unyielding referential integrity to the sovereign primary key of a distant table. Enter this cross-table anchor."
    ],
    "codeLines": [],
    "question": "What relational integrity constraint embeds a pointer in a child table to enforce references to a sovereign primary key in another table?",
    "hints": [
      {
        "text": "Enforces referential integrity between tables.",
        "penalty": 10
      },
      {
        "text": "A field in one table that refers to the Primary Key of another.",
        "penalty": 20
      },
      {
        "text": "The answer is FOREIGN KEY.",
        "penalty": 30
      }
    ],
    "fragment": 30,
    "evidenceTitle": "The Cross Reference Evidence Fragment",
    "consequence": [
      "CLUE VERIFIED",
      "FOREIGN KEY identified. The Battleworld fragment has been recovered."
    ],
    "keywords": [
      "FOREIGN KEY",
      "FOREIGNKEY",
      "FK"
    ],
    "answer": "FOREIGN KEY",
    "order": 30,
    "cleanTitle": "THE CROSS REFERENCE"
  }
];
