#!/bin/bash
################################################################################
# クイックデプロイスクリプト（対話式）
# さくらサーバー（Ubuntu）向け
#
# このスクリプトは対話式で必要な情報を収集し、full-deploy.sh を実行します
################################################################################

set -e

# カラー設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         🎣 釣り船予約システム クイックデプロイ 🎣         ║
║                                                           ║
║              さくらサーバー（Ubuntu）対応                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}このスクリプトは以下を自動的に実行します:${NC}"
echo "  ✅ システムのアップデート"
echo "  ✅ Node.js, PostgreSQL, Nginx, PM2 のインストール"
echo "  ✅ データベースのセットアップ"
echo "  ✅ GitHubからのリポジトリクローン"
echo "  ✅ アプリケーションのビルドと起動"
echo "  ✅ Nginxリバースプロキシの設定"
echo "  ✅ SSL証明書の取得（オプション）"
echo ""
echo -e "${RED}⚠️  注意: このスクリプトはroot権限で実行する必要があります${NC}"
echo ""

# rootユーザーチェック
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERROR] このスクリプトはroot権限で実行してください${NC}"
    echo "実行方法: sudo bash quick-deploy.sh"
    exit 1
fi

read -p "続行しますか？ [y/N]: " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "キャンセルしました"
    exit 0
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  設定情報の入力${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# アプリケーションユーザー
echo -e "${CYAN}[1/6] アプリケーション実行ユーザー名${NC}"
echo "      デフォルト: fishing"
read -p "      入力 (Enter でデフォルト): " APP_USER
APP_USER=${APP_USER:-fishing}
echo -e "      ✓ ユーザー名: ${GREEN}${APP_USER}${NC}"
echo ""

# データベースパスワード
echo -e "${CYAN}[2/6] データベースパスワード${NC}"
echo "      8文字以上の強力なパスワードを入力してください"
while true; do
    read -sp "      パスワード: " DB_PASSWORD
    echo ""
    if [ ${#DB_PASSWORD} -ge 8 ]; then
        read -sp "      パスワード（確認）: " DB_PASSWORD_CONFIRM
        echo ""
        if [ "$DB_PASSWORD" = "$DB_PASSWORD_CONFIRM" ]; then
            echo -e "      ✓ パスワード設定完了"
            break
        else
            echo -e "${RED}      パスワードが一致しません。もう一度入力してください${NC}"
        fi
    else
        echo -e "${RED}      パスワードは8文字以上である必要があります${NC}"
    fi
done
echo ""

# GitHubリポジトリ
echo -e "${CYAN}[3/6] GitHubリポジトリ${NC}"
echo "      形式: owner/repository"
echo "      デフォルト: hoshinonumazu-hash/fishing-reservation"
read -p "      入力 (Enter でデフォルト): " GITHUB_REPO
GITHUB_REPO=${GITHUB_REPO:-hoshinonumazu-hash/fishing-reservation}
echo -e "      ✓ リポジトリ: ${GREEN}${GITHUB_REPO}${NC}"
echo ""

# GitHubブランチ
echo -e "${CYAN}[4/6] GitHubブランチ${NC}"
echo "      デフォルト: main"
read -p "      入力 (Enter でデフォルト): " GITHUB_BRANCH
GITHUB_BRANCH=${GITHUB_BRANCH:-main}
echo -e "      ✓ ブランチ: ${GREEN}${GITHUB_BRANCH}${NC}"
echo ""

# ドメイン名（SSL用）
echo -e "${CYAN}[5/6] ドメイン名（オプション）${NC}"
echo "      SSL証明書（Let's Encrypt）を取得する場合は入力してください"
echo "      IPアドレスのみで運用する場合は Enter"
read -p "      ドメイン名: " DOMAIN_NAME
if [ -n "$DOMAIN_NAME" ]; then
    echo -e "      ✓ ドメイン名: ${GREEN}${DOMAIN_NAME}${NC}"
else
    echo -e "      ✓ IPアドレスのみで運用"
fi
echo ""

# メールアドレス（SSL用）
EMAIL=""
if [ -n "$DOMAIN_NAME" ]; then
    echo -e "${CYAN}[6/6] メールアドレス（Let's Encrypt用）${NC}"
    echo "      証明書の更新通知を受け取るメールアドレス"
    read -p "      メールアドレス: " EMAIL
    echo -e "      ✓ メールアドレス: ${GREEN}${EMAIL}${NC}"
    echo ""
fi

# 設定確認
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  設定内容の確認${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "  アプリケーションユーザー: ${APP_USER}"
echo "  データベースパスワード: $(echo "$DB_PASSWORD" | sed 's/./*/g')"
echo "  GitHubリポジトリ: ${GITHUB_REPO}"
echo "  GitHubブランチ: ${GITHUB_BRANCH}"
if [ -n "$DOMAIN_NAME" ]; then
    echo "  ドメイン名: ${DOMAIN_NAME}"
    echo "  メールアドレス: ${EMAIL}"
else
    echo "  ドメイン名: （設定なし - IPアドレスのみ）"
fi
echo ""

read -p "この設定でデプロイを開始しますか？ [y/N]: " FINAL_CONFIRM
if [[ ! "$FINAL_CONFIRM" =~ ^[Yy]$ ]]; then
    echo "キャンセルしました"
    exit 0
fi

# デプロイスクリプトのダウンロード
echo ""
echo -e "${YELLOW}デプロイスクリプトをダウンロードしています...${NC}"

SCRIPT_URL="https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/scripts/full-deploy.sh"
SCRIPT_PATH="/tmp/full-deploy.sh"

if curl -fsSL "$SCRIPT_URL" -o "$SCRIPT_PATH"; then
    echo -e "${GREEN}✓ ダウンロード完了${NC}"
    chmod +x "$SCRIPT_PATH"
else
    echo -e "${RED}✗ ダウンロード失敗${NC}"
    echo ""
    echo "代替方法:"
    echo "1. スクリプトを手動でダウンロード:"
    echo "   wget https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/scripts/full-deploy.sh"
    echo ""
    echo "2. 環境変数を設定して実行:"
    cat << EOF
   sudo \\
     APP_USER="${APP_USER}" \\
     DB_PASSWORD="${DB_PASSWORD}" \\
     GITHUB_REPO="${GITHUB_REPO}" \\
     GITHUB_BRANCH="${GITHUB_BRANCH}" \\
     DOMAIN_NAME="${DOMAIN_NAME}" \\
     EMAIL="${EMAIL}" \\
     bash full-deploy.sh
EOF
    exit 1
fi

# デプロイ実行
echo ""
echo -e "${YELLOW}デプロイを開始します...${NC}"
echo ""

export APP_USER
export DB_PASSWORD
export GITHUB_REPO
export GITHUB_BRANCH
export DOMAIN_NAME
export EMAIL

bash "$SCRIPT_PATH"

# 完了
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  クイックデプロイ完了！${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
