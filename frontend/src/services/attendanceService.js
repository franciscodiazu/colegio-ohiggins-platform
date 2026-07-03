import { bffClient } from './bffClient';

/**
 * attendanceService.js - Servicio HTTP real de asistencia
 */

export const attendanceService = {

    /**
     * Lista todas las clases registradas
     */
    async listClasses() {
        try {
            const response = await bffClient.get(`/api/clases`);
            return response.data || [];
        } catch (error) {
            console.error('[attendanceService:listClasses]', {
                status: error.response?.status,
                message: error.response?.data?.message,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    },

    /**
     * Crea una nueva clase
     * @param {Object} classForm - { fecha, curso, asignatura, bloque }
     * @returns {Promise<Object>} Clase creada
     */
    async createClass(classForm) {
        try {
            if (!classForm.fecha || !classForm.curso || !classForm.asignatura) {
                throw new Error('Fecha, curso y asignatura son obligatorios');
            }

            const response = await bffClient.post('/api/clases', classForm);

            console.info('[attendanceService:createClass] Success', {
                classId: response.data?.id,
                curso: classForm.curso,
                timestamp: new Date().toISOString()
            });

            return response.data;
        } catch (error) {
            console.error('[attendanceService:createClass] Error', {
                timestamp: new Date().toISOString(),
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
            throw error;
        }
    },

    /**
     * Lista todos los registros de asistencia
     */
    async listAttendanceRecords() {
        try {
            const response = await bffClient.get(`/api/asistencia`);
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
     * @param {Object} payload - { classId, studentId, estado, observacion }
     * @returns {Promise<Object>} Registro creado
     */
    async createAttendanceRecord(payload) {
        try {
            // Validar payload obligatorio
            if (!payload.classId || !payload.studentId || !payload.estado) {
                throw new Error('Clase, estudiante y estado son obligatorios');
            }

            // Mapear desde frontend a backend (ms-attendance espera snake_case)
            const isInasistencia = payload.estado === 'AUSENTE' || payload.estado === 'JUSTIFICADO';
            const backendPayload = {
                estudiante_id: Number(payload.studentId),
                clase_id: Number(payload.classId),
                fecha_registro: new Date().toISOString().slice(0, 10),
                tipo_registro: isInasistencia ? 'INASISTENCIA' : payload.estado,
                es_justificada: payload.estado === 'JUSTIFICADO',
                ...(payload.observacion && { notas: payload.observacion })
            };

            // POST a BFF (que routea a ms-attendance)
            const response = await bffClient.post('/api/asistencia', backendPayload);

            console.info('[attendanceService:createAttendanceRecord] Success', {
                recordId: response.data?.id,
                studentId: payload.studentId,
                timestamp: new Date().toISOString()
            });

            return response.data;

        } catch (error) {
            const errorInfo = {
                timestamp: new Date().toISOString(),
                studentId: payload.studentId,
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            };

            console.error('[attendanceService:createAttendanceRecord] Error', errorInfo);

            // Diferenciar errores
            if (error.response?.status === 404) {
                error.userMessage = 'Estudiante o clase no encontrado. Verifica los datos.';
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
     * Obtiene estadísticas de asistencia por estudiante
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

