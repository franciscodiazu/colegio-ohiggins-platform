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

        const backendMessage = error.response?.data?.message || '';

        if (status === 400) {
            error.userMessage = backendMessage || 'Datos inválidos. Revisa la información ingresada.';
            error.type = 'VALIDATION_ERROR';
        } else if (status === 401) {
            error.userMessage = 'Sesión expirada. Inicia sesión nuevamente.';
            error.type = 'UNAUTHORIZED';
        } else if (status === 403) {
            error.userMessage = 'No tienes permisos para realizar esta acción.';
            error.type = 'FORBIDDEN';
        } else if (status === 404) {
            error.userMessage = backendMessage || 'El recurso solicitado no fue encontrado.';
            error.type = 'NOT_FOUND';
        } else if (status === 409) {
            error.userMessage = backendMessage || 'Conflicto: el recurso ya existe o está duplicado.';
            error.type = 'CONFLICT';
        } else if (status === 503) {
            error.userMessage = 'El servicio no está disponible. Intenta más tarde.';
            error.type = 'SERVICE_UNAVAILABLE';
        } else {
            error.userMessage = backendMessage || error.message || 'Error inesperado. Intenta nuevamente.';
            error.type = 'UNKNOWN_ERROR';
        }

        return Promise.reject(error);
    }
);

// Mapeo de campos: Frontend (nombre, curso) -> Backend (rut_estudiante, nombre_completo, grado_academico)
const mapFrontendToBackend = (frontendData) => ({
    rut_estudiante: frontendData.rut || '',
    nombre_completo: frontendData.nombre || frontendData.name || '',
    grado_academico: frontendData.curso || frontendData.grade || '',
    correo: frontendData.correo || frontendData.email || '',
    telefono: frontendData.telefono || frontendData.phone || '',
});

const mapBackendToFrontend = (backendData) => ({
    id: backendData.id,
    nombre: backendData.name || '',
    rut: backendData.rut || '',
    correo: backendData.email || '',
    curso: backendData.grade || '',
    telefono: backendData.phone || '',
});

// Servicio de Estudiantes - Conexión real al BFF
export const studentsService = {
    async listStudents() {
        try {
            const response = await bffClient.get('/api/students');
            return Array.isArray(response.data) ? response.data.map(mapBackendToFrontend) : [];
        } catch (error) {
            console.error('[studentsService:listStudents]', {
                status: error.response?.status,
                message: error.response?.data?.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },

    async createStudent(payload) {
        try {
            if (!payload.nombre && !payload.name) {
                throw new Error('El nombre del estudiante es obligatorio');
            }
            const backendPayload = mapFrontendToBackend(payload);
            const response = await bffClient.post('/api/students', backendPayload);
            return mapBackendToFrontend(response.data);
        } catch (error) {
            console.error('[studentsService:createStudent]', {
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },

    async getStudentById(studentId) {
        try {
            const response = await bffClient.get(`/api/students/${studentId}`);
            return response.data ? mapBackendToFrontend(response.data) : null;
        } catch (error) {
            console.error('[studentsService:getStudentById]', {
                studentId,
                status: error.response?.status,
                message: error.response?.data?.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },

    async updateStudent(studentId, payload) {
        try {
            if (!payload.nombre && !payload.name) {
                throw new Error('El nombre del estudiante es obligatorio');
            }
            const backendPayload = mapFrontendToBackend(payload);
            const response = await bffClient.put(`/api/students/${studentId}`, backendPayload);
            return response.data ? mapBackendToFrontend(response.data) : null;
        } catch (error) {
            console.error('[studentsService:updateStudent]', {
                studentId,
                status: error.response?.status,
                message: error.response?.data?.message || error.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },

    async listStudentCourses(studentId) {
        try {
            const response = await bffClient.get(`/api/students/${studentId}/courses`);
            return response.data || [];
        } catch (error) {
            console.error('[studentsService:listStudentCourses]', {
                studentId,
                status: error.response?.status,
                message: error.response?.data?.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },
};
