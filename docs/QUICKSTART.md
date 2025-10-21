# ⚡ クイックスタート - 10分でデプロイ

本格的な手順は `DEPLOYMENT_GUIDE.md` を参照してください。
このファイルは最短手順のみを記載しています。

## 🚀 最短デプロイ手順

### ステップ1: データベース準備（3分）

**Supabaseを使う場合（おすすめ）:**

1. https://supabase.com → 「Start your project」
2. プロジェクト名: `fishing-reservation`、リージョン: Tokyo
3. パスワードを設定して「Create project」
4. Settings → Database → Connection string（URI）をコピー
5. **重要**: Connection pooling（Transaction mode, port 6543）の接続文字列を使用

**接続文字列の例:**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

---

### ステップ2: GitHubにプッシュ（2分）

```bash
# リポジトリ初期化
git init
git add .
git commit -m "Initial commit"

# GitHubリポジトリ作成後
git remote add origin https://github.com/your-username/fishing-reservation.git
git branch -M main
git push -u origin main
```

---

### ステップ3: Vercelデプロイ（3分）

1. https://vercel.com → 「Add New」→「Project」
2. GitHubリポジトリを選択
3. **環境変数を追加**:
   
   **DATABASE_URL**:
   ```
   （Supabaseの接続文字列をペースト）
   ```
   
   **JWT_SECRET**:
   ```powershell
   # PowerShellでランダム文字列生成
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
   ```
   生成された文字列をコピー&ペースト

4. 「Deploy」をクリック

---

### ステップ4: マイグレーション実行（2分）

**方法A: Vercel CLI（推奨）**
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma migrate deploy
```

**方法B: 手動（Supabase SQL Editor）**
1. Supabase → SQL Editor
2. `prisma/migrations/` の各SQLファイルを順番に実行

---

### ステップ5: 動作確認

1. Vercelが提供するURL（`https://your-project.vercel.app`）にアクセス
2. `/api/health/db` で接続確認
3. ユーザー登録・ログインをテスト

---

## ✅ 成功の確認

- [ ] トップページ表示OK
- [ ] `/api/health/db` が `{"status":"ok"}` を返す
- [ ] ユーザー登録できる
- [ ] ログインできる
- [ ] 船舶一覧が表示される

---

## 🆘 エラーが出たら

### "Database connection failed"
→ Supabaseの**Connection pooling（port 6543）**の接続文字列を使用していますか？

### "Prisma Client not found"
→ Vercelの環境変数を確認して再デプロイ

### "JWT malformed"
→ `JWT_SECRET` 環境変数が設定されているか確認

---

**詳細手順やトラブルシューティングは `DEPLOYMENT_GUIDE.md` を参照！**
