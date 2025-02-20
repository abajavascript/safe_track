import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; //"http://localhost:5000/api"; // Replace with your backend URL

// Set up Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header dynamically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Save Firebase token in localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const apiService = {
  getUserById: (uid) => apiClient.get(`/users/${uid}`),
  existUserById: (uid) => apiClient.get(`/users/exist/${uid}`),
  addUser: (userData) => apiClient.post("/users/add", userData),
  getUserList: () => apiClient.get("/users"),
  getManagers: () => apiClient.get("/users/managers"),
  updateUser: (uid, userData) => apiClient.put(`/users/${uid}`, userData),
  updateUserRole: (uid, role) =>
    apiClient.put(`/users/update-role/${uid}`, { role }),
  updateUserStatus: (uid, status) =>
    apiClient.put(`/users/update-status/${uid}`, { status }),
  deleteUser: (uid) => apiClient.delete(`/users/${uid}`),

  getRegions: () => apiClient.get(`/regions`),
  addRegion: (regionData) => apiClient.post(`/regions/add`, regionData),
  deleteRegion: (uid) => apiClient.delete(`/regions/${uid}`),
  updateRegion: (uid, regionData) =>
    apiClient.put(`/regions/${uid}`, regionData),
  sendNotificationForRegion: (regionId) =>
    apiClient.post(`/regions/${regionId}/notify`),

  addResponse: (data) => apiClient.post("/responses", data),
  getLastStatusByUserId: (uid) => apiClient.get(`/responses/status/${uid}`),
  getStatusesForUserId: (uid) => apiClient.get(`/responses/statuses/${uid}`),

  saveSubscription: (data) => apiClient.post("/subscriptions", data),
};
