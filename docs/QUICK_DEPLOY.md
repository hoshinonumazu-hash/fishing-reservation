# 釣り船予約システム - クイックデプロイ

## 🚀 ワンコマンドデプロイ

```bash
curl -fsSL https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/quick-deploy.sh | sudo bash
```

## 📋 手動デプロイ（推奨）

### 1. スクリプトをダウンロード

```bash
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh
chmod +x full-deploy.sh
```

### 2. 環境変数を設定して実行

```bash
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="your-strong-password" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  DOMAIN_NAME="fishing.example.com" \
  EMAIL="your-email@example.com" \
  bash full-deploy.sh
```

### 3. GitHubデプロイキーを登録

スクリプトが停止したら：
1. GitHub > Settings > Deploy keys > Add deploy key
2. 表示された公開鍵を貼り付け
3. Allow write accessのチェックは外す
4. Add key をクリック
5. スクリプトに戻って Enter

## 📚 詳細ドキュメント

- [フルデプロイガイド](./FULL_DEPLOYMENT_GUIDE.md)
- [SSH セキュリティ設定](./scripts/setup-ssh-security.sh)

## ⚡ 最小構成（IPアドレスのみ）

```bash
sudo APP_USER="fishing" DB_PASSWORD="MyPass123!" bash full-deploy.sh
```

## 🌐 完全構成（ドメイン + SSL）

```bash
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="MyPass123!" \
  DOMAIN_NAME="fishing.example.com" \
  EMAIL="admin@example.com" \
  bash full-deploy.sh
```
