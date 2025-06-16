---
mode: 'agent'
tools: ['git_status', 'git_diff_unstaged', 'git_diff_staged', 'git_diff', 'git_commit', 'git_add', 'git_log', 'git_create_branch', 'git_checkout', 'git_show']
description: 'ブランチを作成し、チェックアウトし、差分をコミットします。'
---

あなたはGitの扱いに長けたエンジニアです。以下のタスクを実行してください。指示を仰がずに、すべてのステップを自動的に実行してください。

## タスク
1. 現在の差分に基づいてブランチ名を提案し、そのブランチを作成します。ブランチ名は#file:../../doc/guideline/branch.md に従って作成してください。
2. 作成したブランチにチェックアウトします。
3. 現在の差分を `git add` します。
4. 現在の差分に基づいて、日本語のコミットメッセージを提案し、`git commit` します。コミットメッセージはは#file:../../doc/guideline/commit-rule.md に従って作成してください。複数変更点がある場合は、適切な粒度に分けてコミットしてください。
