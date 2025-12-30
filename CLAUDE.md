# AI Chat - プロジェクト仕様書

## プロジェクト概要

エンターテイメント向けのAIチャットボットアプリケーション。匿名で利用可能な汎用アシスタントとして、ユーザーとの自然な対話を提供する。

### 目的
- エンターテイメント性の高い対話体験の提供
- 誰でも気軽に利用できるアクセシビリティ
- モバイルファーストで快適な操作性

### 特徴
- 認証不要の匿名利用
- 会話履歴の永続化
- モバイルフレンドリーなUI/UX
- ビジネスライクで洗練されたデザイン

---

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15+ (App Router)
- **UIライブラリ**: React 19+
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API + useState
- **言語**: TypeScript

### バックエンド
- **APIフレームワーク**: Hono
- **ルーティング**: Next.js App Router
- **ORM**: Prisma
- **AIフレームワーク**: Mastra
- **言語**: TypeScript

### AI/ML
- **プロバイダー**: Claude API (Anthropic)
- **モデル**: Claude 3.5 Sonnet 推奨

### データベース
- **データベース**: MongoDB
- **ORM**: Prisma (MongoDB connector)

### インフラ
- **デプロイ先**: Google Cloud Run
- **コンテナ**: Docker

---

## アーキテクチャ

### 全体構成

```
┌─────────────────┐
│   ブラウザ      │
│  (Next.js UI)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Next.js App    │
│  App Router     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Hono API      │
│ (Route Handlers)│
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────────┐
│ Mastra │ │ Prisma   │
│  AI    │ │   ORM    │
└────┬───┘ └────┬─────┘
     │          │
     ↓          ↓
┌─────────┐ ┌─────────┐
│ Claude  │ │ MongoDB │
│   API   │ │         │
└─────────┘ └─────────┘
```

### データフロー

1. **ユーザー入力**: ブラウザからNext.jsフロントエンドへメッセージ送信
2. **API呼び出し**: Honoで実装されたRoute Handlersがリクエストを処理
3. **AI処理**: MastraがClaude APIと連携してレスポンス生成
4. **永続化**: Prismaを通じてMongoDBに会話履歴を保存
5. **レスポンス**: ストリーミングまたは一括でユーザーに返却

---

## ディレクトリ構成

```
ai-chat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # Route Handlers (Hono)
│   │   │   └── chat/
│   │   │       └── route.ts   # チャットAPI
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # ホームページ
│   ├── components/            # Reactコンポーネント
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ChatHistory.tsx
│   │   └── ui/               # 共通UIコンポーネント
│   ├── lib/                  # ユーティリティ・設定
│   │   ├── mastra/          # Mastra設定
│   │   ├── prisma.ts        # Prismaクライアント
│   │   └── claude.ts        # Claude API設定
│   ├── contexts/            # React Context
│   │   └── ChatContext.tsx
│   ├── types/               # TypeScript型定義
│   └── styles/              # グローバルスタイル
├── prisma/
│   └── schema.prisma        # Prismaスキーマ
├── public/                  # 静的ファイル
├── .env.local              # 環境変数（ローカル）
├── .env.example            # 環境変数テンプレート
├── docker/
│   └── Dockerfile          # Cloud Run用
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## データモデル

### Prisma Schema (MongoDB)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model Conversation {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  messages  Message[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Message {
  id             String       @id @default(auto()) @map("_id") @db.ObjectId
  conversationId String       @db.ObjectId
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           String       // "user" | "assistant"
  content        String
  createdAt      DateTime     @default(now())
}
```

---

## 機能要件

### 必須機能

#### 1. チャット機能
- ユーザーがメッセージを入力できる
- Claude APIを使用してAIレスポンスを生成
- リアルタイムでレスポンスを表示（ストリーミング推奨）

#### 2. 会話履歴管理
- 全ての会話をMongoDBに永続化
- 匿名セッションIDで会話を識別
- 過去の会話を読み込んで継続可能

#### 3. UI/UX
- モバイルファーストのレスポンシブデザイン
- ビジネスライクで洗練された見た目
- Tailwind CSSで統一されたデザイン言語

#### 4. セッション管理
- ブラウザのlocalStorageまたはCookieでセッションID管理
- 認証不要で即座に利用開始

