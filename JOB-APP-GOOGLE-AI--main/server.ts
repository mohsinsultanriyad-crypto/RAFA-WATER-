
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';

import { connectDB } from './services/db';
import Job from './models/Job';

dotenv.config();



const app = express();
const port = Number(process.env.PORT) || 3001;

// CORS setup for Render
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// API Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
    const jobs = await Job.find({ postedAt: { $gt: fifteenDaysAgo } }).sort({ postedAt: -1 }).lean();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const jobData = req.body;
    const id = Math.random().toString(36).substring(2, 11);
    const postedAt = Date.now();
    const newJob = {
      ...jobData,
      id,
      postedAt,
      views: 0
    };
    if (newJob.isUrgent) {
      newJob.urgentUntil = Date.now() + (24 * 60 * 60 * 1000);
    }
    const jobDoc = await Job.create(newJob);
    res.status(201).json(jobDoc.toObject());
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ error: 'Failed to post job' });
  }
});


app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, ...updateData } = req.body;
    const job = await Job.findOne({ id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.email !== email) {
      return res.status(403).json({ error: 'Unauthorized: Email mismatch' });
    }
    if (updateData.isUrgent && !job.isUrgent) {
      updateData.urgentUntil = Date.now() + (24 * 60 * 60 * 1000);
    }
    Object.assign(job, updateData);
    await job.save();
    res.json(job.toObject());
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});


app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, adminKey } = req.body;
    const job = await Job.findOne({ id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const isAdmin = adminKey === 'saudi_admin_2025';
    if (!isAdmin && job.email !== email) {
      return res.status(403).json({ error: 'Unauthorized: Email mismatch' });
    }
    await Job.deleteOne({ id });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});


app.post('/api/jobs/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOne({ id });
    if (job) {
      job.views = (job.views || 0) + 1;
      await job.save();
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ error: 'Failed to increment views' });
  }
});


// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })();
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  // Express 5.x: use regex for SPA fallback (exclude /api)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
