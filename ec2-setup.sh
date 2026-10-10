#!/bin/bash
# =============================================================
#  Sudharak EC2 Setup Script — AWS Free Tier (Amazon Linux 2023)
#  Run this once after SSH-ing into your EC2 t2.micro instance
#  Usage: bash ec2-setup.sh
# =============================================================

set -e  # Exit on any error

echo "============================================="
echo "  SUDHARAK — EC2 Free Tier Setup Script"
echo "============================================="

# ── 1. System update ──────────────────────────────────────────
echo "[1/9] Updating system packages..."
sudo dnf update -y

# ── 2. Install Node.js 20 LTS ─────────────────────────────────
echo "[2/9] Installing Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs git

# ── 3. Install Python 3.11 ────────────────────────────────────
echo "[3/9] Installing Python 3.11..."
sudo dnf install -y python3.11 python3.11-pip
sudo alternatives --set python3 /usr/bin/python3.11

# ── 4. Install Nginx ──────────────────────────────────────────
echo "[4/9] Installing Nginx..."
sudo dnf install -y nginx
sudo systemctl enable nginx

# ── 5. Install PM2 globally ───────────────────────────────────
echo "[5/9] Installing PM2..."
sudo npm install -g pm2

# ── 6. Create log directory ───────────────────────────────────
echo "[6/9] Creating log directories..."
mkdir -p /home/ec2-user/logs

# ── 7. Clone repository ───────────────────────────────────────
echo "[7/9] Cloning Sudharak repository..."
cd /home/ec2-user

# CHANGE THIS to your actual GitHub repo URL
REPO_URL="https://github.com/YOUR_USERNAME/sudharak.git"

if [ -d "sudharak" ]; then
  echo "  Repo exists, pulling latest..."
  cd sudharak && git pull
else
  git clone "$REPO_URL" sudharak
  cd sudharak
fi

# ── 8. Setup Node.js backend ─────────────────────────────────
echo "[8/9] Setting up Node.js backend..."
cd /home/ec2-user/sudharak/server
npm install --omit=dev
npx prisma generate
npx prisma migrate deploy

# ── 9. Setup Python ML service ───────────────────────────────
echo "[9/9] Setting up Python ML service..."
cd /home/ec2-user/sudharak/ml-services
pip3.11 install -r requirements.txt

# ── Start services with PM2 ───────────────────────────────────
echo "[STARTING] Starting services with PM2..."
cd /home/ec2-user/sudharak/server
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -1 | bash  # Auto-start on reboot

# ── Configure Nginx ───────────────────────────────────────────
echo "[NGINX] Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/conf.d/sudharak.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    # Node.js API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploaded images (local fallback)
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
    }

    # ML Service (internal only – not exposed externally)
    # Uncomment below to expose ML API publicly if needed
    # location /ml/ {
    #     proxy_pass http://localhost:8000/;
    # }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/api/health;
    }
}
NGINX

sudo nginx -t && sudo systemctl start nginx

echo ""
echo "============================================="
echo "  ✅ SUDHARAK SETUP COMPLETE!"
echo "============================================="
echo "  API running at:  http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api"
echo "  PM2 status:      pm2 status"
echo "  PM2 logs:        pm2 logs"
echo "  Nginx logs:      sudo tail -f /var/log/nginx/error.log"
echo ""
echo "  ⚠️  Don't forget to create /home/ec2-user/sudharak/server/.env"
echo "     with your production environment variables!"
echo "============================================="
