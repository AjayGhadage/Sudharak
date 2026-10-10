module.exports = {
  apps: [
    {
      name: 'sudharak-api',
      script: 'index.js',
      cwd: '/home/ec2-user/sudharak/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/home/ec2-user/logs/api-error.log',
      out_file: '/home/ec2-user/logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name: 'sudharak-ml',
      script: 'uvicorn',
      args: 'app:app --host 0.0.0.0 --port 8000',
      cwd: '/home/ec2-user/sudharak/ml-services',
      interpreter: 'none',
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      error_file: '/home/ec2-user/logs/ml-error.log',
      out_file: '/home/ec2-user/logs/ml-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }
  ]
};
