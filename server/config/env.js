import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'sudharak_super_secret_jwt_key_2026_hackathon',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  groqApiKey: process.env.GROQ_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  // AWS
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME || 'sudharak-civic-issues',
  awsBucketName: process.env.AWS_S3_BUCKET_NAME || 'sudharak-civic-issues', // alias kept for compat
  // PayPal
  paypalMode: process.env.PAYPAL_MODE || 'sandbox',
  paypalClientId: process.env.PAYPAL_CLIENT_ID || 'AY_mock_paypal_client_id',
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || 'EG_mock_paypal_client_secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

