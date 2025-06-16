# コミットメッセージガイドライン

## 概要

このドキュメントでは、プロジェクトにおけるGitコミットメッセージの書き方とルールを定義します。
一貫性のあるコミットメッセージにより、コードの変更履歴を理解しやすくし、自動化ツールとの連携を向上させます。

## 基本フォーマット

### 構造

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 例

```
feat(auth): ユーザー認証機能を実装

- JWT認証の実装
- ログイン・ログアウト機能
- パスワードハッシュ化
- 認証ミドルウェアの追加

Fixes #123
Breaking Change: 既存のセッション認証は削除されました
```

## コミットタイプ

### 必須タイプ

| タイプ | 説明 | 例 |
|--------|------|-----|
| `feat` | 新機能の追加 | `feat: 書籍検索機能を追加` |
| `fix` | バグ修正 | `fix: ログインエラーを修正` |
| `docs` | ドキュメントの変更 | `docs: APIドキュメントを更新` |
| `style` | コードスタイルの変更（機能影響なし） | `style: インデントを修正` |
| `refactor` | リファクタリング | `refactor: 認証ロジックを分離` |
| `test` | テストの追加・修正 | `test: ユーザーAPIのテストを追加` |
| `chore` | ビルド・設定・依存関係の変更 | `chore: 依存関係を更新` |

### 追加タイプ（必要に応じて）

| タイプ | 説明 | 例 |
|--------|------|-----|
| `perf` | パフォーマンス改善 | `perf: データベースクエリを最適化` |
| `ci` | CI/CD設定の変更 | `ci: GitHub Actionsワークフローを更新` |
| `build` | ビルドシステムの変更 | `build: Webpackの設定を更新` |
| `revert` | 以前のコミットの取り消し | `revert: feat(auth): ユーザー認証機能を実装` |

## スコープ（Scope）

### 定義

スコープは変更が影響する範囲を示します（オプション）。

### このプロジェクトのスコープ例

| スコープ | 説明 |
|----------|------|
| `auth` | 認証・認可関連 |
| `books` | 書籍管理機能 |
| `ui` | ユーザーインターフェース |
| `api` | APIエンドポイント |
| `db` | データベース関連 |
| `config` | 設定ファイル |
| `deps` | 依存関係 |

### 使用例

```
feat(auth): JWT認証を実装
fix(books): 書籍検索のバグを修正
docs(api): エンドポイント仕様を更新
chore(deps): Next.jsを14.2.0に更新
```

## 件名（Subject）

### ルール

1. **50文字以内**で簡潔に記述
2. **命令形**で記述（「〜を追加」「〜を修正」）
3. **文末にピリオドを付けない**
4. **最初の文字は小文字**（英語の場合）
5. **何を変更したかを明確に**記述

### ✅ 良い例

```
feat: ユーザー登録機能を追加
fix: ログインフォームのバリデーションエラーを修正
docs: README.mdにセットアップ手順を追加
refactor: 共通コンポーネントを分離
test: 書籍APIのエンドツーエンドテストを実装
```

### ❌ 悪い例

```
update stuff           # 具体性がない
Fix bugs.             # ピリオドが不要、複数形は避ける
added new feature     # 過去形ではなく命令形
WIP                   # 意味不明な略語
修正しました。         # 丁寧語は避ける
```

## 本文（Body）

### 使用するタイミング

- 変更内容が複雑な場合
- なぜその変更が必要かを説明する場合
- 複数の変更を含む場合

### ルール

1. **件名から1行空けて**記述
2. **72文字で改行**
3. **箇条書きを活用**
4. **「何を」「なぜ」を説明**（「どうやって」は避ける）

### 例

```
feat(books): 高度な書籍検索機能を実装

- タイトル、著者、ISBNでの検索
- カテゴリーとタグによるフィルタリング
- 検索結果のソート機能（タイトル、発行日、評価順）
- 検索履歴の保存

ユーザーが効率的に書籍を見つけられるようにするため。
既存の基本検索では、大量の書籍データから目的の本を
見つけることが困難でした。
```

## フッター（Footer）

### 関連Issue・PR

```
Fixes #123
Closes #456
Refs #789
```

### Breaking Changes

```
BREAKING CHANGE: 
既存のユーザーAPIのレスポンス形式が変更されました。
`user_id`フィールドは`id`に名前変更されています。

移行方法:
- `user_id` → `id` に変更
- `user_name` → `name` に変更
```

### Co-authored-by

```
Co-authored-by: 田中太郎 <tanaka@example.com>
Co-authored-by: 佐藤花子 <sato@example.com>
```

## 具体例

### 新機能

```
feat(auth): OAuth2.0による外部認証を実装

- Google OAuth認証の追加
- GitHub OAuth認証の追加
- 既存のメール認証との併用
- プロファイル情報の自動取得

ユーザーの登録・ログイン体験を向上させるため。
メール認証のみでは利用開始までのハードルが高く、
ユーザー離脱の原因となっていました。

Fixes #234
```

### バグ修正

```
fix(books): 貸出中書籍の重複表示を修正

書籍一覧で同じ書籍が複数回表示される問題を解決。
データベースクエリでDISTINCTを使用し、
重複するレコードを除外。

Fixes #456
```

### リファクタリング

```
refactor(api): 認証ミドルウェアを共通化

- 各エンドポイントの重複した認証ロジックを統合
- middleware/auth.tsに共通処理を移動
- JWT検証とエラーハンドリングを統一

コードの保守性向上とバグ修正の効率化のため。
```

