const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchAdminOverview = async () => {
  const response = await fetch(`${API_URL}/admin/overview`);
  if (!response.ok) throw new Error('Failed to fetch overview');
  return response.json();
};

export const fetchSystemStatus = async () => {
  const response = await fetch(`${API_URL}/admin/system-status`);
  if (!response.ok) throw new Error('Failed to fetch system status');
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const fetchMerchants = async () => {
  const response = await fetch(`${API_URL}/shops`);
  if (!response.ok) throw new Error('Failed to fetch merchants');
  return response.json();
};

export const fetchProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const fetchOrders = async () => {
  const response = await fetch(`${API_URL}/orders`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};
