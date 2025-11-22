const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// Minimal CSP that still permits your iframe hosts
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "frame-ancestors 'self'",
      "frame-src https://iframe.pstream.org https://vidsrc.su",
      "connect-src 'self'",
    ].join('; ')
  );
  next();
});

// Reusable HTML shell
function renderPage({ title, embedUrl = '', subtitle = '' }) {
  const isPlayer = Boolean(embedUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <title>${title ? title + ' · ' : ''}CineLite</title>
  <link rel="stylesheet" href="/style.css"/>
  <meta name="color-scheme" content="light dark"/>
</head>
<body>
  <header class="site-header container">
    <a class="brand" href="/"><span aria-hidden="true">🎬</span> <strong>CineLite</strong></a>
    <div class="header-actions">
      <button id="themeToggle" class="btn btn--ghost" aria-label="Toggle dark mode">
        <span class="only-light">🌙</span><span class="only-dark">☀️</span>
      </button>
      <a class="btn btn--remix" href="https://glitch.com/edit/#!/glitch-hello-node" rel="noopener">Remix on Glitch</a>
    </div>
  </header>

  <main class="wrapper">
    <section class="content container ${isPlayer ? 'content--player' : ''}">
      ${
        isPlayer
          ? `
      <h1 class="title">${title || 'Player'}</h1>
      ${subtitle ? `<p class="lead">${subtitle}</p>` : ''}
      <div class="player-card">
        <div class="player-aspect">
          <iframe
            class="video"
            src="${embedUrl}"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
            loading="eager"
            referrerpolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          ></iframe>
          <div class="loader" id="loader" aria-hidden="true">
            <div class="spinner"></div>
            <span>Loading stream…</span>
          </div>
        </div>
        <p class="disclaimer">If the video fails to load, try another source or refresh.</p>
      </div>
          `
          : `
      <h1 class="title">Watch beautifully, fast.</h1>
      <p class="lead">Jump straight to a movie or TV episode by ID. Your player opens in a sleek, responsive layout.</p>

      <div class="grid">
        <article class="card">
          <h2>Open a Movie</h2>
          <form class="form" id="movieForm" autocomplete="off">
            <label for="movieId">TMDB Movie ID</label>
            <input id="movieId" name="movieId" type="number" placeholder="e.g. 550 (Fight Club)" required/>
            <button class="btn btn--primary" type="submit">Open Movie</button>
          </form>
          <p class="form-help">Route pattern: <code>/movie/:id</code></p>
        </article>

        <article class="card">
          <h2>Open a TV Episode</h2>
          <form class="form" id="tvForm" autocomplete="off">
            <div class="grid-3">
              <div>
                <label for="tvId">TMDB TV ID</label>
                <input id="tvId" name="tvId" type="number" placeholder="e.g. 1399 (GoT)" required/>
              </div>
              <div>
                <label for="season">Season</label>
                <input id="season" name="season" type="number" placeholder="e.g. 1" required/>
              </div>
              <div>
                <label for="episode">Episode</label>
                <input id="episode" name="episode" type="number" placeholder="e.g. 1" required/>
              </div>
            </div>
            <button class="btn btn--primary" type="submit">Open Episode</button>
          </form>
          <p class="form-help">Route pattern: <code>/tv/:id/:season/:episode</code></p>
        </article>

        <article class="card">
          <h2>Tips</h2>
          <ul class="tips">
            <li>Fully responsive 16:9 player with safe area and dark mode.</li>
            <li>Accessible focus states and keyboard-friendly forms.</li>
            <li>Minimal CSP, allows only the two iframe providers you use.</li>
          </ul>
        </article>
      </div>

      <script>
        (function(){
          const $ = (s, r=document)=>r.querySelector(s);
          $('#movieForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const id = $('#movieId').value.trim();
            if(id) location.href = '/movie/' + encodeURIComponent(id);
          });
          $('#tvForm')?.addEventListener('submit', e => {
            e.preventDefault();
            const id = $('#tvId').value.trim();
            const s  = $('#season').value.trim();
            const ep = $('#episode').value.trim();
            if(id && s && ep) location.href = '/tv/' + encodeURIComponent(id) + '/' + encodeURIComponent(s) + '/' + encodeURIComponent(ep);
          });
        })();
      </script>
          `
      }
    </section>
  </main>

  <footer class="footer container">
    <small>© <span id="year"></span> CineLite</small>
  </footer>

  <script>
    // Year
    (function(){ var y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear(); })();

    // Theme toggle (light/dark/system)
    (function(){
      const KEY="cl-theme";
      const el=document.documentElement;
      const apply = (m)=>{ el.dataset.theme = m || ""; el.style.colorScheme = m || ""; };
      const saved = localStorage.getItem(KEY);
      if(saved) apply(saved);
      document.getElementById('themeToggle')?.addEventListener('click', ()=>{
        const curr = el.dataset.theme || "system";
        const next = curr==="light" ? "dark" : curr==="dark" ? "" : "light"; // "" = system
        localStorage.setItem(KEY, next);
        apply(next);
      });
    })();

    // Hide loader when iframe reports 'load'
    (function(){
      const iframe = document.querySelector('iframe.video');
      const loader = document.getElementById('loader');
      if(iframe && loader){
        const done = ()=> loader.style.opacity = '0';
        iframe.addEventListener('load', ()=> setTimeout(done, 200));
        setTimeout(done, 4000); // fallback
      }
    })();
  </script>
</body>
</html>`;
}

// Home
app.get('/', (req, res) => {
  res.send(renderPage({ title: '' }));
});

// Movie route
app.get('/movie/:id', (req, res) => {
  const movieId = req.params.id;
  const embed = `https://iframe.pstream.org/embed/tmdb-movie-${encodeURIComponent(movieId)}`;
  res.send(
    renderPage({
      title: `Movie #${movieId}`,
      embedUrl: embed,
      subtitle: 'Enjoy the show 👇',
    })
  );
});

// TV Episode route
app.get('/tv/:id/:season/:episode', (req, res) => {
  const { id, season, episode } = req.params;
  const embed = `https://vidsrc.su/embed/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`;
  res.send(
    renderPage({
      title: `TV #${id} · S${season}E${episode}`,
      embedUrl: embed,
      subtitle: 'Grab popcorn 🍿',
    })
  );
});

// Remove the accidental duplicate route with leading //
/* (deleted) app.get('//tv/:id/:season/:episode', ...) */

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
