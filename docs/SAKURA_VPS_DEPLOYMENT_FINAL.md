# さくらVPS Docker デプロイ実施記録（成功版）

## 概要
さくらVPS（シングルサーバコントロールパネル）上で、Next.js釣り予約システムをDocker Composeで本番起動し、外部からアクセス可能にするまでの実施記録。

---

## フェーズ1: サーバーアクセスと環境構築

### 1-1. Webコンソールでログイン
- さくらVPSの「シングルサーバコントロールパネル」にアクセス
- 「Webコンソール」を開く
- ユーザー名：`ubuntu`
- パスワード：案内メール記載の「OSのrootパスワード」（実際はubuntuユーザーのパスワード）
  - 例：`EOul6m7B24bi`

### 1-2. sudo権限の確認
```bash
sudo apt update
```
→ ubuntuユーザーには最初からsudo権限が付与されていた

### 1-3. Dockerのインストール
```bash
# システム更新
sudo apt update && sudo apt upgrade -y

# Docker公式インストールスクリプト
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# ubuntuユーザーをdockerグループに追加
sudo usermod -aG docker ubuntu

# 動作確認
docker --version
docker compose version
```

### 1-4. VSCodeでSSH接続（推奨）
- ローカルPCのVS Codeに「Remote - SSH」拡張機能をインストール
- `ssh ubuntu@133.242.22.159` で接続
- 以降の作業はVS CodeのターミナルでVPS上で実行

---

## フェーズ2: アプリケーションのデプロイとビルドエラー修正

### 2-1. リポジトリのクローン（VPS上で実行）
```bash
cd ~
git clone https://github.com/hoshinonumazu-hash/fishing-reservation.git
cd fishing-reservation
```

### 2-2. ビルドエラー修正（ローカルPC ⇔ VPS 往復作業）

#### 修正1: Dockerfileの追加
**問題**: `Dockerfile: no such file or directory`

**ローカルPC（VS Code PowerShell）で実行**:
```powershell
git add Dockerfile
git commit -m "Add Dockerfile for production (Next.js + Prisma, Node 20 Alpine)"
git push origin main
```

---

#### 修正2: ESLintインストール & isActive削除
**問題**: `ESLint must be installed` / `Type error: 'isActive' does not exist`

**ローカルPC（VS Code PowerShell）で実行**:
```powershell
npm install --save-dev eslint
git add package.json package-lock.json src/app/api/auth/register.ts
git commit -m "Fix: ビルドエラー（ESLintとTypeScript）を修正"
git push origin main
```

**修正内容**: `src/app/api/auth/register.ts` から `isActive: true,` 行を削除

---

#### 修正3: eslint-config-next & 構文エラー（カンマ）
**問題**: `Failed to load config "next/core-web-vitals"` / `Type error: ',' expected`

**ローカルPC（VS Code PowerShell）で実行**:
```powershell
npm install --save-dev eslint-config-next
git add package.json package-lock.json src/app/api/auth/register.ts
git commit -m "Fix: ESLint configとregister.tsの構文エラーを修正"
git push origin main
```

**修正内容**: `src/app/api/auth/register.ts` の `role: UserRole.CUSTOMER,` から末尾カンマを削除

---

#### 修正4: ESLint無効化 & 構文エラー（}抜け）
**問題**: `ESLint: Converting circular structure` / `Type error: ',' expected`（再発）

**ローカルPC（VS Code PowerShell）で実行**:
```powershell
git add next.config.js src/app/api/auth/register.ts
git commit -m "Fix: ビルド時ESLint無効化＆register.ts構文エラー修正"
git push origin main
```

**修正内容**:
- `next.config.js` に `eslint: { ignoreDuringBuilds: true }` を追加
- `src/app/api/auth/register.ts` の `data: { ... }` に閉じ括弧 `}` を追加

---

#### 修正5: useSearchParams Suspenseエラー
**問題**: `useSearchParams() should be wrapped in a suspense boundary`

**ローカルPC（VS Code PowerShell）で実行**:
```powershell
git add src/app/reserve/page.tsx
git commit -m "Fix: /reserve ページのビルドエラー（useSearchParams）を修正"
git push origin main
```

**修正内容**: `src/app/reserve/page.tsx` の先頭に `export const dynamic = 'force-dynamic';` を追加

---

#### 修正6: "use client" の順序エラー
**問題**: `The "use client" directive must be placed before other expressions`

**ローカルPC（VS Code PowerShell）で実行**:
```powershell
git add src/app/reserve/page.tsx
git commit -m "Fix: 'use client' の順序を修正"
git push origin main
```

**修正内容**: `src/app/reserve/page.tsx` の1行目と3行目を入れ替え
- `"use client";` を1行目に
- `export const dynamic = 'force-dynamic';` をその下に

---

### 2-3. 各修正後のVPS側作業
**VPS（VS Code Remote SSH）で実行**:
```bash
cd ~/fishing-reservation
git pull origin main
docker compose -f docker-compose.prod.yml up --build -d
```

---

## フェーズ3: ファイアウォール設定とアクセス確認

### 3-1. UFWファイアウォール有効化（VPS上で実行）
```bash
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
# y（半角）を入力

# 状態確認
sudo ufw status
```

### 3-2. ブラウザでアクセス確認
```
http://133.242.22.159:3000
```
→ アプリが正常に表示されることを確認

---

## 最終結果
- ✅ ビルド成功（`[+] Building ... FINISHED`）
- ✅ アプリ・DBコンテナ起動（`[+] Running 5/5`）
- ✅ ファイアウォール有効化
- ✅ 外部アクセス確認（http://133.242.22.159:3000）

---

## 日常運用コマンド

### コンテナ状態確認
```bash
docker compose -f docker-compose.prod.yml ps
```

### ログ確認
```bash
docker compose -f docker-compose.prod.yml logs -f app
```

### 再起動
```bash
docker compose -f docker-compose.prod.yml restart
```

### 停止
```bash
docker compose -f docker-compose.prod.yml down
```

### コード更新後の再デプロイ
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up --build -d
```

---

## トラブルシューティング

### ビルドエラーが出る場合
- ローカルPCで修正 → git push
- VPS側で git pull → docker compose up --build -d

### コンテナが起動しない場合
```bash
docker compose -f docker-compose.prod.yml logs app
```

### ポート3000が使えない場合
```bash
sudo netstat -tuln | grep 3000
```

---

## 重要な注意点
- パスワード管理：「OSのrootパスワード」として案内されたものは、実際は「ubuntuユーザーのパスワード」
- sudo権限：ubuntuユーザーには最初からsudo権限がある
- ビルドエラー：ローカルPC（git push）とVPS（git pull → docker compose up）を往復しながら一つずつ解決
- ESLint：本番ビルドではESLintを無効化（`next.config.js` の `ignoreDuringBuilds: true`）

---

このドキュメントに従えば、さくらVPS上でNext.js＋Docker Composeの本番環境を再現できます。
