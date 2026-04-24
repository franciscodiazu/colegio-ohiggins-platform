const STUDENTS_STORAGE_KEY = 'coh_students';

const seedStudents = [
  {
    id: 1001,
    nombre: 'Juan Perez',
    correo: 'juan.perez@alum.cl',
    curso: '1A',
    telefono: '+56 9 1111 1111',
    cursosAsociados: ['Matematicas', 'Lenguaje', 'Historia'],
  },
  {
    id: 1002,
    nombre: 'Maria Gomez',
    correo: 'maria.gomez@alum.cl',
    curso: '2B',
    telefono: '+56 9 2222 2222',
    cursosAsociados: ['Biologia', 'Quimica', 'Ingles'],
  },
];

const readStudents = () => {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);

    if (!raw) {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(seedStudents));
      return seedStudents;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('No se pudo leer estudiantes mock:', error);
    return [];
  }
};

const writeStudents = (students) => {
  localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
};

const buildUniqueId = (students) => {
  const maxId = students.reduce((acc, current) => (current.id > acc ? current.id : acc), 0);
  let candidate = maxId + 1;

  while (students.some((student) => student.id === candidate)) {
    candidate += 1;
  }

  return candidate;
};

const toCourseList = (rawCourses) => {
  return rawCourses
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

const validateStudentPayload = (payload) => {
  const nombre = (payload.nombre || '').trim();
  const curso = (payload.curso || '').trim();

  if (!nombre || !curso) {
    throw new Error('Nombre y curso son obligatorios.');
  }
};

/*
  This service is intentionally shaped like an API client so the backend integration is easy.
  When the BFF is available, replace these function bodies with HTTP calls and keep signatures.
*/
export const studentsMockService = {
  async listStudents() {
    return delay(readStudents());
  },

  async createStudent(payload) {
    const students = readStudents();
    validateStudentPayload(payload);

    const student = {
      id: buildUniqueId(students),
      nombre: payload.nombre.trim(),
      correo: payload.correo.trim().toLowerCase(),
      curso: payload.curso.trim(),
      telefono: payload.telefono.trim(),
      cursosAsociados: toCourseList(payload.cursosAsociados),
    };

    const nextStudents = [...students, student];
    writeStudents(nextStudents);
    return delay(student);
  },

  async getStudentById(studentId) {
    const students = readStudents();
    const found = students.find((student) => student.id === Number(studentId)) || null;
    return delay(found);
  },

  async updateStudent(studentId, payload) {
    const students = readStudents();
    const index = students.findIndex((student) => student.id === Number(studentId));

    if (index === -1) {
      return delay(null);
    }

    validateStudentPayload(payload);

    const updated = {
      ...students[index],
      nombre: payload.nombre.trim(),
      correo: payload.correo.trim().toLowerCase(),
      curso: payload.curso.trim(),
      telefono: payload.telefono.trim(),
      cursosAsociados: toCourseList(payload.cursosAsociados),
    };

    const nextStudents = [...students];
    nextStudents[index] = updated;
    writeStudents(nextStudents);

    return delay(updated);
  },

  async listStudentCourses(studentId) {
    const found = await this.getStudentById(studentId);
    return delay(found ? found.cursosAsociados : []);
  },
};
