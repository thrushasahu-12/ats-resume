import { ResumeData } from '../types/resume';

export const SAMPLE_RESUME: ResumeData = {
  summary: "Results-driven Software Architect with 8+ years of experience in designing and scaling distributed systems. Expert in React, Node.js, and Cloud Infrastructure. Proven track record of improving system uptime by 40% and leading cross-functional teams to deliver high-impact features.",
  experience: [
    {
      company: "TechScale Systems",
      position: "Senior Software Architect",
      location: "San Francisco, CA",
      period: "2020 - Present",
      highlights: [
        "Led migration of monolithic architecture to microservices using Node.js and Kubernetes.",
        "Designed high-performance data pipelines processing 1TB+ daily data.",
        "Reduced cloud infrastructure costs by 25% through optimization and right-sizing."
      ]
    },
    {
      company: "Innovate AI",
      position: "Senior Full Stack Engineer",
      location: "Austin, TX",
      period: "2017 - 2020",
      highlights: [
        "Architected foundational frontend architecture using React and Redux.",
        "Implemented real-time collaboration features using WebSockets and Redis.",
        "Mentored 5 junior engineers and established robust code review processes."
      ]
    }
  ],
  skills: [
    "TypeScript", "React", "Node.js", "Docker", "Kubernetes", "AWS", "PostgreSQL", "System Design", "Microservices", "GraphQL"
  ],
  education: [
    {
      school: "Stanford University",
      degree: "M.S. in Computer Science",
      period: "2015 - 2017"
    },
    {
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science",
      period: "2011 - 2015"
    }
  ],
  contact: {
    name: "Alex Rivera",
    email: "arivera@example.com",
    phone: "+1 (555) 010-9988",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/arivera",
    website: "arivera.io"
  }
};

export const SAMPLE_JOB_DESCRIPTION = `
Position: Principal Software Engineer - Platform Team

We are looking for a highly skilled Principal Engineer to join our Platform Team. You will be responsible for building the foundation that powers our global SaaS application.

Key Responsibilities:
- Design and implement scalable backend services using Node.js and Go.
- Lead the architectural direction for our microservices ecosystem.
- Optimize system performance and observability.
- Collaborate with product and design teams to build user-centric features.

Required Skills:
- 10+ years of software engineering experience.
- Deep expertise in distributed systems and cloud-native architectures.
- Expert-level knowledge of React and modern frontend frameworks.
- Experience with infrastructure as code (Terraform, Pulumi).
- Strong leadership and communication skills.
`;
