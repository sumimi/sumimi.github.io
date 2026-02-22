# 🚀 Sumimi's Projects Hub

ゆるい開発と学習の記録。Modern C++を中心に、学習目的で作成したプロジェクトを公開しています。
誰かの参考になれば嬉しいです。

![GitHub Repo stars](https://img.shields.io/github/stars/sumimi/sumimi.github.io?style=social)
![GitHub forks](https://img.shields.io/github/forks/sumimi/sumimi.github.io?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/sumimi/sumimi.github.io)
![GitHub license](https://img.shields.io/github/license/sumimi/sumimi.github.io)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://sumimi.github.io/)

---

## 📋 概要

このハブサイトは、以下の機能を提供します：

- **自動メタデータ収集**: GitHub Actions で各プロジェクトの README.md からメタデータを自動収集
- **プロジェクト一覧表示**: 番号順・Stars順・更新日順でソート可能
- **検索・フィルタ**: タイトル、説明、タグで検索、カテゴリ・難易度でフィルタ
- **統計情報**: プロジェクト数、カテゴリ数、総Stars数を自動集計

---

## 🏗️ 構成

```
sumimi.github.io/
├── index.html              # メインページ
├── projects.json           # プロジェクトメタデータ（自動生成）
├── projects-list.txt       # 収集対象リポジトリリスト
├── .github/
│   └── workflows/
│       └── update-projects.yml  # メタデータ自動更新
├── scripts/
│   └── fetch-metadata.py   # メタデータ収集スクリプト
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

---

## 🚀 セットアップ

### 前提条件

- Git がインストールされていること
- Python 3.7 以上がインストールされていること
- GitHubアカウントを持っていること

### 1. 依存関係のインストール

Python パッケージをインストールします：

```bash
pip install requests pyyaml
```

### 2. リポジトリをGitHubにプッシュ

```bash
cd /path/to/sumimi.github.io
git add .
git commit -m "Initial commit: Hub site setup"
git remote add origin https://github.com/sumimi/sumimi.github.io.git
git branch -M main
git push -u origin main
```

### 3. GitHub Pages を有効化

1. GitHubリポジトリの **Settings** > **Pages** に移動
2. **Source** を `main` ブランチの `/root` に設定
3. **Save** をクリック

数分後、 `https://sumimi.github.io/` でサイトが公開されます。

### 4. 初回のメタデータ生成

初回公開時は `projects.json` を生成する必要があります：

**方法1: ローカルで生成（推奨）**

```bash
python3 scripts/fetch-metadata.py
git add projects.json
git commit -m "Add initial projects metadata"
git push
```

**方法2: GitHub Actions で生成**

1. https://github.com/sumimi/sumimi.github.io/actions に移動
2. 「Update Projects Metadata」ワークフローを選択
3. 「Run workflow」をクリック

### 5. プロジェクトを追加

`projects-list.txt` に新しいプロジェクトのリポジトリを追加：

```bash
echo "sumimi/new-project" >> projects-list.txt
git add projects-list.txt
git commit -m "Add new project"
git push
```

GitHub Actions が自動的にメタデータを収集します。

---

## 📝 プロジェクトのメタデータ形式

各プロジェクトの `README.md` には、以下の形式でメタデータを記述：

```html
<!--
---
number: 001
id: project-id
slug: project-slug

title: "プロジェクトタイトル"

subtitle_ja: "日本語サブタイトル"
subtitle_en: "English Subtitle"

description_ja: "日本語の説明"
description_en: "English description"

category_ja:
  - カテゴリ名
category_en:
  - Category

difficulty: 2

tags:
  - tag1
  - tag2
  - tag3

repo_url: "https://github.com/user/repo"
demo_url: "https://user.github.io/repo/"

hub: true
---
-->
```

---

## 🤖 自動更新

GitHub Actions により、以下のタイミングでメタデータが自動更新されます：

- **定期実行**: 毎日 0:00 UTC（日本時間 9:00）
- **手動実行**: GitHub の Actions タブから実行可能
- **自動実行**: `projects-list.txt` または `scripts/fetch-metadata.py` が更新された時

---

## 🛠️ ローカル開発

### メタデータ収集のテスト

```bash
# 依存関係をインストール（初回のみ）
pip install requests pyyaml

# メタデータ収集を実行
python3 scripts/fetch-metadata.py

# 生成された projects.json を確認
cat projects.json | jq .  # jq がインストールされている場合
```

### ローカルサーバーで表示確認

```bash
# Python の簡易サーバーを起動
python3 -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

---

## 🔒 セキュリティ機能

このプロジェクトには、以下のセキュリティ対策が実装されています：

### フロントエンド
- **XSS対策**: すべてのユーザーデータをHTMLエスケープ
- **URLサニタイゼーション**: 危険なURLスキーム（`javascript:`, `data:` など）をブロック
- **CSP（Content Security Policy）**: 厳格なポリシーで外部リソースを制限
- **Reverse Tabnabbing対策**: 外部リンクに `rel="noopener noreferrer"` を設定

### バックエンド
- **入力検証**: メタデータの型チェック・長さ制限・範囲制限
- **URLプロトコル検証**: http/https のみ許可
- **安全なYAMLパース**: `yaml.safe_load()` を使用

### インフラ
- **最小権限の原則**: GitHub Actions の権限を必要最小限に制限
- **トークン管理**: 環境変数とSecrets で適切に管理

---

## 🐛 トラブルシューティング

### サイトに「プロジェクトの読み込みに失敗しました」と表示される

**原因**: `projects.json` が存在しないか、正しく生成されていない

**解決方法**:

1. ローカルでメタデータを生成:
   ```bash
   python3 scripts/fetch-metadata.py
   git add projects.json
   git commit -m "Add projects metadata"
   git push
   ```

2. または GitHub Actions を手動実行:
   - https://github.com/sumimi/sumimi.github.io/actions
   - 「Update Projects Metadata」を実行

### `projects.json` が Git に追跡されない

**原因**: `.gitignore` に `projects.json` が含まれている

**解決方法**: `.gitignore` から `projects.json` の行を削除してください。このファイルはGitHub Pagesで必須です。

### Python 依存関係のインストールエラー

```bash
# ユーザー環境にインストール
pip install --user requests pyyaml

# または仮想環境を使用
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install requests pyyaml
```

### GitHub Actions が失敗する

1. **Actions タブ**で詳細なエラーログを確認
2. **Permissions** が正しく設定されているか確認:
   - Settings > Actions > General > Workflow permissions
   - 「Read and write permissions」を選択

---

## 💡 重要な注意事項

### `projects.json` について

- ⚠️ **`.gitignore` に含めないでください**
- このファイルはGitHub Pagesで必須です
- GitHub Actions が自動生成しますが、Git に追跡される必要があります

### GitHub Actions の権限

- ワークフローには `contents: write` 権限が必要です
- `projects.json` を自動コミットするために使用されます

---

## 📊 メタデータの構造

`projects.json` の構造：

```json
{
  "generated_at": "2026-02-22T09:00:00+09:00",
  "total_count": 1,
  "projects": [
    {
      "number": 1,
      "id": "modern-cpp-template-learnkit",
      "title": "Modern C++ Template LearnKit",
      "subtitle_ja": "Modern C++学習用プロジェクトテンプレート",
      "category_ja": ["C++/テンプレート"],
      "difficulty": 2,
      "tags": ["cpp17", "cmake", "googletest"],
      "repo_url": "https://github.com/sumimi/modern-cpp-template-learnkit",
      "stars": 0,
      "forks": 0,
      "updated_at": "2026-02-22T00:00:00Z"
    }
  ]
}
```

---

## 📄 ライセンス

MIT License
