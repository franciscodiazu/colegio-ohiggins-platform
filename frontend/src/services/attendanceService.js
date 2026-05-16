import { bffClient } from './bffClient';

/**
 * attendanceService.js - Servicio real de asistencia que se conecta al BFF
 * Reemplaza attendanceMockService.js con llamadas HTTP reales
 */

export const attendanceService = {

    /**
     * Lista todos los registros de asistencia
     */
    async listAttendanceRecords() {
        try {
            const response = await bffClient.get('/api/asistencia/listar');
            return response.data || [];
        } catch (error) {
            console.error('[attendanceService:listAttendanceRecords]', {
                status: error.response?.status,
                message: error.response?.data?.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },

    /**
     * Crea un nuevo registro de asistencia
     * @param {Object} payload - { estudianteId, fecha_registro, tipo_registro }
     * @returns {Promise<Object>} Registro creado
     */
    async createAttendanceRecord(payload) {
        try {
            // Validar payload obligatorio
            if (!payload.estudianteId || !payload.fecha_registro || !payload.tipo_registro) {
                throw new Error('Estudiante, fecha y tipo de registro son obligatorios');
            }

            // Mapear desde frontend a backend si es necesario
            const backendPayload = {
                estudiante_id: payload.estudianteId,
                fecha_registro: payload.fecha_registro,
                tipo_registro: payload.tipo_registro,
                ...(payload.horaLlegada && { hora_llegada: payload.horaLlegada })
            };

            // POST a BFF (que routea a ms-attendance)
            const response = await bffClient.post('/api/asistencia', backendPayload);

            console.info('[attendanceService:createAttendanceRecord] Success', {
                recordId: response.data?.id,
                studentId: payload.estudianteId,
                timestamp: new Date().toISOString()
            });

            return response.data;

        } catch (error) {
            const errorInfo = {
                timestamp: new Date().toISOString(),
                studentId: payload.estudianteId,
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            };

            console.error('[attendanceService:createAttendanceRecord] Error', errorInfo);

            // Diferenciar errores
            if (error.response?.status === 404) {
                error.userMessage = 'Estudiante no encontrado. Verifica el ID.';
                error.type = 'STUDENT_NOT_FOUND';
            } else if (error.response?.status === 503) {
                error.userMessage = 'El servicio de asistencia está en mantenimiento. Intenta más tarde.';
                error.type = 'SERVICE_UNAVAILABLE';
            } else if (error.response?.status === 400) {
                error.userMessage = 'Datos inválidos: ' + (error.response?.data?.message || 'Revisa los datos ingresados');
                error.type = 'INVALID_PAYLOAD';
            } else {
                error.userMessage = 'Error inesperado: ' + error.message;
                error.type = 'UNKNOWN_ERROR';
            }

            throw error;
        }
    },

    /**
     * Obtiene registros de asistencia por estudiante
     */
    async listAttendanceByStudent(studentId) {
        try {
            const response = await bffClient.get(`/api/asistencia/estudiante/${studentId}`);
            return response.data || [];
        } catch (error) {
            console.error('[attendanceService:listAttendanceByStudent]', {
                studentId,
                status: error.response?.status,
                message: error.response?.data?.message
            });
            throw error;
        }
    },

    /**
     * Obtiene registros de asistencia por curso
     */
    async listAttendanceByCourse(courseName) {
        try {
            const response = await bffClient.get(`/api/asistencia/curso/${courseName}`);
            return response.data || [];
        } catch (error) {
            console.error('[attendanceService:listAttendanceByCourse]', {
                course: courseName,
                status: error.response?.status
            });
            throw error;
        }
    },

    /**
     * Obtiene estadísticas de asistencia
     */
    async getAttendanceStats(studentId) {
        try {
            const response = await bffClient.get(`/api/asistencia/estadisticas/${studentId}`);
            return response.data || {};
        } catch (error) {
            console.error('[attendanceService:getAttendanceStats]', {
                studentId,
                status: error.response?.status
            });
            throw error;
        }
    },

    /**
     * Obtiene atrasos por umbral
     */
    async getAtrasos(studentId, umbral = 15) {
        try {
            const response = await bffClient.get(
                `/api/asistencia/estudiante/${studentId}/atrasos?umbral=${umbral}`
            );
            return response.data || [];
        } catch (error) {
            console.error('[attendanceService:getAtrasos]', {
                studentId,
                umbral,
                status: error.response?.status
            });
            throw error;
        }
    }
};

export default attendanceService;

