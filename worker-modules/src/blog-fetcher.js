// GitHub Pages Blog Fetcher for PaperDog
// Fetches articles from https://13331112522.github.io static site

const GITHUB_PAGES_BASE = 'https://13331112522.github.io';

// Cache TTL configuration
const CACHE_TTL = {
  BLOG_LIST: 15 * 60, // 15 minutes for blog list
  BLOG_POST: 60 * 60, // 1 hour for individual posts
  BLOG_IMAGE: 24 * 60 * 60, // 24 hours for article images
};

// Category mapping based on URL path
const PATH_CATEGORIES = {
  'papers/': 'Paper',
  'blog/': 'Blog',
  'claude-code-101/': 'Tutorial',
};

/**
 * Determine article category from its href path
 * @param {string} href - Relative URL path like "papers/oryx.html"
 * @returns {string} Category name
 */
function getCategoryFromPath(href) {
  for (const [prefix, category] of Object.entries(PATH_CATEGORIES)) {
    if (href.startsWith(prefix)) {
      return category;
    }
  }
  return 'Blog';
}

/**
 * Derive a slug from a relative href path
 * Strips directory prefix and .html extension
 * e.g. "papers/oryx-multi-mixer.html" -> "papers-oryx-multi-mixer"
 * e.g. "blog/raspberrypi-nanobot.html" -> "blog-raspberrypi-nanobot"
 * @param {string} href - Relative URL path
 * @returns {string} Slug suitable for /blog/:slug route
 */
function slugFromHref(href) {
  return href
    .replace(/\.html$/, '')
    .replace(/\//g, '-');
}

/**
 * Parse the index.html listing page and extract articles
 * Handles three section types: tutorials, blog posts, and paper interpretations
 * @param {string} html - Full HTML of index.html
 * @returns {Array} Array of article objects
 */
function parseIndexArticles(html) {
  const articles = [];

  // ── Strategy 1: Parse <li class="article-item"> blocks ──
  // Each article-item contains: <h2><a href="...">title</a></h2>,
  //   <div class="article-meta">...</div>, <div class="article-desc">...</div>
  const itemRegex = /<li\s+class="article-item[^"]*">([\s\S]*?)<\/li>/g;
  let match;

  while ((match = itemRegex.exec(html)) !== null) {
    const block = match[1];

    // Extract href and title from the h2 > a link
    const linkMatch = block.match(/<h2>\s*<a\s+href="([^"]+)">\s*([\s\S]*?)\s*<\/a>/);
    if (!linkMatch) continue;
    const href = linkMatch[1].trim();
    const title = linkMatch[2].replace(/<[^>]*>/g, '').trim();

    // Extract article-meta content
    const metaMatch = block.match(/<div\s+class="article-meta">([\s\S]*?)<\/div>/);
    const metaHtml = metaMatch ? metaMatch[1] : '';

    // Extract date (YYYY-MM-DD pattern)
    const dateMatch = metaHtml.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Extract badges (tags) from <span class="badge">...</span>
    const tagMatches = metaHtml.match(/<span\s+class="badge">([\s\S]*?)<\/span>/g);
    const tags = tagMatches
      ? tagMatches.map(t => t.replace(/<\/?span[^>]*>/g, '').trim())
      : [];

    // Also extract sep spans as additional tags (institution/topic labels)
    const sepMatches = metaHtml.match(/<span\s+class="sep">([\s\S]*?)<\/span>/g);
    if (sepMatches) {
      sepMatches.forEach(s => {
        const val = s.replace(/<\/?span[^>]*>/g, '').trim();
        if (val) tags.push(val);
      });
    }

    // Extract article description (excerpt)
    const descMatch = block.match(/<div\s+class="article-desc">([\s\S]*?)<\/div>/);
    const excerpt = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Determine category
    const category = getCategoryFromPath(href);

    // Extract featured image from article block
    const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
    const featuredImage = imgMatch ? imgMatch[1] : null;

    // Build slug
    const slug = slugFromHref(href);

    articles.push({
      id: slug,
      slug,
      title,
      excerpt,
      content: excerpt, // For list view, content = excerpt
      link: `${GITHUB_PAGES_BASE}/${href}`,
      featuredImage,
      date,
      categories: [category],
      tags,
      author: { name: 'PaperDog', url: '#' },
      commentCount: 0,
      commentStatus: 'closed',
      _href: href, // internal: original relative path for detail fetching
    });
  }

  // ── Strategy 2: Parse claude-code-101 card grid (if not already captured) ──
  // These are <a href="..." class="card"> blocks inside the tutorial section
  const cardRegex = /<a\s+href="([^"]+)"\s+class="card">([\s\S]*?)<\/a>/g;

  while ((match = cardRegex.exec(html)) !== null) {
    const href = match[1].trim();
    const block = match[2];

    // Only process claude-code-101 links
    if (!href.startsWith('claude-code-101/')) continue;

    // Check if already captured by article-item parsing
    const slug = slugFromHref(href);
    if (articles.some(a => a.slug === slug)) continue;

    // Extract card-num (lesson number)
    const numMatch = block.match(/<span\s+class="card-num">([\s\S]*?)<\/span>/);
    const lessonNum = numMatch ? numMatch[1].trim() : '';

    // Extract title from h3
    const titleMatch = block.match(/<h3>([\s\S]*?)<\/h3>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract description from <p>
    const descMatch = block.match(/<div\s+class="card-body">[\s\S]*?<p>([\s\S]*?)<\/p>/);
    const excerpt = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Extract featured image from card block
    const cardImgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
    const featuredImage = cardImgMatch ? cardImgMatch[1] : null;

    articles.push({
      id: slug,
      slug,
      title: lessonNum ? `${lessonNum}: ${title}` : title,
      excerpt,
      content: excerpt,
      link: `${GITHUB_PAGES_BASE}/${href}`,
      featuredImage,
      date: '2026-05-20',
      categories: ['Tutorial'],
      tags: ['Claude Code', 'Anthropic'],
      author: { name: 'PaperDog', url: '#' },
      commentCount: 0,
      commentStatus: 'closed',
      _href: href,
    });
  }

  // Sort by date descending
  articles.sort((a, b) => b.date.localeCompare(a.date));

  return articles;
}

