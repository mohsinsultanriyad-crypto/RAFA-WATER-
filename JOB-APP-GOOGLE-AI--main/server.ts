import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { connectDB } from './services/db';
import Job from './models/Job';
import PushToken from "./models/PushToken";
import { getFirebaseApp, getMessaging } from "./services/firebaseAdmin";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

// Middlewares
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

/**
 * Robust Role Normalization
 * - convert to lowercase
 * - trim
 * - replace underscores and hyphens with spaces
 * - collapse multiple spaces to one
 * - remove leading/trailing punctuation
 */
function normalizeRole(value: string): string {
  if (!value || typeof value !== "string") return "";
  let v = value.toLowerCase();
  v = v.replace(/[_\-]+/g, ' '); // underscores/hyphens -> space
  v = v.replace(/\s+/g, ' ');    // multiple spaces -> single
  v = v.trim();
  v = v.replace(/^[^\w\s]+|[^\w\s]+$/g, ''); // remove leading/trailing punctuation
  return v.trim();
}

/**
 * Implementation of sendJobNotification(jobRole, jobCity)
 * - Normalizes inputs
 * - Queries for matching tokens (role + optional city targeting)
 * - Sends in chunks of 400
 */
export async function sendJobNotification(role: string, city?: string, customTitle?: string, customBody?: string) {
  try {
    const roleNormalized = normalizeRole(role);
    const cityLower = (city || "").trim().toLowerCase();

    if (!roleNormalized) {
      console.log("[Push] No valid role provided (even after normalization), skipping.");
      return;
    }

    // Target tokens that subscribed to this role
    // If token has a city preference, it must match jobCity.
    // If token has no city preference (""), it matches any job city.
    const query: any = { roles: roleNormalized };
    if (cityLower) {
      query.$or = [
        { city: cityLower },
        { city: "" },
        { city: { $exists: false } }
      ];
    }

    const tokens = await PushToken.find(query);
    const matchedCount = tokens.length;

    console.log(`[Push] Normalized target - role: ${roleNormalized}, city: ${cityLower || 'any'}. Matched count: ${matchedCount}`);

    if (matchedCount === 0) {
      return { matchedCount: 0, sentCount: 0, failedCount: 0 };
    }

    const fcmTokens = tokens.map(t => t.token);
    const messaging = getMessaging();

    const title = customTitle || "New Job Posted";
    const body = customBody || (city ? `${roleNormalized} in ${cityLower}` : roleNormalized);

    let sentCount = 0;
    let failedCount = 0;

    // FCM multicast limit is 500. Using 400 for safety.
    const chunkSize = 400;
    for (let i = 0; i < fcmTokens.length; i += chunkSize) {
      const chunk = fcmTokens.slice(i, i + chunkSize);
      const message: any = {
        notification: { title, body },
        tokens: chunk,
        android: {
          priority: "high",
          notification: { sound: "default" }
        }
      };

      try {
        const response = await messaging.sendEachForMulticast(message);
        sentCount += response.successCount;
        failedCount += response.failureCount;
      } catch (err) {
        console.error("[Push] Batch error:", err);
        failedCount += chunk.length;
      }
    }

    console.log(`[Push] Report - Role: ${roleNormalized}, Matched: ${matchedCount}, Sent: ${sentCount}, Failed: ${failedCount}`);
    return { matchedCount, sentCount, failedCount };
  } catch (e) {
    console.error("[Push] sendJobNotification error:", e);
    return { error: e };
  }
}

// Push Routes
const pushRouter = express.Router();

// POST /api/push/register
pushRouter.post("/register", async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token string required" });
    }
    await PushToken.findOneAndUpdate(
      { token },
      {
        $set: { platform: platform || "android", updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date(), roles: [], city: "" }
      },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to register" });
  }
});

