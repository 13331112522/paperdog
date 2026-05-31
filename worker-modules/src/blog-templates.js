// Blog Templates for PaperDog
import { getHeader, getSharedCSS } from './dual-column-templates.js';

/**
 * Generate blog listing page HTML
 * @param {Array} posts - Array of blog posts
 * @param {Object} visitorStats - Visitor statistics
 * @returns {string} HTML for blog listing page
 */
export function getBlogListHTML(posts = [], visitorStats = null) {
  // Debug: Log all posts with their slugs
  console.log('Blog: Processing posts:', posts.map(p => ({ id: p.id, slug: p.slug, title: p.title })));

  const ARTICLES_PER_PAGE = 6;

  const postsHTML = posts.map((post, index) => {
    console.log(`  [${index}] Generating card for slug: "${post.slug}" - "${post.title}"`);
    const page = Math.floor(index / ARTICLES_PER_PAGE) + 1;
    const cardHTML = getBlogCardHTML(post, page);
    console.log(`  [${index}] Generated ${cardHTML.length} bytes of HTML`);
    return cardHTML;
  }).join('\n');

  const totalPages = Math.max(1, Math.ceil(posts.length / ARTICLES_PER_PAGE));

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - PaperDog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        ${getSharedCSS()}

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
            background: linear-gradient(180deg, #FFFFFF 0%, var(--color-gray-50) 100%);
            color: var(--color-ink);
            padding: 3rem 0 2rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--color-gray-200);
            animation: fadeIn 0.5s ease-out;
            position: relative;
        }

        .page-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 60px;
            height: 3px;
            background: var(--color-primary-500);
        }

        .page-header h1 {
            font-family: var(--font-heading);
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: var(--spacing-2);
            letter-spacing: -0.01em;
            color: var(--color-ink);
        }

        .page-header p {
            color: var(--color-gray-500);
            font-size: 1.125rem;
            margin-bottom: 0;
        }

        .blog-card-col {
            opacity: 0;
            animation: fadeInUp 0.4s ease-out forwards;
        }

        .blog-card-col:nth-child(1) { animation-delay: 0.05s; }
        .blog-card-col:nth-child(2) { animation-delay: 0.1s; }
        .blog-card-col:nth-child(3) { animation-delay: 0.15s; }
        .blog-card-col:nth-child(4) { animation-delay: 0.2s; }
        .blog-card-col:nth-child(5) { animation-delay: 0.25s; }
        .blog-card-col:nth-child(6) { animation-delay: 0.3s; }

        .blog-card {
            background: #FFFFFF;
            border: 1px solid var(--color-gray-200);
            border-radius: 2px;
            padding: var(--spacing-6);
            transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
            height: 100%;
        }

        .blog-card:hover {
            border-color: var(--color-primary-500);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(192, 85, 45, 0.08);
        }

        .blog-featured-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 2px;
            margin-bottom: var(--spacing-4);
            background: var(--color-primary-200);
        }

        .blog-title {
            font-family: var(--font-heading);
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-ink);
            margin-bottom: var(--spacing-3);
            line-height: 1.4;
        }

        .blog-title a {
            color: inherit;
            text-decoration: none;
            transition: color 0.15s ease;
        }

        .blog-title a:hover {
            color: var(--color-primary-500);
        }

        .blog-excerpt {
            color: var(--color-gray-500);
            font-size: 0.9375rem;
            line-height: 1.8;
            margin-bottom: var(--spacing-4);
        }

        .blog-meta {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-2);
            align-items: center;
            font-size: 0.875rem;
            color: var(--color-gray-500);
            margin-bottom: var(--spacing-4);
        }

        .blog-date {
            display: flex;
            align-items: center;
            gap: var(--spacing-2);
        }

        .blog-categories {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-2);
            margin-bottom: var(--spacing-4);
        }

        .category-badge {
            background: var(--color-primary-50);
            color: var(--color-primary-700);
            padding: var(--spacing-1) var(--spacing-3);
            border-radius: 2px;
            font-size: 0.8125rem;
            font-weight: 500;
            border: 1px solid var(--color-primary-200);
        }

        .blog-tags {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-2);
            margin-bottom: var(--spacing-4);
        }

        .tag-badge {
            background: var(--color-gray-100);
            color: var(--color-gray-700);
            padding: var(--spacing-1) var(--spacing-2);
            border-radius: 2px;
            font-size: 0.8125rem;
            border: 1px solid var(--color-gray-200);
        }

        .read-more-btn {
            background: var(--color-primary-500);
            color: white;
            border: none;
            padding: var(--spacing-2) var(--spacing-5);
            border-radius: 3px;
            font-weight: 500;
            transition: background 0.15s ease;
        }

        .read-more-btn:hover {
            background: var(--color-primary-600);
            color: white;
        }

        .no-posts {
            text-align: center;
            padding: 4rem var(--spacing-8);
            background: #FFFFFF;
            border-radius: 2px;
            border: 1px solid var(--color-gray-200);
        }

        .no-posts i {
            font-size: 4rem;
            color: var(--color-primary-500);
            margin-bottom: var(--spacing-4);
        }

        .no-posts h3 {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--color-ink);
            margin-bottom: var(--spacing-2);
        }

        /* Dark mode blog-specific overrides */
        @media (prefers-color-scheme: dark) {
            .blog-card,
            .no-posts {
                background: #262320;
                border-color: var(--color-gray-200);
            }

            .page-header {
                background: linear-gradient(180deg, #262320 0%, #1c1a16 100%);
                border-bottom-color: var(--color-gray-200);
            }

            .blog-featured-image {
                background: var(--color-primary-200);
            }
        }

        /* Search Bar */
        .blog-search-wrapper {
            margin-bottom: var(--spacing-6);
        }

        .blog-search {
            position: relative;
            max-width: 480px;
        }

        .blog-search input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.75rem;
            border: 1px solid var(--color-gray-200);
            border-radius: 3px;
            background: #FFFFFF;
            color: var(--color-body);
            font-family: var(--font-body);
            font-size: 0.9375rem;
            outline: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .blog-search input::placeholder {
            color: var(--color-gray-300);
        }

        .blog-search input:focus {
            border-color: var(--color-primary-500);
            box-shadow: 0 0 0 3px rgba(192, 85, 45, 0.1);
        }

        .blog-search .search-icon {
            position: absolute;
            left: 0.875rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-gray-300);
            font-size: 0.9375rem;
            pointer-events: none;
        }

        .blog-search-clear {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--color-gray-500);
            cursor: pointer;
            font-size: 0.875rem;
            padding: 0.25rem;
            display: none;
            line-height: 1;
        }

        .blog-search-clear.visible {
            display: block;
        }

        .search-results-count {
            font-size: 0.875rem;
            color: var(--color-gray-500);
            margin-top: var(--spacing-2);
            display: none;
        }

        .search-results-count.visible {
            display: block;
        }

        /* Pagination */
        .blog-pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--spacing-2);
            margin: var(--spacing-8) 0 var(--spacing-4);
            padding-top: var(--spacing-6);
            border-top: 1px solid var(--color-gray-200);
        }

        .blog-pagination.hidden {
            display: none;
        }

        .pagination-btn {
            min-width: 2.25rem;
            height: 2.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FFFFFF;
            border: 1px solid var(--color-gray-200);
            color: var(--color-gray-700);
            font-family: var(--font-body);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            border-radius: 2px;
            padding: 0 var(--spacing-2);
        }

        .pagination-btn:hover {
            border-color: var(--color-primary-500);
            color: var(--color-primary-500);
        }

        .pagination-btn.active {
            background: var(--color-primary-500);
            border-color: var(--color-primary-500);
            color: #FFFFFF;
        }

        .pagination-btn.disabled {
            opacity: 0.4;
            cursor: not-allowed;
            pointer-events: none;
        }

        .pagination-btn.nav-arrow {
            font-size: 0.8125rem;
        }

        /* Dark mode overrides for search and pagination */
        @media (prefers-color-scheme: dark) {
            .blog-search input {
                background: #262320;
                border-color: var(--color-gray-200);
                color: var(--color-body);
            }

            .pagination-btn {
                background: #262320;
                border-color: var(--color-gray-200);
                color: var(--color-gray-700);
            }

            .pagination-btn:hover {
                border-color: var(--color-primary-500);
                color: var(--color-primary-500);
            }
        }

        @media (max-width: 768px) {
            .blog-card {
                margin-bottom: var(--spacing-6);
            }

            .page-header {
                padding: var(--spacing-8) 0;
            }

            .page-header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    ${getHeader('blog', visitorStats)}

    <div class="page-header">
        <div class="container">
            <h1><i class="fas fa-book me-2"></i>Blog</h1>
            <p>Thoughts, insights, and updates from the PaperDog team</p>
        </div>
    </div>

    <div class="container">
        ${posts.length > 0 ? `
        <div class="blog-search-wrapper">
            <div class="blog-search">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="blog-search-input" placeholder="Search articles by title, topic, or tag..." autocomplete="off">
                <button class="blog-search-clear" id="blog-search-clear" type="button">&times;</button>
            </div>
            <div class="search-results-count" id="search-results-count"></div>
        </div>
        ` : ''}

        <div class="row" id="blog-articles-grid">
            ${posts.length > 0 ? postsHTML : `
                <div class="col-12">
                    <div class="no-posts">
                        <i class="fas fa-book-open"></i>
                        <h3>No posts yet</h3>
                        <p class="text-muted">Check back soon for new content!</p>
                    </div>
                </div>
            `}
        </div>

        ${totalPages > 1 ? `
        <div class="blog-pagination" id="blog-pagination">
            <button class="pagination-btn nav-arrow disabled" id="page-prev" type="button">&laquo; Prev</button>
            ${Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              return `<button class="pagination-btn${pageNum === 1 ? ' active' : ''}" data-page="${pageNum}" type="button">${pageNum}</button>`;
            }).join('\n            ')}
            <button class="pagination-btn nav-arrow${totalPages <= 1 ? ' disabled' : ''}" id="page-next" type="button">Next &raquo;</button>
        </div>
        ` : ''}

        <div class="no-posts" id="no-search-results" style="display:none;">
            <i class="fas fa-search"></i>
            <h3>No matching articles</h3>
            <p class="text-muted">Try a different search term.</p>
        </div>
    </div>

    <footer>
        <div class="container">
            <p class="mb-0">
                <i class="fas fa-heart me-1"></i> PaperDog - AI Papers Daily Digest
            </p>
            <p class="mb-0 small opacity-75 mt-1">
                Aggregating the latest AI research from arXiv and HuggingFace
            </p>
        </div>
    </footer>

    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    (function() {
        var PER_PAGE = ${ARTICLES_PER_PAGE};
        var currentPage = 1;
        var totalPages = ${totalPages};
        var isSearching = false;

        var grid = document.getElementById('blog-articles-grid');
        var pagination = document.getElementById('blog-pagination');
        var searchInput = document.getElementById('blog-search-input');
        var searchClear = document.getElementById('blog-search-clear');
        var resultsCount = document.getElementById('search-results-count');
        var noResults = document.getElementById('no-search-results');
        var pageButtons = pagination ? pagination.querySelectorAll('.pagination-btn[data-page]') : [];
        var prevBtn = document.getElementById('page-prev');
        var nextBtn = document.getElementById('page-next');

        function getAllCards() {
            return grid ? grid.querySelectorAll('.blog-card-col') : [];
        }

        function showPage(page) {
            currentPage = page;
            var cards = getAllCards();
            cards.forEach(function(card) {
                var cardPage = parseInt(card.getAttribute('data-page'), 10);
                card.style.display = (cardPage === page) ? '' : 'none';
            });
            updatePaginationUI();
        }

        function updatePaginationUI() {
            if (!pagination) return;
            pageButtons.forEach(function(btn) {
                var p = parseInt(btn.getAttribute('data-page'), 10);
                btn.classList.toggle('active', p === currentPage);
            });
            if (prevBtn) prevBtn.classList.toggle('disabled', currentPage <= 1);
            if (nextBtn) nextBtn.classList.toggle('disabled', currentPage >= totalPages);
        }

        if (pagination) {
            pagination.addEventListener('click', function(e) {
                var btn = e.target.closest('.pagination-btn');
                if (!btn || btn.classList.contains('disabled') || btn.classList.contains('active')) return;

                if (btn.id === 'page-prev') {
                    if (currentPage > 1) showPage(currentPage - 1);
                } else if (btn.id === 'page-next') {
                    if (currentPage < totalPages) showPage(currentPage + 1);
                } else {
                    var page = parseInt(btn.getAttribute('data-page'), 10);
                    if (page) showPage(page);
                }
            });
        }

        // Search
        function filterArticles(query) {
            query = query.trim().toLowerCase();
            var cards = getAllCards();

            if (!query) {
                isSearching = false;
                cards.forEach(function(card) {
                    card.style.display = '';
                });
                showPage(1);
                if (pagination) pagination.classList.remove('hidden');
                if (resultsCount) resultsCount.classList.remove('visible');
                if (noResults) noResults.style.display = 'none';
                if (searchClear) searchClear.classList.remove('visible');
                return;
            }

            isSearching = true;
            var matchCount = 0;
            if (pagination) pagination.classList.add('hidden');
            if (searchClear) searchClear.classList.add('visible');

            cards.forEach(function(card) {
                var title = (card.getAttribute('data-title') || '').toLowerCase();
                var excerpt = (card.getAttribute('data-excerpt') || '').toLowerCase();
                var tags = (card.getAttribute('data-tags') || '').toLowerCase();
                var match = title.indexOf(query) !== -1 ||
                            excerpt.indexOf(query) !== -1 ||
                            tags.indexOf(query) !== -1;
                card.style.display = match ? '' : 'none';
                if (match) matchCount++;
            });

            if (resultsCount) {
                resultsCount.textContent = matchCount + ' article' + (matchCount !== 1 ? 's' : '') + ' found';
                resultsCount.classList.add('visible');
            }
            if (noResults) noResults.style.display = (matchCount === 0) ? '' : 'none';
        }

        if (searchInput) {
            var debounceTimer;
            searchInput.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function() {
                    filterArticles(searchInput.value);
                }, 200);
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', function() {
                if (searchInput) searchInput.value = '';
                filterArticles('');
                if (searchInput) searchInput.focus();
            });
        }

        // Initial page show
        if (totalPages > 1 && getAllCards().length > 0) {
            showPage(1);
        }
    })();

    // Load article images from /api/blog/image/:slug
    (function loadArticleImages() {
        var placeholders = document.querySelectorAll('.blog-image-placeholder[data-slug]');
        if (placeholders.length === 0) return;

        // Load in batches of 4 to avoid overwhelming the server
        var BATCH = 4;
        var idx = 0;
        var loaded = {};

        function loadNext() {
            var batch = [];
            while (batch.length < BATCH && idx < placeholders.length) {
                var el = placeholders[idx++];
                var slug = el.dataset.slug;
                if (slug && !loaded[slug]) {
                    loaded[slug] = true;
                    batch.push({ el: el, slug: slug });
                }
            }
            if (batch.length === 0) return;

            batch.forEach(function(item) {
                var img = new Image();
                img.alt = '';
                img.className = 'blog-featured-image';
                img.loading = 'lazy';
                img.decoding = 'async';
                img.src = '/api/blog/image/' + encodeURIComponent(item.slug);

                img.onload = function() {
                    if (item.el.parentNode) {
                        item.el.replaceWith(img);
                    }
                    loadNext();
                };
                img.onerror = function() {
                    delete loaded[item.slug];
                    loadNext();
                };
            });
        }

        loadNext();
    })();
    </script>
