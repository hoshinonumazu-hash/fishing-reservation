# 🚀 釣り船予約システム - さくらサーバー（Ubuntu）デプロイ完全ガイド

最終更新: 2025-10-21  
対象環境: Ubuntu 24.04.2 LTS (64bit) - さくらのレンタルサーバー

## 📋 目次
1. [事前準備](#事前準備)
2. [サーバー初期設定](#サーバー初期設定)
3. [必要なソフトウェアのインストール](#必要なソフトウェアのインストール)
4. [PostgreSQLデータベース設定](#postgresqlデータベース設定)
5. [アプリケーションデプロイ](#アプリケーションデプロイ)
6. [Nginxリバースプロキシ設定](#nginxリバースプロキシ設定)
7. [SSL証明書設定（Let's Encrypt）](#ssl証明書設定)
8. [自動起動設定](#自動起動設定)
9. [動作確認](#動作確認)
10. [トラブルシューティング](#トラブルシューティング)

---

## 🔧 事前準備

### 必要な情報
- ✅ さくらサーバーのIPアドレス
- ✅ SSHログイン情報（ユーザー名・パスワード）
- ✅ ドメイン名（例: fishing.example.com）※オプション
- ✅ GitHubアカウント（コードのプッシュ用）

### ローカルでの事前作業

#### 1. Gitリポジトリにプッシュ
```powershell
# プロジェクトディレクトリで実行
cd C:\Users\tawaw\fishing

# Gitリポジトリ初期化（まだの場合）
git init
git add .
git commit -m "Initial commit: Ubuntu deployment ready"

# GitHubにプッシュ
git remote add origin https://github.com/your-username/fishing-reservation.git
git branch -M main
git push -u origin main
```

#### 2. 環境変数の準備
後でサーバーで使用する環境変数を確認:
```env
DATABASE_URL="postgresql://fishing_user:password@localhost:5432/fishing_db"
JWT_SECRET="（64文字以上のランダム文字列）"
```

---

## 🖥️ サーバー初期設定

### 1. SSHでサーバーに接続

#### Windows（PowerShell）から接続
```powershell
# SSH接続
ssh username@your-server-ip

# 初回接続時は "yes" で接続を承認
```

#### 接続できたら
```bash
# システム情報確認
uname -a
# Ubuntu 24.04.2 LTS と表示されることを確認

# ユーザー確認
whoami
```

---

### 2. システムアップデート

```bash
# パッケージリストを更新
sudo apt update

# インストール済みパッケージをアップグレード
sudo apt upgrade -y

# 不要なパッケージを削除
sudo apt autoremove -y
```

**所要時間: 5-10分**

---

### 3. 必要なツールのインストール

```bash
# 基本的な開発ツールをインストール
sudo apt install -y git curl wget build-essential
```

---

## 📦 必要なソフトウェアのインストール

### 1. Node.js 20.x のインストール

```bash
# NodeSourceリポジトリを追加
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.jsとnpmをインストール
sudo apt install -y nodejs

# バージョン確認
node -v  # v20.x.x と表示されることを確認
npm -v   # 10.x.x と表示されることを確認
```

---

### 2. PostgreSQL のインストール

```bash
# PostgreSQLをインストール
sudo apt install -y postgresql postgresql-contrib

# PostgreSQLサービスの起動と自動起動設定
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 動作確認
sudo systemctl status postgresql
# "active (running)" と表示されればOK
```

---

### 3. PM2（プロセスマネージャー）のインストール

```bash
# PM2をグローバルにインストール
sudo npm install -g pm2

# バージョン確認
pm2 -v
```

---

### 4. Nginx（Webサーバー）のインストール

```bash
# Nginxをインストール
sudo apt install -y nginx

# Nginxサービスの起動と自動起動設定
sudo systemctl start nginx
sudo systemctl enable nginx

# 動作確認
sudo systemctl status nginx
# "active (running)" と表示されればOK
```

**ブラウザで `http://your-server-ip` にアクセス**
→ Nginxのデフォルトページが表示されればOK

---

## 🗄️ PostgreSQLデータベース設定

### 1. データベースとユーザーの作成

```bash
# PostgreSQLに管理者としてログイン
sudo -u postgres psql

# 以下はPostgreSQLのプロンプト内で実行
```

```sql
-- データベース作成
CREATE DATABASE fishing_db;

-- ユーザー作成（パスワードは強力なものに変更）
CREATE USER fishing_user WITH PASSWORD 'your_strong_password_here';

-- 権限付与
GRANT ALL PRIVILEGES ON DATABASE fishing_db TO fishing_user;

-- PostgreSQL 15以降の場合、スキーマ権限も必要
\c fishing_db
GRANT ALL ON SCHEMA public TO fishing_user;

-- 接続確認
\l  -- データベース一覧表示
\q  -- 終了
```

---

### 2. PostgreSQL接続設定（外部接続許可は不要）

ローカルホストからのみ接続するため、デフォルト設定で問題ありません。

```bash
# 設定ファイルの確認（念のため）
sudo nano /etc/postgresql/16/main/pg_hba.conf
# "local all all peer" の行が存在することを確認
# Ctrl+X で終了（変更不要）
```

---

### 3. 接続テスト

```bash
# 作成したユーザーでログインテスト
psql -U fishing_user -d fishing_db -h localhost

# パスワードを入力してログインできればOK
# \q で終了
```

---

## 🚀 アプリケーションデプロイ

### 1. アプリケーション用ディレクトリ作成

```bash
# ホームディレクトリに移動
cd ~

# アプリケーション用ディレクトリ作成
mkdir -p ~/apps
cd ~/apps
```

---

### 2. GitHubからコードをクローン

```bash
# GitHubからクローン（URLは自分のリポジトリに変更）
git clone https://github.com/your-username/fishing-reservation.git fishing

# ディレクトリに移動
cd fishing

# ブランチ確認
git branch
# * main と表示されればOK
```

---

### 3. 環境変数の設定

```bash
# .env.production ファイルを作成
nano .env.production
```

以下の内容を記述（パスワードは実際のものに変更）:
```env
# データベース接続URL
DATABASE_URL="postgresql://fishing_user:your_strong_password_here@localhost:5432/fishing_db"

# JWT認証用シークレットキー（64文字以上のランダム文字列）
JWT_SECRET="your-super-secret-jwt-key-at-least-64-characters-long-random-string"

# Node.js環境
NODE_ENV="production"

# サーバーURL（ドメイン名またはIPアドレス）
NEXT_PUBLIC_API_URL="http://your-server-ip:3000"
```

**保存方法**: Ctrl+O → Enter → Ctrl+X

#### JWT_SECRETの生成方法（ローカルPowerShellで実行）
```powershell
# 64文字のランダム文字列を生成
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

### 4. 依存関係のインストール

```bash
# npmパッケージをインストール
npm install

# Prismaクライアント生成
npx prisma generate
```

**所要時間: 3-5分**

---

### 5. データベースマイグレーション

```bash
# マイグレーション実行（本番環境用）
npx prisma migrate deploy

# 成功メッセージが表示されることを確認
```

---

### 6. アプリケーションのビルド

```bash
# Next.jsアプリケーションをビルド
npm run build

# ビルドが成功することを確認
# "Compiled successfully" と表示されればOK
```

**所要時間: 2-3分**

---

### 7. PM2でアプリケーション起動

```bash
# PM2でNext.jsアプリを起動
pm2 start npm --name "fishing-app" -- start

# 起動確認
pm2 status
# "fishing-app" が "online" と表示されればOK

# ログ確認
pm2 logs fishing-app --lines 50
```

---

### 8. 動作確認（ローカルポート）

```bash
# サーバー内でHTTPリクエストテスト
curl http://localhost:3000

# HTMLが返ってくればOK
```

**または、ブラウザで `http://your-server-ip:3000` にアクセス**

---

## 🌐 Nginxリバースプロキシ設定

### 1. Nginx設定ファイルの作成

```bash
# 設定ファイルを作成
sudo nano /etc/nginx/sites-available/fishing
```

以下の内容を記述:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # ドメイン名に変更（IPアドレスでもOK）

    # アクセスログとエラーログ
    access_log /var/log/nginx/fishing-access.log;
    error_log /var/log/nginx/fishing-error.log;

    # Next.jsアプリケーションへのプロキシ
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # セキュリティヘッダー
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**保存**: Ctrl+O → Enter → Ctrl+X

---

### 2. 設定を有効化

```bash
# シンボリックリンクを作成
sudo ln -s /etc/nginx/sites-available/fishing /etc/nginx/sites-enabled/

# デフォルト設定を無効化（オプション）
sudo rm /etc/nginx/sites-enabled/default

# Nginx設定テスト
sudo nginx -t
# "syntax is ok" と "test is successful" が表示されればOK

# Nginxを再起動
sudo systemctl restart nginx
```

---

### 3. 動作確認

**ブラウザで `http://your-server-ip` または `http://your-domain.com` にアクセス**

→ 釣り船予約システムのトップページが表示されればOK！

---

## 🔒 SSL証明書設定（Let's Encrypt）

### 前提条件
- ドメイン名が必要（例: fishing.example.com）
- DNSがサーバーのIPアドレスを指していること

### 1. Certbotのインストール

```bash
# Certbotとnginxプラグインをインストール
sudo apt install -y certbot python3-certbot-nginx
```

---

### 2. SSL証明書の取得と設定

```bash
# Certbotを実行（ドメイン名を変更）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# メールアドレスを入力
# 利用規約に同意（A）
# ニュースレター受信（Y/N）

# 成功メッセージが表示されればOK
```

---

### 3. 自動更新設定

```bash
# 証明書の自動更新テスト
sudo certbot renew --dry-run

# 成功すれば、cronで自動更新が設定されています
```

**HTTPSで `https://your-domain.com` にアクセスして動作確認**

---

## 🔄 自動起動設定

### 1. PM2スタートアップ設定

```bash
# PM2の自動起動設定
pm2 startup systemd

# 表示されたコマンドをコピーして実行（例）
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username

# 現在のPM2プロセスを保存
pm2 save
```

---

### 2. サーバー再起動テスト

```bash
# サーバーを再起動
sudo reboot

# 再接続後、PM2の状態確認
pm2 status
# fishing-appが "online" になっていればOK
```

---

## ✅ 動作確認チェックリスト

### システム確認
- [ ] Node.js がインストールされている（`node -v`）
- [ ] PostgreSQL が稼働している（`sudo systemctl status postgresql`）
- [ ] Nginx が稼働している（`sudo systemctl status nginx`）
- [ ] PM2 でアプリが起動している（`pm2 status`）

### アプリケーション確認
- [ ] トップページが表示される（`/`）
- [ ] 船舶一覧が表示される（`/boats`）
- [ ] ログインページが表示される（`/login`）
- [ ] ユーザー登録が動作する（`/register`）
- [ ] データベース接続確認（`/api/health/db`）

### セキュリティ確認
- [ ] HTTPS でアクセスできる（SSL証明書設定後）
- [ ] 環境変数が正しく設定されている
- [ ] ファイアウォールが設定されている（オプション）

---

## 🔧 トラブルシューティング

### エラー: "npm: command not found"

**原因**: Node.jsが正しくインストールされていない

**解決策**:
```bash
# Node.jsを再インストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

### エラー: "Database connection failed"

**原因**: DATABASE_URLが間違っている、またはPostgreSQLが起動していない

**解決策**:
```bash
# PostgreSQLの状態確認
sudo systemctl status postgresql

# 再起動
sudo systemctl restart postgresql

# 接続テスト
psql -U fishing_user -d fishing_db -h localhost
```

---

### エラー: "Port 3000 already in use"

**原因**: 既に別のプロセスがポート3000を使用している

**解決策**:
```bash
# ポート3000を使用しているプロセスを確認
sudo lsof -i :3000

# PM2で古いプロセスを停止
pm2 delete fishing-app
pm2 start npm --name "fishing-app" -- start
```

---

### エラー: "502 Bad Gateway"

**原因**: Next.jsアプリが起動していない

**解決策**:
```bash
# PM2の状態確認
pm2 status

# ログ確認
pm2 logs fishing-app

# 再起動
pm2 restart fishing-app
```

---

### エラー: "Prisma Client not found"

**原因**: Prismaクライアントが生成されていない

**解決策**:
```bash
cd ~/apps/fishing
npx prisma generate
pm2 restart fishing-app
```

---

## 📞 便利なコマンド集

### PM2関連
```bash
# アプリケーション起動
pm2 start npm --name "fishing-app" -- start

# 再起動
pm2 restart fishing-app

# 停止
pm2 stop fishing-app

# 削除
pm2 delete fishing-app

# ログ確認
pm2 logs fishing-app

# 状態確認
pm2 status

# モニタリング
pm2 monit
```

### Nginx関連
```bash
# 設定テスト
sudo nginx -t

# 再起動
sudo systemctl restart nginx

# リロード（ダウンタイムなし）
sudo systemctl reload nginx

# ログ確認
sudo tail -f /var/log/nginx/fishing-access.log
sudo tail -f /var/log/nginx/fishing-error.log
```

### PostgreSQL関連
```bash
# 接続
psql -U fishing_user -d fishing_db -h localhost

# データベース一覧
sudo -u postgres psql -c "\l"

# 再起動
sudo systemctl restart postgresql
```

### Git関連（更新時）
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

## 🎉 デプロイ完了！

おめでとうございます！釣り船予約システムがさくらサーバー（Ubuntu）で稼働しています。

### 次のステップ
1. **初期データ投入**: `npx prisma db seed` でテストデータを追加
2. **ドメイン設定**: DNSを設定してドメイン名でアクセス
3. **SSL証明書**: Let's EncryptでHTTPS化
4. **バックアップ設定**: 定期的なデータベースバックアップ

---

**サポートが必要な場合は、このガイドのトラブルシューティングを参照してください！**
