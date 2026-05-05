/* ============================================================
   JAIN CYBER SOLUTIONS — Admin Panel Shared JS
   ============================================================ */
const API = 'http://localhost:5000/api';

/* ── Auth ─────────────────────────────────── */
function getToken() { return localStorage.getItem('jcs_token'); }
function getAdmin() { try { return JSON.parse(localStorage.getItem('jcs_admin')); } catch { return null; } }

function requireAuth() {
  if (!getToken()) { window.location.href = 'index.html'; return false; }
  return true;
}

function logout() {
  localStorage.removeItem('jcs_token');
  localStorage.removeItem('jcs_admin');
  window.location.href = 'index.html';
}

/* ── API ──────────────────────────────────── */
async function api(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    }
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(API + path, opts);
    const data = await r.json();
    if (r.status === 401) { logout(); return null; }
    return { ok: r.ok, data };
  } catch (e) {
    console.error('API error:', e);
    return { ok: false, data: { error: 'Network error' } };
  }
}

/* ── Toast ────────────────────────────────── */
function toast(msg, type = 'success') {
  let el = document.getElementById('admin-toast');
  if (!el) { el = document.createElement('div'); el.id = 'admin-toast'; document.body.appendChild(el); }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  el.className = `show ${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 4500);
}

/* ── Format ───────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function truncate(s, n = 60) { return s && s.length > n ? s.slice(0, n) + '…' : (s || '—'); }

/* ── Sidebar render ───────────────────────── */
function renderSidebar(activePage) {
  const admin = getAdmin();
  const pages = [
    { id: 'dashboard', icon: 'fa-gauge', label: 'Dashboard', href: 'dashboard.html' },
    { id: 'blogs', icon: 'fa-newspaper', label: 'Blog Posts', href: 'blogs.html' },
    { id: 'leads', icon: 'fa-bullseye', label: 'Leads', href: 'leads.html', badge: 'leads' },
    { id: 'contacts', icon: 'fa-envelope', label: 'Contact Messages', href: 'contacts.html', badge: 'contacts' },
    { id: 'services', icon: 'fa-shield-halved', label: 'Services', href: 'services-admin.html' },
    { id: 'content', icon: 'fa-pen-ruler', label: 'Website Content', href: 'content-admin.html' },
    { id: 'settings', icon: 'fa-gear', label: 'Settings', href: 'settings.html' },
  ];

  const nav = pages.map(p => `
    <a href="${p.href}" class="sb-link ${activePage === p.id ? 'active' : ''}">
      <i class="fas ${p.icon}"></i>
      <span>${p.label}</span>
      ${p.badge ? `<span class="sb-badge" id="badge-${p.badge}" style="display:none">0</span>` : ''}
    </a>
  `).join('');

  return `
    <div class="sb-logo">
      <img class="site-brand-logo" src="../logo.png" alt="Jain Cyber Solutions">
    </div>
    <div class="sb-section">
      <div class="sb-section-label">Navigation</div>
      ${nav}
    </div>
    <div class="sb-section">
      <div class="sb-section-label">Quick Links</div>
      <a href="../index.html" target="_blank" class="sb-link"><i class="fas fa-external-link"></i><span>View Website</span></a>
    </div>
    <div class="sb-bottom">
      <div class="sb-user">
        <div class="sb-avatar">👨‍💼</div>
        <div style="flex:1;min-width:0">
          <div class="sb-user-name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${admin?.name || 'Admin'}</div>
          <div class="sb-user-role">${admin?.role || 'admin'}</div>
        </div>
        <button onclick="logout()" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:13px;padding:4px" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
      </div>
    </div>
  `;
}

/* ── Load badge counts ────────────────────── */
async function loadBadges() {
  try {
    const [leads, contacts] = await Promise.all([
      api('GET', '/leads'),
      api('GET', '/contacts')
    ]);
    if (leads?.ok) {
      const newLeads = leads.data.leads?.filter(l => l.status === 'new').length || 0;
      const el = document.getElementById('badge-leads');
      if (el && newLeads > 0) { el.textContent = newLeads; el.style.display = 'block'; }
    }
    if (contacts?.ok) {
      const newContacts = contacts.data.contacts?.filter(c => c.status === 'new').length || 0;
      const el = document.getElementById('badge-contacts');
      if (el && newContacts > 0) { el.textContent = newContacts; el.style.display = 'block'; }
    }
  } catch (e) {}
}

/* ── Confirm dialog ───────────────────────── */
function confirm(msg) {
  return window.confirm(msg);
}

/* ── Status select HTML ───────────────────── */
function statusSelect(current, options, onchange) {
  const opts = options.map(o => `<option value="${o}" ${current === o ? 'selected' : ''}>${o.charAt(0).toUpperCase() + o.slice(1)}</option>`).join('');
  return `<select onchange="${onchange}" class="fi" style="padding:4px 8px;font-size:11px;width:auto">${opts}</select>`;
}

/* ── Demo data ────────────────────────────── */
const DEMO_DATA = {
  leads: [
    { _id:'l1', name:'Rajesh Kumar', email:'rajesh@railwayindia.com', phone:'+91-9876543210', company:'Indian Railways', industry:'Railway / Metro Systems', assessment:'OT / ICS Security Assessment', status:'new', createdAt:new Date(Date.now()-86400000*2) },
    { _id:'l2', name:'Priya Sharma', email:'priya@bhel.in', phone:'+91-9876543211', company:'BHEL', industry:'Manufacturing / Industrial', assessment:'Risk Assessment (IEC 62443)', status:'contacted', createdAt:new Date(Date.now()-86400000*5) },
    { _id:'l3', name:'Amit Singh', email:'amit@ntpc.co.in', phone:'+91-9876543212', company:'NTPC', industry:'Power & Energy', assessment:'Compliance Audit (ISO 27001)', status:'qualified', createdAt:new Date(Date.now()-86400000*8) },
    { _id:'l4', name:'Sunita Patel', email:'sunita@airindia.in', phone:'+91-9876543213', company:'Air India', industry:'Aviation', assessment:'Gap Analysis & Remediation', status:'new', createdAt:new Date(Date.now()-86400000*1) },
    { _id:'l5', name:'Vikram Mehta', email:'vikram@ongc.co.in', phone:'+91-9876543214', company:'ONGC', industry:'Oil & Gas', assessment:'Security Training', status:'new', createdAt:new Date(Date.now()-86400000*3) },
  ],
  contacts: [
    { _id:'c1', name:'Anita Desai', email:'anita@delmetro.com', phone:'+91-9123456789', subject:'OT / ICS Security Assessment', message:'We are looking for a comprehensive OT security assessment for our metro signaling systems. Can you provide details on your IEC 62443 assessment process?', status:'new', createdAt:new Date(Date.now()-86400000*1) },
    { _id:'c2', name:'Mohan Rao', email:'mohan@powergrid.in', phone:'+91-9123456790', subject:'Compliance Audit (ISO 27001)', message:'Need ISO 27001 compliance audit for our control center. What is the timeline and scope for this?', status:'read', createdAt:new Date(Date.now()-86400000*3) },
    { _id:'c3', name:'Deepak Joshi', email:'deepak@tata.com', subject:'General Inquiry', message:'Interested in cybersecurity awareness training for our 500-person engineering team. Do you offer customized programs?', status:'replied', createdAt:new Date(Date.now()-86400000*6) },
  ],
  blogs: [
    { _id:'b1', title:'Why Railway OT Security Is India\'s #1 Cyber Priority for 2025', category:'Railway', status:'published', views:1247, featured:true, author:'Virendra Kothari', publishedAt:new Date('2024-12-10'), readTime:8 },
    { _id:'b2', title:'IEC 62443-3-2: A Practical Guide for OT Risk Assessment', category:'Compliance', status:'published', views:843, featured:false, author:'Jain Cyber Team', publishedAt:new Date('2024-11-15'), readTime:7 },
    { _id:'b3', title:'Top 5 OT Cybersecurity Threats Facing Indian Manufacturing', category:'OT Security', status:'published', views:612, featured:false, author:'Jain Cyber Team', publishedAt:new Date('2024-10-20'), readTime:6 },
    { _id:'b4', title:'ISO 27001 vs IEC 62443: Which Does Your OT Network Need?', category:'Compliance', status:'draft', views:0, featured:false, author:'Virendra Kothari', createdAt:new Date('2024-09-01'), readTime:9 },
  ],
  services: [
    { _id:'s1', title:'Security Control Assessment', icon:'🛡️', shortDesc:'Evaluate existing security controls per IEC 62443-4-2, NIST CSF, ISO 27002', order:1, active:true },
    { _id:'s2', title:'Risk Assessment & Analysis', icon:'📊', shortDesc:'ISO 31000, NIST SP 800-30, IEC 62443-3-2 aligned risk analysis', order:2, active:true },
    { _id:'s3', title:'Gap Analysis & Remediation', icon:'🔍', shortDesc:'Standards gap analysis with prioritized remediation roadmap', order:3, active:true },
    { _id:'s4', title:'Audit Report & Presentation', icon:'📋', shortDesc:'Executive and technical audit reports with presentation delivery', order:4, active:true },
    { _id:'s5', title:'Cybersecurity Awareness Training', icon:'🎓', shortDesc:'Phishing, insider threats, OT security training for all staff levels', order:5, active:true },
    { _id:'s6', title:'Remediation Support & Implementation', icon:'🔧', shortDesc:'Hands-on implementation support for all remediation items', order:6, active:true },
    { _id:'s7', title:'AI Risk Assessment', icon:'🤖', shortDesc:'NIST AI RMF, ISO/IEC 42001, EU AI Act compliance assessment', order:7, active:true },
  ],
  homeContent: {
    hero: {
      chip: 'Registration Number: 23AOZPK5376A1ZQ',
      titleLine1: 'Defend What',
      titleAccent: 'Powers the World',
      subtitle: 'OT · ICS · SCADA · Critical Infrastructure',
      desc: 'Globally premier OT/ICS cybersecurity firm delivering IEC 62443-aligned security assessments for Railway, Metro, Power, Manufacturing & Government infrastructure. From gap analysis to full remediation.',
      primaryCta: 'Request Free Assessment',
      secondaryCta: 'Explore Services'
    },
    ticker: [
      'SCADA Vulnerability Detected — Railway OT Network',
      'IEC 62443-3-2 Assessment Completed — Metro Systems',
      'Ransomware Attempt Blocked — Manufacturing SCADA',
      'ISO 27001 Audit Passed — Energy Sector Client',
      'OT Network Segmentation Deployed — Oil & Gas Refinery',
      'AI Risk Assessment Completed — ITES Infrastructure'
    ],
    standards: ['IEC 62443-3-2','IEC 62443-4-2','ISO 27001','ISO 31000','NIST CSF','NIST SP 800-30','ISO 27005','MITRE ATT&CK ICS','ISO 27002'],
    statsBand: [
      { value: '20+', label: 'Years Experience', desc: 'Deep OT/ICS domain expertise across critical sectors' },
      { value: '50+', label: 'Projects Delivered', desc: 'Successful engagements across global sectors' },
      { value: '9', label: 'Standards Frameworks', desc: 'IEC 62443, ISO 27001, NIST and 6 more' },
      { value: '100%', label: 'Client Satisfaction', desc: 'Every client receives a clear, actionable deliverable' }
    ],
    industries: [
      { icon: '🚇', title: 'Railway & Metro', desc: 'SCADA, signaling systems, OT networks and passenger infrastructure security', tag: 'Core Specialization' },
      { icon: '⚡', title: 'Power & Energy', desc: 'Grid security, SCADA protection, substation hardening', tag: 'Critical Infrastructure' },
      { icon: '🏭', title: 'Manufacturing', desc: 'OT/IT convergence, PLC/DCS security, production continuity', tag: 'ICS / OT Focus' },
      { icon: '🛢️', title: 'Oil & Gas', desc: 'Pipeline SCADA, refinery OT, offshore platform security', tag: 'High Risk' },
      { icon: '🏥', title: 'Healthcare', desc: 'IoMT devices, medical OT, patient data protection', tag: 'Safety-Critical' },
      { icon: '✈️', title: 'Aviation', desc: 'Air traffic OT, airport infrastructure security', tag: 'High Consequence' },
      { icon: '🏛️', title: 'Government', desc: 'National critical infrastructure, smart city OT', tag: 'National Security' },
      { icon: '💻', title: 'IT, ITES & BFSI', desc: 'Data centers, cloud infrastructure, fintech security', tag: 'Enterprise Scale' }
    ],
    faq: [
      { q: 'Why is OT security different from IT security?', a: 'OT environments have unique constraints — zero-downtime requirements, legacy equipment that cannot be patched, proprietary industrial protocols and safety-critical systems. Standard IT security tools can disrupt OT if applied incorrectly.' },
      { q: 'Will your assessments disrupt our OT operations?', a: 'No. We use passive, non-intrusive assessment methodologies specifically designed for live OT environments where operational continuity is non-negotiable.' },
      { q: 'What is included in a Security Control Assessment?', a: 'We evaluate policies, procedures and technical safeguards guided by IEC 62443-4-2, NIST CSF and ISO 27002 and provide an actionable assessment report.' },
      { q: 'Do you provide ongoing support after assessment?', a: 'Yes. We provide remediation implementation support and verification so recommendations are executed, not just documented.' },
      { q: 'Can you help us qualify for cyber insurance?', a: 'Yes. Our reports and controls mapping help organizations meet insurer requirements and improve coverage outcomes.' },
      { q: 'Which industries do you specialize in?', a: 'Railway/Metro, Manufacturing, Power & Energy, Healthcare, Oil & Gas, Government, IT/ITES, Aviation, and BFSI.' }
    ],
    cta: {
      title: 'Build Resilience & Keep Threats at Bay',
      desc: 'Protect your critical infrastructure with Globally premier OT cybersecurity experts. First assessment is free.',
      primary: 'Request Free Assessment',
      secondary: 'Contact Our Experts'
    }
  }
};

/* ── Local storage helpers (frontend-only persistence) ───────────────── */
function _lsKey(k) { return 'jcs_' + k; }
function getLocalData(k, fallback = null) {
  try { const v = localStorage.getItem(_lsKey(k)); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}
function setLocalData(k, v) {
  try { localStorage.setItem(_lsKey(k), JSON.stringify(v)); return true; } catch (e) { return false; }
}

/* ── API Wrapper Functions for Admin Panels ───────────────── */
async function fetchAllBlogs() {
  return apiCall('GET', '/admin/blogs').then(r => r?.ok ? r.data : []);
}

async function createBlog(data) {
  return apiCall('POST', '/blogs', data);
}

async function updateBlog(id, data) {
  return apiCall('PUT', '/blogs/' + id, data);
}

async function deleteAdminBlog(id) {
  return apiCall('DELETE', '/blogs/' + id);
}

// Ensure demo data seeds localStorage on first run
if (!getLocalData('initialized')) {
  setLocalData('blogs', DEMO_DATA.blogs);
  setLocalData('leads', DEMO_DATA.leads);
  setLocalData('contacts', DEMO_DATA.contacts);
  setLocalData('services', DEMO_DATA.services);
  setLocalData('homeContent', DEMO_DATA.homeContent);
  setLocalData('settings', { address: 'Indore, Madhya Pradesh, India — 452001' });
  setLocalData('initialized', true);
}

if (!getLocalData('blogs')) setLocalData('blogs', DEMO_DATA.blogs);
if (!getLocalData('leads')) setLocalData('leads', DEMO_DATA.leads);
if (!getLocalData('contacts')) setLocalData('contacts', DEMO_DATA.contacts);
if (!getLocalData('services')) setLocalData('services', DEMO_DATA.services);
if (!getLocalData('homeContent')) setLocalData('homeContent', DEMO_DATA.homeContent);
if (!getLocalData('settings')) setLocalData('settings', { address: 'Indore, Madhya Pradesh, India — 452001' });