// POST /api/push/preferences
pushRouter.post("/preferences", async (req, res) => {
  try {
    const { token, roles, city } = req.body;
    if (!token || !Array.isArray(roles)) {
      return res.status(400).json({ error: "token and roles array required" });
    }

    // Normalize every role, remove empty, and deduplicate
    const normalizedRoles = Array.from(new Set(
      roles
        .filter(r => typeof r === "string")
        .map(r => normalizeRole(r))
        .filter(r => r !== "")
    ));

    const normalizedCity = typeof city === "string" ? city.trim().toLowerCase() : "";

    await PushToken.findOneAndUpdate(
      { token },
      {
        $set: {
          roles: normalizedRoles,
          city: normalizedCity,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// POST /api/push/test
pushRouter.post("/test", async (req, res) => {
  try {
    const { role, city, title, body } = req.body;
    if (!role) return res.status(400).json({ error: "role required" });
    const result: any = await sendJobNotification(role, city, title, body);
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ error: "Test push failed" });
  }
});

// POST /api/push/debug-match
pushRouter.post("/debug-match", async (req, res) => {
  try {
    const { role, city } = req.body;
    const normalizedRole = normalizeRole(role);
    const cityLower = (city || "").trim().toLowerCase();

    const query: any = { roles: normalizedRole };
    if (cityLower) {
      query.$or = [
        { city: cityLower },
        { city: "" },
        { city: { $exists: false } }
      ];
    }

    const tokens = await PushToken.find(query);
    res.json({
      ok: true,
      normalizedRole,
      matchedCount: tokens.length,
      matchedTokenPrefixes: tokens.map((t: any) => t.token ? t.token.substring(0, 12) : "unknown")
    });
  } catch (e) {
    res.status(500).json({ error: "Debug match failed" });
  }
});

// GET /api/push/health
pushRouter.get("/health", async (req, res) => {
  let firebaseOk = false;
  try {
    getFirebaseApp();
    firebaseOk = true;
  } catch (e) {}
  const tokenCount = await PushToken.countDocuments();
  res.json({ ok: true, firebase: firebaseOk, tokenCount });
});

// GET /api/push/tokens
pushRouter.get("/tokens", async (req, res) => {
  try {
    const tokens = await PushToken.find().sort({ updatedAt: -1 }).limit(50);
    const items = tokens.map((t: any) => ({
      platform: t.platform,
      roles: t.roles,
      city: t.city,
      updatedAt: t.updatedAt,
      tokenPrefix: t.token ? t.token.substring(0, 12) : ""
    }));
    res.json({ count: tokens.length, items });
  } catch (e) {
    res.status(500).json({ error: "Error fetching tokens" });
  }
});

app.use("/api/push", pushRouter);

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Job Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const fifteenDaysAgo = Date.now() - (15 * 24 * 60 * 60 * 1000);
    const jobs = await Job.find({ postedAt: { $gt: fifteenDaysAgo } }).sort({ postedAt: -1 }).lean();
    res.json(jobs);
  } catch (error) {
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

    // Trigger Notification
    (async () => {
      try {
        // Robust field mapping: frontend may send jobRole or role
        const roleRaw = (jobDoc.jobRole || req.body.jobRole || req.body.role || "").trim();
        const city = (jobDoc.city || req.body.city || "").trim();

        // Normalize role before triggering notification
        const normalizedRole = normalizeRole(roleRaw);

        if (normalizedRole) {
          await sendJobNotification(normalizedRole, city);
        }
      } catch (pushErr) {
        console.error("[Push] Trigger failure:", pushErr);
      }
    })();
  } catch (error) {
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
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (updateData.isUrgent && !job.isUrgent) {
      updateData.urgentUntil = Date.now() + (24 * 60 * 60 * 1000);
    }
    Object.assign(job, updateData);
    await job.save();
    res.json(job.toObject());
  } catch (error) {
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
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await Job.deleteOne({ id });
    res.json({ message: 'Job deleted' });
  } catch (error) {
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
      return res.json({ views: job.views });
    }
    res.status(404).json({ error: 'Job not found' });
  } catch (error) {
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
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
