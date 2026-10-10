import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/env.js';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const isS3Configured = config.awsAccessKeyId && 
  config.awsSecretAccessKey && 
  !config.awsAccessKeyId.includes('mock');

let s3 = null;
if (isS3Configured) {
  s3 = new S3Client({
    region: config.awsRegion || 'ap-south-1',
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });
}

/**
 * Upload a file to S3 (production) or return a local URL fallback (dev).
 * @param {string|Buffer} filePathOrBuffer - Local file path or Buffer
 * @param {string} filename - Original filename
 * @param {string} [mimeType] - MIME type (required if passing Buffer)
 * @returns {Promise<string>} Public URL
 */
export async function uploadToS3(filePathOrBuffer, filename, mimeType) {
  const serverBaseUrl = process.env.SERVER_URL || `http://localhost:${config.port || 5000}`;

  // Fallback to local serving in dev mode
  if (!isS3Configured) {
    return `${serverBaseUrl}/uploads/${filename}`;
  }

  try {
    const ext = path.extname(filename);
    const uniqueKey = `uploads/${crypto.randomUUID()}${ext}`;

    let body;
    let contentType = mimeType || 'application/octet-stream';

    if (typeof filePathOrBuffer === 'string') {
      body = fs.readFileSync(filePathOrBuffer);
      // Infer MIME type from extension if not provided
      if (!mimeType) {
        const extMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
        contentType = extMap[ext.toLowerCase()] || contentType;
      }
    } else {
      body = filePathOrBuffer;
    }

    await s3.send(new PutObjectCommand({
      Bucket: config.awsS3BucketName,
      Key: uniqueKey,
      Body: body,
      ContentType: contentType,
    }));

    return `https://${config.awsS3BucketName}.s3.${config.awsRegion}.amazonaws.com/${uniqueKey}`;
  } catch (err) {
    console.error('S3 upload failed, falling back to local:', err.message);
    return `${serverBaseUrl}/uploads/${filename}`;
  }
}

/**
 * Delete a file from S3 by its full URL.
 * @param {string} fileUrl - Full S3 URL
 */
export async function deleteFromS3(fileUrl) {
  if (!isS3Configured || !fileUrl?.includes('amazonaws.com')) return;
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1); // remove leading '/'
    await s3.send(new DeleteObjectCommand({
      Bucket: config.awsS3BucketName,
      Key: key,
    }));
  } catch (err) {
    console.error('S3 delete error:', err.message);
  }
}
