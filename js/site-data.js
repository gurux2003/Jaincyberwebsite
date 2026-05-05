// Frontend site data helpers (reads admin localStorage keys)
function getLocalDataSite(k, fallback = null) {
  try { const v = localStorage.getItem('jcs_' + k); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
}

function renderSiteBlogs() {
  const blogs = (getLocalDataSite('blogs', []) || [])
    .filter(b => b.status === 'published')
    .sort((a, b) => {
      const da = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const db = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return db - da;
    });

  // Prioritize featured posts if flagged in admin.
  const featuredFirst = blogs.slice().sort((a, b) => Number(b.featured === true) - Number(a.featured === true));
  const featured = featuredFirst.slice(0, 3);
  const featuredRow = document.getElementById('featured-row');
  if (featuredRow) {
    featuredRow.innerHTML = '';
    if (!featured.length) {
      featuredRow.style.display = 'none';
    } else {
      featuredRow.style.display = 'grid';
    }
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
    const featuredIds = new Set(featured.map(b => String(b._id)));
    const remaining = featuredFirst.filter(b => !featuredIds.has(String(b._id)));
    grid.innerHTML = remaining.map(b => `
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

    if (!remaining.length && !featured.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:26px;border:1px solid var(--line);border-radius:var(--r);color:var(--txt3);font-family:var(--mono);font-size:12px">No published blog posts yet. Publish posts from admin to show them here.</div>';
    }

    const pag = document.getElementById('pagination');
    if (pag) pag.style.display = 'none';
  }
}

function esc(v) {
  return String(v || '').replace(/[&<>'"]/g, function(ch) {
    return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch] || ch;
  });
}

function renderSiteSettings() {
  const s = getLocalDataSite('settings', {}) || {};
  try {
    if (s.metaTitle) document.title = s.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && s.metaDesc) metaDesc.setAttribute('content', s.metaDesc);

    const navPhoneLink = document.querySelector('.nav-phone a');
    if (navPhoneLink && s.phone) {
      navPhoneLink.textContent = s.phone;
      navPhoneLink.setAttribute('href', 'tel:' + s.phone.replace(/\s+/g, ''));
    }

    const footer = document.getElementById('footer');
    if (footer) {
      const brandDesc = footer.querySelector('.footer-brand p');
      const addressEl = footer.querySelector('.footer-contact-row:nth-of-type(1) span');
      const phoneEl = footer.querySelector('.footer-contact-row:nth-of-type(2) a');
      const emailEl = footer.querySelector('.footer-contact-row:nth-of-type(3) a');
      const socials = footer.querySelectorAll('.footer-socials a');
      const copyright = footer.querySelector('.footer-bottom p');

      if (brandDesc && s.siteDesc) brandDesc.textContent = s.siteDesc;
      if (addressEl && s.address) addressEl.textContent = s.address;
      if (phoneEl && s.phone) {
        phoneEl.textContent = s.phone;
        phoneEl.setAttribute('href', 'tel:' + s.phone.replace(/\s+/g, ''));
      }
      if (emailEl && s.email) {
        emailEl.textContent = s.email;
        emailEl.setAttribute('href', 'mailto:' + s.email);
      }
      if (socials[0] && s.linkedin) socials[0].setAttribute('href', s.linkedin);
      if (socials[1] && s.twitter) socials[1].setAttribute('href', s.twitter);
      if (socials[2] && s.email) socials[2].setAttribute('href', 'mailto:' + s.email);
      if (copyright && s.siteName) {
        const yr = new Date().getFullYear();
        copyright.textContent = '© ' + yr + ' ' + s.siteName + '. All rights reserved.' + (s.address ? ' ' + s.address : '');
      }
    }
  } catch (e) {}
}

function renderHomeServices() {
  const tabsRoot = document.getElementById('home-services-tabs');
  const panelsRoot = document.getElementById('home-services-panels');
  if (!tabsRoot || !panelsRoot) return;
  const items = (getLocalDataSite('services', []) || []).filter(s => s.active !== false).sort((a,b) => (a.order || 0) - (b.order || 0));
  if (!items.length) return;

  tabsRoot.innerHTML = items.map((s, idx) => `
    <div class="svc-tab ${idx === 0 ? 'active' : ''}" onclick="switchSvc(${idx},this)">
      <span class="svc-tab-icon">${esc(s.icon || '🛡️')}</span>
      <span class="svc-tab-name">${esc(s.title || 'Service')}</span>
      <span class="svc-tab-n">${String(idx + 1).padStart(2, '0')}</span>
    </div>
  `).join('');

  panelsRoot.innerHTML = items.map((s, idx) => {
    const standards = Array.isArray(s.standards) ? s.standards : [];
    return `
      <div class="svc-panel ${idx === 0 ? 'active' : ''}">
        <div class="svc-panel-hd">
          <div class="svc-icon-big">${esc(s.icon || '🛡️')}</div>
          <div>
            <h3>${esc(s.title || 'Service')}</h3>
            <p>${esc(s.fullDesc || s.shortDesc || '')}</p>
          </div>
        </div>
        <div class="svc-panel-body">
          <div class="svc-detail">
            <h4>Service Summary</h4>
            <ul>
              <li>${esc(s.shortDesc || 'Customized OT cybersecurity service')}</li>
              <li>Delivered by OT/ICS domain specialists</li>
              <li>Aligned to your compliance and business goals</li>
            </ul>
          </div>
          <div class="svc-detail">
            <h4>Standards Applied</h4>
            <ul>${(standards.length ? standards : ['IEC 62443', 'ISO 27001', 'NIST CSF']).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          </div>
          <div class="svc-deliverable"><div class="svc-del-label">📄 Key Deliverable</div><p>${esc(s.deliverable || ('Detailed report and action plan for ' + (s.title || 'your service')))}</p></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderHomeContent() {
  const data = getLocalDataSite('homeContent', null);
  if (!data) return;

  try {
    if (data.hero) {
      const chip = document.querySelector('.hero-chip span');
      const h1 = document.querySelector('.hero-h1');
      const desc = document.querySelector('.hero-desc');
      const primary = document.getElementById('hero-primary-cta');
      const secondary = document.getElementById('hero-secondary-cta');
      if (chip && data.hero.chip) chip.textContent = data.hero.chip;
      if (h1) h1.innerHTML = `${esc(data.hero.titleLine1 || '')}<br><span style="color:var(--blue)">${esc(data.hero.titleAccent || '')}</span><span class="line-muted">${esc(data.hero.subtitle || '')}</span>`;
      if (desc && data.hero.desc) desc.textContent = data.hero.desc;
      if (primary && data.hero.primaryCta) primary.innerHTML = `<i class="fas fa-shield-halved"></i> ${esc(data.hero.primaryCta)}`;
      if (secondary && data.hero.secondaryCta) secondary.innerHTML = `<i class="fas fa-list"></i> ${esc(data.hero.secondaryCta)}`;
    }

    const tick = document.getElementById('home-ticker-track');
    if (tick && Array.isArray(data.ticker) && data.ticker.length) {
      const full = data.ticker.concat(data.ticker);
      tick.innerHTML = full.map(x => `<span class="ticker-item">${esc(x)}</span>`).join('');
    }

    const standards = document.getElementById('home-standards-strip');
    if (standards && Array.isArray(data.standards) && data.standards.length) {
      standards.innerHTML = `<span style="font-family:var(--mono);font-size:10px;color:var(--txt3);letter-spacing:.18em;text-transform:uppercase;flex-shrink:0">Standards We Work With</span>` + data.standards.map(x => `<span class="std-pill">${esc(x)}</span>`).join('');
    }

    const stats = document.getElementById('home-stats-band');
    if (stats && Array.isArray(data.statsBand) && data.statsBand.length) {
      stats.innerHTML = data.statsBand.map(s => `<div class="stat-cell"><div class="stat-n">${esc(s.value || '')}</div><div class="stat-l">${esc(s.label || '')}</div><div class="stat-d">${esc(s.desc || '')}</div></div>`).join('');
    }

    const industries = document.getElementById('home-industries-grid');
    if (industries && Array.isArray(data.industries) && data.industries.length) {
      industries.innerHTML = data.industries.map(i => `<div class="ind-card"><div class="ind-icon">${esc(i.icon || '•')}</div><h3>${esc(i.title || '')}</h3><p>${esc(i.desc || '')}</p><span class="ind-tag">${esc(i.tag || '')}</span></div>`).join('');
    }

    const faq = document.getElementById('home-faq-grid');
    if (faq && Array.isArray(data.faq) && data.faq.length) {
      faq.innerHTML = data.faq.map(f => `<div class="faq-item" onclick="this.classList.toggle('open')"><div class="faq-q">${esc(f.q || '')}<div class="faq-icon">+</div></div><div class="faq-a">${esc(f.a || '')}</div></div>`).join('');
    }

    if (data.cta) {
      const title = document.getElementById('home-cta-title');
      const desc = document.getElementById('home-cta-desc');
      const p = document.getElementById('home-cta-primary');
      const s = document.getElementById('home-cta-secondary');
      if (title && data.cta.title) title.textContent = data.cta.title;
      if (desc && data.cta.desc) desc.textContent = data.cta.desc;
      if (p && data.cta.primary) p.innerHTML = `<i class="fas fa-shield-halved"></i> ${esc(data.cta.primary)}`;
      if (s && data.cta.secondary) s.innerHTML = `<i class="fas fa-envelope"></i> ${esc(data.cta.secondary)}`;
    }
  } catch (e) {}
}

function renderHomeBlogs() {
  const grid = document.getElementById('home-blog-grid');
  if (!grid) return;
  const blogs = (getLocalDataSite('blogs', []) || []).filter(b => b.status === 'published').slice(0, 3);
  if (!blogs.length) return;
  grid.innerHTML = blogs.map(b => `
    <a href="blog-post.html?id=${encodeURIComponent(b._id)}" class="blog-home-card">
      <div class="bhc-img" style="font-size:40px">📄<span class="bhc-cat">${esc(b.category || 'News')}</span></div>
      <div class="bhc-body">
        <div class="bhc-meta"><span>${new Date(b.publishedAt || b.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span><span>·</span><span>${b.readTime || 6} min read</span></div>
        <h3>${esc(b.title || '')}</h3>
        <p>${esc(b.excerpt || '')}</p>
        <span class="bhc-link">Read Article <i class="fas fa-arrow-right" style="font-size:10px"></i></span>
      </div>
    </a>
  `).join('');
}

// Auto-render on load
window.addEventListener('load', () => {
  if (location.protocol === 'file:') {
    console.warn('Running site from file:// — localStorage changes from admin may not sync across tabs. Serve the site via http://localhost:8000 to enable live updates.');
  }
  renderSiteBlogs();
  renderSiteSettings();
  renderHomeContent();
  renderHomeServices();
  renderHomeBlogs();
});

// Re-render when admin updates localStorage in another tab (storage event)
window.addEventListener('storage', (e) => {
  try {
    if (!e || !e.key) return;
    // keys are stored with prefix `jcs_`
    const key = e.key.replace(/^jcs_/, '');
    const watch = ['blogs', 'services', 'homeContent', 'leads', 'contacts', 'settings'];
    if (watch.includes(key)) {
      console.info('site-data: detected remote storage change for', key, '- re-rendering');
      // Re-run renderers that derive from admin-local storage
      renderSiteBlogs();
      renderSiteSettings();
      renderHomeContent();
      renderHomeServices();
      renderHomeBlogs();
    }
  } catch (err) {
    console.error('site-data: storage event handler error', err);
  }
});

// Also re-render when the tab gains focus (useful when storage events don't fire in same tab)
window.addEventListener('focus', () => {
  try {
    renderSiteBlogs();
    renderSiteSettings();
    renderHomeContent();
    renderHomeServices();
    renderHomeBlogs();
  } catch (e) {}
});
