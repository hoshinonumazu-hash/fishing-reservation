# 🚀 デプロイ実行マニュアル - 実際の手順

このドキュメントでは、**実際にサーバーで実行するコマンド**を順番に記載しています。

---

## 📋 前提条件

### 必要な情報
- ✅ さくらサーバーのIPアドレス: `133.242.22.159`（例）
- ✅ SSHログイン情報（初回はパスワード）
- ✅ GitHubアカウント: `hoshinonumazu-hash`
- ✅ リポジトリ: `fishing-reservation`

### ローカルPC（Windows）での準備

#### 1. SSH鍵の確認・生成

```powershell
# PowerShellで実行

# 既存の鍵を確認
Get-ChildItem ~/.ssh

# 鍵がない場合は生成
ssh-keygen -t ed25519 -C "your-email@example.com"

# 公開鍵を表示（コピーしておく）
cat ~/.ssh/id_ed25519.pub
```

#### 2. GitHubリポジトリの準備

1. リポジトリをプライベートに設定（既に設定済みの場合はスキップ）
2. すべてのコードをコミット・プッシュ

```powershell
cd C:\Users\tawaw\fishing

git add .
git commit -m "Add deployment scripts"
git push origin main
```

---

## 🎯 デプロイ実行（3つの方法）

### 方法1: 完全自動デプロイ（最も簡単）⚡

```bash
# 1. サーバーにSSH接続
ssh username@133.242.22.159

# 2. 対話式デプロイスクリプトを実行
curl -fsSL https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/quick-deploy.sh > quick-deploy.sh

# 3. 実行
sudo bash quick-deploy.sh
```

スクリプトが対話的に以下を尋ねます：
- アプリケーションユーザー名（デフォルト: fishing）
- データベースパスワード（8文字以上）
- GitHubリポジトリ（デフォルト: hoshinonumazu-hash/fishing-reservation）
- ドメイン名（オプション、IPのみならEnter）
- メールアドレス（SSL証明書用、ドメインありの場合）

**途中でGitHubデプロイキーの登録が必要です**（後述）

---

### 方法2: 環境変数を指定して自動デプロイ（カスタマイズ可）

```bash
# 1. サーバーにSSH接続
ssh username@133.242.22.159

# 2. スクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh
chmod +x full-deploy.sh

# 3. 環境変数を設定して実行（IPアドレスのみ）
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="F1shApp92Zp4Lts" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  bash full-deploy.sh

# または、ドメイン+SSL証明書付き
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="F1shApp92Zp4Lts" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  DOMAIN_NAME="fishing.example.com" \
  EMAIL="admin@example.com" \
  bash full-deploy.sh
```

---

### 方法3: SSH設定とアプリケーションを分けてデプロイ（段階的）

#### ステップ1: SSHセキュリティ強化

```bash
# 1. サーバーにSSH接続（初回はパスワード）
ssh username@133.242.22.159

# 2. SSHセキュリティスクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/setup-ssh-security.sh
chmod +x setup-ssh-security.sh

# 3. 実行（対話式）
sudo bash setup-ssh-security.sh
```

このスクリプトは以下を対話的に行います：
1. ユーザーの選択
2. **ローカルPCのSSH公開鍵**を入力（下記の「公開鍵の準備」を参照）
3. SSH設定の変更（パスワード認証無効化、ポート変更など）
4. Fail2Banのインストール

**公開鍵の準備（ローカルPC）:**

```powershell
# Windows PowerShellで実行
cat ~/.ssh/id_ed25519.pub
```

表示された内容（`ssh-ed25519 AAAA...`）を**コピー**して、サーバー側のスクリプトにペーストします。

#### ステップ2: 新しいSSH接続で確認

```bash
# 別のターミナルで新しいSSH接続をテスト（パスワード不要）
ssh username@133.242.22.159

# 接続できたら元のターミナルに戻ってEnterを押す
```

#### ステップ3: アプリケーションデプロイ

```bash
# SSH鍵で接続
ssh username@133.242.22.159

# デプロイスクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh
chmod +x full-deploy.sh

# 実行
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="F1shApp92Zp4Lts" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  bash full-deploy.sh
```

---

## 🔑 GitHubデプロイキーの登録（重要）

