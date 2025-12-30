# AI Chat アプリケーション実装計画

## プロジェクト概要
エンターテイメント向けのAIチャットボットアプリケーションを構築します。
この計画書は、CLAUDE.mdの仕様書に基づいた詳細な実装手順を示します。

---

## Phase 1: プロジェクト初期セットアップ

### 1.1 Next.jsプロジェクトの作成
- [x] Next.js 15+ プロジェクトを作成（App Router、TypeScript、Tailwind CSS有効化）
- [x] 不要なデフォルトファイルを削除・整理
- [x] プロジェクト構造を仕様書に合わせて準備

### 1.2 依存関係のインストール
- [x] **フロントエンド関連**
  - [x] React 19+（Next.js 15に含まれる）
  - [x] Tailwind CSS（セットアップ時に設定）
- [x] **バックエンド関連**
  - [x] `hono` - APIフレームワーク
  - [x] `@mastra/core` - AIフレームワーク
  - [x] `@anthropic-ai/sdk` - Claude API SDK
  - [x] `zod` - バリデーションライブラリ
- [x] **データベース関連**
  - [x] `@prisma/client` - Prismaクライアント
  - [x] `prisma` (devDependency) - Prisma CLI
- [x] **開発ツール**
  - [x] `vitest` - テストフレームワーク
  - [x] `@testing-library/react` - Reactテストユーティリティ
  - [x] `@testing-library/jest-dom` - テスト用マッチャー
  - [x] `@testing-library/dom` - DOM テストユーティリティ
  - [x] `@vitejs/plugin-react` - Vite React プラグイン
  - [x] `jsdom` - テスト用DOM環境

### 1.3 環境変数設定
- [x] `.env.example`ファイルを作成
  - [x] `DATABASE_URL` - MongoDB接続文字列
  - [x] `CLAUDE_API_KEY` - Anthropic APIキー
  - [x] `NODE_ENV` - 実行環境
  - [x] `NEXT_PUBLIC_APP_URL` - アプリケーションURL
- [ ] `.env.local`ファイルを作成（実際の値を設定）※ユーザーが手動で設定
- [x] `.gitignore`に`.env.local`が含まれているか確認

### 1.4 TypeScript設定
- [x] `tsconfig.json`でStrict Mode有効化
- [x] パスエイリアス設定（`@/*`）
- [x] 型チェック設定の最適化（noUnusedLocals, noUnusedParameters等）

### 1.5 Tailwind CSS設定
- [x] Tailwind CSSカスタムテーマ設定（globals.cssで実装）
- [x] グローバルスタイルの準備（`src/app/globals.css`）
- [x] ビジネスライクな色設定（プライマリ、セカンダリ、アクセント等）
- [x] ダークモード対応

---

## Phase 2: データベースとPrismaのセットアップ

### 2.1 Prismaの初期化
- [x] `npx prisma init --datasource-provider mongodb`を実行
- [x] `prisma/schema.prisma`が生成されることを確認
- [x] `prisma.config.ts`が生成されることを確認（Prisma 7）
- [x] `dotenv`パッケージをインストール

### 2.2 Prismaスキーマ定義
- [x] `Conversation`モデルを定義
  - [x] `id` (ObjectId)
  - [x] `messages` (Message[])
  - [x] `createdAt` (DateTime)
  - [x] `updatedAt` (DateTime)
- [x] `Message`モデルを定義
  - [x] `id` (ObjectId)
  - [x] `conversationId` (ObjectId)
  - [x] `conversation` (Conversation relation)
  - [x] `role` (String: "user" | "assistant")
  - [x] `content` (String)
  - [x] `createdAt` (DateTime)

### 2.3 Prismaクライアント設定
- [x] `src/lib/prisma.ts`を作成
- [x] シングルトンパターンでPrismaClientをエクスポート
- [x] 開発環境でのホットリロード対応

### 2.4 データベース接続確認
- [x] `npx prisma generate`を実行してクライアント生成
- [ ] `npx prisma db push`を実行（MongoDBスキーマ同期）※ユーザーがMongoDB接続後に実行
- [ ] MongoDB Atlas接続をテスト ※ユーザーが.env.local設定後に実行

