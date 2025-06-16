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
```bash
# .envファイルは既に存在し、ローカル開発用に設定されています
# DATABASE_URL="file:./dev.db" (SQLite)
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

### Azure Container Apps へのデプロイ

1. Azure CLIでログイン
```bash
az login
```

2. リソースグループを作成
```bash
az group create --name bookshare-rg --location japaneast
```

3. Bicepテンプレートでインフラストラクチャをデプロイ
```bash
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
  -e DATABASE_URL="file:./dev.db" \
  -e NEXTAUTH_SECRET="your-secret-key" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  bookshare
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
