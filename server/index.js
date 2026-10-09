import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';

import authRoutes from './routes/auth.routes.js';
import issueRoutes from './routes/issue.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { startEscalationCron, checkAndEscalateIssues } from './services/escalation.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware 

app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'Sudharak API' });
});

// Manual escalation trigger (for demo/testing)
app.get('/api/escalate', async (req, res) => {
  const results = await checkAndEscalateIssues();
  res.json({ success: true, escalated: results.length, data: results });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

const PORT = config.port || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sudharak Backend Server running on port ${PORT}`);
  startEscalationCron();
});
