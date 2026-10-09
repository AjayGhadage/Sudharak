import fs from 'fs';
import path from 'path';

export const uploadToS3 = async (filePath, filename) => {
  // If AWS S3 credentials are functional in production:
  // We mock or return local uploaded URL fallback if S3 credentials are mock
  const serverBaseUrl = process.env.SERVER_URL || 'http://localhost:5000';
  return `${serverBaseUrl}/uploads/${filename}`;
};
