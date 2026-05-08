import axios from 'axios';

const API_URL = 'http://localhost:8080';

export const bffClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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