---

## Phase 3: バックエンドAPI実装

### 3.1 Mastraエージェント設定
- [x] `src/lib/mastra/`ディレクトリを作成
- [x] `src/lib/mastra/agent.ts`を作成
  - [x] Mastraエージェント設定（Claude 3.5 Sonnet）
  - [x] システムプロンプト設定
  - [x] `generateResponse`関数を実装
  - [x] `streamResponse`関数を実装

### 3.2 チャットAPIエンドポイント実装
- [x] `src/app/api/chat/route.ts`を作成
- [x] Honoアプリケーションのセットアップ
- [x] `POST /api/chat/message`エンドポイント実装
  - [x] リクエストボディのバリデーション（zodを使用）
  - [x] Mastraを使用してClaude APIと連携
  - [x] ユーザーメッセージをDBに保存
  - [x] AIレスポンスをDBに保存
  - [x] レスポンスを返却
- [x] `GET /api/chat/history/:sessionId`エンドポイント実装
- [x] エラーハンドリング実装
  - [x] Claude APIエラー
  - [x] データベースエラー
  - [x] バリデーションエラー

### 3.3 セッション管理
- [x] `src/lib/session.ts`を作成
- [x] セッションID生成関数を実装（`generateSessionId`）
- [x] セッションバリデーション関数を実装（`isValidSessionId`）

### 3.4 ユーティリティ関数
- [x] 入力バリデーション用のzodスキーマ定義（`src/lib/validation.ts`）
- [x] 型定義の作成（`src/types/chat.ts`）
  - [x] `Message`型
  - [x] `Conversation`型
  - [x] `ChatRequest`型
  - [x] `ChatResponse`型
  - [x] `ErrorResponse`型

---

## Phase 4: フロントエンド実装

### 4.1 型定義
- [x] `src/types/`ディレクトリを作成（Phase 3で完了）
- [x] `src/types/chat.ts`を作成（Phase 3で完了）
  - [x] `Message`型
  - [x] `Conversation`型
  - [x] API関連の型

### 4.2 Context API設定
- [x] `src/contexts/`ディレクトリを作成
- [x] `src/contexts/ChatContext.tsx`を作成
  - [x] `ChatProvider`コンポーネント
  - [x] `useChat`カスタムフック
  - [x] メッセージ状態管理
  - [x] API呼び出しロジック
  - [x] ローディング状態管理
  - [x] セッションID管理（localStorage）
  - [x] 会話履歴の読み込み
  - [x] エラーハンドリング

### 4.3 UIコンポーネント実装

#### 4.3.1 共通UIコンポーネント
- [x] `src/components/ui/`ディレクトリを作成
- [x] `Button`コンポーネント（バリアント、サイズ対応）
- [x] `Input`コンポーネント（エラー表示対応）
- [x] `Card`コンポーネント（Header, Content, Footer）
- [x] `LoadingSpinner`コンポーネント

#### 4.3.2 チャットコンポーネント
- [x] `src/components/chat/`ディレクトリを作成
- [x] `ChatContainer.tsx` - チャット全体のコンテナ
  - [x] エラー表示UI
  - [x] レスポンシブレイアウト
- [x] `ChatMessage.tsx` - 個別のメッセージ表示
  - [x] ユーザーメッセージスタイル（右寄せ、プライマリ色）
  - [x] AIメッセージスタイル（左寄せ、ミュート色）
  - [x] タイムスタンプ表示
  - [x] アニメーション効果
- [x] `ChatInput.tsx` - メッセージ入力フォーム
  - [x] テキストエリア（自動リサイズ）
  - [x] 送信ボタン
  - [x] エンターキー送信対応（Shift+Enterで改行）
  - [x] ローディング中の無効化
- [x] `ChatHistory.tsx` - 会話履歴表示
  - [x] スクロール処理
  - [x] 自動スクロール（最新メッセージへ）
  - [x] 空状態のウェルカムメッセージ
  - [x] ローディングインジケーター

