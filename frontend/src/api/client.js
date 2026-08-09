const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(detail || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  baseUrl: API_BASE,
  health: () => request('/health'),
  triggerIncident: (scenario) =>
    request('/incident/trigger', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    }),
  blastRadius: (id) => request(`/agent/blast-radius/${id}`),
  hypotheses: (id) => request(`/agent/hypotheses/${id}`),
  confidence: (id) => request(`/agent/confidence/${id}`),
  playbook: () => request('/playbook/pattern'),
  audit: (id) => request(`/agent/audit/${id}`),
  graph: (id) => request(`/agent/graph/${id}`),
  approve: (id) => request(`/approval/approve/${id}`, { method: 'POST' }),
  reject: (id) => request(`/approval/reject/${id}`, { method: 'POST' }),
  arizeStatus: (id) => request(`/arize/status/${id}`),
  learn: (id) => request(`/memory/learn/${id}`, { method: 'POST' }),
  streamUrl: (id) => `${API_BASE}/incident/${id}/stream`,
};
