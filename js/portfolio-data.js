/**
 * PORTFOLIO DATA CONFIGURATION
 * Owner: Younus Mohammad Maheer
 * Tagline: Computer Science & Engineering Student · Full-Stack Developer · Competitive Programmer
 *
 * Edit this file to easily customize or update any portfolio content!
 */

window.PORTFOLIO_DATA = {
  profile: {
    name: "Younus Mohammad Maheer",
    title: "Computer Science & Engineering Student · Full-Stack Developer · Competitive Programmer",
    handle: "nihedevotee",
    systemName: "MaheerOS v2.4",
    email: "younusmohammadmaheer123@gmail.com",
    github: "https://github.com/nihedevotee",
    linkedin: "https://linkedin.com/in/younus-mohammadmaheer",
    location: "Dhaka, Bangladesh",
    statusBadge: "🟢 Open to Internships & Collaborative Projects",
    bioShort: "Computer Science & Engineering student at BRAC University with a strong foundation in problem-solving and full-stack development. Active in competitive programming across Codeforces, CodeChef, and LeetCode, with hands-on experience building and shipping independent web applications.",
    avatarEmoji: "🚀"
  },

  about: {
    heading: "Hellooo assalamualaikum! I am Younus Mohammad Maheer.",
    subheading: "A Computer Science student of BRAC university trying to learn full stack development and AI ML integration.",
    paragraphs: [
      "I'm currently in my 7th semester with a CGPA of 3.64. I have a strong foundation in development, problem-solving, data structures, and learning full-stack web development.",
      "I'm actively engaged doing projects to enhance my skills in deploying real life applications to help people and myself. I used to participate in competitive programming across Codeforces, CodeChef, and LeetCode, which sharpens my problem solving skills.",
      "Outside of coding, I'm a general member of the BRAC University Chess Club, and I enjoy reading books and play chess in my free time."
    ],
    personal: {
      heading: "Personal Me",
      paragraphs: [
        "Well, in this beautiful chaos called life, I like to sit down with a cup of tea and a good book. Sometimes it's something deep and meaningful. Sometimes it's 47 brainrot reels in a row, slowly deleting my attention span.",
        "Sometimes I play chess to relax. Somehow, I end up more stressed than before. Apparently, losing to a lower rated player is a great way to build character.",
        "Then there's university. Assignments, exams, projects, and that lovely feeling of knowing I should be learning something but instead staring at the ceiling.",
        "And now AI is here, apparently turning science fiction into a \"coming soon\" section. As a Computer Science student, I sometimes wonder whether I'll be writing software in the future or writing poems because AI took my job.",
        "But hey, life is not that bad. I've got tea, books, chess, random thoughts, and a questionable amount of optimism. We move. 😭"
      ]
    },
    journeyHighlights: [
      { year: "2023 and 2021", title: "Completed HSC & SSC (Science)", desc: "Graduated with a GPA of 5.00/5.00 in both, from Birshresto Munshi Abdur Rouf College, Dhaka." },
      { year: "2024 - Present", title: "B.Sc. in Computer Science & Engineering", desc: "Currently in my 7th semester at BRAC University, CGPA 3.64." }
    ],
    currentFocus: [
      "Improving competitive programming rating across Codeforces, CodeChef, and LeetCode",
      "Building and polishing independent projects — a drawing app, a focus timer, and a Chrome extension",
      "Deepening backend skills with PHP & MySQL, and exploring Machine Learning fundamentals",
      "Preparing for an undergraduate thesis on disease prediction using Machine Learning, planned for Spring 2027",
      "Trying to reach 2000 rated in chess.com haha lool"
    ],
    interests: [
      "💻 Coding & Software Development",
      "🧩 Problem Solving & Competitive Programming",
      "📚 Reading Books",
      "♟️ Chess"
    ]
  },

  skills: {
    categories: [
      {
        name: "Frontend Development",
        icon: "🎨",
        items: [
          { name: "HTML", level: "Proficient", desc: "Semantic markup and accessible structure" },
          { name: "CSS", level: "Proficient", desc: "Layout, responsive design, animation" },
          { name: "JavaScript", level: "Proficient", desc: "DOM manipulation, Canvas rendering, Web Audio API" }
        ]
      },
      {
        name: "Backend Development",
        icon: "⚙️",
        items: [
          { name: "PHP", level: "Intermediate", desc: "Server-side scripting and application logic" },
          { name: "MySQL", level: "Intermediate", desc: "Relational database design and queries" }
        ]
      },
      {
        name: "Machine Learning",
        icon: "🧠",
        items: [
          { name: "Machine Learning Fundamentals", level: "Learning", desc: "Core ML concepts, moving toward an undergraduate thesis on disease prediction" }
        ]
      },
      {
        name: "Competitive Programming",
        icon: "🏁",
        items: [
          { name: "Codeforces", level: "Rating 793", desc: "Algorithmic problem solving" },
          { name: "CodeChef", level: "Rating 1017", desc: "Contest-based problem solving" },
          { name: "LeetCode", level: "Rating 1473", desc: "Data structures & algorithms practice" }
        ]
      },
      {
        name: "Languages",
        icon: "🗣️",
        items: [
          { name: "English", level: "Fluent", desc: "Professional working proficiency" },
          { name: "Bangla", level: "Native", desc: "Native speaker" }
        ]
      }
    ]
  },

  projects: [
    {
      id: "notebook",
      name: "Notebook — Web-Based Drawing Application",
      tagline: "A browser-based drawing tool with canvas rendering, Web Audio sound synthesis, and PDF export.",
      icon: "🎨",
      status: "Ongoing",
      badge: "Creative Tools & Frontend",
      problem: "Wanted a lightweight, accessible drawing tool that runs entirely in the browser without needing any install.",
      solution: "Built a canvas-based drawing tool that renders freehand strokes in real time, synthesizes sound via the Web Audio API, and lets users export their work directly to PDF. Deployed publicly on Vercel.",
      tech: ["JavaScript", "HTML5 Canvas", "Web Audio API", "Vercel"],
      features: [
        "Real-time canvas-based freehand drawing",
        "Interactive sound synthesis via the Web Audio API",
        "One-click PDF export of drawings",
        "Deployed and publicly accessible on Vercel"
      ],
      learned: "Learned how to work directly with the Canvas 2D API for real-time rendering, and how to integrate the Web Audio API for interactive sound.",
      github: "https://github.com/nihedevotee/Notebook",
      demo: "https://notebook-seven-omega.vercel.app"
    },
    {
      id: "study-rest-clock",
      name: "Study Rest Clock — Pomodoro-Style Timer App",
      tagline: "A chess-clock-style focus timer built to stay visible above every other window while you work.",
      icon: "⏱️",
      status: "Ongoing",
      badge: "Productivity & Desktop Tools",
      problem: "Identified a gap in existing focus-timer apps: none of them could reliably stay visible above every other application while working.",
      solution: "Built a chess-clock-style Pomodoro timer with a shared JavaScript core, shipped as both an Electron desktop app and a Vercel-deployed installable PWA.",
      tech: ["JavaScript", "Electron", "PWA", "Vercel"],
      features: [
        "Chess-clock-style focus/rest timing mechanic",
        "Shared core logic powering both desktop and web versions",
        "Always-on-top Electron desktop app",
        "Installable, Vercel-deployed Progressive Web App"
      ],
      learned: "Learned how to share a single JavaScript core across an Electron app and a PWA, and how to manage always-on-top window behavior.",
      github: "https://github.com/nihedevotee/study-rest-clock",
      demo: "https://study-rest-clock.vercel.app"
    },
    {
      id: "cursor-trail",
      name: "Cursor Trail — Chrome Extension",
      tagline: "A Manifest V3 Chrome extension that renders a colorful particle trail following your cursor across the web.",
      icon: "🖱️",
      status: "Finished",
      badge: "Browser Tools & Creative Coding",
      problem: "Wanted a small, playful way to make everyday browsing feel more alive without slowing pages down.",
      solution: "Built a Manifest V3 Chrome extension that spawns a colorful particle trail behind the cursor on any webpage, plus a caret-tracking effect that spawns particles at the text cursor while typing.",
      tech: ["JavaScript", "Chrome Extensions (Manifest V3)"],
      features: [
        "Colorful particle trail following the cursor on any webpage",
        "Caret-tracking particle effect while typing",
        "Works across inputs, textareas, and contentEditable fields",
        "Lightweight Manifest V3 architecture"
      ],
      learned: "Learned how Manifest V3 content scripts work, and how to track both pointer and text-caret positions reliably across arbitrary web pages.",
      github: "https://github.com/nihedevotee/cursor-chrome-extension"
    },
    {
      id: "pdf-maker",
      name: "ImageOrder PDF — Local Image-to-PDF & Reverse Tool",
      tagline: "Two client-side PDF tools — build a PDF from a stack of images, or reverse an existing PDF's page order — with nothing ever uploaded to a server.",
      icon: "▣",
      status: "Live / Deployed",
      badge: "Privacy-First Web Tools",
      problem: "Existing PDF utilities require uploading personal files to a third-party server just to reorder or combine images into a PDF.",
      solution: "Built two fully client-side tools: one that turns a stack of images into a single ordered PDF via drag-to-reorder cards, and another that reverses an existing PDF's page order and optionally recompresses its embedded JPEGs — both running entirely in the browser with jsPDF and pdf-lib.",
      tech: ["JavaScript", "jsPDF", "pdf-lib", "HTML5 Drag & Drop", "Canvas API"],
      features: [
        "Drag-and-drop image uploads with automatic natural-order sorting (1, 2, 3…10, 11)",
        "Manual drag-to-reorder, sort-by-filename, and reverse-order controls",
        "Configurable page size, orientation, and image fit (contain/cover) for the generated PDF",
        "Separate PDF-reversal tool that flips page order without re-uploading each page as an image",
        "Optional JPEG recompression (via Canvas + pdf-lib) to shrink oversized embedded images",
        "Zero uploads — every operation runs locally in the browser"
      ],
      learned: "Learned how to manipulate PDF internals directly with pdf-lib — walking XObject resources to find and re-encode embedded JPEG streams — and how to keep a fully client-side file pipeline fast using the Canvas API and object URLs.",
      github: "https://github.com/nihedevotee/pdf-maker",
      demo: "https://pdf-maker-inky-theta.vercel.app"
    }
  ],

  experience: [
    {
      role: "General Member — HR Department",
      org: "BRAC University Chess Club",
      period: "Jul 2026 - Present",
      location: "BRAC University, Dhaka",
      bullets: [
        "Active general member contributing to the HR department of the university's chess club.",
        "Engages with a community of chess enthusiasts alongside coursework and independent development projects."
      ]
    }
  ],

  education: [
    {
      degree: "B.Sc. in Computer Science & Engineering",
      institution: "BRAC University, Dhaka, Bangladesh",
      period: "7th Semester (Ongoing)",
      gpa: "CGPA: 3.64",
    },
    {
      degree: "Higher Secondary Certificate (HSC), Science",
      institution: "Birshresto Munshi Abdur Rouf College, Dhaka, Bangladesh",
      period: "2023",
      gpa: "GPA: 5.00/5.00",
      group: "Science"
    },
    {
      degree: "Secondary School Certificate (SSC), Science",
      institution: "Birshresto Munshi Abdur Rouf College, Dhaka, Bangladesh",
      period: "2023",
      gpa: "GPA: 5.00/5.00",
      group: "Science"
    }
  ],

  achievements: [
    {
      title: "🏆 Bit Battles — Intra BRAC University Programming Contest",
      issuer: "BRAC University Computer Club, Aug 2025",
      desc: "Received a Certificate of Participation for competing in this intra-university programming contest."
    },
    {
      title: "🔐 NSU Cybernaut — Datathon & Cybersecurity Competition",
      issuer: "North South University",
      desc: "Participated in this datathon and cybersecurity competition."
    }
  ],

  notes: [],

  currentlyBuilding: {
    status: "🛠️ In Active Development",
    lastUpdated: "Recently",
    items: [
      {
        project: "Notebook — Web-Based Drawing Application",
        detail: "Polishing the canvas drawing tool, Web Audio sound synthesis, and PDF export, deployed on Vercel."
      },
      {
        project: "Study Rest Clock — Pomodoro-Style Timer",
        detail: "Refining the shared JavaScript core powering both the Electron desktop app and the Vercel-deployed PWA."
      },

      {
        project: "Disease Prediction Thesis",
        detail: "Working with a small group on a Machine Learning-based disease prediction project, as part of the undergraduate thesis planned for Spring 2027."
      }
    ]
  },

  contact: {
    pitch: "I am always excited to discuss new software projects, internship opportunities, research collaborations, or fascinating tech topics.",
    channels: [
      { name: "Email", value: "younusmohammadmaheer123@gmail.com", url: "mailto:younusmohammadmaheer123@gmail.com", icon: "✉️" },
      { name: "GitHub", value: "github.com/nihedevotee", url: "https://github.com/nihedevotee", icon: "🐙" },
      { name: "LinkedIn", value: "linkedin.com/in/younus-mohammadmaheer", url: "https://linkedin.com/in/younus-mohammadmaheer", icon: "💼" }
    ],
    responseTime: "Typically responds within 24 hours"
  }
};