### 4.4 ページ実装
- [x] `src/app/layout.tsx`を更新
  - [x] メタデータ設定（日本語対応）
  - [x] `ChatProvider`でラップ
  - [x] `ErrorBoundary`でラップ
  - [x] グローバルスタイル適用
- [x] `src/app/page.tsx`を実装
  - [x] `ChatContainer`を配置
  - [x] レスポンシブレイアウト
  - [x] モバイルファーストデザイン

### 4.5 エラーハンドリング
- [x] `src/components/ErrorBoundary.tsx`を作成
- [x] エラー表示UIコンポーネント
- [x] ページリロード機能
- [x] ChatContext内でネットワークエラーのハンドリング

---

## Phase 5: スタイリングとUI/UX改善

### 5.1 デザインシステム
- [x] カラーパレット定義（Tailwind config）
  - [x] プライマリ、セカンダリ、アクセント、エラー、警告、成功カラー
  - [x] ホバー状態のカラー定義
  - [x] ダークモード対応
- [x] タイポグラフィ設定
  - [x] フォントファミリー（sans, mono）
  - [x] フォントサイズ（xs〜4xl）
  - [x] 行の高さ（tight, normal, relaxed）
  - [x] フォントウェイト（normal, medium, semibold, bold）
- [x] スペーシングとレイアウトの統一
  - [x] スペーシングスケール（xs〜2xl）
  - [x] 角丸のバリエーション（sm〜full）
  - [x] シャドウのバリエーション（sm〜lg）
  - [x] トランジション設定（fast, base, slow）

### 5.2 レスポンシブデザイン
- [x] モバイル表示の最適化（320px〜）
  - [x] タッチターゲットサイズ最低44px
  - [x] パディングとマージンの調整
  - [x] フォントサイズの最適化
  - [x] 全画面表示対応（rounded-none on mobile）
- [x] タブレット表示の調整（768px〜）
  - [x] レイアウトの調整
  - [x] スペーシングの拡大
- [x] デスクトップ表示の調整（1024px〜）
  - [x] 最大幅の設定（max-w-4xl）
  - [x] カードシャドウの追加

### 5.3 アクセシビリティ
- [x] キーボードナビゲーション対応
  - [x] フォーカスリング（focus:ring-2）
  - [x] Enterキー送信対応（ChatInput）
  - [x] Tabキー順序の最適化
- [x] ARIAラベル設定
  - [x] role属性（main, article, log, status, alert）
  - [x] aria-label（すべてのインタラクティブ要素）
  - [x] aria-live（動的コンテンツ）
  - [x] aria-describedby（フォーム要素）
  - [x] スクリーンリーダー用テキスト（sr-only）
- [x] コントラスト比の確認
  - [x] WCAG AA準拠の配色
  - [x] ダークモード対応
  - [x] テキストと背景のコントラスト確保

---

## Phase 6: テスト実装

### 6.1 テスト環境セットアップ
- [x] Vitestの設定ファイル作成（`vitest.config.ts`）
- [x] テスト用の環境変数設定（`.env.test`）
- [x] テスト用セットアップファイル作成（`src/test/setup.ts`）
- [x] @testing-library/user-event インストール

### 6.2 ユニットテスト
- [x] `src/lib/__tests__/session.test.ts` - セッション管理のテスト
  - [x] generateSessionId - UUID v4形式の検証
  - [x] generateSessionId - ユニーク性の検証
  - [x] isValidSessionId - 有効なUUID検証
  - [x] isValidSessionId - 無効なUUID拒否
  - [x] isValidSessionId - 型チェック（null, undefined, 非文字列）
- [x] `src/lib/__tests__/validation.test.ts` - バリデーションのテスト
  - [x] 有効なチャットリクエストの検証
  - [x] メッセージ長の検証（1-5000文字）
  - [x] UUID大文字小文字の検証
  - [x] 空メッセージの拒否
  - [x] 5000文字超のメッセージ拒否
  - [x] ホワイトスペースのみのメッセージ拒否
  - [x] 無効なUUID形式の拒否
  - [x] 必須フィールドの検証
  - [x] エッジケースのテスト（null, undefined, array等）

