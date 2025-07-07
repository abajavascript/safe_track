import axios from "axios";
import { auth } from "../firebaseConfig"; // Import Firebase auth

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; //"http://localhost:5000/api"; // Replace with your backend URL

// Set up Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header dynamically
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    try {
      const token = await user.getIdToken(); // Get fresh token if needed
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Error getting Firebase token:", error);
    }
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
  updateUserFields: (uid, userData) =>
    apiClient.put(`/users/update-user-fields/${uid}`, userData),
  updateUserRole: (uid, role) =>
    apiClient.put(`/users/update-role/${uid}`, { role }),
  verifyEmail: (uid, status) =>
    apiClient.put(`/users/verify-email/${uid}`, { status }),
  updateUserStatus: (uid, status) =>
    apiClient.put(`/users/update-status/${uid}`, { status }),
  deleteUser: (uid) => apiClient.delete(`/users/${uid}`),

  getRegions: () => apiClient.get(`/regions`),
  addRegion: (regionData) => apiClient.post(`/regions/add`, regionData),
  deleteRegion: (uid) => apiClient.delete(`/regions/${uid}`),
  updateRegion: (uid, regionData) =>
    apiClient.put(`/regions/${uid}`, regionData),
  sendNotificationForUser: (userId) =>
    apiClient.post(`/users/${userId}/notify`),
  sendNotificationForRegion: (regionId) =>
    apiClient.post(`/regions/${regionId}/notify`),

  addResponse: (data) => apiClient.post("/responses", data),
  getLastStatusByUserId: (uid) => apiClient.get(`/responses/status/${uid}`),
  getStatusesForUserId: (uid) => apiClient.get(`/responses/statuses/${uid}`),

  saveSubscription: (data) => apiClient.post("/subscriptions", data),
};
