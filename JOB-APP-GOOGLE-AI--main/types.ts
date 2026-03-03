
export interface Job {
  id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  jobRole: string;
  description: string;
  email: string;
  company?: string;
  isUrgent: boolean;
  urgentUntil?: number;
  views: number;
  postedAt: number;
}

export type TabType = 'ALL_JOBS' | 'POST_JOB' | 'SAVED_JOBS' | 'ALERTS' | 'MANAGE' | 'ADMIN_PANEL';

export interface LocalData {
  viewedJobIds: string[];
  savedJobIds: string[];
  alertRoles: string[];
  lastAlertCheck: number;
  urgentPostTracking: {
    [email: string]: {
      count: number;
      lastReset: number;
      extraCredits: number;
    }
  };
}

export interface StorageData {
  jobs: Job[];
  viewedJobIds: string[];
}
