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
    document.title = `${a.title} — Guru Based`;

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

        ${a.audio_url ? `
        <div class="audio-player">
          <audio id="gb-audio" src="${a.audio_url}" preload="metadata"></audio>
          <div class="audio-player__inner">
            <button class="audio-btn" id="play-btn" onclick="togglePlay()">
              <span id="play-icon">▶</span> <span id="play-label">Listen to this article</span>
            </button>
            <div class="audio-progress-wrap" onclick="seekAudio(event)" title="Click to seek">
              <div class="audio-progress-bar" id="progress-bar"></div>
            </div>
            <span class="audio-time" id="audio-time">0:00</span>
          </div>
        </div>
        ` : ''}

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

    if (a.content && window.marked) {
      document.getElementById('article-body').innerHTML = marked.parse(a.content);
    } else if (a.content) {
      document.getElementById('article-body').textContent = a.content;
    }

    if (a.audio_url) {
      const audio = document.getElementById('gb-audio');
      const progressBar = document.getElementById('progress-bar');
      const timeEl = document.getElementById('audio-time');
      audio.addEventListener('timeupdate', () => {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (!isNaN(pct)) progressBar.style.width = pct + '%';
        timeEl.textContent = formatTime(audio.currentTime);
      });
      audio.addEventListener('ended', () => {
        document.getElementById('play-icon').textContent = '▶';
        document.getElementById('play-label').textContent = 'Listen to this article';
      });
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="blog-empty">Could not load article. <a href="blog.html">← Back to The Lab</a></div>';
  }
});

function togglePlay() {
  const audio = document.getElementById('gb-audio');
  const icon = document.getElementById('play-icon');
  const label = document.getElementById('play-label');
  if (audio.paused) {
    audio.play();
    icon.textContent = '⏸';
    label.textContent = 'Pause';
  } else {
    audio.pause();
    icon.textContent = '▶';
    label.textContent = 'Listen to this article';
  }
}

function seekAudio(e) {
  const audio = document.getElementById('gb-audio');
  const wrap = e.currentTarget;
  const pct = e.offsetX / wrap.offsetWidth;
  audio.currentTime = pct * audio.duration;
}

function toggleFaq(i) {
  document.getElementById(`faq-${i}`).classList.toggle('open');
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
