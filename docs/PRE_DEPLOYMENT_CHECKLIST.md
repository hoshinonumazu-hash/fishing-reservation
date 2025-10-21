# ✅ デプロイ前チェックリスト

デプロイ実行前に、このチェックリストを確認してください。

## 📋 ローカル環境チェック

### コード品質
- [ ] `npm run build` が成功する
- [ ] TypeScriptエラーがない
- [ ] `npx prisma validate` が成功する
- [ ] コンソールに重大なエラーがない

### Git管理
- [ ] すべての変更がコミットされている
- [ ] `.gitignore` が適切に設定されている
  - [ ] `node_modules` が除外されている
  - [ ] `.env` ファイルが除外されている
  - [ ] `.vercel` フォルダが除外されている
- [ ] GitHubリポジトリが作成されている
- [ ] `git push` が完了している

### ファイル確認
- [ ] `vercel.json` が存在する
- [ ] `.env.example` が存在する
- [ ] `README.md` が最新
- [ ] `package.json` の scripts に `vercel-build` がある

---

## 🗄️ データベースチェック

### データベース準備
- [ ] PostgreSQLデータベースが作成されている
  - [ ] Supabase / Neon / Railway のいずれかを使用
- [ ] データベースの接続文字列を取得済み
- [ ] **Supabaseの場合**: Connection pooling（port 6543）を使用
- [ ] データベースにアクセス制限がかかっていない（または適切に設定されている）

### ローカルでのDB接続確認
```bash
# 環境変数を設定して確認
DATABASE_URL="（本番のDATABASE_URL）" npx prisma db push --skip-generate
```
- [ ] エラーなく接続できる

---

## 🔐 環境変数チェック

### 必須環境変数の準備
- [ ] `DATABASE_URL` の値を確認済み
  - 形式: `postgresql://user:password@host:port/database`
  - Supabaseの場合: `:6543` ポートのPooler接続文字列
- [ ] `JWT_SECRET` を生成済み
  - [ ] 64文字以上のランダム文字列
  - [ ] 英数字のみ使用

### PowerShellで生成（Windows）
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Bashで生成（Mac/Linux）
```bash
openssl rand -base64 64 | tr -d '\n'
```

---

## 🚀 Vercelチェック

### アカウント準備
- [ ] Vercelアカウントが作成されている
- [ ] GitHubアカウントと連携されている

### プロジェクト設定（デプロイ前）
- [ ] プロジェクト名を決めている
  - 例: `fishing-reservation`
- [ ] Framework Preset: Next.js を選択予定
- [ ] Build Command: `npm run vercel-build`（自動設定）

### 環境変数設定（デプロイ時）
Vercelダッシュボードで設定する環境変数:

- [ ] `DATABASE_URL`
  - Environment: Production, Preview, Development にチェック
- [ ] `JWT_SECRET`
  - Environment: Production, Preview, Development にチェック
- [ ] `NEXT_PUBLIC_API_URL`（オプション）
  - Production: `https://your-project.vercel.app`

---

## 📦 デプロイ実行チェック

### 初回デプロイ
- [ ] Vercelでプロジェクトをインポート
- [ ] 環境変数を設定
- [ ] 「Deploy」をクリック
- [ ] ビルドログを確認
- [ ] ビルド成功を確認（5-10分程度）

### デプロイ後の確認
- [ ] デプロイURLにアクセスできる
- [ ] トップページが表示される
- [ ] `/boats` ページが表示される
- [ ] ログインページ（`/login`）が表示される

---

## 🔄 マイグレーション実行チェック

### Vercel CLIを使用する場合
```bash
# インストール
npm install -g vercel

# ログイン
vercel login

# プロジェクトにリンク
vercel link

# 環境変数取得
vercel env pull .env.production

# マイグレーション実行
npx prisma migrate deploy
```

- [ ] Vercel CLIがインストールされている
- [ ] `vercel login` が成功
- [ ] `vercel link` でプロジェクトが選択できた
- [ ] `vercel env pull` で `.env.production` が作成された
- [ ] `npx prisma migrate deploy` が成功

### 手動でマイグレーションする場合
- [ ] Supabase SQL Editorでマイグレーションを実行
- [ ] 各マイグレーションファイルを順番に実行
  1. `20251015025500_init/migration.sql`
  2. `20251015040048_add_email_to_user/migration.sql`
  3. `20251015040337_add_password_to_user/migration.sql`
  4. `20251020045442_add_boat_memo_recent_fish/migration.sql`
  5. `20251020091832_add_allow_multiple_bookings/migration.sql`

---

## ✅ 動作確認チェック

### API接続確認
```
https://your-project.vercel.app/api/health/db
```
- [ ] `{"status":"ok","database":"connected"}` が返ってくる

### 主要ページ確認
- [ ] トップページ（`/`）→ `/boats` にリダイレクト
- [ ] 船舶一覧（`/boats`）が表示される
- [ ] ユーザー登録（`/register`）が動作する
- [ ] ログイン（`/login`）が動作する
- [ ] オーナーダッシュボード（`/owner/dashboard`）にアクセスできる

### 機能テスト
- [ ] ユーザー登録ができる
- [ ] ログインができる
- [ ] 船舶一覧が表示される
- [ ] 検索フィルターが動作する
- [ ] 予約フォームが表示される

### オーナー機能テスト（ログイン必要）
- [ ] 船舶を登録できる
- [ ] プランテンプレートを作成できる
- [ ] カレンダーでプランを追加できる
- [ ] 予約管理カレンダーが表示される

---

## 🆘 トラブルシューティング準備

### よくあるエラーへの対処法を確認
- [ ] "Prisma Client could not locate" エラー
  - → `package.json` の `vercel-build` を確認
- [ ] "Database connection failed" エラー
  - → DATABASE_URL が正しいか確認
  - → Supabaseの場合は Pooler（port 6543）を使用
- [ ] "JWT malformed" エラー
  - → JWT_SECRET が設定されているか確認

### デバッグ用コマンドを確認
```bash
# Vercelログ確認
vercel logs

# 環境変数確認
vercel env ls

# 再デプロイ
vercel --prod
```

---

## 🎉 完了！

すべてのチェック項目が完了したら、デプロイ準備完了です！

**次のステップ:**
1. `docs/DEPLOYMENT_GUIDE.md` を開く
2. 手順に従ってデプロイを実行
3. 動作確認を行う

**問題が発生したら:**
- `docs/DEPLOYMENT_GUIDE.md` のトラブルシューティングを確認
- Vercelのログを確認
- データベースの接続設定を再確認

---

**デプロイ成功を祈っています！🚀**
