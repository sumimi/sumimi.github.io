#!/usr/bin/env python3
"""
GitHub リポジトリから README.md のメタデータを収集して projects.json を生成するスクリプト
"""

import os
import json
import re
import requests
import yaml
from datetime import datetime
from typing import Dict, List, Optional

# GitHub API の設定
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
GITHUB_API_BASE = 'https://api.github.com'
HEADERS = {
    'Accept': 'application/vnd.github.v3+json',
}
if GITHUB_TOKEN:
    HEADERS['Authorization'] = f'token {GITHUB_TOKEN}'


def read_projects_list() -> List[str]:
    """projects-list.txt からリポジトリリストを読み込む"""
    with open('projects-list.txt', 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip() and not line.startswith('#')]


def fetch_readme(repo: str) -> Optional[str]:
    """GitHub API で README.md を取得"""
    url = f'{GITHUB_API_BASE}/repos/{repo}/readme'
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        
        # README の内容を取得
        readme_data = response.json()
        content_url = readme_data.get('download_url')
        
        if content_url:
            content_response = requests.get(content_url)
            content_response.raise_for_status()
            return content_response.text
    except Exception as e:
        print(f"⚠️  Error fetching README for {repo}: {e}")
        return None


def extract_metadata(readme_content: str) -> Optional[Dict]:
    """README.md から HTML コメント内の YAML メタデータを抽出"""
    # HTML コメント内の YAML を抽出
    pattern = r'<!--\s*\n---\s*\n(.*?)\n---\s*\n-->'
    match = re.search(pattern, readme_content, re.DOTALL)
    
    if not match:
        return None
    
    yaml_content = match.group(1)
    
    try:
        metadata = yaml.safe_load(yaml_content)
        return validate_metadata(metadata)
    except yaml.YAMLError as e:
        print(f"⚠️  YAML parse error: {e}")
        return None


def validate_metadata(metadata: Dict) -> Optional[Dict]:
    """メタデータを検証・サニタイズする"""
    if not isinstance(metadata, dict):
        return None
    
    # 必須フィールドのチェック
    if 'title' not in metadata:
        return None
    
    # 整数フィールドの検証
    if 'number' in metadata:
        try:
            metadata['number'] = int(metadata['number'])
        except (ValueError, TypeError):
            metadata['number'] = 999
    
    if 'difficulty' in metadata:
        try:
            difficulty = int(metadata['difficulty'])
            # 1-5 の範囲に制限
            metadata['difficulty'] = max(1, min(5, difficulty))
        except (ValueError, TypeError):
            metadata['difficulty'] = 2
    
    # URL フィールドの検証
    for url_field in ['repo_url', 'demo_url']:
        if url_field in metadata and metadata[url_field]:
            url = str(metadata[url_field])
            # 安全なプロトコルのみ許可
            if not url.startswith(('http://', 'https://')):
                metadata[url_field] = ''
    
    # リストフィールドの検証
    for list_field in ['tags', 'category_ja', 'category_en']:
        if list_field in metadata:
            if isinstance(metadata[list_field], list):
                # 各要素を文字列に変換し、長さを制限
                metadata[list_field] = [
                    str(item)[:100] for item in metadata[list_field]
                    if item
                ][:20]  # 最大20要素まで
            else:
                metadata[list_field] = []
    
    # 文字列フィールドの長さ制限
    string_fields = ['title', 'subtitle_ja', 'subtitle_en', 'description_ja', 'description_en', 'id', 'slug']
    for field in string_fields:
        if field in metadata and metadata[field]:
            metadata[field] = str(metadata[field])[:500]  # 最大500文字
    
    return metadata


def fetch_repo_info(repo: str) -> Dict:
    """リポジトリの基本情報を取得"""
    url = f'{GITHUB_API_BASE}/repos/{repo}'
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        
        return {
            'stars': data.get('stargazers_count', 0),
            'forks': data.get('forks_count', 0),
            'updated_at': data.get('updated_at', ''),
            'language': data.get('language', ''),
        }
    except Exception as e:
        print(f"⚠️  Error fetching repo info for {repo}: {e}")
        return {}


def main():
    """メイン処理"""
    print("📦 Fetching project metadata...")
    
    # プロジェクトリストを読み込む
    repos = read_projects_list()
    print(f"📋 Found {len(repos)} repositories to process")
    
    projects = []
    
    for repo in repos:
        print(f"\n🔍 Processing: {repo}")
        
        # README を取得
        readme = fetch_readme(repo)
        if not readme:
            print(f"  ⏭️  Skipping (README not found)")
            continue
        
        # メタデータを抽出
        metadata = extract_metadata(readme)
        if not metadata:
            print(f"  ⏭️  Skipping (metadata not found)")
            continue
        
        # リポジトリ情報を取得
        repo_info = fetch_repo_info(repo)
        
        # プロジェクトデータを構築
        project = {
            **metadata,
            'repo': repo,
            'stars': repo_info.get('stars', 0),
            'forks': repo_info.get('forks', 0),
            'updated_at': repo_info.get('updated_at', ''),
            'language': repo_info.get('language', ''),
        }
        
        projects.append(project)
        print(f"  ✅ Added: {metadata.get('title', repo)}")
    
    # number でソート
    projects.sort(key=lambda x: x.get('number', 999))
    
    # タイムスタンプを生成（外部APIに依存しない）
    now = datetime.now().astimezone()
    
    # JSON として出力
    output = {
        'generated_at': now.isoformat(),
        'total_count': len(projects),
        'projects': projects,
    }
    
    with open('projects.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Successfully generated projects.json with {len(projects)} projects!")


if __name__ == '__main__':
    main()
