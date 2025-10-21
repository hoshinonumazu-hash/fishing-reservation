#!/bin/bash
# さくらサーバー（Ubuntu）自動デプロイスクリプト
# 使用方法: bash scripts/deploy-sakura.sh

echo "================================"
echo "  釣り船予約システム"
echo "  さくらサーバーデプロイ"
echo "================================"
echo ""

# カラー設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# エラーハンドリング
set -e
trap 'echo -e "${RED}❌ エラーが発生しました${NC}"' ERR

# プロジェクトディレクトリに移動
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)

echo -e "${YELLOW}[1/8] Gitから最新コードを取得しています...${NC}"
git pull origin main
echo -e "${GREEN}✓ 完了${NC}"
echo ""

echo -e "${YELLOW}[2/8] 依存関係をインストールしています...${NC}"
npm install
echo -e "${GREEN}✓ 完了${NC}"
echo ""

echo -e "${YELLOW}[3/8] Prismaクライアントを生成しています...${NC}"
npx prisma generate
echo -e "${GREEN}✓ 完了${NC}"
echo ""

echo -e "${YELLOW}[4/8] データベースマイグレーションを実行しています...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✓ 完了${NC}"
echo ""

echo -e "${YELLOW}[5/8] アプリケーションをビルドしています...${NC}"
npm run build
echo -e "${GREEN}✓ 完了${NC}"
echo ""

echo -e "${YELLOW}[6/8] PM2プロセスを再起動しています...${NC}"
if pm2 describe fishing-app > /dev/null 2>&1; then
    pm2 restart fishing-app
    echo -e "${GREEN}✓ fishing-appを再起動しました${NC}"
else
    pm2 start npm --name "fishing-app" -- start
    pm2 save
    echo -e "${GREEN}✓ fishing-appを起動しました${NC}"
fi
echo ""

echo -e "${YELLOW}[7/8] PM2プロセスの状態を確認しています...${NC}"
pm2 status
echo ""

echo -e "${YELLOW}[8/8] ログを確認しています...${NC}"
pm2 logs fishing-app --lines 20 --nostream
echo ""

echo "================================"
echo -e "${GREEN}  デプロイ完了！${NC}"
echo "================================"
echo ""
echo "📊 アプリケーション状態:"
echo "   - PM2 Status: $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'running')"
echo "   - プロセス名: fishing-app"
echo ""
echo "🔗 アクセスURL:"
echo "   - http://your-server-ip"
echo "   - https://your-domain.com (SSL設定済みの場合)"
echo ""
echo "📝 次のステップ:"
echo "   1. ブラウザでアクセスして動作確認"
echo "   2. ログ確認: pm2 logs fishing-app"
echo "   3. モニタリング: pm2 monit"
echo ""
