import axios from "axios";
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  USER_DATA,
} from "./authConstants";

const api = axios.create({
 baseURL: "https://mypayments-o874.onrender.com/api/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("API REQUEST:", config.method?.toUpperCase(), config.baseURL + config.url);

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("API RESPONSE:", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error("NO RESPONSE FROM DJANGO (Case A - Network/CORS):", error.message);
    } else {
      console.error(
        `DJANGO ERROR [HTTP ${error.response.status}]:`,
        error.config?.url,
        error.response.data
      );

      const isAuthEndpoint = error.config?.url?.includes("login") || error.config?.url?.includes("register");
      if (error.response.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        localStorage.removeItem(USER_DATA);
      }
    }

    return Promise.reject(error);
  }
);

export default api;