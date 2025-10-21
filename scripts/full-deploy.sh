#!/bin/bash
################################################################################
# 釣り船予約システム - フルデプロイスクリプト
# さくらサーバー（Ubuntu 24.04）対応
#
# このスクリプトは以下を実行します:
# 1. システムの更新
# 2. 必要なソフトウェアのインストール（Node.js, PostgreSQL, Nginx, PM2）
# 3. PostgreSQLデータベースのセットアップ
# 4. リポジトリのクローン（デプロイキーを使用）
# 5. 環境変数の設定
# 6. Prisma migration & ビルド
# 7. PM2でアプリケーション起動
# 8. Nginxリバースプロキシ設定
# 9. SSL証明書の取得（Let's Encrypt）
#
# 使用方法:
#   chmod +x scripts/full-deploy.sh
#   sudo scripts/full-deploy.sh
################################################################################

set -e  # エラーが発生したら即座に終了

# カラー設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ出力関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# プログレスバー風の表示
show_progress() {
    echo ""
    echo "================================"
    echo "  $1"
    echo "================================"
    echo ""
}

################################################################################
# 設定変数（デプロイ前に編集してください）
################################################################################

# アプリケーション設定
APP_USER="${APP_USER:-fishing}"  # アプリケーション実行ユーザー
APP_DIR="/home/${APP_USER}/fishing-reservation"
DOMAIN_NAME="${DOMAIN_NAME:-}"  # 例: fishing.example.com（SSL用）
EMAIL="${EMAIL:-}"  # Let's Encrypt用メールアドレス

# データベース設定
DB_NAME="fishing_site"
DB_USER="fishing_user"
DB_PASSWORD="${DB_PASSWORD:-}"  # 環境変数で指定推奨

# GitHub設定
GITHUB_REPO="${GITHUB_REPO:-hoshinonumazu-hash/fishing-reservation}"
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"

# Node.js設定
NODE_VERSION="20"  # LTS版

################################################################################
# 前提条件チェック
################################################################################

show_progress "前提条件チェック"

# rootユーザーで実行されているか確認
if [ "$EUID" -ne 0 ]; then 
    log_error "このスクリプトはroot権限で実行する必要があります"
    log_info "実行方法: sudo bash scripts/full-deploy.sh"
    exit 1
fi

# Ubuntuバージョン確認
if ! grep -q "Ubuntu" /etc/os-release; then
    log_warning "このスクリプトはUbuntu向けです。他のディストリビューションでは動作しない可能性があります。"
fi

log_success "前提条件チェック完了"

################################################################################
# ステップ1: システムの更新
################################################################################

show_progress "ステップ1: システムの更新"

log_info "パッケージリストを更新しています..."
apt update

log_info "システムをアップグレードしています..."
apt upgrade -y

log_info "不要なパッケージを削除しています..."
apt autoremove -y

log_success "システム更新完了"

################################################################################
# ステップ2: 必要なソフトウェアのインストール
################################################################################

show_progress "ステップ2: 必要なソフトウェアのインストール"

log_info "基本ツールをインストールしています..."
apt install -y curl wget git build-essential software-properties-common ufw

# Node.js のインストール
log_info "Node.js ${NODE_VERSION}.x をインストールしています..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    log_success "Node.js $(node -v) インストール完了"
else
    log_info "Node.js は既にインストールされています: $(node -v)"
fi

# PostgreSQL のインストール
log_info "PostgreSQLをインストールしています..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
    log_success "PostgreSQL インストール完了"
else
    log_info "PostgreSQL は既にインストールされています"
fi

# Nginx のインストール
log_info "Nginxをインストールしています..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    log_success "Nginx インストール完了"
else
    log_info "Nginx は既にインストールされています"
fi

# PM2 のインストール
log_info "PM2をインストールしています..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log_success "PM2 インストール完了"
else
    log_info "PM2 は既にインストールされています"
fi

# Certbot のインストール（SSL証明書用）
if [ -n "$DOMAIN_NAME" ]; then
    log_info "Certbot (Let's Encrypt) をインストールしています..."
    if ! command -v certbot &> /dev/null; then
        apt install -y certbot python3-certbot-nginx
        log_success "Certbot インストール完了"
    else
        log_info "Certbot は既にインストールされています"
    fi
fi

log_success "ソフトウェアインストール完了"

################################################################################
# ステップ3: アプリケーションユーザーの作成
################################################################################

show_progress "ステップ3: アプリケーションユーザーの作成"

if id "$APP_USER" &>/dev/null; then
    log_info "ユーザー ${APP_USER} は既に存在します"
else
    log_info "ユーザー ${APP_USER} を作成しています..."
    useradd -m -s /bin/bash "$APP_USER"
    log_success "ユーザー ${APP_USER} 作成完了"
