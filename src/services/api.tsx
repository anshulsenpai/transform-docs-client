import axios from "axios";
import { store } from "../redux/store";

const BASE_URL = "http://localhost:5050/api";

// Public API Instance (No Authentication Required)
export const publicRequest = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// User API Instance (Requires Authentication)
export const userRequest = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor (Attach Token from Redux Store)
userRequest.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (Handle 401 Errors)
userRequest.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            store.dispatch({ type: "auth/logout" });
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
