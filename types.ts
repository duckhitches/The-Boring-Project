export interface Project {
  id: string;
  projectName: string;
  timeline: string;
  description: string;
  codeSnippet?: string;
  codeLanguage?: string;
  screenshots: string[];
  githubLink?: string;
  liveLink?: string;
  contactEmail: string;
  backgroundImage?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  userInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface ProjectWithUserInfo extends Project {
  userInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
}