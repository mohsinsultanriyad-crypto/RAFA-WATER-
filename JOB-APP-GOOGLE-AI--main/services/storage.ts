import fs from 'fs/promises';
import path from 'path';
import { Job } from '../types';

const STORAGE_FILE = path.join(process.cwd(), 'jobs_db.json');

export async function readJobs(): Promise<Job[]> {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    const jobs = JSON.parse(data);
    if (jobs.length > 0) return jobs;
    return getSeedJobs();
  } catch (error) {
    const seedJobs = getSeedJobs();
    await writeJobs(seedJobs);
    return seedJobs;
  }
}

function getSeedJobs(): Job[] {
  return [
    {
      id: 'seed-1',
      fullName: 'Khalid Al-Saud',
      phoneNumber: '0501234567',
      city: 'Riyadh',
      jobRole: 'Sales Executive',
      description: 'Looking for an experienced sales executive for our Riyadh branch. Must have 2+ years experience in retail.',
      email: 'khalid@example.com',
      company: 'Al-Faisaliah Group',
      isUrgent: true,
      urgentUntil: Date.now() + 86400000,
      views: 124,
      postedAt: Date.now() - 3600000
    },
    {
      id: 'seed-2',
      fullName: 'Sarah Ahmed',
      phoneNumber: '0559876543',
      city: 'Jeddah',
      jobRole: 'Delivery Driver',
      description: 'Urgent requirement for delivery drivers in Jeddah. Must have a valid Saudi driving license and own a vehicle.',
      email: 'sarah@example.com',
      company: 'FastDelivery KSA',
      isUrgent: false,
      views: 45,
      postedAt: Date.now() - 7200000
    },
    {
      id: 'seed-3',
      fullName: 'Mohammed Khan',
      phoneNumber: '0561122334',
      city: 'Dammam',
      jobRole: 'Security Guard',
      description: 'Security guards needed for a shopping mall in Dammam. 8-hour shifts, competitive salary.',
      email: 'mohammed@example.com',
      company: 'SafeGuard Solutions',
      isUrgent: false,
      views: 89,
      postedAt: Date.now() - 86400000
    }
  ];
}

export async function writeJobs(jobs: Job[]): Promise<void> {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(jobs, null, 2));
}

export async function addJob(job: Job): Promise<Job> {
  const jobs = await readJobs();
  jobs.push(job);
  await writeJobs(jobs);
  return job;
}

export async function updateJob(id: string, data: Partial<Job>): Promise<Job | null> {
  const jobs = await readJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index === -1) return null;
  
  jobs[index] = { ...jobs[index], ...data };
  await writeJobs(jobs);
  return jobs[index];
}

export async function deleteJob(id: string): Promise<boolean> {
  const jobs = await readJobs();
  const filtered = jobs.filter(j => j.id !== id);
  if (filtered.length === jobs.length) return false;
  
  await writeJobs(filtered);
  return true;
}

export async function incrementViews(id: string): Promise<void> {
  const jobs = await readJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index !== -1) {
    jobs[index].views = (jobs[index].views || 0) + 1;
    await writeJobs(jobs);
  }
}