### 6.3 統合テスト
- [x] `src/app/api/chat/__tests__/route.test.ts` - チャットAPIのテスト
  - [x] POST正常系：有効なメッセージでAIレスポンスが返る
  - [x] POST正常系：新規会話の作成
  - [x] POST正常系：ユーザーとAIメッセージの保存
  - [x] POST異常系：バリデーションエラー（空メッセージ、長すぎるメッセージ、無効なUUID）
  - [x] POST異常系：Claude APIエラー
  - [x] POST異常系：データベースエラー
  - [x] POST異常系：一般的なエラーハンドリング
  - [x] GET正常系：会話履歴の取得
  - [x] GET正常系：存在しない会話の処理
  - [x] GET異常系：sessionId未指定
  - [x] GET異常系：データベースエラー
  - [x] メッセージの昇順ソート検証

### 6.4 コンポーネントテスト
- [x] `src/components/chat/__tests__/ChatMessage.test.tsx` - ChatMessageのテスト
  - [x] ユーザーメッセージの表示とスタイル
  - [x] AIメッセージの表示とスタイル
  - [x] ARIAラベルとセマンティックHTML
  - [x] タイムスタンプのフォーマット
  - [x] レスポンシブデザインクラス
  - [x] アニメーションクラス
  - [x] メッセージフォーマット（改行、長文）
- [x] `src/components/chat/__tests__/ChatInput.test.tsx` - ChatInputのテスト
  - [x] レンダリングと基本構造
  - [x] ARIAラベルとアクセシビリティ
  - [x] 入力処理とフォーム送信
  - [x] Enterキー送信とShift+Enter改行
  - [x] ローディング状態
  - [x] IME変換処理
  - [x] ボタンの有効/無効状態
  - [x] レスポンシブデザインクラス

**重要**: 全てのテストは実際の機能を検証すること。`expect(true).toBe(true)`のような無意味なテストは書かない。

---

## Phase 7: ローカル動作確認

### 7.1 開発サーバー起動
- [x] `npm run dev`で起動確認
  - [x] http://localhost:3000 で正常にアクセス可能
  - [x] Turbopack使用、577msで起動完了
- [x] ホットリロード動作確認
  - [x] layout.tsxのタイトル変更でホットリロード成功 (35msでコンパイル)

### 7.2 機能テスト
- [x] メッセージ送信が正常に動作
  - [x] POST /api/chat エンドポイントが正常に動作
  - [x] テストメッセージ「こんにちは！動作テストです。」が送信成功
- [x] AIレスポンスが表示される
  - [x] Claude APIからレスポンス取得成功
  - [x] JSON形式で正しいレスポンスが返却される
- [x] 会話履歴がDBに保存される
  - [x] MongoDBに会話が正常に保存される
  - [x] ユーザーメッセージとAIレスポンスの両方が保存される
  - [x] 4件のメッセージ（2往復）が確認できた
- [x] ページリロード後も会話が復元される
  - [x] GET /api/chat エンドポイントで履歴取得成功
  - [x] conversationIdとmessages配列が正しく返却される
  - [x] メッセージが作成日時順にソートされている

### 7.3 エラーケーステスト
- [x] バリデーションエラー時の挙動
  - [x] 空メッセージ送信時に適切なエラーメッセージが返る
  - [x] 無効なUUID送信時に適切なエラーメッセージが返る
- [x] Claude APIエラー時の挙動（ユニットテストで検証済み）
- [x] 空メッセージ送信時の挙動（バリデーションで正しく拒否される）

---

## Phase 8: デプロイ準備

### 8.1 Dockerfile作成
- [x] `docker/Dockerfile`を作成
- [x] マルチステージビルド設定
  - [x] 依存関係インストールステージ
  - [x] ビルドステージ
  - [x] 本番環境ステージ
- [x] Prisma生成コマンドを含める
- [x] ポート8080設定（Cloud Run用）

### 8.2 Next.js設定
- [x] `next.config.js`を更新
- [x] `output: 'standalone'`を設定
- [x] 必要なヘッダー設定

