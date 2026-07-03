import { bffClient } from './bffClient';

export const evaluationsService = {
  async listEvaluations() {
    try {
      const response = await bffClient.get('/api/evaluaciones');
      return response.data ?? [];
    } catch (error) {
      console.error('[evaluationsService:listEvaluations]', {
        status: error.response?.status,
        message: error.response?.data?.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async createEvaluation(payload) {
    try {
      if (!payload.nombre || !payload.curso || !payload.fecha) {
        throw new Error('Nombre, curso y fecha son obligatorios');
      }
      const response = await bffClient.post('/api/evaluaciones', {
        ...payload,
        ponderacion: Number(payload.ponderacion) || 30,
      });
      return response.data;
    } catch (error) {
      console.error('[evaluationsService:createEvaluation]', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async updateEvaluation(evaluationId, payload) {
    try {
      if (!payload.nombre || !payload.curso || !payload.fecha) {
        throw new Error('Nombre, curso y fecha son obligatorios');
      }
      const response = await bffClient.put(`/api/evaluaciones/${evaluationId}`, {
        ...payload,
        ponderacion: Number(payload.ponderacion) || 30,
      });
      return response.data;
    } catch (error) {
      console.error('[evaluationsService:updateEvaluation]', {
        evaluationId,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async listEvaluationsByCourse(courseName) {
    try {
      const response = await bffClient.get(`/api/evaluaciones/curso/${courseName}`);
      return response.data ?? [];
    } catch (error) {
      console.error('[evaluationsService:listEvaluationsByCourse]', {
        course: courseName,
        status: error.response?.status,
        message: error.response?.data?.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async listGrades() {
    try {
      const response = await bffClient.get('/api/evaluaciones/calificaciones');
      return response.data ?? [];
    } catch (error) {
      console.error('[evaluationsService:listGrades]', {
        status: error.response?.status,
        message: error.response?.data?.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async createGrade(payload) {
    try {
      if (!payload.evaluationId && !payload.evaluacionId) {
        throw new Error('El campo evaluationId es obligatorio');
      }
      if (!payload.studentId && !payload.estudianteId) {
        throw new Error('El campo studentId es obligatorio');
      }
      if (payload.nota === undefined || payload.nota === '') {
        throw new Error('La nota es obligatoria');
      }
      const response = await bffClient.post('/api/evaluaciones/calificaciones', payload);
      return response.data;
    } catch (error) {
      console.error('[evaluationsService:createGrade]', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async listGradesByStudent(studentId) {
    try {
      const response = await bffClient.get(`/api/evaluaciones/calificaciones/estudiante/${studentId}`);
      return response.data ?? [];
    } catch (error) {
      console.error('[evaluationsService:listGradesByStudent]', {
        studentId,
        status: error.response?.status,
        message: error.response?.data?.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },
};
