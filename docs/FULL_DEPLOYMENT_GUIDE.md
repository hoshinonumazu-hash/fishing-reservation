# 🚀 釣り船予約システム - フルデプロイガイド（完全版）

最終更新: 2025-10-21  
対象環境: さくらサーバー（Ubuntu 24.04 LTS）

## 📋 概要

このガイドでは、以下の作業を完全自動化します：

1. ✅ SSH鍵認証の設定とパスワードログイン無効化
2. ✅ システムのアップデートと必要なソフトウェアのインストール
3. ✅ PostgreSQLデータベースのセットアップ
4. ✅ GitHubからのプライベートリポジトリクローン（デプロイキー使用）
5. ✅ 環境変数の自動設定
6. ✅ Prisma migrateとアプリケーションビルド
7. ✅ PM2でのプロセス管理と自動起動設定
8. ✅ Nginxリバースプロキシの設定
9. ✅ Let's Encrypt SSL証明書の自動取得

---

## 🎯 デプロイ方法（3つのオプション）

### オプション1: 完全自動デプロイ（推奨）⚡

すべてを一気に実行します。最速で完了します。

```bash
# サーバーにSSH接続
ssh username@your-server-ip

# スクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh

# 実行権限を付与
chmod +x full-deploy.sh

# 環境変数を設定して実行
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="your-strong-password" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  DOMAIN_NAME="fishing.example.com" \
  EMAIL="your-email@example.com" \
  bash full-deploy.sh
```

**所要時間: 約15-20分**

---

### オプション2: 段階的デプロイ 🔧

SSH設定とアプリケーションデプロイを分けて実行します。

#### ステップ1: SSH セキュリティ強化

```bash
# サーバーにSSH接続（初回はパスワード）
ssh username@your-server-ip

# スクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/setup-ssh-security.sh

# 実行権限を付与
chmod +x setup-ssh-security.sh

# 実行（対話式）
sudo bash setup-ssh-security.sh
```

**このスクリプトは対話式で以下を行います：**
1. SSH公開鍵の登録
2. パスワード認証の無効化
3. SSHポート変更（オプション）
4. Fail2Banのインストール

#### ステップ2: アプリケーションデプロイ

SSHキーでログインできることを確認してから実行：

```bash
# 新しいSSH接続（公開鍵認証）
ssh -p 22 fishing@your-server-ip  # ポート変更した場合は適宜変更

# デプロイスクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh

# 実行
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="your-strong-password" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  DOMAIN_NAME="fishing.example.com" \
  EMAIL="your-email@example.com" \
  bash full-deploy.sh
```

---

### オプション3: 手動デプロイ 📝

完全にコントロールしたい場合や、トラブルシューティングが必要な場合。

詳細は [SAKURA_UBUNTU_DEPLOYMENT.md](./SAKURA_UBUNTU_DEPLOYMENT.md) を参照してください。

---

## 📦 事前準備

### 1. ローカルPC（Windows）での準備

#### SSH鍵の生成

```powershell
# PowerShellで実行
ssh-keygen -t ed25519 -C "your-email@example.com"

# 公開鍵を表示（後で使います）
cat ~/.ssh/id_ed25519.pub
```

#### GitHubの準備

1. **リポジトリをプライベートに設定**
   - GitHub > fishing-reservation > Settings > General
   - Danger Zone > Change visibility > Make private

2. **デプロイキーの準備（後でサーバー側で生成した鍵を登録）**
   - GitHub > Settings > Deploy keys > Add deploy key
   - スクリプト実行時に表示される公開鍵を登録

---

## 🔧 環境変数の説明

デプロイスクリプトで使用する環境変数：

| 変数名 | 必須 | デフォルト | 説明 |
|--------|------|-----------|------|
| `APP_USER` | ❌ | `fishing` | アプリケーション実行ユーザー |
| `DB_PASSWORD` | ⚠️ | 自動生成 | PostgreSQLパスワード（推奨：手動設定） |
| `GITHUB_REPO` | ❌ | `hoshinonumazu-hash/fishing-reservation` | GitHubリポジトリ |
| `GITHUB_BRANCH` | ❌ | `main` | デプロイするブランチ |
| `DOMAIN_NAME` | ❌ | なし | ドメイン名（SSL証明書用） |
| `EMAIL` | ❌ | なし | Let's Encrypt用メールアドレス |

