const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.neptechbrief.com/wp-json/wp/v2';

export interface Category {
  id: number;
  slug: string;
  name_en: string;
  name_np: string;
}

export interface Author {
  id: number;
  name: string;
  email: string;
  slug?: string;
  avatar_url?: string;
  description?: string;
}

export interface Article {
  id: number;
  slug: string;
  title_en: string;
  title_np: string;
  body_en: string;
  body_np: string;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  featured_image?: string | null;
  category_id?: number;
  author_id?: number;
  category: Category;
  author: Author;
}

export interface PaginatedArticles {
  data: Article[];
  current_page: number;
  last_page: number;
  total: number;
}

function mapWPPostToArticle(post: any): Article {
  let featured_image = null;
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
    featured_image = post._embedded['wp:featuredmedia'][0].source_url;
  }

  let authorName = 'Editor';
  let authorAvatar = '';
  let authorSlug = 'editor';
  let authorDesc = 'à¤ªà¥à¤°à¤µà¤¿à¤§à¤¿ à¤° à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤…à¤°à¥à¤¥à¤¤à¤¨à¥à¤¤à¥à¤°à¤®à¤¾ à¤µà¤¿à¤¶à¥‡à¤·à¤œà¥à¤žà¤¤à¤¾ à¤¹à¤¾à¤¸à¤¿à¤² à¤—à¤°à¥‡à¤•à¤¾ à¤à¤• à¤…à¤¨à¥à¤­à¤µà¥€ à¤ªà¤¤à¥à¤°à¤•à¤¾à¤° à¤¹à¥à¤¨à¥à¥¤';
  if (post._embedded && post._embedded.author && post._embedded.author[0]) {
    const authorData = post._embedded.author[0];
    authorName = authorData.name;
    authorSlug = authorData.slug || authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    authorDesc = authorData.description || authorDesc;
    if (authorData.avatar_urls) {
      // get highest res avatar available
      authorAvatar = authorData.avatar_urls['96'] || authorData.avatar_urls['48'] || authorData.avatar_urls['24'] || '';
    }
  }

  let categoryName = 'News';
  let categorySlug = 'news';
  if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0] && post._embedded['wp:term'][0][0]) {
    categoryName = post._embedded['wp:term'][0][0].name;
    categorySlug = post._embedded['wp:term'][0][0].slug;
  }

  return {
    id: post.id,
    slug: post.slug,
    title_en: post.title.rendered,
    title_np: post.title.rendered, // Fallback to same for now
    body_en: post.content.rendered,
    body_np: post.content.rendered,
    status: post.status,
    published_at: post.date,
    created_at: post.date,
    updated_at: post.modified,
    featured_image,
    category: {
      id: post.categories?.[0] || 1,
      slug: categorySlug,
      name_en: categoryName,
      name_np: categoryName
    },
    author: {
      id: post.author || 1,
      name: authorName,
      email: '',
      slug: authorSlug,
      avatar_url: authorAvatar,
      description: authorDesc
    }
  };
}

export async function fetchArticles(page: number = 1, limit: number = 12, q?: string): Promise<PaginatedArticles> {
  try {
    let url = `${API_BASE_URL}/posts?_embed=1&page=${page}&per_page=${limit}`;
    if (q) url += `&search=${encodeURIComponent(q)}`;
    
    const res = await fetch(url, { 
      next: { revalidate: 60 } 
    });
    
    if (!res.ok) {
      if (res.status === 400 && page > 1) {
        // WP returns 400 if page is out of bounds
        return { data: [], current_page: page, last_page: page - 1, total: 0 };
      }
      throw new Error(`Failed to fetch articles: ${res.status} ${res.statusText} (${url})`);
    }
    
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const total = parseInt(res.headers.get('X-WP-Total') || '0', 10);
    const posts = await res.json();
    
    return {
      data: posts.map(mapWPPostToArticle),
      current_page: page,
      last_page: totalPages,
      total
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { data: [], current_page: 1, last_page: 1, total: 0 };
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    
    const categories = await res.json();
    return categories.map((cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name_en: cat.name,
      name_np: cat.name
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/posts?_embed=1&slug=${slug}`, { 
      next: { revalidate: 60 } 
    });
    if (!res.ok) return null;
    
    const posts = await res.json();
    if (!posts || posts.length === 0) return null;
    
    return mapWPPostToArticle(posts[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

// Stubs for RSS feeds (since WP doesn't have this by default without custom post types)
export interface RssFeed {
  id: number; name: string; url: string; lang: string; category_id: number; is_active: boolean; category?: Category;
}
export async function fetchRssFeeds(): Promise<RssFeed[]> { return []; }
export async function createRssFeed(data: Partial<RssFeed>) { return {}; }
export async function updateRssFeed(id: number, data: Partial<RssFeed>) { return {}; }
export async function deleteRssFeed(id: number) { return {}; }

export async function fetchAuthors() {
  try {
    const url = `${API_BASE_URL}/users?per_page=100`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function fetchArticlesByAuthor(authorId: number, page: number = 1, limit: number = 12): Promise<PaginatedArticles> {
  try {
    let url = `${API_BASE_URL}/posts?author=${authorId}&_embed=1&page=${page}&per_page=${limit}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    
    if (!res.ok) {
      if (res.status === 400 && page > 1) {
        return { data: [], current_page: page, last_page: page - 1, total: 0 };
      }
      throw new Error('Failed to fetch author articles');
    }
    
    const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
    const totalItems = parseInt(res.headers.get('X-WP-Total') || '0', 10);
    
    const posts = await res.json();
    return {
      data: posts.map(mapWPPostToArticle),
      current_page: page,
      last_page: totalPages,
      total: totalItems
    };
  } catch (error) {
    console.error('Error fetching author articles:', error);
    return { data: [], current_page: page, last_page: page, total: 0 };
  }
}

export async function fetchTeamMembers() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.neptechbrief.com/wp-json/wp/v2"}/team_member?per_page=100&orderby=menu_order&order=asc`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}


