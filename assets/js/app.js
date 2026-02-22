// グローバル変数
let allProjects = [];
let filteredProjects = [];

// DOM要素
const projectsContainer = document.getElementById('projects-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const sortSelect = document.getElementById('sort-select');

// 統計要素
const totalProjectsEl = document.getElementById('total-projects');
const totalCategoriesEl = document.getElementById('total-categories');
const totalStarsEl = document.getElementById('total-stars');
const lastUpdatedEl = document.getElementById('last-updated');

// 初期化
async function init() {
    try {
        const response = await fetch('projects.json');
        const data = await response.json();

        allProjects = data.projects || [];
        filteredProjects = [...allProjects];

        updateStats(data);
        populateCategoryFilter();
        renderProjects();

        // イベントリスナー
        searchInput.addEventListener('input', handleFilter);
        categoryFilter.addEventListener('change', handleFilter);
        difficultyFilter.addEventListener('change', handleFilter);
        sortSelect.addEventListener('change', handleSort);

    } catch (error) {
        console.error('Error loading projects:', error);
        projectsContainer.innerHTML = `
            <div class="empty-state">
                ❌ プロジェクトの読み込みに失敗しました。<br>
                <small>${escapeHtml(error.message)}</small>
            </div>
        `;
    }
}

// 統計情報を更新
function updateStats(data) {
    totalProjectsEl.textContent = data.total_count || 0;

    const categories = new Set(allProjects.map(p => p.category_ja?.[0]).filter(Boolean));
    totalCategoriesEl.textContent = categories.size;

    const totalStars = allProjects.reduce((sum, p) => sum + (p.stars || 0), 0);
    totalStarsEl.textContent = totalStars;

    if (data.generated_at) {
        const date = new Date(data.generated_at);
        lastUpdatedEl.textContent = date.toLocaleString('ja-JP');
    }
}

// カテゴリフィルタを生成
function populateCategoryFilter() {
    const categories = new Set(allProjects.map(p => p.category_ja?.[0]).filter(Boolean));

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = String(category);
        option.textContent = String(category);
        categoryFilter.appendChild(option);
    });
}

// フィルタリング処理
function handleFilter() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedDifficulty = difficultyFilter.value;

    filteredProjects = allProjects.filter(project => {
        // 検索
        const matchesSearch = !searchTerm ||
            project.title?.toLowerCase().includes(searchTerm) ||
            project.subtitle_ja?.toLowerCase().includes(searchTerm) ||
            project.description_ja?.toLowerCase().includes(searchTerm) ||
            project.tags?.some(tag => tag.toLowerCase().includes(searchTerm));

        // カテゴリ
        const matchesCategory = !selectedCategory ||
            project.category_ja?.includes(selectedCategory);

        // 難易度
        const matchesDifficulty = !selectedDifficulty ||
            project.difficulty === parseInt(selectedDifficulty);

        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    renderProjects();
}

// ソート処理
function handleSort() {
    const sortBy = sortSelect.value;

    filteredProjects.sort((a, b) => {
        switch (sortBy) {
            case 'number':
                return (a.number || 999) - (b.number || 999);
            case 'stars':
                return (b.stars || 0) - (a.stars || 0);
            case 'updated':
                return new Date(b.updated_at) - new Date(a.updated_at);
            default:
                return 0;
        }
    });

    renderProjects();
}

// プロジェクトをレンダリング
function renderProjects() {
    if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
                😢 プロジェクトが見つかりませんでした。<br>
                <small>検索条件を変更してみてください。</small>
            </div>
        `;
        return;
    }

    projectsContainer.innerHTML = filteredProjects.map(project =>
        createProjectCard(project)
    ).join('');
}

// HTMLエスケープ関数
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// URLのサニタイズ
function sanitizeUrl(url) {
    if (!url) return '';
    // javascript: や data: スキームを除外
    if (url.match(/^(javascript|data|vbscript):/i)) {
        return '';
    }
    return url;
}

// プロジェクトカードを作成
function createProjectCard(project) {
    const difficultyLabel = ['入門', '初級', '中級', '上級', 'エキスパート'];
    const difficultyText = difficultyLabel[project.difficulty - 1] || '不明';

    // タグをエスケープ
    const tags = project.tags?.slice(0, 5).map(tag =>
        `<span class="tag">${escapeHtml(tag)}</span>`
    ).join('') || '';

    // URLをサニタイズ
    const demoUrl = sanitizeUrl(project.demo_url);
    const repoUrl = sanitizeUrl(project.repo_url);

    const demoButton = demoUrl ?
        `<a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">🚀 Demo</a>` : '';

    return `
        <div class="project-card">
            <div class="project-number">#${String(project.number || 0).padStart(3, '0')}</div>
            <h3 class="project-title">${escapeHtml(project.title || 'Untitled')}</h3>
            <p class="project-subtitle">${escapeHtml(project.subtitle_ja || '')}</p>
            <p class="project-description">${escapeHtml(project.description_ja || '')}</p>
            
            <div class="project-meta">
                <span class="difficulty-badge difficulty-${parseInt(project.difficulty) || 1}">
                    ${escapeHtml(difficultyText)}
                </span>
                <span>⭐ ${parseInt(project.stars) || 0}</span>
                <span>🍴 ${parseInt(project.forks) || 0}</span>
            </div>
            
            <div class="project-tags">${tags}</div>
            
            <div class="project-links">
                <a href="${escapeHtml(repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    📦 Repository
                </a>
                ${demoButton}
            </div>
        </div>
    `;
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
