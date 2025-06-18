# BookShare - データベース切り替えガイド

このプロジェクトでは、開発環境と本番環境で異なるデータベースを使用できるように設定されています。

## データベース切り替え機能

### サポートされているデータベース

- **SQLite** - 開発環境のデフォルト、ファイルベース（`dev.db`）
- **PostgreSQL** - 本番環境推奨、Docker Compose で簡単にセットアップ可能

### データベースの切り替え方法

#### SQLite に切り替え

```bash
npm run db:sqlite
```

#### PostgreSQL に切り替え

```bash
npm run db:postgresql
```

### セットアップ手順

#### 1. 初回セットアップ

```bash
# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp .env.template .env.local

# SQLiteに切り替え（デフォルト）
npm run db:sqlite

# Prismaクライアントを生成
npm run db:generate

# データベーススキーマを作成
npm run db:push
```

#### 2. PostgreSQL を使用する場合

```bash
# PostgreSQLに切り替え
npm run db:postgresql

# .env.localファイルでDATABASE_URLを更新
# DATABASE_URL="postgresql://username:password@localhost:5432/bookshare"

# Docker Composeでローカル PostgreSQL を起動（オプション）
docker-compose up -d postgres

# Prismaクライアントを生成
npm run db:generate

# データベーススキーマを作成
npm run db:push
```

### Docker Compose 設定

PostgreSQL をローカルで簡単に起動するための Docker Compose 設定が含まれています：

```bash
# PostgreSQLのみ起動
docker-compose up -d postgres

# アプリケーション全体を起動
docker-compose up -d
```

デフォルトの PostgreSQL 設定：

- ホスト: localhost
- ポート: 5432
- データベース名: bookshare
- ユーザー名: bookshare_user
- パスワード: bookshare_password

### 環境変数

#### SQLite 設定例

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

#### PostgreSQL 設定例

```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://bookshare_user:bookshare_password@localhost:5432/bookshare"
```

### トラブルシューティング

#### SSL 証明書エラーが発生する場合

```bash
# 一時的にSSL証明書チェックを無効化
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run db:generate
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run build
```

#### データベース接続エラーが発生する場合

1. `.env.local`の`DATABASE_URL`が正しく設定されているか確認
2. PostgreSQL の場合、サービスが起動しているか確認
3. ファイアウォール設定を確認

### 開発ワークフロー

```bash
# 開発サーバーを起動
npm run dev

# データベーススキーマの変更後
npm run db:push      # 開発環境
npm run db:migrate   # 本番環境

# データベースをリセット
npm run db:reset

# Prismaクライアントを再生成
npm run db:generate
```

### ファイル構成

```
prisma/
├── schema.prisma          # 現在アクティブなスキーマ
├── schema.sqlite.prisma   # SQLite用スキーマ
├── schema.postgresql.prisma # PostgreSQL用スキーマ
└── dev.db                # SQLiteデータベースファイル（自動生成）

scripts/
└── switch-db.js          # データベース切り替えスクリプト

.env.template              # 環境変数テンプレート
.env.local                # ローカル環境変数（Git未追跡）
```

### 本番環境へのデプロイ

本番環境では通常 PostgreSQL を使用します：

1. PostgreSQL に切り替え：`npm run db:postgresql`
2. `.env.local`で本番データベースの URL を設定
3. マイグレーションを実行：`npm run db:migrate:deploy`
4. アプリケーションをビルド：`npm run build`
5. アプリケーションを起動：`npm start`
