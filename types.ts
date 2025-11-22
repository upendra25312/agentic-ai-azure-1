export enum Status {
  LOCKED = 'LOCKED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface Certification {
  code: string;
  name: string;
  description: string;
  link: string;
  studyGuide?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: Status;
}

export interface Skill {
  name: string;
  category: 'Architecture' | 'Development' | 'Governance' | 'Business';
  mastered: boolean;
}

export interface Project {
  title: string;
  description: string;
  techStack: string[];
  deliverables: string[];
  status: Status;
}

export interface Phase {
  id: number;
  title: string;
  duration: string;
  description: string;
  focus: string;
  certs: Certification[];
  skills: Skill[];
  projects: Project[];
}

export interface WeeklyTask {
  day: string;
  activity: string;
  type: 'Theory' | 'Lab' | 'Review' | 'Build';
  hours: number;
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}