すべての方法で、途中でスクリプトが停止し、以下のような公開鍵が表示されます：

```
========================================
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAbCdEfGhIjKlMnOpQrStUvWxYz deploy@fishing-reservation
========================================

上記の公開鍵をGitHubリポジトリのDeploy Keysに追加してください
GitHub > Settings > Deploy keys > Add deploy key

GitHubにデプロイキーを追加したら Enter を押してください...
```

### GitHub での操作手順

1. **GitHubにアクセス**
   - https://github.com/hoshinonumazu-hash/fishing-reservation

2. **Settings に移動**
   - リポジトリページの右上にある "Settings" タブをクリック

3. **Deploy keys を開く**
   - 左メニューの "Deploy keys" をクリック

4. **新しいデプロイキーを追加**
   - 右上の "Add deploy key" ボタンをクリック

5. **情報を入力**
   - **Title**: `Sakura Server Deploy Key`
   - **Key**: スクリプトに表示された公開鍵をコピー&ペースト
   - **Allow write access**: ❌ チェックを外す（読み取り専用）

6. **追加**
   - "Add key" ボタンをクリック

7. **サーバーに戻る**
   - ターミナルに戻って **Enter** を押す

デプロイが自動的に続行されます。

---

## ✅ デプロイ完了後の確認

### 1. デプロイ情報の表示

デプロイが完了すると、以下のような情報が表示されます：

```
==========================================
  📊 デプロイ情報
==========================================

🖥️  アプリケーション:
   ユーザー: fishing
   ディレクトリ: /home/fishing/fishing-reservation
   プロセス名: fishing-app

🗄️  データベース:
   名前: fishing_site
   ユーザー: fishing_user
   パスワード: F1shApp92Zp4Lts

🌐 アクセスURL:
   HTTP:  http://133.242.22.159
```

**重要**: データベースパスワードなどの認証情報は `/root/fishing-credentials.txt` に保存されます。

### 2. アプリケーションの状態確認

```bash
# PM2プロセス確認
sudo -u fishing pm2 status

# ログの確認
sudo -u fishing pm2 logs fishing-app --lines 50

# リアルタイムログ
sudo -u fishing pm2 logs fishing-app
```

### 3. Webアクセス確認

ブラウザで以下にアクセス：
- `http://133.242.22.159`（またはあなたのサーバーIP）
- ドメイン設定した場合: `https://your-domain.com`

正常に表示されれば成功です！

### 4. ヘルスチェックAPI

```bash
# データベース接続確認
curl http://localhost:3000/api/health/db

# 期待される出力
# {"status":"healthy","database":"connected"}
```

---

## 🔄 アップデート・再デプロイ

### コードの更新

```bash
# fishing ユーザーに切り替え
sudo su - fishing

# アプリケーションディレクトリに移動
cd ~/fishing-reservation

# 最新コードを取得
git pull origin main

# 依存関係の更新（package.jsonが変更された場合）
npm install

# Prismaクライアント再生成（schemaが変更された場合）
npx prisma generate

# マイグレーション実行（DB変更がある場合）
npx prisma migrate deploy

# ビルド
npm run build

# アプリケーション再起動
pm2 restart fishing-app

# ログ確認
pm2 logs fishing-app
```

### 簡単再デプロイ（スクリプト使用）

```bash
# fishing ユーザーで実行
sudo su - fishing
cd ~/fishing-reservation
bash scripts/deploy-sakura.sh
```

---

## 🛠️ よく使うコマンド

### PM2 関連

```bash
# プロセス一覧
sudo -u fishing pm2 list

# ログ確認
sudo -u fishing pm2 logs fishing-app

# リアルタイムモニタリング
sudo -u fishing pm2 monit

# 再起動
sudo -u fishing pm2 restart fishing-app

# 停止
sudo -u fishing pm2 stop fishing-app

# 起動
sudo -u fishing pm2 start fishing-app

# プロセス削除
sudo -u fishing pm2 delete fishing-app
```

### データベース関連

```bash
# PostgreSQLに接続
sudo -u postgres psql -d fishing_site

# テーブル一覧
\dt

# ユーザー一覧
SELECT * FROM "User";

# 予約一覧
SELECT * FROM "Booking";

# 終了
\q
```

