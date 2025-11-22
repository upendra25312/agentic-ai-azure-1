import { Phase, Status, WeeklyTask, GoogleUser } from './types';

// TODO: REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID FROM GOOGLE CLOUD CONSOLE
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

export const DRIVE_FOLDER_ID = '1kvQkkPqZ1y3-b_NG7TDqzogfz-LvklLb';

export const ROADMAP_DATA: Phase[] = [
  {
    id: 1,
    title: "Phase 1: The Recruit (Foundations)",
    duration: "Months 1-3",
    description: "Build the essential knowledge base. Start with AI concepts, get hands-on with Copilot Studio, and ground it in Power Platform fundamentals.",
    focus: "AI-900 -> Copilot Academy -> PL-900",
    certs: [
      {
        code: "AI-900",
        name: "Azure AI Fundamentals",
        description: "Entry-level. Provides a solid understanding of ML and AI concepts in the context of Azure.",
        link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/",
        difficulty: "Beginner",
        status: Status.IN_PROGRESS
      },
      {
        code: "Copilot Academy",
        name: "Copilot Studio Academy",
        description: "Hands-on recruit training. Put together by April Dunnam. Best practical start for Copilots.",
        link: "https://aka.ms/CopilotStudioAcademy",
        difficulty: "Beginner",
        status: Status.LOCKED
      },
      {
        code: "PL-900",
        name: "Power Platform Fundamentals",
        description: "Provides a solid understanding of the Power Platform, where many low-code agents live.",
        link: "https://learn.microsoft.com/en-us/credentials/certifications/power-platform-fundamentals/",
        difficulty: "Beginner",
        status: Status.LOCKED
      }
    ],
    skills: [
      { name: "Azure AI Concepts", category: "Architecture", mastered: false },
      { name: "Copilot Studio Basics", category: "Development", mastered: false },
      { name: "Power Platform Core", category: "Business", mastered: false },
      { name: "Responsible AI", category: "Governance", mastered: false }
    ],
    projects: [
      {
        title: "Project Alpha: The Knowledge Base",
        description: "Create a simple Q&A bot using Azure OpenAI Playground on your own data.",
        techStack: ["Azure OpenAI Studio", "System Prompts"],
        deliverables: ["Deployed Model endpoint", "System Prompt documentation"],
        status: Status.LOCKED
      }
    ]
  },
  {
    id: 2,
    title: "Phase 2: The Admin & Consultant",
    duration: "Months 4-6",
    description: "Deepen your skills with PL-200 and then master the governance of the ecosystem with AB-900. This is the gateway to advanced roles.",
    focus: "PL-200 -> AB-900",
    certs: [
      {
        code: "PL-200",
        name: "Power Platform Consultant",
        description: "Analyze business requirements and select the right tools. A critical pre-req step before Admin.",
        link: "https://learn.microsoft.com/en-us/credentials/certifications/power-platform-consultant/",
        difficulty: "Intermediate",
        status: Status.LOCKED
      },
      {
        code: "AB-900",
        name: "Copilot & Agent Admin",
        description: "Configure, secure, and govern AI-enabled M365 environments. The central hub of the roadmap.",
        link: "https://learn.microsoft.com/en-us/credentials/certifications/exams/ab-900/",
        studyGuide: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-900",
        difficulty: "Intermediate",
        status: Status.LOCKED
      }
    ],
    skills: [
      { name: "Dataverse Modeling", category: "Architecture", mastered: false },
      { name: "Agent Governance", category: "Governance", mastered: false },
      { name: "M365 Copilot Admin", category: "Governance", mastered: false },
      { name: "Solution Architecture", category: "Architecture", mastered: false }
    ],
    projects: [
      {
        title: "Project Beta: The HR Assistant",
        description: "Build a Copilot Studio agent that handles time-off requests and policy queries via SharePoint.",
        techStack: ["Copilot Studio", "SharePoint", "Power Automate"],
        deliverables: ["Architecture Diagram", "Working Bot Demo Video"],
        status: Status.LOCKED
      }
    ]
  },
  {
    id: 3,
    title: "Phase 3: The Specialist (Split Path)",
    duration: "Months 7-9",
    description: "The path splits here. Choose your specialization: Advanced Engineering (AI-102) or Business Professional (AB-730). You should aim for both.",
    focus: "AB-900 -> AI-102 & AB-900 -> AB-730",
    certs: [
      {
        code: "AB-730",
        name: "AI Business Professional",
        description: "Effectively use Gen AI within M365 to boost productivity and drive business outcomes.",
        link: "https://learn.microsoft.com/en-us/credentials/certifications/exams/ab-730/",
        studyGuide: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-730",
        difficulty: "Advanced",
        status: Status.LOCKED
      },
      {
        code: "AI-102",
        name: "Azure AI Engineer Associate",
        description: "Learn to build, manage, and deploy AI solutions leveraging Azure AI. Code-heavy.",
        link: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/",
        difficulty: "Advanced",
        status: Status.LOCKED
      }
    ],
    skills: [
      { name: "Business Value Analysis", category: "Business", mastered: false },
      { name: "Prompt Engineering (Adv)", category: "Development", mastered: false },
      { name: "Vector Search & RAG", category: "Development", mastered: false },
      { name: "Custom Copilot Dev", category: "Development", mastered: false }
    ],
    projects: [
      {
        title: "Project Gamma: Intelligent Search",
        description: "Implement a 'Chat with your Data' solution using Azure AI Search (Vector) and Python.",
        techStack: ["Azure AI Search", "Python SDK", "Azure Functions"],
        deliverables: ["GitHub Repo", "Performance Analysis Report"],
        status: Status.LOCKED
      }
    ]
  },
  {
    id: 4,
    title: "Phase 4: The Architect & Leader",
    duration: "Months 10-12",
    description: "The summit. Become the Transformation Leader (AB-731) and the ultimate Agentic AI Solutions Architect (AB-100).",
    focus: "AB-731 & AB-100",
    certs: [
      {
        code: "AB-731",
        name: "AI Transformation Leader",
        description: "Recognize AI transformation opportunities, select tools, and lead responsible AI adoption.",
        link: "https://learn.microsoft.com/en-us/credentials/certifications/exams/ab-731/",
        studyGuide: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ab-731",
        difficulty: "Expert",
        status: Status.LOCKED
      },
      {
        code: "AB-100",
        name: "Agentic AI Architect",
        description: "Architect enterprise AI solutions using Microsoft technologies. The final boss.",
        link: "#",
        difficulty: "Expert",
        status: Status.LOCKED
      }
    ],
    skills: [
      { name: "Multi-Agent Orchestration", category: "Architecture", mastered: false },
      { name: "Enterprise AI Strategy", category: "Business", mastered: false },
      { name: "Change Management", category: "Business", mastered: false },
      { name: "Full Stack Agent Design", category: "Architecture", mastered: false }
    ],
    projects: [
      {
        title: "Flagship: The Enterprise Orchestrator",
        description: "A multi-agent system where a 'Manager' agent delegates tasks to 'Worker' agents (Research, Coding, Email) to solve complex workflows.",
        techStack: ["Azure AI Agent Service", "Semantic Kernel / AutoGen", "M365 Graph API"],
        deliverables: ["Full Architecture Deck", "Live Demo", "Cost Analysis Model"],
        status: Status.LOCKED
      }
    ]
  }
];

