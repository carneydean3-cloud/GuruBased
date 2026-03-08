// ─── BLOG PAGE ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('article-grid');

  grid.innerHTML = '<div class="blog-loading">LOADING_ARTICLES...</div>';

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?is_published=eq.true&order=publish_date.desc&select=id,title,slug,category,excerpt,cover_image,read_time,publish_date`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!res.ok) throw new Error('Failed to fetch articles');

    const articles = await res.json();

    if (!articles.length) {
      grid.innerHTML = '<div class="blog-empty">NO_ARTICLES_YET — Check back soon.</div>';
      return;
    }

    grid.innerHTML = articles.map(a => `
      <article class="article-card fade-in">
        ${a.cover_image
          ? `<div class="article-card__image"><img src="${a.cover_image}" alt="${a.title}" loading="lazy"></div>`
          : `<div class="article-card__placeholder">[ GURU BASED ]</div>`
        }
        <div class="article-card__body">
          ${a.category ? `<div class="article-card__category">${a.category}</div>` : ''}
          <h2 class="article-card__title">${a.title}</h2>
          ${a.excerpt ? `<p class="article-card__excerpt">${a.excerpt}</p>` : ''}
          <div class="article-card__meta">
            <span class="article-card__meta-info">
              ${a.publish_date ? formatDate(a.publish_date) : ''}
              ${a.read_time ? ` · ${a.read_time}` : ''}
            </span>
            <a href="article.html?slug=${a.slug}" class="article-card__read">Read →</a>
          </div>
        </div>
      </article>
    `).join('');

    // Trigger fade-in observer
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.classList.add('visible');
          observer.unobserve(el.target);
        }
      });
    }, { threshold: 0.05 });
    fadeEls.forEach(el => observer.observe(el));

  } catch (err) {
    console.error(err);
    grid.innerHTML = '<div class="blog-empty">Could not load articles. Please try again later.</div>';
  }
});

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
