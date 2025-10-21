# 環境変数設定ヘルパースクリプト
# PowerShellで実行: .\scripts\setup-env.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  釣り船予約システム" -ForegroundColor Cyan
Write-Host "  環境変数セットアップ" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# JWT_SECRET生成
Write-Host "[1/3] JWT_SECRETを生成しています..." -ForegroundColor Yellow
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "✓ 生成完了`n" -ForegroundColor Green

# DATABASE_URL入力
Write-Host "[2/3] DATABASE_URLを入力してください" -ForegroundColor Yellow
Write-Host "（SupabaseまたはNeonの接続文字列）" -ForegroundColor Gray
$databaseUrl = Read-Host "DATABASE_URL"
Write-Host ""

# .env.localファイル作成
Write-Host "[3/3] .env.localファイルを作成しています..." -ForegroundColor Yellow

$envContent = @"
# 自動生成された環境変数ファイル
# 生成日時: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# データベース接続URL
DATABASE_URL="$databaseUrl"

# JWT認証用シークレットキー（自動生成）
JWT_SECRET="$jwtSecret"

# Next.js環境変数
NEXT_PUBLIC_API_URL="http://localhost:3000"
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8
Write-Host "✓ .env.local ファイルを作成しました`n" -ForegroundColor Green

# 結果表示
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  セットアップ完了！" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "作成されたファイル: .env.local`n" -ForegroundColor White

Write-Host "【次のステップ】" -ForegroundColor Yellow
Write-Host "1. Prismaクライアント生成: npx prisma generate" -ForegroundColor White
Write-Host "2. マイグレーション実行: npx prisma migrate deploy" -ForegroundColor White
Write-Host "3. 開発サーバー起動: npm run dev`n" -ForegroundColor White

Write-Host "【Vercel用の環境変数】" -ForegroundColor Yellow
Write-Host "Vercelダッシュボードで以下を設定してください:`n" -ForegroundColor White
Write-Host "DATABASE_URL:" -ForegroundColor Cyan
Write-Host "$databaseUrl`n" -ForegroundColor Gray
Write-Host "JWT_SECRET:" -ForegroundColor Cyan
Write-Host "$jwtSecret`n" -ForegroundColor Gray

Write-Host "================================`n" -ForegroundColor Cyan