### 環境変数の設定例

```bash
# 最小構成（IP アドレスのみ）
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="MySecurePass123!" \
  bash full-deploy.sh

# 完全構成（ドメイン + SSL）
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="MySecurePass123!" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  DOMAIN_NAME="fishing.example.com" \
  EMAIL="admin@example.com" \
  bash full-deploy.sh
```

---

## 🎬 デプロイ手順（完全自動の場合）

### ステップ1: サーバーに接続

```bash
# 初回はパスワードで接続
ssh username@your-server-ip

# Ubuntuバージョン確認
cat /etc/os-release
```

### ステップ2: スクリプトのダウンロード

```bash
# 作業ディレクトリに移動
cd ~

# スクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh

# または、Gitリポジトリ全体をクローン
git clone https://github.com/hoshinonumazu-hash/fishing-reservation.git
cd fishing-reservation
```

### ステップ3: デプロイスクリプトの実行

```bash
# 実行権限を付与
chmod +x full-deploy.sh

# 実行（環境変数を設定）
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="F1shApp92Zp4Lts" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  DOMAIN_NAME="" \
  EMAIL="" \
  bash full-deploy.sh
```

### ステップ4: GitHubデプロイキーの登録

スクリプトが途中で停止し、SSH公開鍵が表示されます：

```
========================================
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAbCdEfGhIjKlMnOpQrStUvWxYz deploy@fishing-reservation
========================================

上記の公開鍵をGitHubリポジトリのDeploy Keysに追加してください
GitHub > Settings > Deploy keys > Add deploy key

GitHubにデプロイキーを追加したら Enter を押してください...
```

**GitHubでの操作：**

1. GitHub にアクセス: https://github.com/hoshinonumazu-hash/fishing-reservation
2. Settings > Deploy keys > Add deploy key をクリック
3. Title: `Sakura Server Deploy Key`
4. Key: 表示された公開鍵を貼り付け
5. ✅ **Allow write access のチェックは外す**（読み取り専用）
6. Add key をクリック

スクリプトに戻って Enter を押すと、デプロイが続行されます。

### ステップ5: 完了確認

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

**認証情報の保存場所：**
- `/root/fishing-credentials.txt`

---

## 🔍 デプロイ後の確認

### 1. アプリケーションの状態確認

```bash
# PM2でプロセス確認
sudo -u fishing pm2 status

# ログ確認
sudo -u fishing pm2 logs fishing-app

# リアルタイムモニタリング
sudo -u fishing pm2 monit
```

### 2. データベース接続確認

```bash
# PostgreSQLに接続
sudo -u postgres psql -d fishing_site

# テーブル確認
\dt

# 終了
\q
```

### 3. Webアクセス確認

ブラウザで以下にアクセス：
- `http://your-server-ip`

正常に表示されれば成功です！

### 4. ヘルスチェック

```bash
# APIヘルスチェック
curl http://localhost:3000/api/health/db

# Nginxステータス
sudo systemctl status nginx

# PM2ステータス
sudo -u fishing pm2 status
```

---

## 🔐 セキュリティ設定

### SSH公開鍵認証の設定（デプロイ後）

デプロイ後、必ずSSHのセキュリティを強化してください：

```bash
# SSH セキュリティ強化スクリプトを実行
sudo bash scripts/setup-ssh-security.sh
```

または手動で設定：

```bash
# SSH設定ファイルを編集
sudo nano /etc/ssh/sshd_config

# 以下を変更または追加
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no

# SSH再起動
sudo systemctl restart sshd
```

### ファイアウォールの確認

