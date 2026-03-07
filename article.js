// ─── ARTICLE PAGE ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const slug = new URLSearchParams(window.location.search).get('slug');

  if (!slug) {
    window.location.href = 'blog.html';
    return;
  }

  const container = document.getElementById('article-content');
  container.innerHTML = '<div class="blog-loading">LOADING...</div>';

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&is_published=eq.true&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();

    if (!data.length) {
      container.innerHTML = '<div class="blog-empty">Article not found. <a href="blog.html">← Back to The Lab</a></div>';
      return;
    }

    const a = data[0];

    // Update page title
    document.title = `${a.title} — Guru Based`;

    // Parse FAQs
    let faqs = [];
    if (a.faqs) {
      try { faqs = typeof a.faqs === 'string' ? JSON.parse(a.faqs) : a.faqs; } catch {}
    }

    container.innerHTML = `
      <article class="article-layout fade-in visible">
        <div class="article-header">
          ${a.category ? `<div class="article-category">${a.category}</div>` : ''}
          <h1 class="article-title">${a.title}</h1>
          <div class="article-meta">
            ${a.author ? `<span>By ${a.author}</span>` : ''}
            ${a.publish_date ? `<span>${formatDate(a.publish_date)}</span>` : ''}
            ${a.read_time ? `<span>${a.read_time}</span>` : ''}
          </div>
        </div>

        ${a.cover_image ? `<img src="${a.cover_image}" alt="${a.title}" class="article-cover">` : ''}

        <div class="article-body" id="article-body"></div>

        ${faqs.length ? `
          <div class="faqs">
            <h2>FAQ</h2>
            ${faqs.map((faq, i) => `
              <div class="faq-item" id="faq-${i}">
                <div class="faq-question" onclick="toggleFaq(${i})">${faq.question}</div>
                <div class="faq-answer">${faq.answer}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="article-cta">
          <h3>Enjoyed this?</h3>
          <p>Get one framework and one action plan every week. Free.</p>
          <a href="https://gurubased.kit.com/9b82aed3c0" target="_blank" rel="noopener" class="btn">Join the Lab →</a>
        </div>
      </article>
    `;

    // Render markdown
    if (a.content && window.marked) {
      document.getElementById('article-body').innerHTML = marked.parse(a.content);
    } else if (a.content) {
      document.getElementById('article-body').textContent = a.content;
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="blog-empty">Could not load article. <a href="blog.html">← Back to The Lab</a></div>';
  }
});

function toggleFaq(i) {
  const item = document.getElementById(`faq-${i}`);
  item.classList.toggle('open');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
