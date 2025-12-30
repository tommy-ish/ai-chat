.PHONY: help install setup dev build clean deploy deploy-prod db-push db-studio clear-db lint format

# デフォルトターゲット: ヘルプを表示
help:
	@echo "Available commands:"
	@echo "  make install      - 依存関係をインストール"
	@echo "  make setup        - 初期セットアップ（install + prisma generate + db push）"
	@echo "  make dev          - 開発サーバーを起動"
	@echo "  make build        - 本番用ビルド"
	@echo "  make clean        - ビルドファイルとnode_modulesを削除"
	@echo "  make db-push      - Prismaスキーマをデータベースに同期"
	@echo "  make db-studio    - Prisma Studioを起動"
	@echo "  make clear-db     - データベースを初期化"
	@echo "  make lint         - コードをリント"
	@echo "  make format       - コードをフォーマット"
	@echo "  make deploy       - Google Cloud Runにデプロイ"
	@echo "  make deploy-prod  - 本番環境にデプロイ（確認付き）"

# 依存関係のインストール
install:
	@echo "📦 Installing dependencies..."
	npm install

# 初期セットアップ
setup: install
	@echo "🔧 Generating Prisma client..."
	npx prisma generate
	@echo "🗄️  Pushing schema to database..."
	npx prisma db push
	@echo "✅ Setup complete!"

# 開発サーバー起動
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# 本番用ビルド
build:
	@echo "🏗️  Building for production..."
	npx prisma generate
	npm run build

# クリーンアップ
clean:
	@echo "🧹 Cleaning build files..."
	rm -rf .next
	rm -rf node_modules
	rm -rf .turbo

# Prismaスキーマをデータベースに同期
db-push:
	@echo "🗄️  Pushing Prisma schema to database..."
	npx prisma db push

# Prisma Studioを起動
db-studio:
	@echo "🎨 Opening Prisma Studio..."
	npx prisma studio

# データベースを初期化
clear-db:
	@echo "⚠️  Clearing database..."
	npx tsx scripts/clear-db.ts

# リント
lint:
	@echo "🔍 Linting code..."
	npm run lint

# フォーマット
format:
	@echo "✨ Formatting code..."
	npx prettier --write .

# Google Cloud Runにデプロイ（環境変数は要設定）
deploy:
	@echo "🚀 Deploying to Google Cloud Run..."
	@echo "Building Docker image with Cloud Build..."
	gcloud builds submit --config=cloudbuild.yaml .
	@echo "Deploying to Cloud Run..."
	gcloud run deploy ai-chat \
		--image asia-northeast1-docker.pkg.dev/ai-chat-482714/ai-chat-repo/ai-chat:latest \
		--platform managed \
		--region asia-northeast1 \
		--allow-unauthenticated \
		--set-env-vars "DATABASE_URL=$(DATABASE_URL),ANTHROPIC_API_KEY=$(ANTHROPIC_API_KEY),NODE_ENV=production,NEXT_PUBLIC_APP_URL=https://ai-chat-194908187004.asia-northeast1.run.app" \
		--port 8080 \
		--memory 512Mi \
		--cpu 1 \
		--max-instances 10

# 本番環境へのデプロイ（確認付き）
deploy-prod:
	@echo "⚠️  WARNING: This will deploy to production!"
	@echo "Project ID: ai-chat-482714"
	@echo "Region: asia-northeast1"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(MAKE) deploy; \
	else \
		echo "Deployment cancelled."; \
	fi

# 開発環境の完全リセット
reset: clean setup
	@echo "✅ Development environment reset complete!"

include .env