### 8.3 ローカルでDockerビルド確認
- [x] `docker build`コマンドでビルド成功確認
- [x] Dockerコンテナでローカル起動確認

#### Phase 8 完了詳細

**実装内容:**
- `next.config.ts`: standalone出力モードとセキュリティヘッダーを追加
- `docker/Dockerfile`: 3段階マルチステージビルド（deps、builder、runner）
- `.dockerignore`: 不要ファイルを除外してビルド効率化
- `tsconfig.json`: prisma.config.tsを除外してビルドエラー回避
- `.env`: Docker互換性のため引用符を削除

**ビルドテスト結果:**
- Dockerイメージビルド: 成功（約18秒）
- コンテナ起動: 成功（34ms起動時間）
- ホームページアクセス: HTTP 200
- チャットAPI動作: 正常（AIレスポンス取得成功）
- 会話履歴保存: 正常（MongoDB接続確認）

**技術的な修正:**
1. Dockerfile builder stageで全依存関係をインストール（dotenv必要）
2. ChatMessage.tsxの未使用パラメータを`_isLatest`に変更
3. prisma.config.tsをTypeScriptビルドから除外
4. .envファイルの引用符を削除（Docker --env-file互換性）

**セキュリティ設定:**
- 非rootユーザー（nextjs:nodejs）でコンテナ実行
- ヘルスチェックエンドポイント設定
- セキュリティヘッダー（X-Frame-Options、X-Content-Type-Options等）

---

## Phase 9: Google Cloud Runデプロイ

### 9.1 Google Cloud設定
- [x] Google Cloudプロジェクト作成
- [x] `gcloud` CLI認証設定
- [x] Container Registryの有効化

### 9.2 イメージビルドとプッシュ
- [x] `gcloud builds submit`でイメージビルド
- [x] Container Registryにイメージがあることを確認

### 9.3 Cloud Runデプロイ
- [x] `gcloud run deploy`コマンド実行
- [x] 環境変数設定
  - [x] `DATABASE_URL`
  - [x] `ANTHROPIC_API_KEY`
  - [x] `NODE_ENV=production`
- [x] リージョン設定（asia-northeast1推奨）
- [x] 認証なしアクセス許可設定

### 9.4 本番環境確認
- [x] デプロイされたURLにアクセス
- [x] 全機能の動作確認
- [x] パフォーマンス確認
- [x] エラーログ確認

#### Phase 9 完了詳細

**デプロイ情報:**
- プロジェクトID: `ai-chat-482714`
- リージョン: `asia-northeast1`
- サービスURL: https://ai-chat-194908187004.asia-northeast1.run.app
- イメージ: `asia-northeast1-docker.pkg.dev/ai-chat-482714/ai-chat-repo/ai-chat:latest`

**実装内容:**
1. Google Cloud SDK（gcloud CLI）をHomebrew経由でインストール
2. gcloud認証とプロジェクト設定完了
3. 必要なAPIを有効化（Cloud Build、Cloud Run、Artifact Registry）
4. Artifact RegistryにDockerリポジトリ作成
5. cloudbuild.yamlを作成してCloud Buildでイメージビルド
6. Cloud Runにデプロイ（環境変数設定含む）

**環境変数設定:**
- `DATABASE_URL`: MongoDB Atlas接続文字列
- `ANTHROPIC_API_KEY`: Claude API キー
- `NODE_ENV`: production
- `NEXT_PUBLIC_APP_URL`: デプロイURL

**動作確認結果:**
- ホームページアクセス: HTTP 200（応答時間: 1.58秒）
- チャットAPI基本動作: 正常（AIレスポンス取得成功）
- データベース接続: 正常（会話履歴保存確認）
- メッセージ保存: 正常（4メッセージ確認）

**MongoDB Atlas設定:**
- Network Accessで0.0.0.0/0を許可（Cloud Runからのアクセス許可）

**リソース設定:**
- メモリ: 512Mi
- CPU: 1
- 最大インスタンス: 10
- ポート: 8080
- 認証: 不要（一般公開）

**既知の課題（Phase 11で対応予定）:**
- 会話の継続性：現在、AIは過去のメッセージを参照していない
- 会話履歴はDBに保存されているが、API実装でAIに渡していない（src/app/api/chat/route.ts:42）

