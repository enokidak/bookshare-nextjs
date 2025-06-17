# BookShare - 職場の本貸し借りサービス

職場内での本の貸し借りを簡単に管理するWebアプリケーションです。

## 機能

- ユーザー登録・認証
- 本の登録・管理
- 本の検索・借用
- 借用履歴の管理
- 返却処理

## 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: SQLite (開発環境), Prisma ORM
- **認証**: NextAuth.js
- **デプロイ**: Azure Container Apps

## 開発環境のセットアップ

### 前提条件

- Node.js 20.x 以上
- npm

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd nextjs-demo
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定

**ローカル開発（SQLite）の場合:**
```bash
# .envファイルは既に存在し、ローカル開発用に設定されています
# 内容を確認・編集する場合:
cat .env
# DATABASE_URL="file:./dev.db" (SQLite)
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"
```

**Docker環境（PostgreSQL）の場合:**
```bash
# docker-compose.ymlで自動設定されるため手動設定不要
# 設定を変更したい場合はdocker-compose.yml内の環境変数を編集
```

4. データベースの初期化
```bash
npm run db:generate
npm run db:push
```

5. 開発サーバーを起動
```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてアプリケーションにアクセスできます。

### データベース管理

- `npm run db:generate` - Prismaクライアントを生成
- `npm run db:push` - スキーマをデータベースにプッシュ
- `npm run db:migrate` - マイグレーションを作成・実行（開発用）
- `npm run db:migrate:deploy` - マイグレーションを実行（本番用）
- `npm run db:reset` - データベースをリセット

### テスト

現在のテストスクリプト:
- `npm run test` - テストフレームワーク設定が必要
- `npm run test:watch` - テスト監視モード（設定後）
- `npm run test:coverage` - カバレッジレポート（設定後）

テスト環境のセットアップについては `docs/testing-guide.md` を参照してください。

### 環境の違い

- **ローカル開発（従来）**: SQLite データベース (`prisma/dev.db`)
- **Docker環境**: PostgreSQL データベース（docker-compose.yml）
- **本番環境**: PostgreSQL データベース（環境変数で設定）

5. 開発サーバーを起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で確認できます。

### Docker Composeでの起動（推奨）

PostgreSQLと併せて起動する場合：

```bash
# PostgreSQLコンテナとアプリケーションを一緒に起動
docker-compose up --build

# バックグラウンドで実行
docker-compose up -d --build
```

アプリケーションは http://localhost:3000 で確認でき、PostgreSQLデータベースが自動的に設定されます。

## 本番環境デプロイ

### Azure Container Appsへのデプロイ（推奨）

このアプリケーションはAzure Container Appsでの運用に最適化されており、Azure Developer CLI (azd) を使用して簡単にデプロイできます。

#### 前提条件

- Azure CLI がインストールされていること
  ```bash
  # Azure CLI のインストール確認
  az --version
  
  # インストールされていない場合
  # macOS: brew install azure-cli
  # Windows: winget install Microsoft.AzureCLI
  ```

- Azure Developer CLI (azd) がインストールされていること
  ```bash
  # azd のインストール確認
  azd version
  
  # インストールされていない場合
  # macOS: brew install azure-dev
  # Windows: winget install Microsoft.Azd
  ```

- Azureにログインしていること
  ```bash
  # Azure にログイン
  az login
  azd auth login
  ```

#### デプロイ手順

1. **Azure Developer CLIでの初期化**
```bash
# プロジェクトのルートディレクトリで実行
azd init --environment <環境名>
# 例: azd init --environment bookshare
```

2. **必要な環境変数の設定**
```bash
# サブスクリプションIDを設定
azd env set AZURE_SUBSCRIPTION_ID <your-subscription-id>

# リージョンを設定（例：Japan East）
azd env set AZURE_LOCATION japaneast

# NextAuth用のシークレットキーを設定（32文字以上のランダム文字列）
azd env set NEXTAUTH_SECRET <your-secure-random-string>
```

3. **インフラストラクチャのプロビジョニングとアプリのデプロイ**
```bash
# インフラ作成とアプリデプロイを一括実行
azd up
```

4. **デプロイ後の確認**
```bash
# アプリケーションのURLを取得
azd show

# アプリケーションのログを確認
azd logs

# Health APIでアプリの状態を確認
curl https://<your-app-url>/api/health
```

#### 手動でのデプロイ手順（上級者向け）

Azure CLIを使用した手動デプロイも可能です：

```bash
# 1. リソースグループの作成
az group create --name rg-bookshare-prod --location japaneast

# 2. インフラストラクチャのデプロイ
az deployment group create \
  --resource-group rg-bookshare-prod \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json

# 3. Container Registryへのログイン
az acr login --name <your-registry-name>

# 4. Dockerイメージのビルドとプッシュ
docker build -t <your-registry>.azurecr.io/bookshare:latest .
docker push <your-registry>.azurecr.io/bookshare:latest

# 5. Container Appの更新
az containerapp update \
  --name bookshare-app \
  --resource-group rg-bookshare-prod \
  --image <your-registry>.azurecr.io/bookshare:latest
