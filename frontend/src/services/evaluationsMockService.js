const EVALUATIONS_STORAGE_KEY = 'coh_evaluations';
const GRADES_STORAGE_KEY = 'coh_grades';
const STUDENTS_STORAGE_KEY = 'coh_students';

const seedEvaluations = [
  {
    id: 801,
    nombre: 'Diagnostico Matematicas',
    curso: '1A',
    fecha: new Date().toISOString().slice(0, 10),
    ponderacion: 30,
    descripcion: 'Evaluacion inicial del primer trimestre',
  },
];

const seedGrades = [];

const readArray = (storageKey, seed) => {
  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      localStorage.setItem(storageKey, JSON.stringify(seed));
      return seed;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`No se pudo leer ${storageKey}:`, error);
    return [];
  }
};

const writeArray = (storageKey, value) => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

const nextId = (items) => {
  const maxId = items.reduce((acc, current) => (current.id > acc ? current.id : acc), 0);
  return maxId + 1;
};

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

const validateEvaluationPayload = (payload) => {
  if (!payload.nombre?.trim() || !payload.curso?.trim() || !payload.fecha) {
    throw new Error('Nombre, curso y fecha son obligatorios para registrar una evaluacion.');
  }

  const ponderacion = Number(payload.ponderacion);
  if (!Number.isFinite(ponderacion) || ponderacion <= 0 || ponderacion > 100) {
    throw new Error('La ponderacion debe estar entre 1 y 100.');
  }

  const students = readArray(STUDENTS_STORAGE_KEY, []);
  const knownCourses = new Set(students.map((item) => item.curso));
  if (!knownCourses.has(payload.curso.trim())) {
    throw new Error('La evaluacion debe estar asociada a un curso existente.');
  }
};

const validateGradePayload = (payload) => {
  if (!payload.evaluationId || !payload.studentId || payload.nota === '' || payload.nota === null || payload.nota === undefined) {
    throw new Error('Evaluacion, estudiante y nota son obligatorios.');
  }

  const grade = Number(payload.nota);
  if (!Number.isFinite(grade) || grade < 1.0 || grade > 7.0) {
    throw new Error('La nota debe estar en rango 1.0 a 7.0.');
  }
};

export const evaluationsMockService = {
  async listEvaluations() {
    return delay(readArray(EVALUATIONS_STORAGE_KEY, seedEvaluations));
  },

  async createEvaluation(payload) {
    validateEvaluationPayload(payload);
    const evaluations = readArray(EVALUATIONS_STORAGE_KEY, seedEvaluations);

    const nextEvaluation = {
      id: nextId(evaluations),
      nombre: payload.nombre.trim(),
      curso: payload.curso.trim(),
      fecha: payload.fecha,
      ponderacion: Number(payload.ponderacion),
      descripcion: (payload.descripcion || '').trim(),
    };

    const nextEvaluations = [...evaluations, nextEvaluation];
    writeArray(EVALUATIONS_STORAGE_KEY, nextEvaluations);

    return delay(nextEvaluation);
  },

  async updateEvaluation(evaluationId, payload) {
    validateEvaluationPayload(payload);
    const evaluations = readArray(EVALUATIONS_STORAGE_KEY, seedEvaluations);
    const index = evaluations.findIndex((item) => item.id === Number(evaluationId));

    if (index === -1) {
      return delay(null);
    }

    const updated = {
      ...evaluations[index],
      nombre: payload.nombre.trim(),
      curso: payload.curso.trim(),
      fecha: payload.fecha,
      ponderacion: Number(payload.ponderacion),
      descripcion: (payload.descripcion || '').trim(),
    };

    const nextEvaluations = [...evaluations];
    nextEvaluations[index] = updated;
    writeArray(EVALUATIONS_STORAGE_KEY, nextEvaluations);

    return delay(updated);
  },

  async listEvaluationsByCourse(courseName) {
    const evaluations = readArray(EVALUATIONS_STORAGE_KEY, seedEvaluations);
    const filtered = evaluations.filter((item) => item.curso === courseName);
    return delay(filtered);
  },

  async listGrades() {
    return delay(readArray(GRADES_STORAGE_KEY, seedGrades));
  },

  async createGrade(payload) {
    validateGradePayload(payload);

    const evaluations = readArray(EVALUATIONS_STORAGE_KEY, seedEvaluations);
    const students = readArray(STUDENTS_STORAGE_KEY, []);
    const grades = readArray(GRADES_STORAGE_KEY, seedGrades);

    const evaluation = evaluations.find((item) => item.id === Number(payload.evaluationId));
    if (!evaluation) {
      throw new Error('La evaluacion seleccionada no existe.');
    }

    const student = students.find((item) => item.id === Number(payload.studentId));
    if (!student) {
      throw new Error('El estudiante seleccionado no existe.');
    }

    if (student.curso !== evaluation.curso) {
      throw new Error('El estudiante no pertenece al curso de la evaluacion.');
    }

    const nextGrade = {
      id: nextId(grades),
      evaluationId: evaluation.id,
      studentId: student.id,
      nota: Number(payload.nota).toFixed(1),
      observacion: (payload.observacion || '').trim(),
      createdAt: new Date().toISOString(),
    };

    const nextGrades = [...grades, nextGrade];
    writeArray(GRADES_STORAGE_KEY, nextGrades);

    return delay(nextGrade);
  },

  async listGradesByStudent(studentId) {
    const grades = readArray(GRADES_STORAGE_KEY, seedGrades);
    const filtered = grades.filter((item) => item.studentId === Number(studentId));
    return delay(filtered);
  },
};
