// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
  avatar?: string;
  bio?: string;
  joinedAt: Date;
  rating: number;
}

export interface Freelancer extends User {
  role: 'freelancer';
  skills: string[];
  hourlyRate: number;
  availability: 'available' | 'limited' | 'unavailable';
  completedProjects: number;
}

export interface Client extends User {
  role: 'client';
  company?: string;
  industry?: string;
  projectsPosted: number;
}

// Contract Types
export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'disputed';
  deliverables: string[];
  feedback?: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  client: string; // client ID
  freelancer: string; // freelancer ID
  startDate: Date;
  endDate?: Date;
  totalAmount: number;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
  milestones: Milestone[];
  terms: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  contractId: string;
  milestoneId: string;
  amount: number;
  status: 'pending' | 'in_escrow' | 'released' | 'refunded';
  date: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  contractId?: string;
  content: string;
  attachments?: string[];
  read: boolean;
  createdAt: Date;
}

// Review Types
export interface Review {
  id: string;
  contractId: string;
  reviewerId: string; // who wrote the review
  revieweeId: string; // who is being reviewed
  rating: number;
  comment: string;
  createdAt: Date;
}

// Dispute Types
export interface Dispute {
  id: string;
  contractId: string;
  milestoneId: string;
  initiatorId: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}