### 任意機能（将来的な拡張）
- Markdownレンダリング
- コードブロックのシンタックスハイライト
- コピー機能
- 会話履歴の検索
- エクスポート機能

---

## 実装方針

### 1. フロントエンド

#### コンポーネント設計
- **Atomic Design不要**: シンプルな構成で十分
- **Container/Presentationalパターン**: 必要に応じて
- **共通化**: 再利用可能な部分のみコンポーネント化

#### 状態管理
```typescript
// src/contexts/ChatContext.tsx
import { createContext, useContext, useState } from 'react';

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    // API呼び出しロジック
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
```

### 2. バックエンド

#### API実装 (Hono + Next.js)
```typescript
// src/app/api/chat/route.ts
import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api/chat');

app.post('/message', async (c) => {
  const { message, sessionId } = await c.req.json();

  try {
    // Mastraを使用してClaude APIと連携
    const response = await mastraAgent.chat({
      message,
      sessionId,
    });

    // Prismaで会話を保存
    await prisma.message.create({
      data: {
        conversationId: sessionId,
        role: 'user',
        content: message,
      },
    });

    await prisma.message.create({
      data: {
        conversationId: sessionId,
        role: 'assistant',
        content: response,
      },
    });

    return c.json({ response });
  } catch (error) {
    return c.json({ error: 'Failed to process message' }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
```

#### Mastra設定
```typescript
// src/lib/mastra/agent.ts
import { Mastra } from '@mastra/core';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const mastraAgent = new Mastra({
  llm: anthropic,
  model: 'claude-3-5-sonnet-20241022',
  systemPrompt: 'あなたは親切で知識豊富なAIアシスタントです。',
});
```

### 3. データベース

#### Prismaクライアント設定
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4. エラーハンドリング

#### 基本的なtry-catch
```typescript
try {
  // API呼び出しやDB操作
} catch (error) {
  console.error('Error:', error);
  // ユーザーにフレンドリーなエラーメッセージを表示
  return { error: 'Something went wrong. Please try again.' };
}
```

#### エラー境界
```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>エラーが発生しました。ページをリロードしてください。</div>;
    }

    return this.props.children;
  }
}
```

---

## テスト戦略

### テスト方針
ユーザーのグローバルCLAUDE.mdの指示に従い、以下を厳守：

1. **意味のあるテストのみ**: `expect(true).toBe(true)`のような無意味なテストは書かない
2. **実際の機能を検証**: 具体的な入力と期待される出力を検証
3. **ハードコーディング禁止**: テストを通すためだけのハードコードは絶対に禁止
4. **Red-Green-Refactor**: テストが失敗する状態から始める
5. **境界値・異常系**: エラーケースも必ずテストする

### テストレベル

#### ユニットテスト
- **対象**: ユーティリティ関数、API処理ロジック
- **ツール**: Vitest
- **例**:
  ```typescript
  // src/lib/__tests__/session.test.ts
  import { describe, it, expect } from 'vitest';
  import { generateSessionId } from '../session';

  describe('generateSessionId', () => {
    it('should generate a unique session ID', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });
  });
  ```

#### 統合テスト
- **対象**: Route Handlers、データベース操作
- **ツール**: Vitest + Supertest
- **例**:
  ```typescript
  // src/app/api/chat/__tests__/route.test.ts
  import { describe, it, expect, beforeEach, afterEach } from 'vitest';
  import { POST } from '../route';

  describe('POST /api/chat/message', () => {
    beforeEach(async () => {
      // テスト用DBのセットアップ
    });

    afterEach(async () => {
      // クリーンアップ
    });

    it('should return AI response for valid message', async () => {
      const request = new Request('http://localhost/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'こんにちは',
          sessionId: 'test-session-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.response).toBeTruthy();
      expect(typeof data.response).toBe('string');
    });

    it('should handle error when Claude API fails', async () => {
      // Claude APIのモックを失敗させる
      // 実際のエラーハンドリングをテスト
    });
  });
  ```

#### E2Eテスト（任意）
- **対象**: ユーザーフロー全体
- **ツール**: Playwright
- **優先度**: 低（初期リリースでは不要）

---

## 環境変数