/**
 * Parse a detail page and extract its main content
 * Handles two page types:
 * 1. Paper pages: <header> with .site-title + .meta, .highlight-box, body content
 * 2. Blog/tutorial pages: <h1> title, <section> content blocks
 * @param {string} html - Full HTML of the detail page
 * @param {string} href - Original relative path (for reference)
 * @returns {Object} Object with title, date, tags, content properties
 */
function parseDetailPage(html, href) {
  // ── Paper pages: extract header info ──
  // Structure: <header><div class="site-title">Title</div><div class="meta">... date ...</div></header>
  // Then: <div class="highlight-box">summary</div>
  // Then: content until <footer>

  // Try paper page structure first
  const headerMatch = html.match(/<header>([\s\S]*?)<\/header>/);
  if (headerMatch) {
    const headerHtml = headerMatch[1];

    // Title from .site-title (may contain <a> link)
    const siteTitleMatch = headerHtml.match(/<div\s+class="site-title">([\s\S]*?)<\/div>/);
    let title = '';
    if (siteTitleMatch) {
      // Could be "PaperDog 论文解读\n  Actual Title" or just the title
      const parts = siteTitleMatch[1].replace(/<[^>]*>/g, '').trim().split('\n');
      title = parts.filter(p => p.trim()).map(p => p.trim()).pop() || '';
    }

    // Date from .meta div
    const metaDivMatch = headerHtml.match(/<div\s+class="meta">([\s\S]*?)<\/div>/);
    const metaText = metaDivMatch ? metaDivMatch[1] : '';
    const dateMatch = metaText.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

    // Tags: extract from meta text - everything between middot separators
    const metaTags = [];
    const metaParts = metaText.replace(/<\/?[^>]+>/g, '').split(/&middot;|·/);
    for (const part of metaParts) {
      const cleaned = part.trim();
      if (cleaned && !cleaned.match(/^\d{4}-\d{2}-\d{2}$/) && !cleaned.match(/^arXiv/i)) {
        // Split compound tags like "CMU / Google Research"
        const subParts = cleaned.split(/\s*\/\s*/);
        for (const sp of subParts) {
          const t = sp.trim();
          if (t) metaTags.push(t);
        }
      }
    }

    // Highlight box as excerpt
    const highlightMatch = html.match(/<div\s+class="highlight-box">([\s\S]*?)<\/div>/);
    const excerpt = highlightMatch ? highlightMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // Full content: everything in the .page div between header and footer
    const pageMatch = html.match(/<div\s+class="page">([\s\S]*?)<\/div>\s*<\/body>/);
    let content = '';
    if (pageMatch) {
      // Strip header and footer
      content = pageMatch[1]
        .replace(/<header>[\s\S]*?<\/header>/, '')
        .replace(/<footer>[\s\S]*?<\/footer>/, '')
        .trim();
    }

    // If no .page div, try body content minus header/footer
    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
      if (bodyMatch) {
        content = bodyMatch[1]
          .replace(/<header>[\s\S]*?<\/header>/, '')
          .replace(/<footer>[\s\S]*?<\/footer>/, '')
          .replace(/<div\s+class="page">/g, '')
          .replace(/<\/div>\s*$/g, '')
          .trim();
      }
    }

    // Extract featured image from content
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    const featuredImage = imgMatch ? imgMatch[1] : null;

    return {
      title: title || 'Untitled',
      date,
      tags: metaTags.length > 0 ? metaTags : ['Paper'],
      excerpt,
      content: content || excerpt,
      featuredImage,
    };
  }

  // ── Blog/Tutorial pages: extract h1 + section content ──
  // Structure: <h1 style="...">Title</h1><p>date · tags</p>
  //            <section class="container">content</section>

  // Title from h1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : 'Untitled';

  // Date from the subtitle paragraph: "2026-05-22 · tag1 · tag2"
  const subtitleMatch = html.match(/<p[^>]*style="[^"]*text-align:center[^"]*"[^>]*>([\s\S]*?)<\/p>/);
  const subtitleText = subtitleMatch ? subtitleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
  const dateMatch2 = subtitleText.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch2 ? dateMatch2[1] : new Date().toISOString().split('T')[0];

  // Tags from subtitle: split by middot
  const tags = [];
  const subParts = subtitleText.split(/·|&middot;/);
  for (const part of subParts) {
    const cleaned = part.trim();
    if (cleaned && !cleaned.match(/^\d{4}-\d{2}-\d{2}$/)) {
      tags.push(cleaned);
    }
  }

  // Content from <section> blocks
  const sectionMatches = html.match(/<section[^>]*>([\s\S]*?)<\/section>/g);
  let content = '';
  if (sectionMatches) {
    content = sectionMatches.join('\n');
  }

  // Fallback: body content minus h1 and subtitle
  if (!content) {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (bodyMatch) {
      content = bodyMatch[1]
        .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '')
        .replace(/<footer>[\s\S]*?<\/footer>/, '')
        .trim();
    }
  }

  // Excerpt: first 200 chars of content with tags stripped
  const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 200).trim();

  // Extract featured image from content
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  const featuredImage = imgMatch ? imgMatch[1] : null;

  return {
    title,
    date,
    tags: tags.length > 0 ? tags : ['Blog'],
    excerpt,
    content,
    featuredImage,
  };
}