### ドキュメント

```
docs: 開発環境セットアップガイドを追加

- 必要な環境（Node.js、Docker）
- 依存関係のインストール手順
- 開発サーバーの起動方法
- データベースの初期化手順

新しいチームメンバーのオンボーディング支援のため。
```

### 設定変更

```
chore(deps): セキュリティ脆弱性の解決

- express: 4.18.2 → 4.19.2
- jsonwebtoken: 8.5.1 → 9.0.2
- prisma: 5.0.0 → 5.1.1

npm audit で検出された高リスク脆弱性の修正。
```

## コミット頻度

### 推奨パターン

1. **機能単位でコミット**
   ```
   feat(auth): ログイン機能を実装
   feat(auth): ログアウト機能を実装
   feat(auth): パスワードリセット機能を実装
   ```

2. **段階的な実装**
   ```
   feat(books): 書籍エンティティを作成
   feat(books): 書籍CRUDのAPIを実装
   feat(books): 書籍一覧画面を作成
   feat(books): 書籍詳細画面を作成
   ```

### 避けるべきパターン

```
❌ WIP: 途中作業
❌ fix: いろいろ修正
❌ update: コードを更新
❌ feat: 全部の機能を実装
```

## 自動化ツール

### VS Code設定

`.vscode/settings.json`に追加:

```json
{
  "git.inputValidation": true,
  "git.inputValidationLength": 72,
  "git.inputValidationSubjectLength": 50,
  "git.enableSmartCommit": true,
  "git.confirmSync": false
}
```

### VS Code Integration (English)

To enforce these rules in VS Code, add the following to your `.vscode/settings.json`:

```json
{
  "git.inputValidation": true,
  "git.inputValidationLength": 72,
  "git.inputValidationSubjectLength": 50,
  "git.enableSmartCommit": true,
  "git.confirmSync": false
}
```


### Pre-commit Hook Example (English)

Create `.githooks/commit-msg` to validate commit messages:

```bash
#!/bin/sh
# Check commit message format
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}$'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Format: type(scope): description"
    echo "Example: feat(auth): add user login functionality"
    exit 1
fi
```

### Conventional Commits

このガイドラインは[Conventional Commits](https://www.conventionalcommits.org/)に準拠しています。

## チェックリスト

### コミット前チェック

- [ ] コミットタイプが適切か
- [ ] 件名が50文字以内か
- [ ] 命令形で書かれているか
- [ ] 具体的な変更内容が分かるか
- [ ] 関連するIssue番号が含まれているか

### 複数ファイル変更時

- [ ] 論理的に関連する変更か
- [ ] 異なる種類の変更が混在していないか
- [ ] 必要に応じて複数のコミットに分割したか

### プッシュ前チェック

- [ ] コミット履歴が整理されているか
- [ ] WIPやテスト用のコミットが含まれていないか
- [ ] 各コミットが独立して動作するか

## よくある質問

### Q: WIPコミットはどうすればよい？

A: 作業中は一時的にWIPコミットを作成し、Push前に`git rebase -i`で整理してください。

```bash
# 作業中
git commit -m "WIP: 認証機能実装中"

# プッシュ前に修正
git rebase -i HEAD~3
# WIPコミットを適切なメッセージに変更
```

### Q: 複数のIssueにまたがる変更の場合は？

A: 可能な限り機能単位でコミットを分割し、それぞれに関連するIssue番号を記載してください。

```
feat(auth): ログイン機能を実装

Fixes #123

feat(auth): パスワードリセット機能を実装

Fixes #124
```

### Q: 緊急修正の場合のコミットメッセージは？

A: 通常通りのルールに従い、緊急である旨を本文に記載してください。

```
fix(auth): セキュリティ脆弱性を修正

SQLインジェクション攻撃の可能性があるクエリを修正。
緊急対応のため、即座にデプロイが必要。

Fixes #999
```

## English Version / 英語版

### Basic Rules
1. **Subject Line**
   - Keep it under 50 characters
   - Start with a verb (Add, Fix, Update, Remove, etc.)
   - Do not end with a period
   - Use imperative mood

2. **Body**
   - Leave a blank line after the subject
   - Wrap at 72 characters
   - Explain what and why, not how
   - Use bullet points for multiple changes

3. **Footer**
   - Reference related issue numbers or PR numbers
   - Note any breaking changes

### Commit Types
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (no functional impact)
- `refactor:` Code refactoring
- `test:` Adding or modifying tests
- `chore:` Build process or tool changes

### Example
```
feat: Add user authentication system

- Implement JWT-based authentication
- Add login and logout functionality
- Create protected routes middleware
- Add password hashing with bcrypt

Fixes #123
```

### Best Practices

#### ✅ Good Examples
```
feat: Add password reset functionality
fix: Resolve memory leak in image processing
docs: Update API documentation for v2.0
refactor: Extract utility functions to separate module
test: Add integration tests for user API
```

#### ❌ Bad Examples
```
fix stuff                 # Not specific enough
update code              # Too vague
changes                  # Meaningless
WIP                      # Unclear abbreviation
Fix bugs.               # Don't use period, avoid plural
added new feature       # Use imperative mood, not past tense
```

#### Best Practices Rules

1. **Be specific**: Instead of "fix bug", write "fix login validation error"
2. **Use present tense**: "Add feature" not "Added feature"
3. **Explain why**: Not just what you changed, but why
4. **Keep changes atomic**: One logical change per commit
5. **Review before committing**: Check your message for clarity