```bash
# UFWステータス確認
sudo ufw status

# 開いているポート確認
sudo ss -tlnp
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

# 依存関係の更新
npm install

# Prismaクライアント再生成
npx prisma generate

# マイグレーション実行（必要な場合）
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
cd ~/fishing-reservation
bash scripts/deploy-sakura.sh
```

---

## 🛠️ トラブルシューティング

### アプリケーションが起動しない

```bash
# PM2ログを確認
sudo -u fishing pm2 logs fishing-app --lines 100

# プロセスを停止して再起動
sudo -u fishing pm2 delete fishing-app
sudo -u fishing pm2 start npm --name "fishing-app" -- start
```

### データベース接続エラー

```bash
# PostgreSQL状態確認
sudo systemctl status postgresql

# データベース存在確認
sudo -u postgres psql -l | grep fishing_site

# 接続テスト
sudo -u postgres psql -d fishing_site -c "SELECT 1;"
```

### Nginx エラー

```bash
# Nginx設定テスト
sudo nginx -t

# Nginxエラーログ
sudo tail -f /var/log/nginx/error.log

# Nginx再起動
sudo systemctl restart nginx
```

### ポート3000が使用中

```bash
# ポートを使用しているプロセスを確認
sudo lsof -i :3000

# プロセスを強制終了
sudo kill -9 <PID>

# PM2再起動
sudo -u fishing pm2 restart fishing-app
```

### SSL証明書エラー

```bash
# Certbot手動実行
sudo certbot --nginx -d your-domain.com --email your-email@example.com

# 証明書の更新テスト
sudo certbot renew --dry-run

# Nginx設定確認
sudo nginx -t
```

---

## 📊 運用・監視

### ログの確認

```bash
# アプリケーションログ
sudo -u fishing pm2 logs fishing-app

# Nginxアクセスログ
sudo tail -f /var/log/nginx/access.log

# Nginxエラーログ
sudo tail -f /var/log/nginx/error.log

# システムログ
sudo journalctl -u nginx -f
```

### パフォーマンスモニタリング

```bash
# PM2モニタリング
sudo -u fishing pm2 monit

# システムリソース確認
htop

# ディスク使用量
df -h
```

### バックアップ

```bash
# データベースバックアップ
sudo -u postgres pg_dump fishing_site > fishing_site_backup_$(date +%Y%m%d).sql

# アプリケーションファイルのバックアップ
sudo tar -czf fishing-app-backup-$(date +%Y%m%d).tar.gz /home/fishing/fishing-reservation
```

---

## 🔄 定期メンテナンス

### 週次タスク

```bash
# システムアップデート
sudo apt update && sudo apt upgrade -y

# PM2ログのローテーション
sudo -u fishing pm2 flush

# ディスク容量確認
df -h
```

### 月次タスク

```bash
# データベースバックアップ
sudo -u postgres pg_dump fishing_site > monthly_backup_$(date +%Y%m).sql

# 不要なDockerイメージ削除（使用している場合）
docker system prune -a

# SSL証明書の更新確認
sudo certbot renew
```

---

## 📚 参考リンク

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 💡 ベストプラクティス

### セキュリティ

- ✅ SSH公開鍵認証を使用
- ✅ パスワード認証を無効化
- ✅ ファイアウォールを有効化
- ✅ Fail2Banをインストール
- ✅ SSL/TLS証明書を使用
- ✅ データベースパスワードは強力なものを使用
- ✅ 定期的なセキュリティアップデート

### 運用

- ✅ PM2でプロセス管理
- ✅ 自動起動設定
- ✅ ログローテーション
- ✅ 定期的なバックアップ
- ✅ モニタリング設定
- ✅ エラー通知設定

### パフォーマンス

- ✅ Next.js本番ビルド
- ✅ Nginxリバースプロキシ
- ✅ gzip圧縮
- ✅ 静的ファイルキャッシング
- ✅ データベース接続プーリング

---

## 🎉 完了！

これで釣り船予約システムが本番環境で動作しています。

何か問題があれば、トラブルシューティングセクションを参照するか、ログを確認してください。

Happy Fishing! 🎣
