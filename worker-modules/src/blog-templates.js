// Blog Templates for PaperDog
import { getHeader } from './dual-column-templates.js';

/**
 * Generate blog listing page HTML
 * @param {Array} posts - Array of blog posts
 * @param {Object} visitorStats - Visitor statistics
 * @returns {string} HTML for blog listing page
 */
export function getBlogListHTML(posts = [], visitorStats = null) {
  // Debug: Log all posts with their slugs
  console.log('📝 Blog: Processing posts:', posts.map(p => ({ id: p.id, slug: p.slug, title: p.title })));

  const postsHTML = posts.map((post, index) => {
    console.log(`  [${index}] Generating card for slug: "${post.slug}" - "${post.title}"`);
    const cardHTML = getBlogCardHTML(post);
    console.log(`  [${index}] Generated ${cardHTML.length} bytes of HTML`);
    return cardHTML;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog - PaperDog</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            /* Color Palette - Indigo based */
            --color-primary-50: #EEF2FF;
            --color-primary-100: #E0E7FF;
            --color-primary-200: #C7D2FE;
            --color-primary-500: #6366F1;
            --color-primary-600: #4F46E5;
            --color-primary-700: #4338CA;

            /* Neutral Grays */
            --color-gray-50: #F9FAFB;
            --color-gray-100: #F3F4F6;
            --color-gray-200: #E5E7EB;
            --color-gray-300: #D1D5DB;
            --color-gray-500: #6B7280;
            --color-gray-700: #374151;
            --color-gray-900: #111827;

            /* Spacing Scale */
            --spacing-1: 0.25rem;
            --spacing-2: 0.5rem;
            --spacing-3: 0.75rem;
            --spacing-4: 1rem;
            --spacing-5: 1.25rem;
            --spacing-6: 1.5rem;
            --spacing-8: 2rem;
        }

        body {
            background: var(--color-gray-50);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 1rem;
            line-height: 1.5;
            color: var(--color-gray-900);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .navbar {
            background: #FFFFFF;
            border-bottom: 1px solid var(--color-gray-200);
            padding: var(--spacing-3) 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(8px);
            background: rgba(255, 255, 255, 0.95);
        }

        .navbar-brand {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-primary-600);
            text-decoration: none;
            transition: color 0.15s ease;
        }

        .navbar-brand:hover {
            color: var(--color-primary-700);
        }

        .navbar-tagline {
            font-size: 0.875rem;
            color: var(--color-gray-500);
            margin-left: var(--spacing-4);
        }

        .visitor-info {
            font-size: 0.8125rem;
            line-height: 1.4;
        }

        .visitor-stats {
            color: var(--color-gray-700);
            font-weight: 500;
        }

        .visitor-label {
            color: var(--color-gray-500);
            font-size: 0.75rem;
        }

        .nav-links {
            display: flex;
            gap: var(--spacing-1);
        }

        .nav-link {
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--color-gray-700);
            text-decoration: none;
            padding: var(--spacing-2) var(--spacing-3);
            border-radius: 6px;
            transition: all 0.15s ease;
        }

        .nav-link:hover {
            background: var(--color-gray-100);
            color: var(--color-gray-900);
        }

        .nav-link.active {
            background: var(--color-primary-50);
            color: var(--color-primary-600);
        }

        .blog-card {
            background: #FFFFFF;
            border: 1px solid var(--color-gray-200);
            border-radius: 12px;
            padding: var(--spacing-6);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
        }

        .blog-card:hover {
            border-color: var(--color-primary-200);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
            transform: translateY(-2px);
        }

        .blog-featured-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: var(--spacing-4);
            background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%);
        }

        .blog-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--color-gray-900);
            margin-bottom: var(--spacing-3);
            line-height: 1.4;
        }

        .blog-title a {
            color: inherit;
            text-decoration: none;
            transition: color 0.15s ease;
        }

        .blog-title a:hover {
            color: var(--color-primary-600);
        }

        .blog-excerpt {
            color: var(--color-gray-500);
            font-size: 0.9375rem;
            line-height: 1.6;
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
            border-radius: 6px;
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
            border-radius: 9999px;
            font-size: 0.8125rem;
            border: 1px solid var(--color-gray-200);
        }

        .read-more-btn {
            background: var(--color-primary-600);
            color: white;
            border: none;
            padding: var(--spacing-2) var(--spacing-5);
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .read-more-btn:hover {
            background: var(--color-primary-700);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
            color: white;
        }

        .page-header {
            background: linear-gradient(180deg, #FFFFFF 0%, var(--color-gray-50) 100%);
            color: var(--color-gray-900);
            padding: var(--spacing-16) 0 var(--spacing-8);
            margin-bottom: var(--spacing-8);
            border-bottom: 1px solid var(--color-gray-200);
        }

        .page-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: var(--spacing-2);
            letter-spacing: -0.02em;
        }

        .page-header p {
            color: var(--color-gray-500);
            font-size: 1.125rem;
            margin-bottom: 0;
        }

        .no-posts {
            text-align: center;
            padding: var(--spacing-16) var(--spacing-8);
            background: #FFFFFF;
            border-radius: 12px;
            border: 1px solid var(--color-gray-200);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .no-posts i {
            font-size: 4rem;
            color: var(--color-primary-600);
            margin-bottom: var(--spacing-4);
        }

        .no-posts h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--color-gray-900);
            margin-bottom: var(--spacing-2);
        }

        footer {
            background: var(--color-gray-900);
            color: var(--color-gray-400);
            padding: var(--spacing-8) 0;
            margin-top: var(--spacing-16);
            text-align: center;
        }

        footer p {
            margin-bottom: var(--spacing-1);
        }

        footer .small {
            font-size: 0.875rem;
            color: var(--color-gray-500);
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
            :root {
                --color-gray-50: #111827;
                --color-gray-100: #1F2937;
                --color-gray-200: #374151;
                --color-gray-300: #4B5563;
                --color-gray-500: #9CA3AF;
                --color-gray-700: #D1D5DB;
                --color-gray-900: #F9FAFB;

                --color-primary-50: #312E81;
                --color-primary-100: #3730A3;
                --color-primary-200: #4338CA;
                --color-primary-500: #818CF8;
                --color-primary-600: #6366F1;
                --color-primary-700: #4F46E5;
            }

            body {
                background: #0F172A;
            }

            .navbar {
                background: rgba(15, 23, 42, 0.95);
                border-bottom-color: var(--color-gray-200);
            }

            .blog-card,
            .no-posts {
                background: #1F2937;
                border-color: var(--color-gray-200);
            }

            .page-header {
                background: linear-gradient(180deg, #1F2937 0%, #0F172A 100%);
                border-bottom-color: var(--color-gray-200);
            }

            footer {
                background: #0F172A;
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
        <div class="row">
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

/**
 * Generate blog card HTML
 * @param {Object} post - Blog post object
 * @returns {string} HTML for blog card
 */
function getBlogCardHTML(post) {
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
    ? `<img src="${featuredImage}" alt="${title}" class="blog-featured-image">`
    : `<div class="blog-featured-image d-flex align-items-center justify-content-center">
         <i class="fas fa-newspaper fa-3x text-white"></i>
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

  return `
    <div class="col-md-6 col-lg-4 mb-4">
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
    ? `<img src="${featuredImage}" alt="${title}" class="img-fluid rounded mb-4" style="width: 100%; max-height: 400px; object-fit: cover;">`
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            /* Color Palette - Indigo based */
            --color-primary-50: #EEF2FF;
            --color-primary-100: #E0E7FF;
            --color-primary-200: #C7D2FE;
            --color-primary-500: #6366F1;
            --color-primary-600: #4F46E5;
            --color-primary-700: #4338CA;

            /* Neutral Grays */
            --color-gray-50: #F9FAFB;
            --color-gray-100: #F3F4F6;
            --color-gray-200: #E5E7EB;
            --color-gray-300: #D1D5DB;
            --color-gray-500: #6B7280;
            --color-gray-700: #374151;
            --color-gray-900: #111827;

            /* Spacing Scale */
            --spacing-1: 0.25rem;
            --spacing-2: 0.5rem;
            --spacing-3: 0.75rem;
            --spacing-4: 1rem;
            --spacing-5: 1.25rem;
            --spacing-6: 1.5rem;
            --spacing-8: 2rem;
        }

        body {
            background: var(--color-gray-50);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 1rem;
            line-height: 1.5;
            color: var(--color-gray-900);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .navbar {
            background: #FFFFFF;
            border-bottom: 1px solid var(--color-gray-200);
            padding: var(--spacing-3) 0;
            position: sticky;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(8px);
            background: rgba(255, 255, 255, 0.95);
        }

        .navbar-brand {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-primary-600);
            text-decoration: none;
            transition: color 0.15s ease;
        }

        .navbar-brand:hover {
            color: var(--color-primary-700);
        }

        .navbar-tagline {
            font-size: 0.875rem;
            color: var(--color-gray-500);
            margin-left: var(--spacing-4);
        }

        .visitor-info {
            font-size: 0.8125rem;
            line-height: 1.4;
        }

        .visitor-stats {
            color: var(--color-gray-700);
            font-weight: 500;
        }

        .visitor-label {
            color: var(--color-gray-500);
            font-size: 0.75rem;
        }

        .nav-links {
            display: flex;
            gap: var(--spacing-1);
        }

        .nav-link {
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--color-gray-700);
            text-decoration: none;
            padding: var(--spacing-2) var(--spacing-3);
            border-radius: 6px;
            transition: all 0.15s ease;
        }

        .nav-link:hover {
            background: var(--color-gray-100);
            color: var(--color-gray-900);
        }

        .nav-link.active {
            background: var(--color-primary-50);
            color: var(--color-primary-600);
        }

        .blog-post-container {
            background: #FFFFFF;
            border: 1px solid var(--color-gray-200);
            border-radius: 12px;
            padding: var(--spacing-16);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            margin-top: var(--spacing-8);
            margin-bottom: var(--spacing-8);
        }

        .blog-post-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--color-gray-900);
            margin-bottom: var(--spacing-4);
            line-height: 1.2;
            letter-spacing: -0.02em;
        }

        .blog-post-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: center;
            padding: 1rem 0;
            border-top: 1px solid #e9ecef;
            border-bottom: 1px solid #e9ecef;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            color: #6c757d;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .category-badge {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .tag-badge {
            background: #e9ecef;
            color: #495057;
            padding: 0.2rem 0.6rem;
            border-radius: 15px;
            font-size: 0.75rem;
        }

        .blog-post-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #2c3e50;
        }

        .blog-post-content img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin: 1.5rem 0;
        }

        .blog-post-content h2,
        .blog-post-content h3,
        .blog-post-content h4 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: #2c3e50;
            font-weight: 600;
        }

        .blog-post-content p {
            margin-bottom: 1rem;
        }

        .blog-post-content ul,
        .blog-post-content ol {
            margin-bottom: 1rem;
            padding-left: 2rem;
        }

        .back-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 20px;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .back-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            color: white;
        }

        .share-buttons {
            display: flex;
            gap: 0.5rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid #e9ecef;
        }

        .share-btn {
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: 500;
            transition: all 0.3s ease;
            border: none;
        }

        .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .share-twitter {
            background: #1da1f2;
            color: white;
        }

        .share-facebook {
            background: #1877f2;
            color: white;
        }

        .share-linkedin {
            background: #0a66c2;
            color: white;
        }

        footer {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            text-align: center;
        }

        @media (max-width: 768px) {
            .blog-post-container {
                padding: 1.5rem;
            }

            .blog-post-title {
                font-size: 1.8rem;
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}
