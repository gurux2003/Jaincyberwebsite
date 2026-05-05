// Frontend API Client - Communicates with backend server
const API_BASE = 'http://localhost:5000/api';
let ws = null;

// Initialize WebSocket for real-time updates
function initWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  
  try {
    ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        document.dispatchEvent(new CustomEvent('backend-update', { detail: { type, data } }));
        // Refresh current page data
        if (window.refreshPageData) {
          window.refreshPageData();
        }
      } catch (e) {
        console.error('WebSocket parse error:', e);
      }
    };
    ws.onerror = (err) => console.error('WebSocket error:', err);
    ws.onclose = () => {
      setTimeout(initWebSocket, 5000); // Reconnect after 5s
    };
  } catch (e) {
    console.error('WebSocket init failed:', e);
  }
}

// Generic API call function
async function apiCall(method, endpoint, data = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`API ${method} ${endpoint} error:`, e.message);
    throw e;
  }
}

// ============ BLOGS ============
async function fetchBlogs() {
  return apiCall('GET', '/blogs');
}

async function fetchBlog(id) {
  return apiCall('GET', `/blogs/${encodeURIComponent(id)}`);
}

async function createBlog(data) {
  return apiCall('POST', '/blogs', data);
}

async function updateBlog(id, data) {
  return apiCall('PUT', `/blogs/${encodeURIComponent(id)}`, data);
}

async function deleteBlog(id) {
  return apiCall('DELETE', `/blogs/${encodeURIComponent(id)}`);
}

async function fetchAllBlogs() {
  return apiCall('GET', '/admin/blogs');
}

// ============ SERVICES ============
async function fetchServices() {
  return apiCall('GET', '/services');
}

async function createService(data) {
  return apiCall('POST', '/services', data);
}

async function updateService(id, data) {
  return apiCall('PUT', `/services/${id}`, data);
}

async function deleteService(id) {
  return apiCall('DELETE', `/services/${id}`);
}

// ============ PARTNERS ============
async function fetchPartners() {
  return apiCall('GET', '/partners');
}

async function createPartner(data) {
  return apiCall('POST', '/partners', data);
}

async function updatePartner(id, data) {
  return apiCall('PUT', `/partners/${id}`, data);
}

async function deletePartner(id) {
  return apiCall('DELETE', `/partners/${id}`);
}

// ============ SETTINGS ============
async function fetchSettings() {
  return apiCall('GET', '/settings');
}

async function updateSettings(data) {
  return apiCall('PUT', '/settings', data);
}

// ============ LEADS ============
async function createLead(data) {
  return apiCall('POST', '/admin/leads', data);
}

async function fetchLeads() {
  return apiCall('GET', '/admin/leads');
}

// ============ CONTACTS ============
async function createContact(data) {
  return apiCall('POST', '/admin/contacts', data);
}

async function fetchContacts() {
  return apiCall('GET', '/admin/contacts');
}

// Initialize WebSocket on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWebSocket);
} else {
  initWebSocket();
}
