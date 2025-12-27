import axios from "axios";


const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem("refresh_token");
                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Call refresh endpoint
                const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                
                if (access) {
                    localStorage.setItem("access_token", access);
                    
                    // Update header and retry original request
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // Logout user
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.href = "/account"; // Redirect to login
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
export { BASE_URL };
