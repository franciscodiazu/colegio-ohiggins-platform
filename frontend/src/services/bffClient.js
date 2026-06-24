import axios from 'axios';
import logger from './logger';

const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'coh_platform_token';
const REFRESH_TOKEN_KEY = 'coh_platform_refresh';

export const bffClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

bffClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

bffClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return bffClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
                if (!refreshToken) {
                    throw new Error('No refresh token disponible');
                }

                const response = await bffClient.post('/api/v1/auth/refresh', { refreshToken });
                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                localStorage.setItem(TOKEN_KEY, newToken);
                localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return bffClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                logger.error('Refresh token fallido — redirigiendo a login', refreshError.message);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        const status = error.response ? error.response.status : 'NETWORK_ERROR';
        const method = originalRequest?.method?.toUpperCase() || 'UNKNOWN';
        const url = originalRequest?.url || 'UNKNOWN';
        logger.error(`Fallo en comunicación BFF [Status ${status}] | ${method} -> ${url}`, error.message);

        return Promise.reject(error);
    }
);

// Mapeo de campos: Frontend (nombre, curso) -> Backend (name, grade, rut)
const mapFrontendToBackend = (frontendData) => ({
    id: frontendData.id,
    rut: frontendData.rut || generateTempRut(),
    name: frontendData.nombre || frontendData.name || '',
    grade: frontendData.curso || frontendData.grade || '',
});

const mapBackendToFrontend = (backendData) => ({
    id: backendData.id,
    nombre: backendData.name,
    rut: backendData.rut,
    correo: backendData.email || '',
    curso: backendData.grade,
    telefono: backendData.phone || '',
    cursosAsociados: backendData.courses || [],
});

// Generador temporal de RUT para compatibilidad con backend
let tempRutCounter = 10000000;
const generateTempRut = () => {
    const num = tempRutCounter++;
    return `${num}-${num % 11}`;
};

// Servicio de Estudiantes - Conexión real al BFF
export const studentsService = {
    async listStudents() {
        const response = await bffClient.get('/api/students');
        return Array.isArray(response.data) ? response.data.map(mapBackendToFrontend) : [];
    },

    async createStudent(payload) {
        const backendPayload = mapFrontendToBackend(payload);
        const response = await bffClient.post('/api/students', backendPayload);
        return mapBackendToFrontend(response.data);
    },

    async getStudentById(studentId) {
        const response = await bffClient.get(`/api/students/${studentId}`);
        return response.data ? mapBackendToFrontend(response.data) : null;
    },

    async updateStudent(studentId, payload) {
        const backendPayload = mapFrontendToBackend(payload);
        const response = await bffClient.put(`/api/students/${studentId}`, backendPayload);
        return response.data ? mapBackendToFrontend(response.data) : null;
    },

    async listStudentCourses(studentId) {
        const response = await bffClient.get(`/api/students/${studentId}/courses`);
        return response.data || [];
    },
};