### Nginx 関連

```bash
# 状態確認
sudo systemctl status nginx

# 設定テスト
sudo nginx -t

# 再起動
sudo systemctl restart nginx

# ログ確認
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### システム関連

```bash
# ディスク使用量
df -h

# メモリ使用量
free -h

# プロセス確認
htop

# ファイアウォール状態
sudo ufw status

# 開いているポート
sudo ss -tlnp
```

---

## 🐛 トラブルシューティング

### アプリケーションが起動しない

```bash
# ログを確認
sudo -u fishing pm2 logs fishing-app --lines 100

# プロセスを削除して再起動
sudo -u fishing pm2 delete fishing-app
cd /home/fishing/fishing-reservation
sudo -u fishing pm2 start npm --name "fishing-app" -- start
```

### データベース接続エラー

```bash
# PostgreSQL状態確認
sudo systemctl status postgresql

# データベース存在確認
sudo -u postgres psql -l | grep fishing_site

# .envファイル確認
sudo -u fishing cat /home/fishing/fishing-reservation/.env
```

### ポート3000が使用中

```bash
# ポートを使用しているプロセスを確認
sudo lsof -i :3000

# プロセスを強制終了（PIDは上記コマンドで確認）
sudo kill -9 <PID>

# PM2再起動
sudo -u fishing pm2 restart fishing-app
```

### Nginx エラー

```bash
# 設定テスト
sudo nginx -t

# エラーログ確認
sudo tail -f /var/log/nginx/error.log

# Nginx再起動
sudo systemctl restart nginx
```

---

## 🔒 セキュリティチェックリスト

デプロイ後、必ず以下を確認してください：

- [ ] SSH公開鍵認証が有効
- [ ] SSHパスワード認証が無効
- [ ] UFWファイアウォールが有効
- [ ] Fail2Banが動作中
- [ ] データベースパスワードが強力
- [ ] `.env`ファイルのパーミッションが600
- [ ] SSL証明書が有効（ドメイン設定した場合）
- [ ] 不要なポートが閉じられている

### 確認コマンド

```bash
# SSH設定確認
sudo sshd -t
grep -E "PasswordAuthentication|PubkeyAuthentication|PermitRootLogin" /etc/ssh/sshd_config.d/99-custom-security.conf

# ファイアウォール確認
sudo ufw status verbose

# Fail2Ban確認
sudo fail2ban-client status sshd

# SSL証明書確認（ドメイン設定した場合）
sudo certbot certificates

# 開いているポート確認
sudo ss -tlnp
```

---

## 📚 参考ドキュメント

- [フルデプロイガイド](./FULL_DEPLOYMENT_GUIDE.md) - 詳細な説明
- [クイックデプロイ](./QUICK_DEPLOY.md) - コマンド一覧
- [Ubuntu デプロイ](./SAKURA_UBUNTU_DEPLOYMENT.md) - 手動デプロイ手順
- [クイックリファレンス](./SAKURA_QUICKREF.md) - 運用コマンド集

---

## 💡 Tips

### 複数環境でのデプロイ

開発環境と本番環境を分ける場合：

```bash
# ステージング環境
sudo \
  APP_USER="fishing-staging" \
  DB_PASSWORD="staging-password" \
  GITHUB_BRANCH="develop" \
  bash full-deploy.sh

# 本番環境
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="production-password" \
  GITHUB_BRANCH="main" \
  DOMAIN_NAME="fishing.example.com" \
  EMAIL="admin@example.com" \
  bash full-deploy.sh
```

### バックアップの取得

```bash
# データベースバックアップ
sudo -u postgres pg_dump fishing_site > fishing_backup_$(date +%Y%m%d).sql

# アプリケーションファイルのバックアップ
sudo tar -czf fishing-app-backup-$(date +%Y%m%d).tar.gz /home/fishing/fishing-reservation
```

### ログのローテーション

```bash
# PM2ログをクリア
sudo -u fishing pm2 flush

# 古いログファイルを削除（30日以上前）
find /home/fishing/.pm2/logs -name "*.log" -mtime +30 -delete
```

---

これで本番環境へのデプロイが完了します。問題が発生した場合は、トラブルシューティングセクションを参照してください。

Happy Fishing! 🎣