</body>
</html>`;
}

/**
 * Generate blog card HTML
 * @param {Object} post - Blog post object
 * @returns {string} HTML for blog card
 */
function getBlogCardHTML(post, page) {
  // Explicitly extract all properties to avoid closure issues
  const {
    slug,
    title,
    featuredImage,
    excerpt: rawExcerpt,
    content,
    date: rawDate,
    categories,
    tags,
    author,
    commentCount
  } = post;

  const featuredImageHTML = featuredImage
    ? `<img src="${featuredImage}" alt="${title}" class="blog-featured-image" loading="lazy" decoding="async">`
    : `<div class="blog-featured-image blog-image-placeholder d-flex align-items-center justify-content-center" data-slug="${slug}">
         <i class="fas fa-newspaper fa-3x" style="color:var(--color-primary-500);"></i>
       </div>`;

  const categoriesHTML = categories.length > 0
    ? `<div class="blog-categories">
        ${categories.map(cat => `<span class="category-badge">${cat}</span>`).join('')}
       </div>`
    : '';

  const tagsHTML = tags.length > 0
    ? `<div class="blog-tags">
        ${tags.map(tag => `<span class="tag-badge">#${tag}</span>`).join('')}
       </div>`
    : '';

  const date = new Date(rawDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Strip HTML tags from excerpt
  const excerpt = rawExcerpt.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

  // Prepare data attributes for search (strip HTML, escape quotes)
  const searchTitle = title.replace(/"/g, '&quot;');
  const searchExcerpt = excerpt.replace(/"/g, '&quot;');
  const searchTags = (tags || []).join(', ');

  return `
    <div class="col-md-6 col-lg-4 mb-4 blog-card-col" data-page="${page || 1}" data-title="${searchTitle}" data-excerpt="${searchExcerpt}" data-tags="${searchTags}">
        <div class="blog-card">
            ${featuredImageHTML}
            <h3 class="blog-title">
                <a href="/blog/${slug}">${title}</a>
            </h3>
            ${categoriesHTML}
            <div class="blog-meta">
                <div class="blog-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${date}</span>
                </div>
                ${commentCount > 0 ? `
                    <div class="blog-comments ms-3">
                        <i class="fas fa-comments"></i>
                        <span>${commentCount} comments</span>
                    </div>
                ` : ''}
            </div>
            <p class="blog-excerpt">${excerpt}</p>
            ${tagsHTML}
            <a href="/blog/${slug}" class="btn read-more-btn">
                Read More <i class="fas fa-arrow-right ms-1"></i>
            </a>
        </div>
    </div>
  `;
}

/**
 * Generate single blog post page HTML
 * @param {Object} post - Blog post object
 * @param {Object} visitorStats - Visitor statistics
 * @returns {string} HTML for blog post page
 */
export function getBlogPostHTML(post, visitorStats = null) {
  if (!post) {
    return getBlogListHTML([], visitorStats).replace('No posts yet', 'Post not found');
  }

  // Explicitly extract all properties to avoid closure issues
  const {
    slug,
    title,
    featuredImage,
    excerpt: rawExcerpt,
    content,
    date: rawDate,
    categories,
    tags,
    author,
    commentCount,
    link
  } = post;

  const featuredImageHTML = featuredImage
    ? `<img src="${featuredImage}" alt="${title}" class="img-fluid mb-4" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 2px;" loading="lazy" decoding="async">`
    : '';

  const categoriesHTML = categories.length > 0
    ? `<div class="blog-categories mb-3">
        ${categories.map(cat => `<span class="category-badge me-2">${cat}</span>`).join('')}
       </div>`
    : '';

  const tagsHTML = tags.length > 0
    ? `<div class="blog-tags mt-4">
        <strong>Tags:</strong>
        ${tags.map(tag => `<span class="tag-badge ms-2">#${tag}</span>`).join('')}
       </div>`
    : '';

  const date = new Date(rawDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - PaperDog Blog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Serif+SC:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        ${getSharedCSS()}

        .blog-post-container {
            background: #FFFFFF;
            border: 1px solid var(--color-gray-200);
            border-radius: 2px;
            padding: 2.5rem;
            margin-top: 2rem;
            margin-bottom: 2rem;
            max-width: 720px;
        }

        .blog-post-title {
            font-family: var(--font-heading);
            font-size: 2.25rem;
            font-weight: 700;
            color: var(--color-ink);
            margin-bottom: var(--spacing-4);
            line-height: 1.3;
            letter-spacing: -0.01em;
        }

        .blog-post-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: center;
            padding: 1rem 0;
            border-top: 1px solid var(--color-gray-200);
            border-bottom: 1px solid var(--color-gray-200);
            margin-bottom: 2rem;
            font-size: 0.9rem;
            color: var(--color-gray-500);
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .category-badge {
            background: var(--color-primary-50);
            color: var(--color-primary-700);
            padding: 0.25rem 0.75rem;
            border-radius: 2px;
            font-size: 0.8rem;
            font-weight: 500;
            border: 1px solid var(--color-primary-200);
        }

        .tag-badge {
            background: var(--color-gray-100);
            color: var(--color-gray-700);
            padding: 0.2rem 0.6rem;
            border-radius: 2px;
            font-size: 0.75rem;
            border: 1px solid var(--color-gray-200);
        }

        .blog-post-content {
            font-size: 1.0625rem;
            line-height: 1.8;
            color: var(--color-body);
        }

        .blog-post-content img {
            max-width: 100%;
            height: auto;
            border-radius: 2px;
            margin: 1.5rem 0;
        }

        .blog-post-content h2,
        .blog-post-content h3,
        .blog-post-content h4 {
            font-family: var(--font-heading);
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: var(--color-ink);
            font-weight: 700;
        }

        .blog-post-content p {
            margin-bottom: 1rem;
        }

        .blog-post-content ul,
        .blog-post-content ol {
            margin-bottom: 1rem;
            padding-left: 2rem;
        }

        .blog-post-content code {
            font-family: var(--font-code);
            background: var(--color-gray-100);
            padding: 0.15em 0.35em;
            border-radius: 2px;
            font-size: 0.9em;
        }

        .back-btn {
            background: var(--color-primary-500);
            color: white;
            border: none;
            padding: 0.5rem 1.25rem;
            border-radius: 3px;
            font-weight: 500;
            transition: background 0.15s ease;
        }

        .back-btn:hover {
            background: var(--color-primary-600);
            color: white;
        }

        .share-buttons {
            display: flex;
            gap: 0.5rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--color-gray-200);
        }

        .share-btn {
            padding: 0.5rem 1rem;
            border-radius: 3px;
            font-weight: 500;
            transition: opacity 0.15s ease;
            border: 1px solid var(--color-gray-200);
            background: var(--color-gray-50);
            color: var(--color-gray-700);
        }

        .share-btn:hover {
            opacity: 0.85;
        }

        .share-twitter {
            color: #1a1a1a;
        }

        .share-facebook {
            color: #1a1a1a;
        }

        .share-linkedin {
            color: #1a1a1a;
        }

        /* Dark mode blog post overrides */
        @media (prefers-color-scheme: dark) {
            .blog-post-container {
                background: #262320;
                border-color: var(--color-gray-200);
            }
        }

        @media (max-width: 768px) {
            .blog-post-container {
                padding: 1.5rem;
            }

            .blog-post-title {
                font-size: 1.75rem;
            }
        }
    </style>
</head>
<body>
    ${getHeader('blog', visitorStats)}

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="blog-post-container">
                    <a href="/blog" class="btn back-btn mb-3">
                        <i class="fas fa-arrow-left me-1"></i> Back to Blog
                    </a>

                    ${featuredImageHTML}

                    <h1 class="blog-post-title">${title}</h1>

                    ${categoriesHTML}

                    <div class="blog-post-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>${date}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${author.name}</span>
                        </div>
                        ${commentCount > 0 ? `
                            <div class="meta-item">
                                <i class="fas fa-comments"></i>
                                <span>${commentCount} comments</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="blog-post-content">
                        ${content}
                    </div>

                    ${tagsHTML}

                    <div class="share-buttons">
                        <span class="text-muted me-2"><strong>Share:</strong></span>
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}" target="_blank" class="btn share-btn share-twitter">
                            <i class="fab fa-twitter me-1"></i> Twitter
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}" target="_blank" class="btn share-btn share-facebook">
                            <i class="fab fa-facebook-f me-1"></i> Facebook
                        </a>
                        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}" target="_blank" class="btn share-btn share-linkedin">
                            <i class="fab fa-linkedin-in me-1"></i> LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <footer>
        <div class="container">
            <p class="mb-0">
                <i class="fas fa-heart me-1"></i> PaperDog - AI Papers Daily Digest
            </p>
            <p class="mb-0 small opacity-75 mt-1">
                Aggregating the latest AI research from arXiv and HuggingFace
            </p>
        </div>
    </footer>

    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}