fi

################################################################################
# ステップ4: PostgreSQLデータベースのセットアップ
################################################################################

show_progress "ステップ4: PostgreSQLデータベースのセットアップ"

# データベースパスワードの生成（未設定の場合）
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-24)
    log_info "データベースパスワードを自動生成しました"
fi

log_info "データベースとユーザーを作成しています..."

sudo -u postgres psql <<EOF
-- ユーザーが存在する場合は削除して再作成
DROP USER IF EXISTS ${DB_USER};
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- データベースが存在する場合は削除して再作成
DROP DATABASE IF EXISTS ${DB_NAME};
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- 権限を付与
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

\c ${DB_NAME}
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${DB_USER};
EOF

log_success "PostgreSQLデータベースセットアップ完了"
log_info "データベース名: ${DB_NAME}"
log_info "データベースユーザー: ${DB_USER}"
log_warning "データベースパスワード: ${DB_PASSWORD} ※必ず安全に保管してください"

################################################################################
# ステップ5: SSH鍵の設定（デプロイキー用）
################################################################################

show_progress "ステップ5: SSH鍵の設定"

SSH_KEY_PATH="/home/${APP_USER}/.ssh/id_ed25519"

sudo -u "$APP_USER" bash <<EOF
mkdir -p /home/${APP_USER}/.ssh
chmod 700 /home/${APP_USER}/.ssh

if [ ! -f "${SSH_KEY_PATH}" ]; then
    echo "SSH鍵を生成しています..."
    ssh-keygen -t ed25519 -C "deploy@fishing-reservation" -f "${SSH_KEY_PATH}" -N ""
    echo "SSH公開鍵:"
    echo "=========================================="
    cat "${SSH_KEY_PATH}.pub"
    echo "=========================================="
else
    echo "SSH鍵は既に存在します"
    cat "${SSH_KEY_PATH}.pub"
fi
EOF

log_success "SSH鍵の準備完了"
log_warning "上記の公開鍵をGitHubリポジトリのDeploy Keysに追加してください"
log_info "GitHub > Settings > Deploy keys > Add deploy key"
echo ""
read -p "GitHubにデプロイキーを追加したら Enter を押してください..." REPLY

# GitHub の known_hosts に追加
sudo -u "$APP_USER" bash <<EOF
ssh-keyscan github.com >> /home/${APP_USER}/.ssh/known_hosts 2>/dev/null
EOF

################################################################################
# ステップ6: リポジトリのクローン
################################################################################

show_progress "ステップ6: リポジトリのクローン"

if [ -d "$APP_DIR" ]; then
    log_info "既存のディレクトリを削除しています..."
    rm -rf "$APP_DIR"
fi

log_info "GitHubリポジトリをクローンしています..."
sudo -u "$APP_USER" git clone "git@github.com:${GITHUB_REPO}.git" "$APP_DIR"

cd "$APP_DIR"
sudo -u "$APP_USER" git checkout "$GITHUB_BRANCH"

log_success "リポジトリクローン完了"

################################################################################
# ステップ7: 環境変数の設定
################################################################################

show_progress "ステップ7: 環境変数の設定"

# JWT_SECRETの生成
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# .envファイルの作成
log_info ".envファイルを作成しています..."

cat > "$APP_DIR/.env" <<EOF
# Database Configuration
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="${JWT_SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV=production
PORT=3000
EOF

chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

log_success ".envファイル作成完了"

################################################################################
# ステップ8: 依存関係のインストールとビルド
################################################################################

show_progress "ステップ8: 依存関係のインストールとビルド"

cd "$APP_DIR"

log_info "npm依存関係をインストールしています..."
sudo -u "$APP_USER" npm install

log_info "Prismaクライアントを生成しています..."
sudo -u "$APP_USER" npx prisma generate

log_info "データベースマイグレーションを実行しています..."
sudo -u "$APP_USER" npx prisma migrate deploy

log_info "アプリケーションをビルドしています..."
sudo -u "$APP_USER" npm run build

log_success "ビルド完了"

################################################################################
# ステップ9: PM2でアプリケーション起動
################################################################################

show_progress "ステップ9: PM2でアプリケーション起動"

cd "$APP_DIR"

log_info "PM2でアプリケーションを起動しています..."

sudo -u "$APP_USER" bash <<EOF
cd "$APP_DIR"

# 既存のプロセスを停止
pm2 delete fishing-app 2>/dev/null || true

# アプリケーションを起動
pm2 start npm --name "fishing-app" -- start

# 自動起動設定を保存
pm2 save

# PM2のスタートアップスクリプトを生成
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
EOF

# PM2のスタートアップを有効化（root権限で実行）
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER"

log_success "アプリケーション起動完了"

