# 📌 TASK（進行管理：MVP到達まで）

最終更新: 2025-10-16

この文書は、さくらのクラウド「みらいサーバー」(Ubuntu 24.04 LTS)を使用した釣り船予約サイトのタスクリストです。SSH接続・Nginx・SFTPを前提とした実装計画を記載します。

---

## ✅ 達成済み（Done）

### サーバー環境構築
- **101**: Next.js App Router + TypeScript + Tailwind CSS 開発環境セットアップ完了
- **102**: みらいサーバー初期設定完了（Ubuntu 24.04 LTS基本設定・ファイアウォール）
- **103**: SSH接続・鍵認証設定完了（開発PC→みらいサーバー安全接続）
- **104**: Node.js環境構築完了（Node.js 20.19.5インストール・PM2設定）
- **105**: PostgreSQL設置・設定完了（fishing_site DB・fishing_user作成・接続確認済み）
- **106**: Nginx設置・基本設定完了（リバースプロキシ設定・ポート80→3000）

### データベース・基盤設計
- **201**: ディレクトリ/型設計完了（src/構成・types/index.ts・データモデル雛形）
- **202**: データベース設計（Prisma設定・マイグレーション適用）完了
  - User, Boat, FishingPlan, Booking モデル作成完了
  - email/password認証対応
- **203**: 認証基盤実装完了（JWT ベース・email/password認証）
  - `/api/auth/register` - ユーザー登録API
  - `/api/auth/login` - ログインAPI（JWT トークン発行）
  - `/login` - ログインページ
  - `/register` - ユーザー登録ページ
- **204**: 初期データ投入完了（Seedスクリプト実装・テストデータ作成）
  - ユーザー: 5名（顧客2、船オーナー2、管理者1）
  - 船舶: 3隻
  - プラン: 6件
  - 予約: 2件（サンプル）

### フロントエンド開発
- **301**: トップページUI完成（検索窓・プラン一覧表示・レスポンシブ対応）
- **302**: 検索フォーム実装完了（魚種・エリア・価格フィルタ機能）
- **303**: 検索API実装完了（GET /api/plans - クエリパラメータによるフィルタリング）
- **304**: 検索結果表示・フィルタ連動完了（リアルタイム検索・ローディング表示）
- **305**: プラン詳細ページ遷移実装（/reserve?planId=[id] - プラン詳細表示）

### API実装
- **API-Plans**: `/api/plans` GET/POST 実装完了（Prisma使用・DB連携）
- **API-Boats**: `/api/boats` GET 実装完了（Prisma使用・DB連携）
- **API-Bookings**: `/api/bookings` POST 実装完了（Prisma使用・DB永続化）
- **API-Health**: `/api/health/db` DB接続確認エンドポイント実装完了

### 予約機能
- **401**: 予約フォーム実装完了（/reserve - バリデーション・自動入力対応）
- **402**: 予約API実装完了（POST /api/bookings - バリデーション・エラーハンドリング）

---

## 🔄 現在進行中（In Progress）
なし

---

## 📋 次のタスク候補（優先度順）

### 最優先タスク
- **403**: 予約完了ページ実装（/reserve/complete - 予約完了メッセージ表示）← **次のステップ**

### 中優先タスク
- **306**: 船舶詳細ページ実装（/boats/[boatId] - 船情報・プラン一覧表示）
- **501**: プラン管理機能（船オーナー向けCRUD UI実装）
- **107**: SFTP設定・ファイル転送テスト（デプロイ準備）

---


## �️ 全体タスク分解（MVP到達まで・依存関係/日数見積もり付き）

### 1. サーバー環境構築・接続設定
| タスクID | タスク名 | 内容 | 目安日数 | 依存 | 備考 |
|---------|----------|------|---------|------|------|
| 101 | Next.js開発環境セットアップ | プロジェクト雛形・型・Linter設定 | 1 | - | ✅完了 |
| 102 | みらいサーバー初期設定 | Ubuntu 24.04 LTS基本設定・ファイアウォール | 1 | 101 | ✅完了 |
| 103 | SSH接続・鍵認証設定 | 開発PC→みらいサーバー安全接続 | 0.5 | 102 | ✅完了 |
| 104 | Node.js・npm環境構築 | Node.js 20+ インストール・環境変数設定 | 0.5 | 103 | ✅完了 |
| 105 | PostgreSQL設置・設定 | DB作成・ユーザー・権限設定 | 1 | 104 | ✅完了 |
| 106 | Nginx設置・基本設定 | リバースプロキシ・SSL準備 | 1 | 104 | ✅完了 |
| 107 | SFTP設定・ファイル転送テスト | 開発環境→サーバーファイル同期確認 | 0.5 | 103 | |

