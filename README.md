# 🎣 釣り船予約システム

Next.js + TypeScript + Prisma + PostgreSQL で構築された、釣り船のオンライン予約管理システムです。

## 🌟 主な機能

### 顧客向け機能
- 🔍 釣り船・プラン検索（船名、エリア、魚種で絞り込み）
- 📅 オンライン予約
- 👤 マイページ（予約履歴管理）
- ✉️ 予約確認・キャンセル

### 船オーナー向け機能
- 📊 ダッシュボード（予約状況の可視化）
- 🚢 船舶管理（登録・編集・削除）
- 📝 プランテンプレート管理
- 📅 プラン追加（カレンダー形式で複数日選択可能）
- 📋 予約管理（カレンダー形式で予約状況を一覧表示）
- ✅ 予約承認・キャンセル

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS, カスタムCSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (Prisma ORM)
- **認証**: JWT (JSON Web Token)
- **デプロイ**: Vercel

## 🚀 デプロイ方法

### さくらサーバー（Ubuntu）でのデプロイ（推奨）

**対象**: Ubuntu 24.04.2 LTS (64bit) - さくらのレンタルサーバー

#### 🎯 自動デプロイ（最速・推奨）

すべてを自動で実行します：

```bash
# サーバーにSSH接続
ssh username@your-server-ip

# 対話式デプロイスクリプトを実行
curl -fsSL https://raw.githubusercontent.com/hoshinonumazu-hash/fishing-reservation/main/scripts/quick-deploy.sh | sudo bash
```

**所要時間**: 約15-20分

#### 📋 詳細なデプロイガイド

- **[フルデプロイガイド](./docs/FULL_DEPLOYMENT_GUIDE.md)** - 完全な手順と説明
- **[クイックデプロイ](./docs/QUICK_DEPLOY.md)** - コマンド一覧
- **[SSH セキュリティ設定](./scripts/setup-ssh-security.sh)** - SSH鍵認証とパスワード無効化
- **[Ubuntu デプロイ詳細](./docs/SAKURA_UBUNTU_DEPLOYMENT.md)** - 手動デプロイ手順
- **[クイックリファレンス](./docs/SAKURA_QUICKREF.md)** - 運用コマンド集

#### 🔧 主な機能

自動デプロイスクリプトは以下を実行します：

1. ✅ システムのアップデートと必要なソフトウェアのインストール
2. ✅ PostgreSQLデータベースのセットアップ
3. ✅ SSH鍵によるGitHubリポジトリクローン
4. ✅ 環境変数の自動設定
5. ✅ Prisma migrateとビルド
6. ✅ PM2でのプロセス管理と自動起動設定
7. ✅ Nginxリバースプロキシの設定
8. ✅ Let's Encrypt SSL証明書の取得（オプション）

**所要時間**: 約30-45分

#### 自動デプロイスクリプト
```bash
# サーバー上で実行
cd ~/apps/fishing
bash scripts/deploy-sakura.sh
```

---

### Vercel でのデプロイ（代替案）

クイックスタート（10分）や完全ガイドは以下を参照:
- [QUICKSTART.md](./docs/QUICKSTART.md) - 10分でデプロイ
- [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) - 完全ガイド

**主な手順:**
1. データベース準備（Supabase/Neon/Railway）
2. GitHubにプッシュ
3. Vercelでインポート
4. 環境変数設定（DATABASE_URL, JWT_SECRET）
5. デプロイ実行
6. マイグレーション実行

## 💻 ローカル開発

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定

#### PowerShellで自動セットアップ（おすすめ）
```powershell
.\scripts\setup-env.ps1
```

#### 手動セットアップ
`.env.local` ファイルを作成:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/fishing_db"
JWT_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Prismaセットアップ
```bash
# Prismaクライアント生成
npx prisma generate

# データベースマイグレーション
npx prisma migrate deploy

# 初期データ投入（オプション）
npx prisma db seed
```

### 4. 開発サーバー起動
```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## 📁 プロジェクト構造

```
fishing/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (customer)/        # 顧客向けページ
│   │   ├── owner/             # オーナー管理画面
│   │   │   ├── dashboard/    # ダッシュボード
│   │   │   ├── boats/         # 船舶管理
│   │   │   ├── bookings/      # 予約管理（カレンダー形式）
│   │   │   └── plan-templates/ # プランテンプレート
│   │   ├── add-plan/          # プラン追加（カレンダー形式）
│   │   ├── api/               # API Routes
│   │   ├── boats/             # 船舶一覧・詳細
│   │   ├── bookings/          # 予約履歴
│   │   ├── login/             # ログイン
│   │   ├── register/          # ユーザー登録
│   │   └── reserve/           # 予約フォーム
│   ├── components/            # 共通コンポーネント
│   ├── lib/                   # ユーティリティ
│   └── types/                 # TypeScript型定義
├── prisma/
│   ├── schema.prisma          # データベーススキーマ
│   ├── migrations/            # マイグレーションファイル
│   └── seed.ts                # 初期データ投入スクリプト
├── docs/
│   ├── DEPLOYMENT_GUIDE.md    # 完全デプロイガイド
│   ├── QUICKSTART.md          # クイックスタート
│   └── PROJECT_STATUS.md      # プロジェクト状況
└── scripts/
    └── setup-env.ps1          # 環境変数セットアップスクリプト
```

## 📊 データベーススキーマ

### 主要モデル
- **User**: ユーザー（顧客・オーナー）
- **Boat**: 船舶情報
- **FishingPlan**: 釣りプラン
- **PlanTemplate**: プランテンプレート
- **Booking**: 予約情報

詳細は `prisma/schema.prisma` を参照

## 🎨 デザインシステム

### カラーパレット
- **Primary**: `#1D3557` (ダークネイビー)
- **Secondary**: `#457B9D` (ミディアムブルー)
- **Accent**: `#A8DADC` (ライトシアン)
- **Background**: `#F4F6F9` (ライトグレー)
- **Error**: `#D32F2F` (レッド)

### 主要コンポーネントクラス
- `.info-card` - カード形式のコンテナ
- `.booking-calendar-card` - カレンダーカード
- `.calendar-grid` - 7列グリッドレイアウト
- `.quick-action-button` - アクションボタン

## 🧪 テスト

```bash
# ビルドテスト
npm run build

# Prismaバリデーション
npx prisma validate

# データベース接続確認
curl http://localhost:3000/api/health/db
```

## 📝 開発状況

- ✅ フロントエンドUI完成（顧客向け・オーナー向け）
- ✅ カレンダー形式の予約管理・プラン追加
- ✅ 認証システム（JWT）
- ✅ 予約CRUD機能
- ✅ 船舶管理機能
- ✅ プランテンプレート機能
- ✅ Vercelデプロイ準備完了

詳細: [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md)

## 🤝 貢献

プルリクエスト歓迎！

## 📄 ライセンス

MIT License

## 🆘 サポート

問題が発生した場合:
1. [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) のトラブルシューティングを確認
2. Issueを作成してください

---

**Built with ❤️ using Next.js**
