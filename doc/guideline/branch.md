# ブランチ運用ガイドライン

## 概要

このドキュメントでは、プロジェクトにおけるGitブランチの命名規則と運用ルールを定義します。

## ブランチ戦略

### Git Flow ベースの運用

```
main
├── develop
│   ├── feature/user-auth
│   ├── feature/book-management
│   └── feature/ui-improvements
├── release/v1.0.0
└── hotfix/login-bug-fix
```

## ブランチの種類

### 1. メインブランチ

#### `main`
- **用途**: 本番環境へのデプロイ可能な安定版コード
- **保護**: 直接pushは禁止、Pull Requestのみ
- **マージ条件**: コードレビュー完了 + CI/CDテスト通過

#### `develop`
- **用途**: 開発中の最新コード統合
- **保護**: 直接pushは禁止、Pull Requestのみ
- **マージ条件**: コードレビュー完了 + テスト通過

### 2. 作業ブランチ

#### `feature/*`
- **用途**: 新機能開発
- **命名規則**: `feature/機能名` または `feature/issue番号-機能名`
- **派生元**: `develop`
- **マージ先**: `develop`

**例:**
```
feature/user-authentication
feature/123-book-search
feature/payment-integration
```

#### `bugfix/*`
- **用途**: バグ修正（非緊急）
- **命名規則**: `bugfix/バグ名` または `bugfix/issue番号-バグ名`
- **派生元**: `develop`
- **マージ先**: `develop`

**例:**
```
bugfix/login-validation
bugfix/456-search-performance
bugfix/ui-responsive-issue
```

#### `hotfix/*`
- **用途**: 本番環境の緊急バグ修正
- **命名規則**: `hotfix/バグ名` または `hotfix/issue番号-バグ名`
- **派生元**: `main`
- **マージ先**: `main` および `develop`

**例:**
```
hotfix/security-vulnerability
hotfix/789-payment-error
hotfix/database-connection
```

#### `release/*`
- **用途**: リリース準備
- **命名規則**: `release/vX.Y.Z`
- **派生元**: `develop`
- **マージ先**: `main` および `develop`

**例:**
```
release/v1.0.0
release/v2.1.0
release/v1.2.3
```

### 3. その他のブランチ

#### `docs/*`
- **用途**: ドキュメント更新
- **命名規則**: `docs/ドキュメント名`
- **派生元**: `develop`
- **マージ先**: `develop`

#### `chore/*`
- **用途**: ビルド、設定、依存関係の更新
- **命名規則**: `chore/作業内容`
- **派生元**: `develop`
- **マージ先**: `develop`

## 命名規則

### 基本ルール

1. **小文字とハイフンを使用**
   ```
   ✅ feature/user-auth
   ❌ feature/UserAuth
   ❌ feature/user_auth
   ```

2. **簡潔で分かりやすい名前**
   ```
   ✅ feature/book-search
   ❌ feature/implement-book-search-functionality-with-filters
   ```

3. **Issue番号を含める（推奨）**
   ```
   ✅ feature/123-user-profile
   ✅ bugfix/456-login-error
   ```

4. **特殊文字は避ける**
   ```
   ✅ feature/api-integration
   ❌ feature/api@integration
   ❌ feature/api integration
   ```

### 禁止されるブランチ名

- `master` (mainを使用)
- `temp`, `test`, `tmp`
- 数字のみ
- 特殊文字を含むもの

## ブランチ操作ガイド

### 1. ブランチ作成

```bash
# developから新しいfeatureブランチを作成
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# Issue番号付きの場合
git checkout -b feature/123-book-management
```

### 2. 作業中の更新

```bash
# 定期的にdevelopから更新を取得
git checkout develop
git pull origin develop
git checkout feature/your-branch
git merge develop
```

### 3. プッシュとPull Request

```bash
# 最初のプッシュ
git push -u origin feature/your-branch

# Pull Request作成後の更新
git push origin feature/your-branch
```

### 4. マージ後の削除

```bash
# リモートブランチの削除（GitHub上で自動削除推奨）
git push origin --delete feature/your-branch

# ローカルブランチの削除
git branch -d feature/your-branch
```

## ブランチ保護ルール

### `main` ブランチ

- [ ] 直接pushを禁止
- [ ] Pull Requestレビューを必須（最低1名）
- [ ] ステータスチェック必須
  - [ ] CI/CDテスト通過
  - [ ] コードカバレッジ基準達成
- [ ] 最新コミットでのレビュー必須
- [ ] 管理者も同じルールに従う

### `develop` ブランチ

- [ ] 直接pushを禁止
- [ ] Pull Requestレビューを必須（最低1名）
- [ ] ステータスチェック必須
  - [ ] CI/CDテスト通過

## 運用フロー

### 新機能開発

1. `develop`から`feature/*`ブランチを作成
2. 機能開発とテスト
3. `develop`へのPull Request作成
4. コードレビューとCI/CD通過後マージ
5. ブランチ削除

### リリース

1. `develop`から`release/*`ブランチを作成
2. リリース準備（バージョン更新、最終テスト）
3. `main`へのPull Request作成
4. マージ後、タグ作成
5. `develop`へもマージ（リリース準備の変更を反映）

### 緊急修正

1. `main`から`hotfix/*`ブランチを作成
2. 修正とテスト
3. `main`への緊急マージ
4. `develop`へもマージ
5. 必要に応じてリリースタグ作成

## ベストプラクティス

### ✅ 推奨

- Issue番号をブランチ名に含める
- 定期的に親ブランチから更新を取得
- 小さな単位でコミット
- 明確なPull Request説明
- レビュー指摘事項への迅速な対応

### ❌ 非推奨

- 長期間の作業ブランチ
- 複数機能の同時開発
- 直接メインブランチへのpush
- レビューなしでのマージ
- 不明確なブランチ名

## トラブルシューティング

### よくある問題と解決方法

#### 1. マージコンフリクト

```bash
# developから最新を取得してマージ
git checkout develop
git pull origin develop
git checkout feature/your-branch
git merge develop
# コンフリクト解決後
git add .
git commit -m "resolve merge conflicts"
```

#### 2. 間違ったブランチでの作業

```bash
# 変更を一時保存
git stash
# 正しいブランチに移動
git checkout correct-branch
# 変更を復元
git stash pop
```

#### 3. ブランチ名の変更

```bash
# ローカルブランチ名変更
git branch -m old-name new-name
# リモートの古いブランチ削除
git push origin --delete old-name
# 新しい名前でプッシュ
git push -u origin new-name
```

## チェックリスト

### ブランチ作成時

- [ ] 適切な命名規則に従っている
- [ ] 正しい親ブランチから作成している
- [ ] Issue番号が含まれている（該当する場合）

### Pull Request作成時

- [ ] 明確なタイトルと説明
- [ ] 関連するIssueが紐付けられている
- [ ] 適切なレビュアーが指定されている
- [ ] CI/CDテストが通過している

### マージ前

- [ ] コードレビューが完了している
- [ ] すべてのチェックが通過している
- [ ] コンフリクトが解決されている
- [ ] 最新のコミットがレビューされている