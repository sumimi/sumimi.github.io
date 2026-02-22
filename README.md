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

### 1. リポジトリをGitHubにプッシュ

```bash
cd /path/to/sumimi.github.io
git add .
git commit -m "Initial commit: Hub site setup"
git remote add origin https://github.com/sumimi/sumimi.github.io.git
git branch -M main
git push -u origin main
```

### 2. GitHub Pages を有効化

1. GitHubリポジトリの **Settings** > **Pages** に移動
2. **Source** を `main` ブランチの `/root` に設定
3. **Save** をクリック

数分後、 `https://sumimi.github.io/` でサイトが公開されます。

### 3. プロジェクトを追加

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
# 依存関係をインストール
pip install requests pyyaml

# メタデータ収集を実行
python scripts/fetch-metadata.py

# 生成された projects.json を確認
cat projects.json
```

### ローカルサーバーで表示確認

```bash
# Python の簡易サーバーを起動
python3 -m http.server 8000

# ブラウザで開く
# http://localhost:8000
```

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

---
