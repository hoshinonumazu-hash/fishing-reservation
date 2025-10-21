# プロジェクトバックアップ記録

作成日時: 2025-10-13

## バックアップ理由
エラーが多発していたため、1から作り直すことになった。
要件定義（REQUIREMENTS_DRAFT.md）とTASK.mdは残し、他をクリーンアップ。

## バックアップ内容
- src/ - App Routerの実装（types, api, pages）
- components/ - React コンポーネント群（Header, SearchFilter, FishingPlanList, BoatSearch）
- package.json, tsconfig.json, next.config.js - 設定ファイル
- app_backup/ - 以前のApp Router実装
- *.ts - ルート直下のTypeScriptファイル

## 主な実装されていた機能
1. 検索UI（魚種・日付・船名フィルタ）
2. プラン一覧表示
3. 船ページ（/boats, /boats/[boatId]）
4. プラン追加フォーム
5. ヘッダーの船名検索（虫眼鏡アイコン）
6. API endpoints（/api/plans, /api/boats）
7. 型定義（Boat, FishingPlan）

## エラーの主な原因
- App RouterとPages Routerの混在
- "use client" ディレクティブの配置問題
- インポートパスの不整合
- ファイルの破損（Header.tsx等）

## 復旧時の注意点
- App Routerに統一（src/app配下）
- "use client"は必ずファイルの最初の行に配置
- 型は src/types/index.ts に一元化
- インポートパスを正しく設定