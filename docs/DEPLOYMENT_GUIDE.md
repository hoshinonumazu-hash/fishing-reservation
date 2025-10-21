# 🚀 釣り船予約システム - Vercel デプロイ完全ガイド

最終更新: 2025-10-21

## 📋 目次
1. [事前準備](#事前準備)
2. [データベースのセットアップ](#データベースのセットアップ)
3. [Vercelへのデプロイ](#vercelへのデプロイ)
4. [環境変数の設定](#環境変数の設定)
5. [データベースマイグレーション](#データベースマイグレーション)
6. [動作確認](#動作確認)
7. [トラブルシューティング](#トラブルシューティング)

---

## 🔧 事前準備

### 必要なアカウント
- ✅ GitHubアカウント
- ✅ Vercelアカウント（GitHubで連携可能）
- ✅ PostgreSQLデータベース（以下のいずれか）
  - **Supabase** (おすすめ・無料枠あり)
  - **Neon** (無料枠あり)
  - **Railway** (無料枠あり)

### ローカル環境の確認
```bash
# Node.jsバージョン確認（18以上推奨）
node -v

# 依存関係インストール
npm install

# ビルドテスト
npm run build
```

---

## 🗄️ データベースのセットアップ

### Option A: Supabase（おすすめ）

#### 1. Supabaseプロジェクト作成
1. [https://supabase.com](https://supabase.com) にアクセス
2. 「Start your project」をクリック
3. プロジェクト作成:
   - **Name**: `fishing-reservation`
   - **Database Password**: 強力なパスワードを設定（保存しておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
4. 作成完了まで1-2分待つ

#### 2. 接続文字列の取得
1. プロジェクトダッシュボード → 「Project Settings」
2. 「Database」タブをクリック
3. 「Connection string」セクションで「URI」を選択
4. 接続文字列をコピー（`postgresql://postgres:[YOUR-PASSWORD]@...`）
5. `[YOUR-PASSWORD]` を実際のパスワードに置き換える

#### 3. 接続プーリング設定（重要）
Vercelでは接続プーリングが必要です:
1. Supabaseの「Database Settings」
2. 「Connection pooling」セクション
3. 「Connection pooling」をONにする
4. **Pooling Mode**: `Transaction` を選択
5. 接続文字列（Pooler）をコピー（通常は `:6543` ポート）

**本番用のDATABASE_URL**:
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

---

### Option B: Neon

#### 1. Neonプロジェクト作成
1. [https://neon.tech](https://neon.tech) にアクセス
2. 「Sign up」→ GitHubで認証
3. 「Create a project」:
   - **Name**: `fishing-reservation`
   - **Region**: `Asia Pacific (Tokyo)`
   - 「Create project」をクリック

#### 2. 接続文字列の取得
1. プロジェクトダッシュボードで「Connection string」をコピー
2. 形式: `postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb`

---

### Option C: Railway

#### 1. Railwayプロジェクト作成
1. [https://railway.app](https://railway.app) にアクセス
2. 「Start a New Project」→「Provision PostgreSQL」
3. データベースが作成される

#### 2. 接続文字列の取得
1. PostgreSQLサービスをクリック
2. 「Connect」タブ
3. 「Postgres Connection URL」をコピー

---

## 🚀 Vercelへのデプロイ

### 方法1: GitHub連携（おすすめ）

#### 1. GitHubリポジトリにプッシュ
```bash
# Gitリポジトリ初期化（まだの場合）
git init
git add .
git commit -m "Initial commit: 釣り船予約システム"

# GitHubにプッシュ
git remote add origin https://github.com/あなたのユーザー名/fishing-reservation.git
git branch -M main
git push -u origin main
```

#### 2. Vercelでインポート
1. [https://vercel.com](https://vercel.com) にアクセス
2. 「Add New」→「Project」
3. GitHubリポジトリを選択: `fishing-reservation`
4. 「Import」をクリック

#### 3. プロジェクト設定
- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run vercel-build`（自動設定済み）
- **Output Directory**: `.next`（自動）

**まだ「Deploy」はクリックしないでください！**

---

## 🔐 環境変数の設定

### Vercelダッシュボードで環境変数を追加

1. Vercelプロジェクト → 「Settings」→「Environment Variables」

2. 以下の環境変数を追加:

#### DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://postgres.xxxxx:[PASSWORD]@...（先ほどコピーした接続文字列）
Environment: Production, Preview, Development
```

#### JWT_SECRET
強力なランダム文字列を生成して設定:

**生成方法（PowerShellで実行）:**
```powershell
# ランダムな64文字の文字列を生成
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

```
Key: JWT_SECRET
Value: （生成されたランダム文字列）
Environment: Production, Preview, Development
```

#### NEXT_PUBLIC_API_URL（オプション）
```
Key: NEXT_PUBLIC_API_URL
Value: https://あなたのプロジェクト名.vercel.app
Environment: Production
```

3. 「Save」をクリック

---

## 📦 デプロイ実行

### 初回デプロイ

1. Vercelダッシュボードで「Deployments」タブ
2. 「Deploy」ボタンをクリック
3. ビルドログを確認（5-10分程度）

### ビルドが成功したら

Prismaマイグレーションを実行する必要があります。

---

## 🔄 データベースマイグレーション

### 方法1: Vercel CLIを使用（推奨）

#### 1. Vercel CLIインストール
```bash
npm install -g vercel
```

#### 2. ログイン
```bash
vercel login
```

#### 3. プロジェクトにリンク
```bash
cd c:\Users\tawaw\fishing
vercel link
# プロジェクトを選択
```

#### 4. 環境変数を取得してマイグレーション実行
```bash
# 本番環境の環境変数を使用してマイグレーション
vercel env pull .env.production

# マイグレーション実行
npx prisma migrate deploy
```

### 方法2: Supabase SQL Editorで手動実行

Vercel CLIが使えない場合:

1. Supabaseダッシュボード → 「SQL Editor」
2. `prisma/migrations/` フォルダ内の各マイグレーションSQLファイルを順番に実行
3. 実行順序:
   ```
   20251015025500_init/migration.sql
   20251015040048_add_email_to_user/migration.sql
   20251015040337_add_password_to_user/migration.sql
   20251020045442_add_boat_memo_recent_fish/migration.sql
   20251020091832_add_allow_multiple_bookings/migration.sql
   ```

---

## ✅ 動作確認

### 1. デプロイURLにアクセス
```
https://あなたのプロジェクト名.vercel.app
```

### 2. 各ページの確認
- ✅ トップページ（`/`） → `/boats` にリダイレクト
- ✅ 船舶一覧（`/boats`）
- ✅ ログイン（`/login`）
- ✅ ユーザー登録（`/register`）
- ✅ オーナーダッシュボード（`/owner/dashboard`）※ログイン必要

### 3. データベース接続確認
```
https://あなたのプロジェクト名.vercel.app/api/health/db
```

期待される結果:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-21T..."
}
```

### 4. 初期データ投入（オプション）

Seedスクリプトを実行して、テストデータを投入:

```bash
# ローカルで本番DBに接続して実行
DATABASE_URL="（本番のDATABASE_URL）" npx prisma db seed
```

---

## 🔧 トラブルシューティング

### エラー: "Prisma Client could not locate the Query Engine"

**原因**: Prismaがビルド時に生成されていない

**解決策**:
1. `package.json` の `vercel-build` スクリプトを確認:
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy && next build"
   ```
2. Vercelで再デプロイ

---

### エラー: "Database connection failed"

**原因**: DATABASE_URLが正しくない、またはIPアクセス制限

**解決策**:
1. Vercelの環境変数で `DATABASE_URL` を確認
2. Supabaseの場合:
   - 接続プーリング（`:6543` ポート）を使用しているか確認
   - 接続文字列に `?pgbouncer=true` を追加（Supabase Pooler使用時）
3. Neonの場合:
   - IPアクセス制限を確認（デフォルトは全IP許可）

---

### エラー: "JWT malformed"

**原因**: JWT_SECRETが設定されていない

**解決策**:
1. Vercelの環境変数に `JWT_SECRET` を追加
2. 強力なランダム文字列を設定
3. 再デプロイ

---

### ビルドエラー: "Module not found"

**原因**: 依存関係が不足

**解決策**:
```bash
# ローカルで依存関係を再インストール
npm install

# package-lock.jsonも含めてコミット
git add package-lock.json
git commit -m "Fix: 依存関係を修正"
git push
```

---

## 🎉 デプロイ完了チェックリスト

- [ ] GitHubリポジトリ作成・プッシュ完了
- [ ] PostgreSQLデータベース作成完了
- [ ] Vercelプロジェクト作成完了
- [ ] 環境変数（DATABASE_URL, JWT_SECRET）設定完了
- [ ] 初回デプロイ成功
- [ ] データベースマイグレーション実行完了
- [ ] トップページアクセス確認
- [ ] データベース接続確認（`/api/health/db`）
- [ ] ユーザー登録・ログイン動作確認
- [ ] 船舶一覧表示確認
- [ ] オーナーダッシュボードアクセス確認

---

## 📞 サポート情報

### 公式ドキュメント
- Vercel: https://vercel.com/docs
- Prisma: https://www.prisma.io/docs
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs

### 便利なコマンド
```bash
# Vercelログ確認
vercel logs

# 環境変数確認
vercel env ls

# 再デプロイ
vercel --prod

# ローカルで本番環境をシミュレート
vercel dev
```

---

**デプロイ成功を祈っています！🚀**