### .env.example
```bash
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/ai-chat"

# Claude API
CLAUDE_API_KEY="sk-ant-..."

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 必要な環境変数
- `DATABASE_URL`: MongoDB接続文字列
- `CLAUDE_API_KEY`: Anthropic APIキー
- `NODE_ENV`: 実行環境 (development/production)
- `NEXT_PUBLIC_APP_URL`: アプリケーションURL

---

## デプロイメント

### Google Cloud Run

#### 前提条件
- Google Cloudプロジェクト作成済み
- `gcloud` CLI設定済み
- Dockerインストール済み

#### Dockerfile
```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS base

# 依存関係のインストール
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# 本番環境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Cloud Runはポート8080を期待
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

#### デプロイコマンド
```bash
# イメージビルド
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-chat

# Cloud Runへデプロイ
gcloud run deploy ai-chat \
  --image gcr.io/PROJECT_ID/ai-chat \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,CLAUDE_API_KEY=$CLAUDE_API_KEY
```

---

## 開発ガイドライン

### コーディング規約

#### TypeScript
- **Strict Mode**: 有効化必須
- **明示的な型定義**: `any`は避ける
- **インターフェース優先**: type aliasより優先

#### スタイリング
- **Tailwind CSS**: ユーティリティクラスを使用
- **カスタムCSS**: 最小限に留める
- **レスポンシブ**: モバイルファースト (`sm:`, `md:`, `lg:`)

#### コンポーネント
- **'use client'**: インタラクティブなコンポーネントのみ
- **Server Component優先**: デフォルトはサーバーコンポーネント
- **小さく保つ**: 1コンポーネント200行以下を目安

### Git運用

#### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `fix/*`: バグ修正

#### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コードスタイル変更（機能影響なし）
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・補助ツール変更
```

### パフォーマンス

#### 最適化ポイント
- **画像最適化**: Next.js Imageコンポーネント使用
- **コード分割**: dynamic import活用
- **キャッシング**: Route Handlersでキャッシュヘッダー設定
- **バンドルサイズ**: 不要な依存関係を避ける

---

## セキュリティ

### 基本対策

#### 環境変数
- APIキーは`.env.local`で管理
- **絶対にコミットしない**: `.gitignore`に`.env.local`を追加済み

#### 入力検証
```typescript
import { z } from 'zod';

const MessageSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid(),
});

// 使用例
const validated = MessageSchema.parse(requestBody);
```

#### レート制限（任意）
- Cloud Run自体にスケーリング設定
- 必要に応じてMiddlewareでレート制限実装

---

## トラブルシューティング

### よくある問題

#### Prisma接続エラー
```bash
# Prismaクライアント再生成
npx prisma generate

# マイグレーション（MongoDBの場合は不要）
npx prisma db push
```

#### Cloud Runビルド失敗
- Dockerfileの各ステージを個別にテスト
- ローカルで`docker build`を試す

#### Claude API エラー
- APIキーが正しいか確認
- レート制限に引っかかっていないか確認
- Anthropicのステータスページを確認

---

## 参考資料

### 公式ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Mastra Documentation](https://mastra.ai/docs)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)

### 推奨リソース
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## プロジェクトマイルストーン

### Phase 1: MVP (最小限の機能)
- [ ] プロジェクトセットアップ
- [ ] 基本的なUI実装
- [ ] Claude API統合
- [ ] MongoDB接続とPrismaセットアップ
- [ ] 会話機能の実装
- [ ] ローカル動作確認

### Phase 2: 永続化と改善
- [ ] セッション管理実装
- [ ] 会話履歴の保存・読み込み
- [ ] エラーハンドリング改善
- [ ] レスポンシブデザインの調整

### Phase 3: デプロイ
- [ ] Dockerfile作成
- [ ] Cloud Run設定
- [ ] 環境変数設定
- [ ] 本番デプロイ
- [ ] 動作確認

### Phase 4: 拡張機能（任意）
- [ ] ストリーミングレスポンス
- [ ] Markdownレンダリング
- [ ] コードハイライト
- [ ] 会話履歴検索

---

## まとめ

このプロジェクトは、モダンな技術スタックを使用したシンプルで効果的なAIチャットボットアプリケーションです。

### 重要な原則
1. **シンプルさを保つ**: 過度な抽象化や設計パターンは避ける
2. **実用性重視**: 使われる機能を優先的に実装
3. **テスト品質**: 意味のあるテストのみを書く
4. **セキュリティ**: 基本を押さえて堅実に

この仕様書に従って開発を進めることで、保守性が高く拡張可能なアプリケーションを構築できます。
