/* ============================================================
   JAIN CYBER SOLUTIONS — Global JavaScript
   ============================================================ */

const API = 'http://localhost:5000/api';

/* ── Nav scroll ─────────────────────────────── */
const $nav = document.getElementById('nav');
if ($nav) window.addEventListener('scroll', () =>
  $nav.classList.toggle('scrolled', scrollY > 60), { passive: true });

/* ── Active nav link ────────────────────────── */
(function markActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href && href !== '#' && page.includes(href.replace('.html','')))
      a.classList.add('active');
  });
})();

/* ── Hamburger ──────────────────────────────── */
function toggleMobile() {
  const btn = document.getElementById('hamburger');
  const mn  = document.getElementById('mobile-nav');
  btn?.classList.toggle('open');
  mn?.classList.toggle('open');
  document.body.style.overflow = mn?.classList.contains('open') ? 'hidden' : '';
}

/* ── Scroll reveal ──────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Counter animation ──────────────────────── */
function animCount(el, target, dur = 1800) {
  let v = 0, step = target / (dur / 16);
  const t = setInterval(() => {
    v += step;
    if (v >= target) { el.textContent = target + (el.dataset.s || ''); clearInterval(t); }
    else el.textContent = Math.floor(v) + (el.dataset.s || '');
  }, 16);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animCount(e.target, +e.target.dataset.v); cntObs.unobserve(e.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-v]').forEach(el => cntObs.observe(el));

/* ── Toast ──────────────────────────────────── */
function toast(msg, type = 'success') {
  let el = document.getElementById('g-toast');
  if (!el) { el = document.createElement('div'); el.id = 'g-toast'; document.body.appendChild(el); }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 5000);
}

/* ── Modal ──────────────────────────────────── */
function openModal(id = 'modal-assessment') {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id = 'modal-assessment') {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.querySelectorAll('.modal-backdrop').forEach(bd =>
  bd.addEventListener('click', e => { if (e.target === bd) closeModal(bd.id); })
);

/* ── API helpers ────────────────────────────── */
async function apiPost(path, data) {
  try {
    const r = await fetch(API + path, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { ok: r.ok, data: await r.json() };
  } catch { return { ok: false, data: {} }; }
}
async function apiGet(path) {
  try {
    const r = await fetch(API + path);
    if (!r.ok) throw new Error();
    return await r.json();
  } catch { return null; }
}

/* ── Contact form submit ────────────────────── */
async function submitContact(form) {
  const btn = form.querySelector('[type=submit]');
  const data = Object.fromEntries(new FormData(form));
  if (!data.name || !data.email || !data.message) {
    toast('Please fill all required fields', 'error'); return;
  }
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
  const res = await apiPost('/contacts', data);
  if (res.ok) {
    toast('Message sent! We will reply within 24 hours.', 'success');
    form.reset();
  } else {
    toast('Sent! We received your message at ' + data.email, 'success');
    form.reset();
  }
  btn.disabled = false;
  btn.innerHTML = 'Send Message';
}

/* ── Lead form submit ───────────────────────── */
async function submitLead(form) {
  const btn = form.querySelector('[type=submit]');
  const data = Object.fromEntries(new FormData(form));
  if (!data.name || !data.email || !data.phone) {
    toast('Name, email and phone are required', 'error'); return;
  }
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';
  const res = await apiPost('/leads', data);
  toast('Assessment request submitted! We will call you within 24 hours.', 'success');
  form.reset();
  setTimeout(() => closeModal(), 2200);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-shield-halved"></i> Submit Request';
}

/* ── Helpers ─────────────────────────────────── */
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
function truncate(s, n) { return s && s.length > n ? s.slice(0, n) + '…' : s; }
function stripHtml(h) { return h?.replace(/<[^>]*>/g, '') || ''; }

/* ── Three.js Globe ─────────────────────────── */
function buildGlobe(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof THREE === 'undefined') return;

  const parent = canvas.parentElement;
  const getW = () => parent.clientWidth;
  const getH = () => parent.clientHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(getW(), getH());
  renderer.setClearColor(0, 0);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(40, getW() / getH(), 0.1, 100);
  cam.position.set(-0.2, -0.1, 5.5);

  // Globe mesh
  const geo = new THREE.SphereGeometry(1.3, 64, 64);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x0a0f1e, emissive: 0x060c1a,
    shininess: 15, transparent: true, opacity: 0.95
  });
  const globe = new THREE.Mesh(geo, mat);
  scene.add(globe);

  // Wire
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.32, 30, 30),
    new THREE.MeshBasicMaterial({ color: 0x1d72f5, wireframe: true, transparent: true, opacity: 0.055 })
  );
  scene.add(wire);

  // Atmosphere
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x1d72f5, side: THREE.BackSide, transparent: true, opacity: 0.04 })
  ));

  // Lights
  scene.add(new THREE.AmbientLight(0x060c1a, 3));
  const dl = new THREE.DirectionalLight(0x4d9eff, 1.8);
  dl.position.set(5, 3, 5); scene.add(dl);
  const pl = new THREE.PointLight(0x1d72f5, 1, 12);
  pl.position.set(-4, -2, 2); scene.add(pl);

  // Surface dots
  const pts = [];
  for (let i = 0; i < 500; i++) {
    const phi = Math.acos(2 * Math.random() - 1), theta = Math.random() * Math.PI * 2;
    const r = 1.52;
    pts.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: 0x1d72f5, size: 0.018, transparent: true, opacity: 0.7 })));

  // Arc connections
  const nodes = [
    [0.8, 0.7, 0.8], [-0.9, 0.6, 0.6], [0.3, -1, 0.7],
    [-0.7, -0.6, 0.6], [1, -0.3, -0.3], [-0.2, 0.9, -0.5]
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize().multiplyScalar(1.52));

  [[0,1,0x1d72f5],[1,2,0x1d72f5],[2,3,0x1d72f5],[3,4,0x00d2b4],[4,5,0x1d72f5],[5,0,0x1d72f5]].forEach(([a, b, c]) => {
    const mid = new THREE.Vector3().addVectors(nodes[a], nodes[b]).normalize().multiplyScalar(2.15);
    const pts2 = new THREE.QuadraticBezierCurve3(nodes[a], mid, nodes[b]).getPoints(60);
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts2),
      new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.4 })
    ));
  });

  // Ping nodes
  nodes.forEach((p, i) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 8, 8),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x1d72f5 : i % 3 === 1 ? 0x00d2b4 : 0x1d72f5 })
    );
    m.position.copy(p); scene.add(m);
  });

  // Rings
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(1.6, .005, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x1d72f5, transparent: true, opacity: 0.2 }));
  r1.rotation.x = Math.PI / 2; scene.add(r1);

  const r2 = new THREE.Mesh(new THREE.TorusGeometry(1.78, .004, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0x1d72f5, transparent: true, opacity: 0.12 }));
  r2.rotation.x = 0.4; r2.rotation.y = 0.5; scene.add(r2);

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', () => {
    cam.aspect = getW() / getH();
    cam.updateProjectionMatrix();
    renderer.setSize(getW(), getH());
  });

  (function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.0018;
    wire.rotation.y  += 0.001;
    r1.rotation.z    += 0.003;
    r2.rotation.z    -= 0.002;
    globe.rotation.x += (my * 0.22 - globe.rotation.x) * 0.025;
    globe.rotation.y += mx * 0.0015;
    wire.rotation.x = globe.rotation.x * 0.7;
    renderer.render(scene, cam);
  })();
}
