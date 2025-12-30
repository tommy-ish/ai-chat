# GitHub Actions デプロイ設定手順

このドキュメントでは、GitHub ActionsでGoogle Cloud Runへの自動デプロイを設定する手順を説明します。

## 前提条件

- GitHubリポジトリが作成されている
- Google Cloud プロジェクトが設定されている（ai-chat-482714）
- サービスアカウントとキーが生成されている

## 1. GitHub Secretsの設定

GitHubリポジトリに以下のSecretsを追加する必要があります。

### 手順

1. GitHubリポジトリページにアクセス
2. **Settings** > **Secrets and variables** > **Actions** をクリック
3. **New repository secret** をクリックして以下を追加：

#### 必要なSecrets

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `GCP_SA_KEY` | サービスアカウントキーのJSON全体 | Google Cloud認証用 |
| `DATABASE_URL` | MongoDB接続文字列 | MongoDB Atlas接続 |
| `ANTHROPIC_API_KEY` | Claude APIキー | Anthropic API認証 |

### GCP_SA_KEY の設定方法

1. ターミナルで以下を実行してキーの内容を表示：
   ```bash
   cat ~/gcp-sa-key.json
   ```

2. 出力された **JSON全体** をコピー（`{` から `}` まで）

3. GitHubのSecretsに `GCP_SA_KEY` として貼り付け

### DATABASE_URL の設定方法

1. `.env` ファイルから `DATABASE_URL` の値をコピー
2. GitHubのSecretsに `DATABASE_URL` として貼り付け

### ANTHROPIC_API_KEY の設定方法

1. `.env` ファイルから `ANTHROPIC_API_KEY` の値をコピー
2. GitHubのSecretsに `ANTHROPIC_API_KEY` として貼り付け

## 2. ワークフローの動作

### 自動デプロイのトリガー

以下の場合に自動的にデプロイが実行されます：

- `main` ブランチへのpush
- GitHub Actionsページから手動実行（workflow_dispatch）

### デプロイの流れ

1. **コードチェックアウト**: リポジトリのコードを取得
2. **Google Cloud認証**: サービスアカウントで認証
3. **Docker設定**: Artifact Registry用にDockerを設定
4. **イメージビルド**: Cloud Buildでイメージをビルド
5. **Cloud Runデプロイ**: 新しいイメージをデプロイ
6. **デプロイ情報表示**: URLと詳細を表示

### デプロイ時間

通常、ビルドからデプロイまで **4〜6分** かかります。

## 3. デプロイの確認方法

### GitHub Actionsページで確認

1. GitHubリポジトリの **Actions** タブをクリック
2. 最新のワークフロー実行をクリック
3. 各ステップのログを確認

### デプロイ成功の確認

ワークフローが成功すると：
- ✅ 緑色のチェックマークが表示される
- 最後のステップにサービスURLが表示される
- Cloud Runに新しいリビジョンがデプロイされる

### デプロイ失敗時

失敗した場合：
- ❌ 赤いバツマークが表示される
- エラーログを確認してトラブルシューティング
- Secretsが正しく設定されているか確認

## 4. セキュリティ注意事項

### サービスアカウントキーの管理

⚠️ **重要**: サービスアカウントキー（`~/gcp-sa-key.json`）は機密情報です。

- **絶対にGitにコミットしない**
- **公開しない**
- 使用後は安全に保管または削除
- 定期的にローテーション（90日ごと推奨）

### キーの削除方法

使用後、ローカルのキーファイルを削除：

```bash
rm ~/gcp-sa-key.json
```

### キーのローテーション

古いキーを無効化して新しいキーを生成：

```bash
# 古いキーを無効化（KEY_IDは gcloud iam service-accounts keys list で確認）
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=github-actions-deployer@ai-chat-482714.iam.gserviceaccount.com

# 新しいキーを生成
gcloud iam service-accounts keys create ~/gcp-sa-key-new.json \
  --iam-account=github-actions-deployer@ai-chat-482714.iam.gserviceaccount.com
```

その後、GitHub SecretsのGCP_SA_KEYを更新してください。

## 5. トラブルシューティング

### よくあるエラー

#### 認証エラー

```
Error: google-github-actions/auth failed with: retry function failed after 1 attempt(s)
```

**解決方法**: GCP_SA_KEYが正しく設定されているか確認

#### 権限エラー

```
Error: Permission denied on resource
```

**解決方法**: サービスアカウントに必要な権限が付与されているか確認

#### ビルドエラー

```
Error: failed to build
```

**解決方法**: cloudbuild.yamlとDockerfileが正しいか確認

### デバッグ方法

1. GitHub Actionsのログを詳細に確認
2. ローカルで `make deploy` が成功するか確認
3. Google Cloud Consoleでサービスアカウントの権限を確認
4. Cloud Build履歴でエラー詳細を確認

## 6. 手動デプロイ方法

GitHub Actionsを使わず手動でデプロイする場合：

```bash
# Makefileを使用
make deploy

# または直接gcloudコマンド
gcloud builds submit --config=cloudbuild.yaml .
gcloud run deploy ai-chat --image asia-northeast1-docker.pkg.dev/ai-chat-482714/ai-chat-repo/ai-chat:latest ...
```

## 7. 参考リンク

- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Google Cloud Run documentation](https://cloud.google.com/run/docs)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) (より安全な認証方法)

---

## まとめ

これでGitHub Actionsを使った自動デプロイが設定されました。

- `main` ブランチにpushすると自動的にデプロイされます
- デプロイ状況はGitHub Actionsタブで確認できます
- 環境変数は安全にGitHub Secretsで管理されます

何か問題が発生した場合は、このドキュメントのトラブルシューティングセクションを参照してください。