---

## Phase 10: 拡張機能（任意）

### 10.1 ストリーミングレスポンス
- [ ] Claude APIストリーミング対応
- [ ] フロントエンドでSSE受信実装
- [ ] リアルタイム表示UI実装

### 10.2 Markdownレンダリング
- [ ] `react-markdown`ライブラリ導入
- [ ] Markdownパーサー設定
- [ ] コードブロックのシンタックスハイライト

### 10.3 会話履歴機能強化
- [ ] 会話一覧表示
- [ ] 会話の検索機能
- [ ] 会話のエクスポート機能

### 10.4 パフォーマンス最適化
- [ ] 画像最適化（Next.js Image）
- [ ] コード分割（dynamic import）
- [ ] キャッシング戦略
- [ ] バンドルサイズ削減

---

## チェックリスト：実装前の確認事項

### 必須
- [ ] MongoDB Atlasアカウント作成済み
- [ ] Anthropic APIキー取得済み
- [ ] Node.js 20+インストール済み
- [ ] Google Cloudアカウント作成済み（デプロイ時）

### 推奨
- [ ] VSCodeまたはお好みのエディタ設定済み
- [ ] ESLint/Prettier設定
- [ ] Git初期化とリモートリポジトリ設定

---

## 見積もり

### 各フェーズの想定作業量
- Phase 1: プロジェクト初期セットアップ - 2-4時間
- Phase 2: データベースとPrisma - 1-2時間
- Phase 3: バックエンドAPI - 3-5時間
- Phase 4: フロントエンド実装 - 5-8時間
- Phase 5: スタイリング - 2-4時間
- Phase 6: テスト実装 - 4-6時間
- Phase 7: ローカル動作確認 - 1-2時間
- Phase 8: デプロイ準備 - 2-3時間
- Phase 9: Cloud Runデプロイ - 1-2時間

**合計: 21-36時間**

---

## 注意事項

1. **テスト品質**: 意味のあるテストのみを書く。ハードコーディング禁止。
2. **シンプルさを保つ**: 過度な抽象化や設計パターンは避ける。
3. **セキュリティ**: 環境変数を絶対にコミットしない。
4. **エラーハンドリング**: 全てのAPI呼び出しとDB操作に適切なエラーハンドリングを実装。
5. **レスポンシブ**: モバイルファーストで実装。

---

## Phase 11: 実装の追加修正と改善

### 11.1 バグ修正と技術的改善（実装済み）
- [x] Prisma 7からPrisma 6へのダウングレード（MongoDB互換性）
- [x] HonoからNext.jsネイティブRoute Handlersへの移行
- [x] MongoDB ObjectIdからUUID形式への変更（Conversation.id）
- [x] Mastraエージェントのレスポンス処理修正（.textプロパティ）
- [x] Claude APIモデル名の更新（claude-3-7-sonnet-latest）
- [x] 日本語IME変換時のEnter送信防止（Safari対応）
- [x] データベースクリアスクリプトの作成
- [x] Makefileの作成（開発コマンドの統一）

### 11.2 コード品質とツール（未実装）
- [ ] ESLint設定ファイル作成と設定
- [ ] Prettier設定ファイル作成とフォーマットルール定義
- [ ] Huskyでpre-commit hooks設定
- [ ] lint-stagedで変更ファイルのみリント
- [ ] コミットメッセージの規約設定（Conventional Commits）
- [ ] VSCode設定ファイル（.vscode/settings.json）
- [ ] エディタ設定（.editorconfig）

### 11.3 ドキュメント（未実装）
- [ ] README.md作成
  - [ ] プロジェクト概要
  - [ ] セットアップ手順
  - [ ] 環境変数の説明
  - [ ] 開発コマンド（Makefile参照）
  - [ ] デプロイ手順
  - [ ] トラブルシューティング
- [ ] CONTRIBUTING.md作成（コントリビューションガイド）
- [ ] API.md作成（API仕様書）
- [ ] コンポーネントのJSDocコメント追加