### 2. 開発基盤・型設計
| タスクID | タスク名 | 内容 | 目安日数 | 依存 | 備考 |
|---------|----------|------|---------|------|------|
| 201 | ディレクトリ/型設計 | src/構成・types/index.ts・データモデル雛形 | 1 | 101 | ✅完了 |
| 202 | データベース設計 | PostgreSQL schema・Prisma設定 | 1 | 105,201 | ✅完了 |
| 203 | 認証基盤（JWT/email） | JWT/Session/role設計・email/password認証 | 2 | 201 | ✅完了 |
| 204 | 初期データ投入 | seed スクリプト・テストデータ | 0.5 | 202 | ✅完了 |

### 3. フロントエンド開発・UI/UX
| タスクID | タスク名 | 内容 | 目安日数 | 依存 | 備考 |
|---------|----------|------|---------|------|------|
| 301 | トップページUI | 検索窓・人気/新着プラン・レスポンシブ | 2 | 201 | ✅完了 |
| 302 | 検索フォーム実装 | 魚種・日付・エリア・船名 | 1 | 301 | ✅完了 |
| 303 | 検索API(GET /api/plans) | クエリ: fishType, date, area, boatName | 2 | 204,302 | ✅完了 |
| 304 | 検索結果表示・フィルタ連動 | 検索結果カード・ローディング・空表示 | 1 | 303 | ✅完了 |
| 305 | プラン詳細ページ | /reserve?planId=[id]・プラン詳細表示 | 1 | 304 | ✅完了 |
| 306 | 船舶ページ/紹介 | /boats/[boatId]・船情報・プラン一覧 | 1 | 304 | |

### 4. 予約・ユーザー管理機能
| タスクID | タスク名 | 内容 | 目安日数 | 依存 | 備考 |
|---------|----------|------|---------|------|------|
| 401 | 予約フォーム | /reserve・予約フォーム実装・バリデーション | 1 | 305 | ✅完了（自動入力対応） |
| 402 | 予約API(POST /api/bookings) | DB登録・バリデーション | 1 | 401 | ✅完了（ダミーデータ） |
| 403 | 予約完了ページ | 完了メッセージ・予約内容表示 | 0.5 | 402 | |

### 5. 船オーナー向け管理機能
| タスクID | タスク名 | 内容 | 目安日数 | 依存 | 備考 |
|---------|----------|------|---------|------|------|
| 501 | プラン作成/編集/削除UI | /boats/my/plans・CRUD | 1.5 | 203,306 | |
| 502 | プラン管理API(POST/PUT/DELETE) | /api/plans | 1 | 501 | |
| 503 | 船情報編集UI | /boats/my/edit | 0.5 | 306 | |
| 504 | 船情報API(PUT /api/boats) | DB更新 | 0.5 | 503 | |

### 6. 本番デプロイ・運用開始
| タスクID | タスク名 | 内容 | 目安日数 | 依存 | 備考 |
|---------|----------|------|---------|------|------|
| 601 | 本番ビルド・最適化 | Next.js production build・静的ファイル生成 | 0.5 | 405,504 | |
| 602 | SFTP本番デプロイ | ビルドファイル→みらいサーバー転送 | 0.5 | 107,601 | |
| 603 | Nginx設定・SSL証明書 | Let's Encrypt・ドメイン設定・リバースプロキシ | 1 | 106,602 | |
| 604 | 本番動作確認・テスト | 全機能動作確認・負荷テスト | 1 | 603 | |
| 605 | 監視・ログ設定 | システム監視・エラーログ・バックアップ | 0.5 | 604 | |

---

## 📅 進行スケジュール例（2025年10月14日〜）

| 週 | 主なタスク | 目標 |
|----|-----------|------|
| 1週目 | 102〜107, 201〜204 | サーバー環境構築・基盤設計 |
| 2週目 | 301〜306, 401〜403 | フロントエンド開発・予約機能 |
| 3週目 | 404〜405, 501〜504 | ユーザー管理・オーナー機能 |
| 4週目 | 601〜605 | 本番デプロイ・運用開始 |

---

## �️ サーバー環境詳細設定（タスク102〜107）

### タスク102: みらいサーバー初期設定
```bash
# Ubuntu 24.04 LTS 基本設定
sudo apt update && sudo apt upgrade -y
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 基本ツールインストール
sudo apt install -y curl wget git vim htop
```

### タスク103: SSH接続・鍵認証設定
```bash
# 開発PC側で鍵ペア生成
ssh-keygen -t ed25519 -C "fishing-site@mirai-server"

# 公開鍵をサーバーに転送
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@mirai-server-ip

# SSH設定強化
sudo vi /etc/ssh/sshd_config
# PasswordAuthentication no
# PubkeyAuthentication yes
sudo systemctl restart ssh
```

### タスク104: Node.js環境構築
```bash
# Node.js 20.x インストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2（プロセス管理）インストール
sudo npm install -g pm2

# 環境変数設定
echo 'export NODE_ENV=production' >> ~/.bashrc
source ~/.bashrc
```

