/**
 * PORTFOLIO DATA CONFIGURATION
 * Owner: Younus Mohammad Maheer
 * Tagline: CS Student · Full-Stack Learner · AI/ML Enthusiast · Open Source Explorer
 * 
 * Edit this file to easily customize or update any portfolio content!
 */

window.PORTFOLIO_DATA = {
  profile: {
    name: "Younus Mohammad Maheer",
    title: "CS Student · Full-Stack Learner · AI/ML Enthusiast · Open Source Explorer",
    handle: "maheer",
    systemName: "MaheerOS v2.4",
    email: "younus.maheer.dev@gmail.com",
    github: "https://github.com/maheer-dev",
    linkedin: "https://linkedin.com/in/younus-maheer",
    twitter: "https://x.com/younus_maheer",
    location: "Global / Open to Remote",
    statusBadge: "🟢 Open for Internships & Research Collaborations",
    bioShort: "Computer Science student passionate about architecting resilient software systems, exploring machine learning models, and building open-source developer tools.",
    avatarEmoji: "🚀"
  },

  about: {
    heading: "Hello, World! I am Younus Mohammad Maheer.",
    subheading: "A curious developer exploring the intersection of full-stack engineering, distributed systems, and machine learning.",
    paragraphs: [
      "I am an enthusiastic Computer Science undergraduate with a deep fascination for how software systems function from the low-level logic up to responsive user interfaces. My journey began with simple script automations and has grown into building full-stack platforms and tinkering with machine learning models.",
      "I believe the best code is readable, maintainable, and solves real human problems. Whether optimizing database queries, building reactive frontends, or experimenting with PyTorch neural nets, I am always looking to push my technical boundaries.",
      "Outside of active coding, you can find me reading technical papers, contributing to open-source repositories, exploring developer tooling, and sharing knowledge with peers."
    ],
    journeyHighlights: [
      { year: "2023 - Present", title: "Undergraduate CS Degree", desc: "Focusing on Algorithms, Data Structures, Distributed Systems, and Machine Learning." },
      { year: "2024", title: "Full-Stack & Cloud Exploration", desc: "Built end-to-end web apps with Next.js, Node.js, PostgreSQL, and deployed on modern cloud infrastructure." },
      { year: "2025", title: "AI/ML Experiments & Open Source", desc: "Implemented computer vision pipelines, LLM agent workflows, and contributed to developer tooling." }
    ],
    currentFocus: [
      "Deepening understanding of Transformer architectures & LLM quantization",
      "Building robust full-stack applications with TypeScript and Go/Python",
      "Learning system design patterns and low-latency network programming"
    ],
    interests: [
      "🤖 Machine Learning & Natural Language Processing",
      "🌐 Full-Stack Web Architecture & Performance",
      "⚡ Distributed Systems & High-Throughput APIs",
      "🐧 Linux, Shell Scripting & Developer Productivity",
      "🕹️ Creative Coding, Physics Simulations & Game Mechanics"
    ]
  },

  skills: {
    categories: [
      {
        name: "Languages",
        icon: "💻",
        items: [
          { name: "Python", level: "Advanced", desc: "Scripting, AI/ML, FastAPI, NumPy/Pandas" },
          { name: "JavaScript / TypeScript", level: "Advanced", desc: "Modern ESNext, React, Node.js, strict typing" },
          { name: "C++", level: "Intermediate", desc: "Data structures, algorithms, memory management" },
          { name: "C", level: "Intermediate", desc: "Systems programming, pointers, low-level OS concepts" },
          { name: "SQL", level: "Intermediate", desc: "Relational queries, indexing, joins, migrations" }
        ]
      },
      {
        name: "Frontend",
        icon: "🎨",
        items: [
          { name: "React / Next.js", level: "Proficient", desc: "Hooks, App Router, SSR, Server Components" },
          { name: "HTML5 / Semantic Web", level: "Advanced", desc: "Accessibility, Canvas 2D, Audio API" },
          { name: "CSS3 / Modern Layouts", level: "Advanced", desc: "Flexbox/Grid, Animations, Responsive Design" },
          { name: "TailwindCSS", level: "Proficient", desc: "Design systems, utility-first CSS" }
        ]
      },
      {
        name: "Backend & Systems",
        icon: "⚙️",
        items: [
          { name: "Node.js / Express", level: "Proficient", desc: "RESTful APIs, middleware, authentication" },
          { name: "FastAPI / Flask", level: "Proficient", desc: "Python async microservices, Pydantic validation" },
          { name: "REST & WebSockets", level: "Intermediate", desc: "Real-time bidirectional event streaming" },
          { name: "Authentication", level: "Intermediate", desc: "JWT, OAuth2, session security" }
        ]
      },
      {
        name: "Databases & Storage",
        icon: "🗄️",
        items: [
          { name: "PostgreSQL", level: "Intermediate", desc: "Relational modeling, indexing, ACID compliance" },
          { name: "MongoDB", level: "Intermediate", desc: "Document schema design, aggregation pipelines" },
          { name: "Redis", level: "Beginner", desc: "In-memory caching and session stores" },
          { name: "Prisma / ORM", level: "Intermediate", desc: "Type-safe database querying & migrations" }
        ]
      },
      {
        name: "AI & Machine Learning",
        icon: "🧠",
        items: [
          { name: "PyTorch", level: "Intermediate", desc: "Neural networks, tensors, loss functions, training loops" },
          { name: "Scikit-Learn", level: "Proficient", desc: "Classical ML classification, regression, clustering" },
          { name: "Transformers / HuggingFace", level: "Intermediate", desc: "Fine-tuning, embeddings, text generation" },
          { name: "LangChain / LLM Tooling", level: "Intermediate", desc: "RAG architectures, prompt pipelines" }
        ]
      },
      {
        name: "Tools & DevOps",
        icon: "🛠️",
        items: [
          { name: "Git & GitHub", level: "Advanced", desc: "Branching workflows, PR reviews, CI/CD actions" },
          { name: "Docker", level: "Intermediate", desc: "Containerization, multi-stage builds, compose" },
          { name: "Linux / Bash", level: "Proficient", desc: "Vim, shell automation, environment setup" },
          { name: "Postman", level: "Proficient", desc: "API endpoint testing, mocking" }
        ]
      }
    ]
  },

  projects: [
    {
      id: "neural-lens",
      name: "NeuralLens: Smart Document AI",
      tagline: "Multimodal document intelligence and semantic search engine powered by local embeddings.",
      icon: "📄",
      status: "Active / Deployed",
      badge: "Featured AI Project",
      problem: "Traditional search engines fail to understand contextual relationships in unstructured technical PDF papers and documentation.",
      solution: "Engineered a fast RAG (Retrieval-Augmented Generation) pipeline combining lightweight sentence embeddings with vector search and interactive citation highlights.",
      tech: ["Python", "FastAPI", "PyTorch", "ChromaDB", "React", "TailwindCSS"],
      features: [
        "Hybrid dense-sparse vector indexing for sub-100ms retrieval",
        "Interactive document preview with side-by-side snippet citations",
        "Local inference option running on quantized HuggingFace models",
        "Exportable summary flashcards and key concept extraction"
      ],
      learned: "Learned deep nuances of chunking strategies, vector embeddings cosine similarity, and streaming response hydration over WebSockets.",
      github: "https://github.com/maheer-dev/neurallens",
      demo: "https://neurallens-demo.preview.app"
    },
    {
      id: "hyper-task",
      name: "HyperTask: Distributed Job Orchestrator",
      tagline: "Lightweight distributed task scheduler with real-time telemetry and fault tolerance.",
      icon: "⚡",
      status: "Completed",
      badge: "Systems & Backend",
      problem: "Heavyweight enterprise job brokers introduce significant overhead and complex setup for small to medium distributed developer workflows.",
      solution: "Built a concurrent job runner in Go and TypeScript utilizing Redis pub/sub, exponential backoff retries, and a responsive web monitoring dashboard.",
      tech: ["Node.js / TypeScript", "Go", "Redis", "WebSocket", "Docker"],
      features: [
        "Dynamic worker registration with heartbeat health checks",
        "Configurable concurrency limits and priority queueing",
        "Live telemetry graphs measuring throughput and failure rates",
        "CLI client for dispatching jobs directly from shell scripts"
      ],
      learned: "Mastered distributed lock patterns, race condition mitigation, and high-frequency WebSocket backpressure handling.",
      github: "https://github.com/maheer-dev/hyper-task",
      demo: "https://hypertask.preview.app"
    },
    {
      id: "dev-canvas",
      name: "DevCanvas: Interactive Code Visualizer",
      tagline: "Collaborative whiteboard and algorithm playground for visualizing data structures in real time.",
      icon: "📊",
      status: "Active",
      badge: "Creative Tech & Frontend",
      problem: "Learning complex data structures (Red-Black Trees, Graph Traversals, Dynamic Programming) is challenging without intuitive step-by-step visual animation.",
      solution: "Created an interactive HTML5 Canvas visualizer where students step forward/backward through algorithms with real-time call stack inspectability.",
      tech: ["TypeScript", "Canvas 2D API", "Web Audio API", "Next.js"],
      features: [
        "Step-by-step timeline scrubber with adjustable animation speed",
        "Interactive tree and graph builder with draggable nodes",
        "Synthesized sound cues indicating comparisons, swaps, and insertions",
        "Export generated algorithm states as GIFs or vector SVGs"
      ],
      learned: "Gained comprehensive expertise in requestAnimationFrame game loops, matrix transforms, and deterministic simulation stepping.",
      github: "https://github.com/maheer-dev/dev-canvas",
      demo: "https://devcanvas.preview.app"
    },
    {
      id: "eco-mesh",
      name: "EcoMesh: IoT Ambient Monitor",
      tagline: "Microclimate telemetry collector and predictive anomaly detection system.",
      icon: "🌱",
      status: "Prototype",
      badge: "IoT & Analytics",
      problem: "Environmental sensor monitoring systems often suffer from intermittent connectivity and missing data imputation.",
      solution: "Developed an edge-friendly ingestion server with time-series data buffering and simple linear Kalman filtering for noisy readings.",
      tech: ["Python", "FastAPI", "InfluxDB", "Chart.js", "ESP32 C++"],
      features: [
        "Offline caching and batch synchronizing when connection recovers",
        "Dynamic threshold anomaly alerting via webhooks",
        "Lightweight dashboard displaying real-time humidity, temperature, and AQI",
        "Statistical outlier detection using rolling standard deviations"
      ],
      learned: "Gained practical experience with time-series data storage, edge computing constraints, and sensor communication protocols.",
      github: "https://github.com/maheer-dev/eco-mesh",
      demo: "https://ecomesh.preview.app"
    }
  ],

  experience: [
    {
      role: "Student Software Developer / Research Assistant",
      org: "Computer Science Department",
      period: "2024 - Present",
      location: "On-Campus / Hybrid",
      bullets: [
        "Collaborated with faculty on benchmarking inference latency across open-source LLM architectures on consumer hardware.",
        "Engineered automated evaluation test harnesses in Python, processing over 10,000 synthetic test cases.",
        "Assisted junior peers in understanding data structures, algorithm complexity, and version control best practices."
      ]
    },
    {
      role: "Open Source Contributor",
      org: "Developer Tooling Ecosystem",
      period: "2023 - Present",
      location: "Remote / GitHub",
      bullets: [
        "Contributed bug fixes, type improvements, and documentation examples to community libraries in the React and Python ecosystems.",
        "Participated in Hacktoberfest and open developer forums, refining code review and collaboration skills.",
        "Authored reusable utility libraries for Canvas drawing and state machines."
      ]
    },
    {
      role: "Lead Developer (Hackathon Project)",
      org: "University Tech Sprint",
      period: "2024",
      location: "Hackathon Event",
      bullets: [
        "Led a team of 4 developers to build a real-time collaborative study aid within a 36-hour sprint.",
        "Architected the backend REST endpoints and WebSocket room sync logic.",
        "Presented the working demonstration to judges, winning the Best Technical Architecture award."
      ]
    }
  ],

  education: {
    degree: "Bachelor of Science in Computer Science",
    institution: "University Academic Program",
    period: "2023 - 2027 (Expected)",
    gpa: "Dean's List / High Standing",
    coursework: [
      "Data Structures & Algorithms",
      "Object-Oriented Programming (C++/Java)",
      "Database Management Systems & SQL",
      "Computer Architecture & Organization",
      "Operating Systems & Concurrency",
      "Linear Algebra & Discrete Mathematics",
      "Probability & Statistics for Machine Learning",
      "Web Technologies & Distributed Systems"
    ],
    highlights: [
      "Active member of the University Computing & Robotics Society",
      "Regular participant in weekly competitive programming meetups",
      "Consistently exploring modern extracurricular research in deep learning"
    ]
  },

  achievements: [
    {
      title: "🏆 Best Technical Architecture Award",
      issuer: "Campus TechSprint Hackathon (2024)",
      desc: "Awarded for architecting a low-latency, resilient WebSocket communication system for real-time collaborative editing."
    },
    {
      title: "🥇 Academic Merit Scholar",
      issuer: "Faculty of Engineering & Computer Science",
      desc: "Recognized for top academic standing and consistent high performance across foundational computer science courses."
    },
    {
      title: "🌟 Open Source Contributor Milestone",
      issuer: "GitHub / Community",
      desc: "Accumulated 100+ commits and authored multiple accepted pull requests across open developer repositories."
    },
    {
      title: "⚡ Competitive Programming Top 15%",
      issuer: "Codeforces / LeetCode Contests",
      desc: "Regularly solved algorithmic challenges focusing on graphs, dynamic programming, and greedy algorithms."
    }
  ],

  notes: [
    {
      id: "note-1",
      title: "Demystifying Attention Mechanisms in 10 Minutes",
      date: "Aug 2025",
      tag: "AI / ML",
      preview: "Why Query, Key, and Value matrices are conceptually identical to database lookups with fuzzy matching.",
      content: `Attention in deep learning can be understood with a database lookup metaphor:
- Query (Q): What you are looking for.
- Key (K): The label / index of every element in the sequence.
- Value (V): The actual informational payload.

The attention weights are calculated via softmax over normalized dot products:
Attention(Q, K, V) = softmax(Q · K^T / sqrt(d_k)) · V

This enables every token to dynamically aggregate information from every other token based on contextual relevance.`
    },
    {
      id: "note-2",
      title: "Why requestAnimationFrame Beats setTimeout for Physics",
      date: "Jun 2025",
      tag: "Web Graphics",
      preview: "Understanding browser refresh synchrony, delta time capping, and accumulator loops for rock-solid 60+ FPS.",
      content: `Using setTimeout or setInterval for game loops causes micro-stutters because the JavaScript event loop does not synchronize with the display V-Sync.

With requestAnimationFrame:
1. Compute dt = (now - last) / 1000.
2. Clamp dt to prevent physics explosions if the browser tab was throttled in the background (e.g. Math.min(dt, 0.05)).
3. Step through a fixed time accumulator (while acc >= STEP: step(STEP)) for completely deterministic physics simulation!`
    },
    {
      id: "note-3",
      title: "Building Resilient REST APIs with Node & TypeScript",
      date: "Apr 2025",
      tag: "Backend",
      preview: "Key practices: Zod schema validation, global error boundary middleware, structured JSON logging.",
      content: `A resilient API should never crash on unexpected payloads:
- Validate incoming req.body and req.query with strict Zod schemas before touching business logic.
- Throw custom AppError classes that encapsulate HTTP status codes and user-safe messages.
- Centralize error handling in an Express error middleware to avoid leaking internal stack traces in production.`
    }
  ],

  currentlyBuilding: {
    status: "🛠️ In Active Development",
    lastUpdated: "Recently",
    items: [
      {
        project: "Quantized Edge LLM Runner",
        detail: "Experimenting with ONNX runtime in WebAssembly to execute compact 1B models entirely client-side inside the browser."
      },
      {
        project: "MaheerOS Interactive Portfolio",
        detail: "Fine-tuning the dynamic lighting shaders and slingshot projectile physics for this personal portfolio website!"
      },
      {
        project: "Distributed Log Ingestion Engine",
        detail: "Writing a lightweight append-only commit log in C++ to understand the core storage mechanics of Apache Kafka."
      }
    ]
  },

  contact: {
    pitch: "I am always excited to discuss new software projects, internship opportunities, research collaborations, or fascinating tech topics.",
    channels: [
      { name: "Email", value: "younus.maheer.dev@gmail.com", url: "mailto:younus.maheer.dev@gmail.com", icon: "✉️" },
      { name: "GitHub", value: "github.com/maheer-dev", url: "https://github.com/maheer-dev", icon: "🐙" },
      { name: "LinkedIn", value: "linkedin.com/in/younus-maheer", url: "https://linkedin.com/in/younus-maheer", icon: "💼" },
      { name: "Twitter / X", value: "@younus_maheer", url: "https://x.com/younus_maheer", icon: "🐦" }
    ],
    responseTime: "Typically responds within 24 hours"
  }
};