export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse extends AuthTokenPair {
  user: UserSummary;
}

export interface ProjectMemberSummary {
  id: string;
  role: 'OWNER' | 'MEMBER';
  user: UserSummary;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members: ProjectMemberSummary[];
}

export interface TaskSummary {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: Date | null;
  projectId: string;
  createdById: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignee?: UserSummary | null;
  createdBy?: UserSummary;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: UserSummary;
  }>;
}
