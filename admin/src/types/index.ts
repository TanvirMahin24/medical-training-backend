export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  subscriptionStatus:
    | "TRIAL"
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED"
    | "PAST_DUE"
    | "UNPAID";
  isEmailVerified?: boolean;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  dateOfBirth?: string;
  specialty?: string;
  experience?: number;
  bio?: string;
  avatar?: string;
}

export interface MedicalCase {
  id: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  category: string;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  criteria: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  planType: string;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAST_DUE" | "UNPAID";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  caseId: string;
  score: number;
  maxScore: number;
  completedAt?: string;
  attempts: number;
  timeSpent?: number;
  answers?: any;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCases: number;
  totalRevenue: number;
  monthlyGrowth: number;
  userEngagement: number;
}
