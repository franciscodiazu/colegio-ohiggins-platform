import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export const bffClient = axios.create({
    baseURL: API_URL,       
    headers: {
        'Content-Type': 'application/json',
    },
});

// Funciones específicas para Estudiantes
export const getEstudiantes = async () => {
    const response = await bffClient.get('/estudiantes');
    return response.data;
};

export const createEstudiante = async (estudianteData) => {
    const response = await bffClient.post('/estudiantes', estudianteData);
    return response.data;
};