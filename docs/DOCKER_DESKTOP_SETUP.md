# WindowsでDocker Desktopを使ったNext.js本番環境構築手順

## 1. Docker Desktopインストール
- 公式サイトから「Windows用Docker Desktop - x86_64」をダウンロード
- インストーラーを実行し、基本は「次へ」「同意する」で進める
- WSL2有効化推奨（自動でセットアップされる場合あり）
- インストール完了後は「Close and log out」で一度Windowsからログアウト
- 再ログイン後、PowerShellで `docker --version` で動作確認

## 2. プロジェクト準備
- プロジェクト直下に `Dockerfile` と `docker-compose.yml` を作成
- `.env` の `DATABASE_URL` を `docker-compose.yml` のPostgreSQLサービスに合わせて修正
  - 例: `postgresql://fishing:F1shApp92Zp4Lts@db:5432/fishing?schema=public`

## 3. 初回起動（ビルド＋起動）
PowerShellでプロジェクトルートへ移動後、以下を実行：
```powershell
cd C:\Users\tawaw\fishing
docker compose up --build
```
- 初回は依存関係インストール、Prismaマイグレーション、Next.jsビルドで数分かかります
- `Ready in 790ms` と表示されたら成功
- ブラウザで http://localhost:3000 を開いて確認
- 停止: `Ctrl+C`

## 4. 日常的な使い方

### バックグラウンド起動（推奨）
```powershell
docker compose up -d
```
- ターミナルを占有せず、バックグラウンドで動き続けます
- ブラウザで http://localhost:3000 を開いて作業

### 状態確認
```powershell
docker compose ps
```
- コンテナの起動状態を確認

### ログ確認
```powershell
docker compose logs -f app
```
- アプリのログをリアルタイムで表示（`Ctrl+C`で終了）

### 停止
```powershell
docker compose down
```
- すべてのコンテナを停止・削除（データベースのデータは保持されます）

### 再起動
```powershell
docker compose restart
```
- コードを変更した場合は再ビルドが必要：
```powershell
docker compose up --build -d
```

### 完全クリーンアップ（データ削除）
```powershell
docker compose down -v
```
- データベースのデータも含めてすべて削除

## 5. 注意点
- Windows 10/11（64bit）推奨
- 管理者権限でインストール
- 企業PCの場合はセキュリティポリシーに注意
- WSL2/Hyper-Vの有効化が必要な場合あり

## 6. トラブルシューティング
- `docker` コマンドが認識されない場合は再起動
- ビルドエラーが出た場合は `docker compose logs app` でログ確認
- ポート3000が既に使われている場合は、他のアプリを停止するか、docker-compose.ymlのポート番号を変更

---
この手順を参考にすれば、Windows上でDockerを使ったNext.js本番環境構築が再現できます。
