import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const mongoUri = config.mongoUri;
  if (!mongoUri || mongoUri.includes('mock') || mongoUri.includes('placeholder')) {
    console.warn('⚠️  MONGODB_URI not set or is a placeholder — running in JSON fallback mode');
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️  Falling back to JSON flat-file storage');
  }
};

export const isMongoConnected = () => isConnected && mongoose.connection.readyState === 1;

// ─── Legacy JSON flat-file fallback (kept intact) ───────────────────────────
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class LocalDatabase {
  constructor() {
    this.tables = {
      users:     path.join(DATA_DIR, 'users.json'),
      issues:    path.join(DATA_DIR, 'issues.json'),
      donations: path.join(DATA_DIR, 'donations.json'),
      upvotes:   path.join(DATA_DIR, 'upvotes.json'),
      comments:  path.join(DATA_DIR, 'comments.json')
    };
    this.init();
  }

  init() {
    for (const [, filePath] of Object.entries(this.tables)) {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    }
  }

  read(table) {
    try {
      const data = fs.readFileSync(this.tables[table], 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`Error reading ${table}:`, e);
      return [];
    }
  }

  write(table, records) {
    try {
      fs.writeFileSync(this.tables[table], JSON.stringify(records, null, 2));
      return true;
    } catch (e) {
      console.error(`Error writing ${table}:`, e);
      return false;
    }
  }
}

export const db = new LocalDatabase();
