
export const mappings = {
  // Frontend technologies (Front-end category)
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  
  // Backend technologies (Back-end category)
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  python: "python",
  django: "django",
  flask: "flask",
  fastapi: "fastapi",
  java: "java",
  "spring boot": "spring",
  spring: "spring",
  php: "php",
  laravel: "laravel",
  ruby: "ruby",
  rails: "rails",
  go: "go",
  rust: "rust",
  "c#": "csharp",
  ".net": "dotnet",
  
  // Database technologies (Database and SQL category)
  mongodb: "mongodb",
  mongo: "mongodb",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  redis: "redis",
  sql: "sql",
  
  // DevOps technologies (DevOps category)
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  jenkins: "jenkins",
  
  // Version Control (Version Control category)
  git: "git",
  github: "github",
  gitlab: "gitlab",
  
  // Security (Security category)
  security: "security",
  oauth: "oauth",
  jwt: "jwt",
  
  // Testing (Software Testing category)
  testing: "testing",
  jest: "jest",
  cypress: "cypress",
  selenium: "selenium",
  
  // System Design
  "system design": "systemdesign",
  architecture: "architecture",
  microservices: "microservices",
  api: "api",
  
  // Web Development (Web Development category)
  "web development": "webdev",
  http: "http",
  https: "https",
  rest: "rest",
  
  // Data Structures and Algorithms
  "data structures": "datastructures",
  algorithms: "algorithms",
  dsa: "dsa",
};

// Interviewer configuration for ML-powered interviews
export const interviewer = {
  name: "ML-Powered Interviewer",
  description: "Conducts interviews using ML-generated questions and ElevenLabs voice",
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.5,
    similarityBoost: 0.75,
  },
};


export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];
