// Frontend site data helpers (reads admin localStorage keys)
function getLocalDataSite(k, fallback = null) {
  try { const v = localStorage.getItem('jcs_' + k); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}

function renderSiteBlogs() {
  const blogs = (getLocalDataSite('blogs', []) || []).filter(b => b.status === 'published');
  if (!blogs.length) return;
  // Featured: first 3
  const featured = blogs.slice(0,3);
  const featuredRow = document.getElementById('featured-row');
  if (featuredRow) {
    featuredRow.innerHTML = '';
    featured.forEach((b,i) => {
      const isMain = i === 0;
      if (isMain) {
        featuredRow.innerHTML += `
          <a href="blog-post.html?id=${encodeURIComponent(b._id)}" class="blog-featured-card">
            <div class="bfc-img"><span>📄</span><span class="bfc-badge">${b.category || 'News'}</span>${b.featured?'<span class="bfc-feat-badge">⭐ Featured</span>':''}</div>
            <div class="bfc-body">
              <div class="bfc-meta">${new Date(b.publishedAt||b.createdAt).toLocaleString('en-US',{month:'long',year:'numeric'})} · ${b.readTime||Math.max(4, Math.round((b.content||'').split(' ').length/200))} min read · ${b.author||'Jain Cyber Team'}</div>
              <h3>${b.title}</h3>
              <p>${b.excerpt || ''}</p>
              <span class="bfc-link">Read Full Article <i class="fas fa-arrow-right" style="font-size:10px"></i></span>
            </div>
          </a>
        `;
      } else {
        featuredRow.innerHTML += `
          <a href="blog-post.html?id=${encodeURIComponent(b._id)}" class="blog-featured-card">
            <div class="bfc-img sm"><span>📄</span><span class="bfc-badge">${b.category || 'News'}</span></div>
            <div class="bfc-body">
              <div class="bfc-meta">${new Date(b.publishedAt||b.createdAt).toLocaleString('en-US',{month:'long',year:'numeric'})} · ${b.readTime||Math.max(3, Math.round((b.content||'').split(' ').length/200))} min read</div>
              <h3 class="sm">${b.title}</h3>
              <p class="sm">${b.excerpt || ''}</p>
              <span class="bfc-link">Read Article <i class="fas fa-arrow-right" style="font-size:10px"></i></span>
            </div>
          </a>
        `;
      }
    });
  }

  const grid = document.getElementById('blog-grid');
  if (grid) {
    grid.innerHTML = blogs.slice(3).map(b => `
      <a href="blog-post.html?id=${encodeURIComponent(b._id)}" class="blog-card" data-cat="${b.category||''}">
        <div class="bc-img"><span>📄</span><span class="bc-cat">${b.category||''}</span></div>
        <div class="bc-body">
          <div class="bc-meta">${new Date(b.publishedAt||b.createdAt).toLocaleString('en-US',{month:'short',year:'numeric'})} · ${b.readTime||Math.max(3, Math.round((b.content||'').split(' ').length/200))} min</div>
          <h3>${b.title}</h3>
          <p>${b.excerpt||''}</p>
          <span class="bc-link">Read More <i class="fas fa-arrow-right" style="font-size:9px"></i></span>
        </div>
      </a>
    `).join('');
  }
}

// Auto-render on load
window.addEventListener('load', () => {
  renderSiteBlogs();
});