################################################################################
# ステップ10: ファイアウォール設定
################################################################################

show_progress "ステップ10: ファイアウォール設定"

log_info "UFWファイアウォールを設定しています..."

ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'

log_success "ファイアウォール設定完了"

################################################################################
# ステップ11: Nginxリバースプロキシ設定
################################################################################

show_progress "ステップ11: Nginxリバースプロキシ設定"

NGINX_CONF="/etc/nginx/sites-available/fishing-reservation"

log_info "Nginx設定ファイルを作成しています..."

if [ -n "$DOMAIN_NAME" ]; then
    # ドメイン名が設定されている場合
    cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN_NAME};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF
else
    # IPアドレスのみの場合
    cat > "$NGINX_CONF" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF
fi

# シンボリックリンクを作成
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/fishing-reservation

# デフォルト設定を削除
rm -f /etc/nginx/sites-enabled/default

# Nginx設定テスト
log_info "Nginx設定をテストしています..."
nginx -t

# Nginxを再起動
log_info "Nginxを再起動しています..."
systemctl restart nginx

log_success "Nginx設定完了"

################################################################################
# ステップ12: SSL証明書の取得（Let's Encrypt）
################################################################################

if [ -n "$DOMAIN_NAME" ] && [ -n "$EMAIL" ]; then
    show_progress "ステップ12: SSL証明書の取得"
    
    log_info "Let's Encrypt SSL証明書を取得しています..."
    
    certbot --nginx \
        -d "$DOMAIN_NAME" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --redirect
    
    log_success "SSL証明書取得完了"
    log_info "HTTPSアクセス: https://${DOMAIN_NAME}"
else
    log_warning "DOMAIN_NAMEまたはEMAILが設定されていないため、SSL設定をスキップしました"
    log_info "SSL証明書が必要な場合は、後で以下のコマンドを実行してください:"
    log_info "sudo certbot --nginx -d your-domain.com --email your-email@example.com"
fi

################################################################################
# 完了メッセージ
################################################################################

show_progress "デプロイ完了！"

log_success "すべてのステップが正常に完了しました"

echo ""
echo "=========================================="
echo "  📊 デプロイ情報"
echo "=========================================="
echo ""
echo "🖥️  アプリケーション:"
echo "   ユーザー: ${APP_USER}"
echo "   ディレクトリ: ${APP_DIR}"
echo "   プロセス名: fishing-app"
echo ""
echo "🗄️  データベース:"
echo "   名前: ${DB_NAME}"
echo "   ユーザー: ${DB_USER}"
echo "   パスワード: ${DB_PASSWORD}"
echo ""
echo "🌐 アクセスURL:"
if [ -n "$DOMAIN_NAME" ]; then
    echo "   HTTP:  http://${DOMAIN_NAME}"
    [ -n "$EMAIL" ] && echo "   HTTPS: https://${DOMAIN_NAME}"
else
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "   HTTP:  http://${SERVER_IP}"
fi
echo ""
echo "=========================================="
echo "  📝 便利なコマンド"
echo "=========================================="
echo ""
echo "# アプリケーションの状態確認"
echo "sudo -u ${APP_USER} pm2 status"
echo ""
echo "# ログの確認"
echo "sudo -u ${APP_USER} pm2 logs fishing-app"
echo ""
echo "# アプリケーションの再起動"
echo "sudo -u ${APP_USER} pm2 restart fishing-app"
echo ""
echo "# データベース接続"
echo "sudo -u postgres psql -d ${DB_NAME}"
echo ""
echo "# Nginxの状態確認"
echo "sudo systemctl status nginx"
echo ""
echo "=========================================="
echo "  ⚠️  セキュリティに関する重要な注意事項"
echo "=========================================="
echo ""
echo "1. データベースパスワードを安全に保管してください"
echo "2. SSH公開鍵認証を設定し、パスワードログインを無効化してください"
echo "3. 定期的にシステムを更新してください: sudo apt update && sudo apt upgrade"
echo "4. ファイアウォール設定を確認してください: sudo ufw status"
echo ""

# 認証情報をファイルに保存
CREDENTIALS_FILE="/root/fishing-credentials.txt"
cat > "$CREDENTIALS_FILE" <<EOF
釣り船予約システム - 認証情報
生成日時: $(date)

データベース:
  名前: ${DB_NAME}
  ユーザー: ${DB_USER}
  パスワード: ${DB_PASSWORD}

JWT Secret: ${JWT_SECRET}

アプリケーションユーザー: ${APP_USER}
アプリケーションディレクトリ: ${APP_DIR}
EOF

chmod 600 "$CREDENTIALS_FILE"
log_info "認証情報を ${CREDENTIALS_FILE} に保存しました"

log_success "デプロイ完了！ブラウザでアクセスして動作確認してください。"
