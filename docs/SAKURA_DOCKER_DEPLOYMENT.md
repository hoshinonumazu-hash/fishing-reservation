# さくらVPSへのDocker Composeデプロイ手順

## 前提条件
- さくらVPSにUbuntu 24.04がインストール済み
- SSH接続可能
- ドメインまたはIPアドレスが分かっている

## 1. さくらVPSにSSH接続

```bash
ssh fishing@133.242.22.159
```

## 2. Dockerのインストール（VPS上で実行）

```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# Docker公式リポジトリ追加
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Dockerインストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Dockerをsudoなしで使えるようにする
sudo usermod -aG docker fishing
# ※ログアウト→再ログインして反映

# 動作確認
docker --version
docker compose version
```

## 3. プロジェクトをVPSにクローン

```bash
cd ~
git clone https://github.com/hoshinonumazu-hash/fishing-reservation.git
cd fishing-reservation
```

## 4. 本番用docker-compose.ymlを作成

VPS上で、`docker-compose.prod.yml` を作成（ポート80で公開、環境変数調整）：

```bash
nano docker-compose.prod.yml
```

内容：
```yaml
services:
  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: fishing
      POSTGRES_PASSWORD: F1shApp92Zp4Lts
      POSTGRES_DB: fishing
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - app-network

  app:
    build: .
    restart: always
    depends_on:
      - db
    environment:
      DATABASE_URL: "postgresql://fishing:F1shApp92Zp4Lts@db:5432/fishing?schema=public"
      NODE_ENV: production
      NEXTAUTH_SECRET: "your-production-secret-key-change-this"
      NEXTAUTH_URL: "http://133.242.22.159:3000"
    ports:
      - "3000:3000"
    command: sh -c "npx prisma migrate deploy && npm start"
    networks:
      - app-network

volumes:
  db_data:

networks:
  app-network:
    driver: bridge
```

## 5. ビルド＆起動

```bash
# バックグラウンドでビルド＆起動
docker compose -f docker-compose.prod.yml up --build -d

# ログ確認
docker compose -f docker-compose.prod.yml logs -f app
```

## 6. ファイアウォール設定（UFW）

```bash
# UFW有効化（SSH許可を忘れずに）
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable

# 状態確認
sudo ufw status
```

## 7. ブラウザで確認

```
http://133.242.22.159:3000
```

## 8. Nginxリバースプロキシ＋SSL設定（オプション）

ドメインがある場合は、Nginxでポート80/443を使い、SSL証明書も設定できます。

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Nginx設定
sudo nano /etc/nginx/sites-available/fishing
```

内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

```bash
# 有効化
sudo ln -s /etc/nginx/sites-available/fishing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL設定（ドメインがある場合）
sudo certbot --nginx -d your-domain.com
```

## 9. 日常運用コマンド

```bash
# 状態確認
docker compose -f docker-compose.prod.yml ps

# ログ確認
docker compose -f docker-compose.prod.yml logs -f app

# 再起動
docker compose -f docker-compose.prod.yml restart

# 停止
docker compose -f docker-compose.prod.yml down

# 更新（git pull後）
git pull origin main
docker compose -f docker-compose.prod.yml up --build -d
```

## トラブルシューティング

### コンテナが起動しない
```bash
docker compose -f docker-compose.prod.yml logs app
```

### データベース接続エラー
- `docker-compose.prod.yml` の `DATABASE_URL` を確認
- DBコンテナが起動しているか確認：`docker compose -f docker-compose.prod.yml ps`

### ポートが使えない
```bash
sudo netstat -tuln | grep 3000
# 既に使われている場合は、他のプロセスを停止
```

---

この手順でさくらVPS上にDocker環境でデプロイできます。
