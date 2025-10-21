# ⚡ さくらサーバーデプロイ - クイックリファレンス

## 🚀 最短デプロイ手順（コマンド一覧）

### ステップ1: SSH接続とシステム更新
```bash
ssh username@your-server-ip
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential
```

### ステップ2: Node.js 20インストール
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # v20.x.x 確認
```

### ステップ3: PostgreSQLインストール
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### ステップ4: データベース作成
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE fishing_db;
CREATE USER fishing_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fishing_db TO fishing_user;
\c fishing_db
GRANT ALL ON SCHEMA public TO fishing_user;
\q
```

### ステップ5: PM2とNginxインストール
```bash
sudo npm install -g pm2
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### ステップ6: アプリケーションデプロイ
```bash
cd ~
mkdir -p apps && cd apps
git clone https://github.com/your-username/fishing-reservation.git fishing
cd fishing
```

環境変数作成:
```bash
nano .env.production
```
```env
DATABASE_URL="postgresql://fishing_user:your_password@localhost:5432/fishing_db"
JWT_SECRET="your-64-character-random-string-here"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="http://your-server-ip:3000"
```

ビルドと起動:
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 start npm --name "fishing-app" -- start
pm2 save
pm2 startup systemd
```

### ステップ7: Nginx設定
```bash
sudo nano /etc/nginx/sites-available/fishing
```
```nginx
server {
    listen 80;
    server_name your-domain.com;
    access_log /var/log/nginx/fishing-access.log;
    error_log /var/log/nginx/fishing-error.log;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

有効化:
```bash
sudo ln -s /etc/nginx/sites-available/fishing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### ステップ8: SSL設定（オプション）
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔄 アップデート手順

```bash
cd ~/apps/fishing
git pull origin main
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart fishing-app
```

---

## 🛠️ よく使うコマンド

### PM2操作
```bash
pm2 status                    # 状態確認
pm2 logs fishing-app          # ログ表示
pm2 restart fishing-app       # 再起動
pm2 stop fishing-app          # 停止
pm2 delete fishing-app        # 削除
pm2 monit                     # リアルタイム監視
```

### Nginx操作
```bash
sudo nginx -t                 # 設定テスト
sudo systemctl restart nginx  # 再起動
sudo systemctl reload nginx   # リロード
sudo tail -f /var/log/nginx/fishing-error.log  # エラーログ
```

### データベース操作
```bash
psql -U fishing_user -d fishing_db -h localhost  # 接続
sudo systemctl restart postgresql                # 再起動
```

### サービス状態確認
```bash
sudo systemctl status postgresql  # PostgreSQL
sudo systemctl status nginx       # Nginx
pm2 status                        # Node.jsアプリ
```

---

## 🆘 トラブルシューティングクイックガイド

| 症状 | 原因 | 解決策 |
|------|------|--------|
| 502 Bad Gateway | アプリが起動していない | `pm2 restart fishing-app` |
| Database connection failed | DB接続エラー | DATABASE_URLを確認、PostgreSQL再起動 |
| Port 3000 already in use | ポート衝突 | `pm2 delete fishing-app` してから再起動 |
| npm: command not found | Node.js未インストール | Node.jsを再インストール |
| Permission denied | 権限不足 | `sudo` をつけて実行 |

---

## 📊 チェックリスト

デプロイ完了確認:
- [ ] `node -v` でNode.js 20が表示される
- [ ] `sudo systemctl status postgresql` でactive
- [ ] `sudo systemctl status nginx` でactive
- [ ] `pm2 status` でfishing-appがonline
- [ ] `http://your-server-ip` でサイトが表示される
- [ ] `/api/health/db` でDB接続確認
- [ ] ユーザー登録・ログインが動作する

---

**詳細は `SAKURA_UBUNTU_DEPLOYMENT.md` を参照してください。**