```

#### 環境変数の設定

本番環境では以下の環境変数が必要です：

| 変数名 | 説明 | 設定方法 | 例 |
|--------|------|----------|-----|
| `NEXTAUTH_SECRET` | NextAuth.jsの認証用シークレット | `azd env set` | 32文字以上のランダム文字列 |
| `NEXTAUTH_URL` | アプリケーションのベースURL | 自動生成 | `https://ca-bookshare-app-xxx.japaneast.azurecontainerapps.io` |
| `DATABASE_URL` | PostgreSQLデータベースの接続文字列 | PostgreSQL Add-onで自動設定 | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Node.js環境 | 自動設定 | `production` |
| `AZURE_CONTAINER_REGISTRY_ENDPOINT` | Container Registry エンドポイント | azd で自動設定 | `cr<name>.azurecr.io` |

#### トラブルシューティング

**よくある問題と解決方法：**

1. **`azd up` でエラーが発生する場合**
```bash
# 詳細ログでエラー内容を確認
azd up --debug

# 環境をリセットして再試行
azd env reset
azd up
```

2. **データベース接続エラーが発生する場合**
```bash
# PostgreSQL Add-onの状態を確認
az containerapp env show \
  --name <container-apps-environment-name> \
  --resource-group <resource-group-name>

# データベースマイグレーションを再実行
azd exec --service bookshare-app -- npx prisma migrate deploy
```

3. **環境変数が正しく設定されているか確認**
```bash
# 設定された環境変数を表示
azd env get-values

# Container Appの環境変数を確認
az containerapp show \
  --name bookshare-app \
  --resource-group <resource-group-name> \
  --query "properties.configuration.secrets"
```

### 従来のAzure CLIでのデプロイ

```bash
# Azure CLIでログイン
az login

# リソースグループを作成
az group create --name bookshare-rg --location japaneast

# Bicepテンプレートでインフラストラクチャをデプロイ
az deployment group create \
  --resource-group bookshare-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json
```

### Docker での実行

1. Dockerイメージをビルド
```bash
docker build -t bookshare .
```

2. コンテナを実行
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  bookshare
```

## Azure Container Apps PostgreSQL Add-onの設定

このプロジェクトはAzure Container AppsのPostgreSQL Add-on（プレビュー）を使用してデータベースを提供します。

### 自動セットアップ（推奨）

`azd up`コマンドを実行すると、以下が自動的に実行されます：

1. Bicepテンプレートでインフラストラクチャをプロビジョニング
2. PostgreSQL Add-onの作成とセットアップ（`scripts/setup-postgres-addon.sh`）
3. Key Vaultでのデータベース接続文字列の更新
4. Container Appsでのapplication bindings設定
5. アプリケーションのデプロイ

```bash
# 環境変数を設定してデプロイ実行
azd env set NEXTAUTH_SECRET "your-super-secret-key-change-in-production-make-it-long-and-random"
azd up
```

### 手動セットアップ（必要な場合）

既存の環境でPostgreSQL Add-onを追加する場合：

```bash
# PostgreSQL Add-onセットアップスクリプトを実行
./scripts/setup-postgres-addon.sh

# Container AppsでPostgreSQL Add-onをバインド
az containerapp update \
  --name <container-app-name> \
  --resource-group <resource-group> \
  --bind postgres-addon

# アプリケーションを再デプロイ
azd deploy
```

### PostgreSQL Add-onの特徴

- **マネージドサービス**: バックアップ、ハイアベイラビリティ、セキュリティパッチが自動管理
- **自動バインディング**: Container Appsアプリケーションと自動的に連携
- **スケーラビリティ**: アプリケーションの需要に応じて自動スケール
- **セキュリティ**: VNet統合とプライベートエンドポイント対応

### 接続情報の確認

```bash
# PostgreSQL Add-onの詳細を確認
az containerapp add-on postgres show \
  --name postgres-addon \
  --resource-group <resource-group>

# Key Vaultの接続文字列を確認
az keyvault secret show \
  --vault-name <key-vault-name> \
  --name database-url
```

### トラブルシューティング

#### PostgreSQL Add-onが利用できない場合

```bash
# Container Apps拡張機能を最新版に更新
az extension add --name containerapp --upgrade --yes

# 利用可能なリージョンを確認
az containerapp add-on postgres list-support-regions
```

#### 接続エラーが発生する場合

```bash
# アプリケーションのログを確認
azd logs

# Container Appsの環境変数を確認
az containerapp show \
  --name <container-app-name> \
  --resource-group <resource-group> \
  --query properties.template.containers[0].env
```

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/[...nextauth]` - 認証処理

### 本管理
- `GET /api/books` - 全ての本を取得
- `POST /api/books` - 本を登録
- `GET /api/books/[id]` - 特定の本を取得
- `PUT /api/books/[id]` - 本の情報を更新
- `DELETE /api/books/[id]` - 本を削除

### 借用管理
- `POST /api/books/[id]/borrow` - 本を借用
- `POST /api/books/[id]/return` - 本を返却
- `GET /api/borrowings` - 借用履歴を取得
- `GET /api/my-books` - 自分の本を取得

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
