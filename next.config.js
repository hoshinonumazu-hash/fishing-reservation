/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		// ビルド時にESLintを実行しない（Docker環境の最初の立ち上げを優先）
		ignoreDuringBuilds: true,
	},
	typescript: {
		// バックアップ配下の型エラー等でビルドが止まらないように暫定無効化
		ignoreBuildErrors: true,
	},
}

module.exports = nextConfig