### 11.4 UI/UX改善（高優先度）
- [ ] **会話管理機能**
  - [ ] 新しい会話を開始するボタン
  - [ ] 会話一覧サイドバー
  - [ ] 会話のタイトル自動生成（最初のメッセージから）
  - [ ] 会話の削除機能
  - [ ] 会話の検索機能
- [ ] **メッセージ表示の改善**
  - [ ] Markdownレンダリング（react-markdown）
  - [ ] コードブロックのシンタックスハイライト（highlight.js/prism）
  - [ ] コードコピーボタン
  - [ ] メッセージのコピー機能
  - [ ] メッセージの編集機能（ユーザーメッセージのみ）
  - [ ] メッセージの削除機能
- [ ] **ローディング状態の改善**
  - [ ] メッセージ送信中のタイピングインジケーター
  - [ ] スケルトンローディング
  - [ ] プログレスバー
- [ ] **エラー表示の改善**
  - [ ] より分かりやすいエラーメッセージ
  - [ ] リトライボタン
  - [ ] オフライン検知と通知

### 11.5 機能追加（中優先度）
- [ ] **ストリーミングレスポンス実装**
  - [ ] Mastraのstream()メソッドを使用
  - [ ] Server-Sent Events (SSE)の実装
  - [ ] リアルタイムでメッセージを表示
  - [ ] ストリーミング中の停止ボタン
- [ ] **会話エクスポート機能**
  - [ ] JSON形式でエクスポート
  - [ ] Markdown形式でエクスポート
  - [ ] テキスト形式でエクスポート
- [ ] **設定画面**
  - [ ] モデル選択（Sonnet, Opus, Haiku）
  - [ ] システムプロンプトのカスタマイズ
  - [ ] テーマ切り替え（ライト/ダーク）
  - [ ] フォントサイズ調整
- [ ] **メッセージ履歴の最適化**
  - [ ] 無限スクロール実装
  - [ ] 仮想化（react-window/react-virtualized）
  - [ ] メッセージのページネーション

### 11.6 パフォーマンス最適化（中優先度）
- [ ] Next.js Image最適化の活用
- [ ] 動的インポート（React.lazy）でコード分割
- [ ] バンドルサイズの分析と削減
- [ ] メモ化（useMemo, useCallback）の適切な使用
- [ ] Service Workerでオフライン対応
- [ ] キャッシング戦略の実装

### 11.7 アクセシビリティ（中優先度）
- [ ] ARIA属性の追加
  - [ ] ボタンやリンクにaria-label
  - [ ] フォームにaria-describedby
  - [ ] ローディング状態にaria-busy
- [ ] キーボードナビゲーション
  - [ ] Tab順序の最適化
  - [ ] ショートカットキー実装（Cmd/Ctrl + K で新しい会話など）
  - [ ] Escキーでモーダルを閉じる
- [ ] フォーカス管理
  - [ ] フォーカストラップ（モーダル内）
  - [ ] フォーカスインジケーター
- [ ] スクリーンリーダー対応
  - [ ] セマンティックHTML
  - [ ] 適切な見出しレベル
- [ ] カラーコントラスト確認（WCAG AA準拠）
- [ ] 文字サイズの調整可能性

### 11.8 セキュリティ強化（低優先度）
- [ ] レート制限の実装（API Route）
- [ ] 入力サニタイゼーション強化
- [ ] XSS対策の確認
- [ ] CORS設定の最適化
- [ ] Content Security Policy (CSP)の設定
- [ ] セキュリティヘッダーの追加

### 11.9 監視とログ（低優先度）
- [ ] 構造化ログの実装（winston/pino）
- [ ] エラートラッキング（Sentry）
- [ ] パフォーマンスモニタリング（Vercel Analytics/Google Analytics）
- [ ] ユーザー行動分析（任意）

### 11.10 Docker化とCI/CD（Phase 8拡張）
- [ ] **Dockerfile作成**
  - [ ] マルチステージビルド
  - [ ] 依存関係の最適化
  - [ ] セキュリティベストプラクティス
- [ ] **docker-compose.yml作成**
  - [ ] アプリケーションサービス
  - [ ] MongoDB開発環境（任意）
