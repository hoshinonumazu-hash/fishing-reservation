# 🚀 デプロイ準備完了！

## ✅ 作成されたスクリプトとドキュメント

すべてのデプロイスクリプトとドキュメントがGitHubにプッシュされました。

### 📜 デプロイスクリプト

1. **`scripts/full-deploy.sh`** - 完全自動デプロイスクリプト
   - システムの更新とソフトウェアインストール
   - PostgreSQLのセットアップ
   - GitHubリポジトリのクローン（デプロイキー使用）
   - 環境変数の自動設定
   - Prisma migrate & ビルド
   - PM2での起動と自動起動設定
   - Nginxリバースプロキシ設定
   - Let's Encrypt SSL証明書取得

2. **`scripts/setup-ssh-security.sh`** - SSH セキュリティ強化スクリプト
   - SSH公開鍵認証の設定
   - パスワード認証の無効化
   - SSHポート変更（オプション）
   - Fail2Banのインストール

3. **`scripts/quick-deploy.sh`** - 対話式デプロイウィザード
   - 必要な情報を対話的に入力
   - full-deploy.sh を自動実行

### 📚 ドキュメント

1. **`docs/DEPLOY_EXECUTION_GUIDE.md`** - 実行マニュアル
   - 実際にサーバーで実行するコマンド
   - ステップバイステップの手順
   - トラブルシューティング

2. **`docs/FULL_DEPLOYMENT_GUIDE.md`** - 完全デプロイガイド
   - 詳細な説明と解説
   - 各ステップの詳細
   - ベストプラクティス

3. **`docs/QUICK_DEPLOY.md`** - クイックリファレンス
   - コマンド一覧
   - 簡易ガイド

4. **`README.md`** - 更新済み
   - デプロイ方法のセクション追加

---

## 🎯 次のステップ：実際のデプロイ

### オプション1: 完全自動デプロイ（最も簡単）⚡

```bash
# 1. サーバーにSSH接続
ssh username@133.242.22.159

# 2. 対話式デプロイを実行
curl -fsSL https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/quick-deploy.sh | sudo bash
```

### オプション2: 環境変数を指定して実行

```bash
# 1. サーバーにSSH接続
ssh username@133.242.22.159

# 2. スクリプトをダウンロード
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh
chmod +x full-deploy.sh

# 3. 実行（環境変数を設定）
sudo \
  APP_USER="fishing" \
  DB_PASSWORD="F1shApp92Zp4Lts" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  bash full-deploy.sh
```

### オプション3: SSH設定とアプリを分けてデプロイ

#### ステップ1: SSH セキュリティ強化

```bash
# サーバーにSSH接続
ssh username@133.242.22.159

# スクリプトをダウンロードして実行
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/setup-ssh-security.sh
chmod +x setup-ssh-security.sh
sudo bash setup-ssh-security.sh
```

**ローカルPCの公開鍵が必要です：**

```powershell
# Windows PowerShellで実行
cat ~/.ssh/id_ed25519.pub
```

#### ステップ2: アプリケーションデプロイ

```bash
# SSH鍵で接続
ssh username@133.242.22.159

# デプロイスクリプトをダウンロードして実行
wget https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/full-deploy.sh
chmod +x full-deploy.sh

sudo \
  APP_USER="fishing" \
  DB_PASSWORD="F1shApp92Zp4Lts" \
  GITHUB_REPO="hoshinonumazu-hash/fishing-reservation" \
  bash full-deploy.sh
```

---

## 🔑 重要：GitHubデプロイキーの登録

スクリプト実行中、SSH公開鍵が表示されたら：

1. GitHub にアクセス: https://github.com/hoshinonumazu-hash/fishing-reservation
2. Settings > Deploy keys > Add deploy key
3. Title: `Sakura Server Deploy Key`
4. Key: 表示された公開鍵を貼り付け
5. ✅ **Allow write access のチェックは外す**（読み取り専用）
6. Add key をクリック
7. ターミナルに戻って Enter

---

## 📊 デプロイ時間の目安

- **完全自動デプロイ**: 約15-20分
- **SSH設定のみ**: 約5分
- **アプリケーションデプロイのみ**: 約10-15分

---

## 🔍 デプロイ後の確認

### 1. アプリケーション状態確認

```bash
sudo -u fishing pm2 status
sudo -u fishing pm2 logs fishing-app
```

### 2. Webアクセス確認

ブラウザで以下にアクセス：
- `http://133.242.22.159`（またはあなたのサーバーIP）

### 3. ヘルスチェック

```bash
curl http://localhost:3000/api/health/db
```

---

## 📋 チェックリスト

デプロイ前：
- [ ] ローカルPCでSSH鍵を生成済み（`ssh-keygen -t ed25519`）
- [ ] すべてのコードをGitHubにプッシュ済み
- [ ] サーバーのIPアドレスを確認
- [ ] SSHログイン情報を確認

デプロイ中：
- [ ] スクリプトが正常に開始
- [ ] GitHubデプロイキーを登録
- [ ] エラーがないことを確認

デプロイ後：
- [ ] PM2プロセスが起動中
- [ ] Webブラウザでアクセス可能
- [ ] データベース接続が正常
- [ ] SSH公開鍵認証が有効
- [ ] パスワード認証が無効

---

## 🛠️ トラブルシューティング

問題が発生した場合：

1. **ログを確認**
   ```bash
   sudo -u fishing pm2 logs fishing-app --lines 100
   ```

2. **プロセスを再起動**
   ```bash
   sudo -u fishing pm2 restart fishing-app
   ```

3. **Nginxを確認**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **データベースを確認**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -d fishing_site
   ```

詳細は `docs/DEPLOY_EXECUTION_GUIDE.md` のトラブルシューティングセクションを参照。

---

## 📚 参考ドキュメント

- **実行手順**: [`docs/DEPLOY_EXECUTION_GUIDE.md`](./docs/DEPLOY_EXECUTION_GUIDE.md)
- **完全ガイド**: [`docs/FULL_DEPLOYMENT_GUIDE.md`](./docs/FULL_DEPLOYMENT_GUIDE.md)
- **クイックリファレンス**: [`docs/QUICK_DEPLOY.md`](./docs/QUICK_DEPLOY.md)

---

## 🎉 準備完了！

すべてのスクリプトとドキュメントが準備できました。
上記の手順に従って、サーバーでデプロイを実行してください。

**所要時間**: 約15-20分

Happy Fishing! 🎣
