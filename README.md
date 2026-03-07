# Guru Based — gurubased.co.uk

Static site. Vanilla HTML/CSS/JS. Blog powered by Supabase.

## Stack
- HTML / CSS / JS (no framework)
- Supabase (blog CMS)
- Netlify (hosting + forms)
- Kit/ConvertKit (newsletter)

## Files
- `index.html` — Home (newsletter CTA)
- `blog.html` — Article grid (pulls from Supabase)
- `article.html` — Single article (pulls by slug)
- `about.html` — About page
- `contact.html` — Contact form (Netlify Forms)
- `styles.css` — All styles
- `config.js` — Supabase credentials
- `js/nav.js` — Nav + scroll + fade-in
- `js/blog.js` — Fetches articles from Supabase
- `js/article.js` — Fetches single article by slug

## Supabase Table: articles
Fields: id, title, slug, category, excerpt, content (markdown), cover_image, author, publish_date, read_time, faqs (JSON), is_published (boolean)

## Deploy
Push to GitHub → connect to Netlify → point gurubased.co.uk DNS to Netlify.