- [ ] **.dockerignore作成**
- [ ] **GitHub Actions設定**
  - [ ] CI: リント、テスト、ビルド
  - [ ] CD: 自動デプロイ（Cloud Run）
  - [ ] プルリクエストのプレビューデプロイ

### 11.11 テスト実装の追加仕様（Phase 6補完）
- [ ] **テストカバレッジ目標設定**
  - [ ] 全体80%以上
  - [ ] クリティカルパス（API、認証）は95%以上
- [ ] **E2Eテスト（任意）**
  - [ ] Playwright設定
  - [ ] ユーザーフロー全体のテスト
  - [ ] クロスブラウザテスト
- [ ] **ビジュアルリグレッションテスト（任意）**
  - [ ] Chromatic/Percy導入
  - [ ] スナップショットテスト

### 11.12 モバイル最適化（Phase 5補完）
- [ ] **レスポンシブデザインの検証**
  - [ ] 320px（iPhone SE）
  - [ ] 375px（iPhone 12/13/14）
  - [ ] 768px（iPad）
  - [ ] 1024px以上（デスクトップ）
- [ ] **タッチ操作の最適化**
  - [ ] タップエリアサイズ（最低44x44px）
  - [ ] スワイプジェスチャー
  - [ ] プルトゥリフレッシュ（任意）
- [ ] **PWA対応（任意）**
  - [ ] manifest.json作成
  - [ ] Service Worker実装
  - [ ] オフライン動作
  - [ ] アプリアイコン設定

### 11.13 国際化（任意）
- [ ] i18n設定（next-i18next）
- [ ] 日本語・英語の言語切り替え
- [ ] タイムゾーン対応

---

## 実装の優先順位

### 🔴 最優先（すぐに実装すべき）
1. Phase 6: テスト実装（品質保証）
2. Phase 8: Docker化（デプロイ準備）
3. README.md作成（ドキュメント）
4. ESLint/Prettier設定（コード品質）

### 🟡 高優先度（早めに実装）
1. 会話管理機能（新しい会話、一覧、削除）
2. Markdownレンダリング
3. ストリーミングレスポンス
4. モバイル最適化の検証

### 🟢 中優先度（余裕があれば）
1. アクセシビリティ対応
2. パフォーマンス最適化
3. 設定画面
4. エラーハンドリング改善

### ⚪ 低優先度（後回しでOK）
1. 国際化
2. PWA対応
3. 監視とログ（本番運用後でも可）
4. E2Eテスト

---

## 次のステップ

### 現在のステータス
- ✅ Phase 1-9: 基本実装、スタイリング、テスト、ローカル動作確認、デプロイ準備、本番デプロイ完了
- ✅ Phase 11.1: バグ修正完了
- ⏳ Phase 10: 未実装（任意）
- ⏳ Phase 11.2-11.13: 未実装

### 推奨される次のアクション
1. **会話の継続性機能を実装** - AIに会話履歴を渡す（Phase 11.2相当）
2. **README.mdを作成** - チーム/将来の自分のため
3. **Phase 10（拡張機能）の検討** - ストリーミング、Markdown対応など
4. **会話管理機能を追加** - ユーザビリティ向上のため

---

## トラブルシューティングログ

### 解決済みの問題
1. **Prisma 7 MongoDB非対応** → Prisma 6にダウングレード
2. **Hono + Next.js App Router 404エラー** → Next.jsネイティブRoute Handlersに移行
3. **MongoDB ObjectID vs UUID** → Conversation.idをString型に変更
4. **Mastraレスポンスがオブジェクト** → response.textを使用
5. **Claude APIモデル404エラー** → claude-3-7-sonnet-latestに更新
6. **日本語IME変換時の誤送信（Safari）** → compositionイベント + 遅延処理で対応

### 既知の制限事項
- Prisma 7はMongoDBに未対応（2025年12月現在）
- 大量のメッセージで動作が重くなる可能性（仮想化未実装）
- オフライン動作未対応

---

開発を継続する準備ができました！優先順位に従って実装を進めてください。