/**
 * Fetch all blog posts from GitHub Pages
 * @param {Object} env - Cloudflare Workers environment
 * @param {Object} options - Fetch options
 * @param {number} options.perPage - Number of posts to return (default: 24)
 * @param {number} options.page - Page number for pagination (default: 1)
 * @returns {Promise<Array>} Array of blog posts
 */
export async function fetchBlogPosts(env, options = {}) {
  const { perPage = 24, page = 1 } = options;

  // Check cache first
  const cacheKey = `blog_posts_page_${page}`;
  const cached = await env.PAPERS.get(cacheKey, 'json');
  if (cached) {
    console.log('Blog posts cache hit for page', page);
    return cached;
  }

  try {
    // Fetch the index page listing
    const url = `${GITHUB_PAGES_BASE}/index.html`;
    console.log('Fetching blog posts from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub Pages error: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const allArticles = parseIndexArticles(html);

    // Apply pagination
    const start = (page - 1) * perPage;
    const posts = allArticles.slice(start, start + perPage);

    // Pre-fetch images for all articles: check KV cache first, then fetch missing ones
    const ARTICLES_PER_PAGE = 6;
    const postsNeedingImages = posts.filter(p => !p.featuredImage && p.slug);

    // Check KV cache for all at once
    const cacheChecks = await Promise.all(
      postsNeedingImages.map(p => env.PAPERS.get(`blog_img_${p.slug}`, 'json'))
    );

    // Separate cached vs uncached
    const cached = [];
    const uncached = [];
    postsNeedingImages.forEach((post, i) => {
      if (cacheChecks[i]) {
        post.featuredImage = `/api/blog/image/${post.slug}`;
        cached.push(post.slug);
      } else {
        uncached.push(post);
      }
    });

    // Fetch missing images in batches — first page eagerly, rest in background
    if (uncached.length > 0) {
      const firstPage = uncached.slice(0, ARTICLES_PER_PAGE);
      const rest = uncached.slice(ARTICLES_PER_PAGE);

      // Fetch first page images now (so they render immediately)
      await Promise.allSettled(firstPage.map(post =>
        prefetchArticleImage(env, post.slug, post._href)
          .then(ok => { if (ok) post.featuredImage = `/api/blog/image/${post.slug}`; })
      ));

      // Fetch remaining images fire-and-forget (don't await)
      if (rest.length > 0) {
        Promise.allSettled(rest.map(post =>
          prefetchArticleImage(env, post.slug, post._href)
        )).catch(() => {});
      }
    }

    // Remove internal _href field before caching
    const cleanedPosts = posts.map(({ _href, ...rest }) => rest);

    // Cache the results
    await env.PAPERS.put(cacheKey, JSON.stringify(cleanedPosts), {
      expirationTtl: CACHE_TTL.BLOG_LIST,
    });

    console.log(`Fetched and cached ${cleanedPosts.length} blog posts`);
    return cleanedPosts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }
}

/**
 * Fetch a single blog post by slug
 * @param {Object} env - Cloudflare Workers environment
 * @param {string} slug - Post slug (e.g. "papers-oryx-multi-mixer")
 * @returns {Promise<Object|null>} Blog post object or null if not found
 */
export async function fetchBlogPostBySlug(env, slug) {
  // Check cache first
  const cacheKey = `blog_post_${slug}`;
  const cached = await env.PAPERS.get(cacheKey, 'json');
  if (cached) {
    console.log('Blog post cache hit:', slug);
    return cached;
  }

  try {
    // Convert slug back to href path
    // e.g. "papers-oryx-multi-mixer" -> "papers/oryx-multi-mixer.html"
    // e.g. "blog-raspberrypi-nanobot" -> "blog/raspberrypi-nanobot.html"
    // e.g. "claude-code-101-what-is-claude-code" -> "claude-code-101/what-is-claude-code.html"
    const href = slugToHref(slug);
    if (!href) {
      console.warn('Could not resolve slug to path:', slug);
      return null;
    }

    const url = `${GITHUB_PAGES_BASE}/${href}`;
    console.log('Fetching blog post from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`GitHub Pages error: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const parsed = parseDetailPage(html, href);

    // Determine category from the href
    const category = getCategoryFromPath(href);

    const post = {
      id: slug,
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      link: url,
      featuredImage: parsed.featuredImage || null,
      date: parsed.date,
      categories: [category],
      tags: parsed.tags,
      author: { name: 'PaperDog', url: '#' },
      commentCount: 0,
      commentStatus: 'closed',
    };

    // Cache the result
    await env.PAPERS.put(cacheKey, JSON.stringify(post), {
      expirationTtl: CACHE_TTL.BLOG_POST,
    });

    console.log('Fetched and cached blog post:', slug);
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }
}

/**
 * Convert a slug back to a GitHub Pages href path
 * Must handle the ambiguity of knowing where the directory prefix ends
 * and the filename begins. We try known prefixes first.
 * @param {string} slug - Slug like "papers-oryx-multi-mixer"
 * @returns {string|null} Href like "papers/oryx-multi-mixer.html"
 */
export function slugToHref(slug) {
  // Known directory prefixes in priority order
  const prefixes = ['claude-code-101', 'papers', 'blog'];

  for (const prefix of prefixes) {
    if (slug.startsWith(prefix + '-')) {
      const remainder = slug.slice(prefix.length + 1);
      if (remainder) {
        return `${prefix}/${remainder}.html`;
      }
    }
  }

  // Fallback: if no known prefix matches, treat the whole slug as a blog post
  return `blog/${slug}.html`;
}

/**
 * Fetch and serve the first image for a blog article.
 * Handles both URL-based images (302 redirect) and base64 images (raw bytes).
 * Results are cached in KV for 24 hours.
 * @param {Object} env - Cloudflare Workers environment
 * @param {string} slug - Article slug
 * @returns {Response} Image response (redirect or raw bytes)
 */
export async function handleBlogImageRequest(env, slug) {
  const cacheKey = `blog_img_${slug}`;

  // Check KV cache first
  const cached = await env.PAPERS.get(cacheKey, 'json');
  if (cached) {
    if (cached.type === 'url') {
      return Response.redirect(cached.src, 302);
    }
    if (cached.type === 'base64') {
      const bytes = Uint8Array.from(atob(cached.data), c => c.charCodeAt(0));
      return new Response(bytes, {
        headers: {
          'Content-Type': cached.contentType || 'image/png',
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  const href = slugToHref(slug);
  if (!href) return new Response(null, { status: 404 });

  try {
    const url = `${GITHUB_PAGES_BASE}/${href}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'text/html' },
    });
    if (!response.ok) return new Response(null, { status: 404 });

    // Stream-read only up to 800KB instead of downloading the entire page
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = '';
    const MAX_READ = 800000;
    while (html.length < MAX_READ) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel();

    // Extract image sources
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
    if (imgMatches.length === 0) return new Response(null, { status: 404 });

    // Prefer URL-based images
    let chosenSrc = null;
    for (const m of imgMatches) {
      const src = m[1];
      if (!src.startsWith('data:')) {
        if (src.startsWith('http')) {
          chosenSrc = src;
        } else {
          const dir = href.includes('/') ? href.substring(0, href.lastIndexOf('/') + 1) : '';
          chosenSrc = `${GITHUB_PAGES_BASE}/${dir}${src}`;
        }
        break;
      }
    }

    // For base64: use first image > 10KB (skip tiny logos)
    if (!chosenSrc) {
      for (const m of imgMatches) {
        const src = m[1];
        if (src.startsWith('data:image/') && src.length > 10000) {
          chosenSrc = src;
          break;
        }
      }
    }

    if (!chosenSrc) return new Response(null, { status: 404 });

    // Cache and respond
    if (chosenSrc.startsWith('data:')) {
      const dataMatch = chosenSrc.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
      if (!dataMatch) return new Response(null, { status: 404 });

      const contentType = dataMatch[1];
      const base64Data = dataMatch[2];

      // Cache the base64 data
      await env.PAPERS.put(cacheKey, JSON.stringify({
        type: 'base64',
        data: base64Data,
        contentType,
      }), { expirationTtl: CACHE_TTL.BLOG_IMAGE });

      // Serve decoded image
      const bytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      return new Response(bytes, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      // Cache URL
      await env.PAPERS.put(cacheKey, JSON.stringify({
        type: 'url',
        src: chosenSrc,
      }), { expirationTtl: CACHE_TTL.BLOG_IMAGE });

      return Response.redirect(chosenSrc, 302);
    }
  } catch (error) {
    console.error('Error fetching article image:', error);
    return new Response(null, { status: 500 });
  }
}

/**
 * Pre-fetch and cache the first image for a blog article.
 * Used during fetchBlogPosts to populate images eagerly.
 * @param {Object} env - Cloudflare Workers environment
 * @param {string} slug - Article slug
 * @param {string} href - Relative href path (e.g. "papers/oryx.html")
 * @returns {Promise<boolean>} true if image was found and cached
 */
async function prefetchArticleImage(env, slug, href) {
  const cacheKey = `blog_img_${slug}`;

  // Already cached — skip
  const existing = await env.PAPERS.get(cacheKey, 'json');
  if (existing) return true;

  const resolvedHref = href || slugToHref(slug);
  if (!resolvedHref) return false;

  try {
    const url = `${GITHUB_PAGES_BASE}/${resolvedHref}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'text/html' },
    });
    if (!response.ok) return false;

    // Stream-read only up to 800KB
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = '';
    const MAX_READ = 800000;
    while (html.length < MAX_READ) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel();

    // Extract image sources
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
    if (imgMatches.length === 0) return false;

    // Prefer URL-based images
    let chosenSrc = null;
    for (const m of imgMatches) {
      const src = m[1];
      if (!src.startsWith('data:')) {
        if (src.startsWith('http')) {
          chosenSrc = src;
        } else {
          const dir = resolvedHref.includes('/') ? resolvedHref.substring(0, resolvedHref.lastIndexOf('/') + 1) : '';
          chosenSrc = `${GITHUB_PAGES_BASE}/${dir}${src}`;
        }
        break;
      }
    }

    // Fallback: base64 > 10KB
    if (!chosenSrc) {
      for (const m of imgMatches) {
        const src = m[1];
        if (src.startsWith('data:image/') && src.length > 10000) {
          chosenSrc = src;
          break;
        }
      }
    }

    if (!chosenSrc) return false;

    // Cache
    if (chosenSrc.startsWith('data:')) {
      const dataMatch = chosenSrc.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
      if (!dataMatch) return false;
      await env.PAPERS.put(cacheKey, JSON.stringify({
        type: 'base64',
        data: dataMatch[2],
        contentType: dataMatch[1],
      }), { expirationTtl: CACHE_TTL.BLOG_IMAGE });
    } else {
      await env.PAPERS.put(cacheKey, JSON.stringify({
        type: 'url',
        src: chosenSrc,
      }), { expirationTtl: CACHE_TTL.BLOG_IMAGE });
    }

    return true;
  } catch (error) {
    console.error('Error prefetching article image:', slug, error.message);
    return false;
  }
}

/**
 * Clear blog cache
 * @param {Object} env - Cloudflare Workers environment
 * @param {string} key - Optional specific cache key to clear
 */
export async function clearBlogCache(env, key = null) {
  if (key) {
    await env.PAPERS.delete(key);
    console.log('Cleared blog cache key:', key);
  } else {
    // Clear all blog-related cache keys
    // Note: This would require listing keys, which isn't directly supported in KV
    // For now, just log that manual clearing might be needed
    console.log('Blog cache clearing requires manual KV key deletion');
  }
}
