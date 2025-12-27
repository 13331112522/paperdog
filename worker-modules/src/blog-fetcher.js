// WordPress Blog Fetcher for PaperDog
// Fetches blog posts from zhouql1978.wordpress.com using WordPress.com REST API

const WORDPRESS_SITE = 'zhouql1978.wordpress.com';
const WORDPRESS_API_BASE = `https://public-api.wordpress.com/rest/v1.1/sites/${WORDPRESS_SITE}`;

// Cache TTL configuration
const CACHE_TTL = {
  BLOG_LIST: 15 * 60, // 15 minutes for blog list
  BLOG_POST: 60 * 60, // 1 hour for individual posts
};

/**
 * Fetch all blog posts from WordPress
 * @param {Object} env - Cloudflare Workers environment
 * @param {Object} options - Fetch options
 * @param {number} options.perPage - Number of posts to fetch (default: 10)
 * @param {number} options.page - Page number for pagination (default: 1)
 * @returns {Promise<Array>} Array of blog posts
 */
export async function fetchBlogPosts(env, options = {}) {
  const { perPage = 10, page = 1 } = options;

  // Check cache first
  const cacheKey = `blog_posts_page_${page}`;
  const cached = await env.PAPERS.get(cacheKey, 'json');
  if (cached) {
    console.log('✅ Blog posts cache hit for page', page);
    return cached;
  }

  try {
    // Fetch from WordPress.com REST API
    const url = `${WORDPRESS_API_BASE}/posts/?number=${perPage}&page=${page}`;
    console.log('📝 Fetching blog posts from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const posts = data.posts || [];

    // Transform WordPress posts to our format
    const transformedPosts = posts.map(transformWordPressPost);

    // Cache the results
    await env.PAPERS.put(cacheKey, JSON.stringify(transformedPosts), {
      expirationTtl: CACHE_TTL.BLOG_LIST,
    });

    console.log(`✅ Fetched and cached ${transformedPosts.length} blog posts`);
    return transformedPosts;
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }
}

/**
 * Fetch a single blog post by slug
 * @param {Object} env - Cloudflare Workers environment
 * @param {string} slug - Post slug
 * @returns {Promise<Object>} Blog post object
 */
export async function fetchBlogPostBySlug(env, slug) {
  // Check cache first
  const cacheKey = `blog_post_${slug}`;
  const cached = await env.PAPERS.get(cacheKey, 'json');
  if (cached) {
    console.log('✅ Blog post cache hit:', slug);
    return cached;
  }

  try {
    // Fetch from WordPress.com REST API
    const url = `${WORDPRESS_API_BASE}/posts/?slug=${slug}`;
    console.log('📝 Fetching blog post from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const posts = data.posts || [];

    if (!posts || posts.length === 0) {
      return null;
    }

    // Find the post with matching slug
    const matchedPost = posts.find(p => p.slug === slug);

    if (!matchedPost) {
      console.warn('⚠️ No post found with slug:', slug);
      return null;
    }

    const post = transformWordPressPost(matchedPost);

    // Cache the result
    await env.PAPERS.put(cacheKey, JSON.stringify(post), {
      expirationTtl: CACHE_TTL.BLOG_POST,
    });

    console.log('✅ Fetched and cached blog post:', slug);
    return post;
  } catch (error) {
    console.error('❌ Error fetching blog post:', error);
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }
}

/**
 * Transform WordPress post to our format
 * @param {Object} wpPost - WordPress post object
 * @returns {Object} Transformed post
 */
function transformWordPressPost(wpPost) {
  // Extract featured image
  let featuredImage = null;
  if (wpPost.featured_image) {
    featuredImage = wpPost.featured_image;
  } else if (wpPost.post_thumbnail && wpPost.post_thumbnail.URL) {
    featuredImage = wpPost.post_thumbnail.URL;
  }

  // Extract categories
  const categories = wpPost.categories || [];

  // Extract tags
  const tags = wpPost.tags || [];

  // Format content (WordPress.com API returns HTML content)
  const content = wpPost.content || '';

  // Get excerpt if available, otherwise generate from content
  let excerpt = wpPost.excerpt || '';
  if (!excerpt && content) {
    // Strip HTML tags and get first 150 characters
    excerpt = content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
  }

  return {
    id: wpPost.ID,
    slug: wpPost.slug,
    title: wpPost.title,
    excerpt,
    content,
    link: wpPost.URL,
    featuredImage,
    date: wpPost.date,
    modified: wpPost.modified,
    categories,
    tags,
    author: {
      name: wpPost.author?.name || wpPost.author?.nice_name || 'Admin',
      url: wpPost.author?.URL || '#',
    },
    commentCount: wpPost.comment_count || 0,
    commentStatus: wpPost.comment_status || 'open',
  };
}

/**
 * Clear blog cache
 * @param {Object} env - Cloudflare Workers environment
 * @param {string} key - Optional specific cache key to clear
 */
export async function clearBlogCache(env, key = null) {
  if (key) {
    await env.PAPERS.delete(key);
    console.log('🗑️ Cleared blog cache key:', key);
  } else {
    // Clear all blog-related cache keys
    // Note: This would require listing keys, which isn't directly supported in KV
    // For now, just log that manual clearing might be needed
    console.log('⚠️ Blog cache clearing requires manual KV key deletion');
  }
}
