import axios from 'axios';

const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Select the active customer for the intentionally public customer API.
customerApi.interceptors.request.use((config) => {
  const rawProfile = localStorage.getItem('cablesync_customer_profile');
  if (rawProfile) {
    try {
      const profile = JSON.parse(rawProfile);
      if (profile?.id) config.headers['x-customer-id'] = profile.id;
    } catch {
      // Ignore malformed optional profile selection.
    }
  }
  return config;
});

// Handle expired customer session
customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default customerApi;
