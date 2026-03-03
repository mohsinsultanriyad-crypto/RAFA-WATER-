
import { Job, LocalData } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const LOCAL_STORAGE_KEY = 'saudi_job_local_device';

export const getGlobalJobs = async (): Promise<Job[]> => {
  const response = await fetch(`${API_BASE}/jobs`);
  if (!response.ok) throw new Error('Failed to fetch jobs');
  return response.json();
};

export const postGlobalJob = async (job: Omit<Job, 'id' | 'views' | 'postedAt'>): Promise<Job> => {
  const response = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(job),
  });
  if (!response.ok) throw new Error('Failed to post job');
  return response.json();
};

export const updateGlobalJob = async (id: string, email: string, data: Partial<Job>): Promise<Job> => {
  const response = await fetch(`${API_BASE}/jobs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, email }),
  });
  if (!response.ok) throw new Error('Failed to update job');
  return response.json();
};

export const deleteGlobalJob = async (id: string, email?: string, adminKey?: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE}/jobs/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, adminKey }),
  });
  return response.ok;
};

export const incrementJobViews = async (id: string): Promise<void> => {
  await fetch(`${API_BASE}/jobs/${id}/view`, { method: 'POST' });
};

export const getLocalData = (): LocalData => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  const defaults: LocalData = { 
    viewedJobIds: [], 
    savedJobIds: [], 
    alertRoles: [], 
    lastAlertCheck: 0,
    urgentPostTracking: {}
  };
  
  if (!data) return defaults;
  
  try {
    const parsed = JSON.parse(data);
    return { ...defaults, ...parsed };
  } catch (e) {
    return defaults;
  }
};

export const saveLocalData = (data: LocalData) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

export const getUrgentStatus = (email: string) => {
  const data = getLocalData();
  const today = new Date().setHours(0, 0, 0, 0);
  
  if (!data.urgentPostTracking[email]) {
    data.urgentPostTracking[email] = { count: 0, lastReset: today, extraCredits: 0 };
    saveLocalData(data);
  }
  
  const status = data.urgentPostTracking[email];
  if (status.lastReset < today) {
    status.count = 0;
    status.lastReset = today;
    status.extraCredits = 0;
    saveLocalData(data);
  }
  
  return {
    remaining: Math.max(0, 2 + status.extraCredits - status.count),
    totalAllowed: 2 + status.extraCredits,
    count: status.count
  };
};

export const recordUrgentPost = (email: string) => {
  const data = getLocalData();
  if (data.urgentPostTracking[email]) {
    data.urgentPostTracking[email].count += 1;
    saveLocalData(data);
  }
};

export const addExtraUrgentCredit = (email: string) => {
  const data = getLocalData();
  if (data.urgentPostTracking[email]) {
    data.urgentPostTracking[email].extraCredits += 1;
    saveLocalData(data);
  }
};

export const markAsViewedLocal = (id: string) => {
  const data = getLocalData();
  if (!data.viewedJobIds.includes(id)) {
    data.viewedJobIds.push(id);
    saveLocalData(data);
    incrementJobViews(id).catch(console.error);
  }
};

export const toggleSaveJob = (id: string) => {
  const data = getLocalData();
  if (data.savedJobIds.includes(id)) {
    data.savedJobIds = data.savedJobIds.filter(jid => jid !== id);
  } else {
    data.savedJobIds.push(id);
  }
  saveLocalData(data);
  return data.savedJobIds.includes(id);
};

export const updateAlertRoles = (roles: string[]) => {
  const data = getLocalData();
  data.alertRoles = roles;
  saveLocalData(data);
};
