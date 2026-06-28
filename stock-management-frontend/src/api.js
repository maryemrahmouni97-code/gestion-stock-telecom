const API_BASE_URL = 'http://localhost:8081/api';

export const endpoints = {
  materials: 'materiels',
  regions: 'regions',
  users: 'users',
  stocks: 'stocks',
  requests: 'demandes',
  requestDetails: 'demande-details',
  movements: 'mouvements',
  maintenances: 'maintenances',
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/${path}`, {
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json', ...options.headers } : options.headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erreur HTTP ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export function getAll(endpoint, signal) {
  return request(endpoint, { signal });
}

export function createItem(endpoint, item) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(item) });
}

export function updateItem(endpoint, id, item) {
  return request(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(item) });
}

export function deleteItem(endpoint, id) {
  return request(`${endpoint}/${id}`, { method: 'DELETE' });
}