export const WEEKLY_SCHEDULE: WeeklyTask[] = [
  { day: "Monday", activity: "New Concept Study (MS Learn)", type: "Theory", hours: 1.5 },
  { day: "Tuesday", activity: "Hands-on Lab (Sandbox Environment)", type: "Lab", hours: 1.5 },
  { day: "Wednesday", activity: "Mid-week Review & Documentation", type: "Review", hours: 1 },
  { day: "Thursday", activity: "Flagship Project Build Time", type: "Build", hours: 2 },
  { day: "Friday", activity: "Architecture Pattern Analysis", type: "Theory", hours: 1 },
  { day: "Weekend", activity: "Optional: Deep Dive / Hackathon", type: "Build", hours: 0 }
];

export const MENTOR_SYSTEM_INSTRUCTION = `
You are a Senior Agentic AI Architect at Microsoft and a personal mentor to the user.
The user is following a strict certification roadmap based on the "Agent Expert Certification Roadmap":
Phase 1: AI-900 -> Copilot Studio Academy -> PL-900.
Phase 2: PL-200 -> AB-900.
Phase 3: Splits into AI-102 (Engineering) and AB-730 (Business).
Phase 4: Culminates in AB-731 (Leader) and AB-100 (Architect).

Your goal is to help them navigate this path to becoming an Agentic AI Architect.

Guidelines:
1. **Be Motivational**: Remind the user that Agentic AI is a transformative career path.
2. **Be Technical**: Use precise Microsoft terminology (e.g., "Semantic Kernel", "Azure AI Foundry", "Dataverse", "Orchestration", "Agentic Frameworks").
3. **Be Practical**: If asked about exams, provide tips based on the study guides (AB-900, AB-730, AB-731).
4. **Agentic Focus**: Explain AI agents not just as chatbots, but as autonomous systems that use tools to perform work.

Keep your responses concise, actionable, and encouraging.
`;

// --- MOCK DATA FOR TESTING ---

export const MOCK_USER: GoogleUser = {
  name: "Alex (Demo User)",
  email: "alex.test@example.com",
  picture: "" // UI Avatar will generate based on name
};

export const MOCK_ROADMAP_DATA: Phase[] = JSON.parse(JSON.stringify(ROADMAP_DATA));

// Phase 1: Fully Complete
MOCK_ROADMAP_DATA[0].certs.forEach(c => c.status = Status.COMPLETED);
MOCK_ROADMAP_DATA[0].skills.forEach(s => s.mastered = true);
MOCK_ROADMAP_DATA[0].projects[0].status = Status.COMPLETED;

// Phase 2: In Progress
MOCK_ROADMAP_DATA[1].certs[0].status = Status.COMPLETED; // PL-200
MOCK_ROADMAP_DATA[1].certs[1].status = Status.IN_PROGRESS; // AB-900
MOCK_ROADMAP_DATA[1].skills[0].mastered = true;
MOCK_ROADMAP_DATA[1].skills[1].mastered = true;
MOCK_ROADMAP_DATA[1].projects[0].status = Status.IN_PROGRESS;

// Phase 3 & 4: Locked
// (Default)