### タスク105: PostgreSQL設置・設定
```bash
# PostgreSQL インストール
sudo apt install -y postgresql postgresql-contrib

# データベース・ユーザー作成
sudo -u postgres psql
CREATE DATABASE fishing_site;
CREATE USER fishing_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE fishing_site TO fishing_user;
\q

# 外部接続設定（必要に応じて）
sudo vi /etc/postgresql/16/main/postgresql.conf
# listen_addresses = 'localhost'
sudo vi /etc/postgresql/16/main/pg_hba.conf
sudo systemctl restart postgresql
```

### タスク106: Nginx設置・基本設定
```bash
# Nginx インストール
sudo apt install -y nginx

# 基本設定ファイル作成
sudo vi /etc/nginx/sites-available/fishing-site
```
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
# サイト有効化
sudo ln -s /etc/nginx/sites-available/fishing-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### タスク107: SFTP設定・ファイル転送テスト
```bash
# 開発PC側でSFTP接続テスト
sftp user@mirai-server-ip
put test-file.txt
ls
quit

# 本番ディレクトリ作成
mkdir -p /home/user/fishing-site
chown user:user /home/user/fishing-site
```

---

## 🌐 インフラ・デプロイ情報

### サーバー基本情報
| 項目 | 値 |
|------|-----|
| **サーバー名** | みらいサーバー（さくらのクラウド） |
| **OS** | Ubuntu 24.04 LTS |
| **公開IPアドレス** | 133.242.22.159 |
| **初期ユーザー名** | ubuntu |
| **接続方法** | SSH |

### 🔐 初回SSH接続・セキュリティ設定手順

#### ステップ1: 初回SSH接続
```bash
# ローカルPCからサーバーへ初回接続
ssh ubuntu@133.242.22.159

# 初回接続時は "yes" で接続を承認
The authenticity of host '133.242.22.159 (133.242.22.159)' can't be established.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
```

#### ステップ2: ubuntuユーザーのパスワード変更（必須）
```bash
# サーバーにログイン後、パスワードを変更
passwd

# 現在のパスワードを入力 → 新しいパスワードを2回入力
Current password: [現在のパスワード]
New password: [新しい強力なパスワード]
Retype new password: [新しい強力なパスワード]
passwd: password updated successfully
```

#### ステップ3: システム更新（推奨）
```bash
# パッケージリストを更新
sudo apt update

# インストール済みパッケージを最新版に更新
sudo apt upgrade -y

# 再起動が必要な場合は実行
sudo reboot
```

#### ステップ4: SSH公開鍵認証設定（強く推奨）

**4-1. ローカルPCで鍵ペア生成**
```bash
# ローカルPC（開発環境）で実行
ssh-keygen -t ed25519 -C "fishing-site@mirai-server"

# 鍵の保存場所を確認（通常は ~/.ssh/id_ed25519）
# パスフレーズは設定することを推奨
```

**4-2. 公開鍵をサーバーにコピー**
```bash
# 方法1: ssh-copy-id を使用（推奨）
ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@133.242.22.159

# 方法2: 手動でコピー
cat ~/.ssh/id_ed25519.pub | ssh ubuntu@133.242.22.159 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**4-3. SSH設定強化（パスワード認証無効化）**
```bash
# サーバー側で SSH設定ファイルを編集
sudo vi /etc/ssh/sshd_config

# 以下の設定を変更/追加
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
Port 22  # 必要に応じて変更

# SSH サービスを再起動
sudo systemctl restart ssh
```

**4-4. 鍵認証での接続テスト**
```bash
# 新しいターミナルで鍵認証接続をテスト
ssh -i ~/.ssh/id_ed25519 ubuntu@133.242.22.159

# パスワード入力なしでログインできれば成功
```

#### ステップ5: 基本セキュリティ設定
```bash
# ファイアウォール有効化
sudo ufw enable

# SSH接続を許可
sudo ufw allow ssh

# HTTP/HTTPS ポートを許可（後でWebサーバー用）
sudo ufw allow 80
sudo ufw allow 443

# ファイアウォール状態確認
sudo ufw status
```

#### ステップ6: 基本ツールインストール
```bash
# 開発・運用で必要な基本ツール
sudo apt install -y curl wget git vim htop tree unzip

# Node.js インストール準備（後のタスクで使用）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

### 🔑 認証情報管理
- **SSH秘密鍵**: ローカルPC `~/.ssh/id_ed25519` に保存
- **サーバーアクセス**: 公開鍵認証のみ使用
- **パスワード**: 緊急時のコンソールアクセス用に強力なパスワードを設定

### ⚠️ セキュリティ注意事項
1. **パスワード認証は無効化** - 公開鍵認証のみ使用
2. **SSH鍵は適切に保管** - バックアップと紛失対策
3. **定期的なシステム更新** - `sudo apt update && sudo apt upgrade`
4. **ファイアウォール設定** - 必要最小限のポートのみ開放

---

## 🔗 依存関係・進行ルール
- サーバー環境構築（102〜107）を最優先で完了
- 開発とサーバー設定を並行進行可能
- SFTP転送は定期的にテスト実行
- SSL証明書は本番デプロイ時に設定

---
- API: `src/app/api/plans/route.ts`, `src/app/api/boats/route.ts`
- 型: `src/types/index.ts`
