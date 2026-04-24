const CLASSES_STORAGE_KEY = 'coh_classes';
const ATTENDANCE_STORAGE_KEY = 'coh_attendance_records';
const STUDENTS_STORAGE_KEY = 'coh_students';

const ATTENDANCE_STATES = {
  PRESENTE: 'PRESENTE',
  AUSENTE: 'AUSENTE',
  JUSTIFICADO: 'JUSTIFICADO',
};

const seedClasses = [
  {
    id: 501,
    fecha: new Date().toISOString().slice(0, 10),
    curso: '1A',
    asignatura: 'Matematicas',
    bloque: '08:00 - 08:45',
  },
  {
    id: 502,
    fecha: new Date().toISOString().slice(0, 10),
    curso: '2B',
    asignatura: 'Historia',
    bloque: '09:00 - 09:45',
  },
];

const seedAttendance = [];

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

const normalizeState = (value) => {
  const raw = String(value || '').trim().toUpperCase();

  if (raw === 'PRESENT') {
    return ATTENDANCE_STATES.PRESENTE;
  }

  if (raw === 'ABSENT') {
    return ATTENDANCE_STATES.AUSENTE;
  }

  if (raw === 'JUSTIFIED') {
    return ATTENDANCE_STATES.JUSTIFICADO;
  }

  return raw;
};

const readStudents = () => readArray(STUDENTS_STORAGE_KEY, []);

const withNormalizedStates = (records) => {
  return records.map((record) => ({
    ...record,
    estado: normalizeState(record.estado),
  }));
};

const writeArray = (storageKey, data) => {
  localStorage.setItem(storageKey, JSON.stringify(data));
};

const nextId = (items) => {
  const maxId = items.reduce((acc, current) => (current.id > acc ? current.id : acc), 0);
  return maxId + 1;
};

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

const validateClassPayload = (payload) => {
  if (!payload.fecha || !payload.curso.trim() || !payload.asignatura.trim() || !payload.bloque.trim()) {
    throw new Error('Fecha, curso, asignatura y bloque son obligatorios para registrar una clase.');
  }
};

const validateAttendancePayload = (payload) => {
  if (!payload.classId || !payload.studentId || !payload.estado) {
    throw new Error('Clase, estudiante y estado son obligatorios para registrar asistencia.');
  }
};

export const attendanceMockService = {
  async listClasses() {
    return delay(readArray(CLASSES_STORAGE_KEY, seedClasses));
  },

  async createClass(payload) {
    validateClassPayload(payload);
    const classes = readArray(CLASSES_STORAGE_KEY, seedClasses);

    const nextClass = {
      id: nextId(classes),
      fecha: payload.fecha,
      curso: payload.curso.trim(),
      asignatura: payload.asignatura.trim(),
      bloque: payload.bloque.trim(),
    };

    const nextClasses = [...classes, nextClass];
    writeArray(CLASSES_STORAGE_KEY, nextClasses);

    return delay(nextClass);
  },

  async listAttendanceRecords() {
    const records = readArray(ATTENDANCE_STORAGE_KEY, seedAttendance);
    return delay(withNormalizedStates(records));
  },

  async createAttendanceRecord(payload) {
    validateAttendancePayload(payload);
    const attendance = readArray(ATTENDANCE_STORAGE_KEY, seedAttendance);
    const classes = readArray(CLASSES_STORAGE_KEY, seedClasses);
    const students = readStudents();

    const classId = Number(payload.classId);
    const studentId = Number(payload.studentId);
    const normalizedState = normalizeState(payload.estado);

    const classEntry = classes.find((item) => item.id === classId);
    if (!classEntry) {
      throw new Error('No se puede registrar asistencia sin una clase previamente registrada.');
    }

    const studentEntry = students.find((item) => item.id === studentId);
    if (!studentEntry) {
      throw new Error('Toda asistencia debe estar asociada a un estudiante existente.');
    }

    if (!classEntry.fecha) {
      throw new Error('Cada registro de asistencia debe incluir fecha y estado de asistencia.');
    }

    const allowedStates = Object.values(ATTENDANCE_STATES);
    if (!allowedStates.includes(normalizedState)) {
      throw new Error('Estado de asistencia invalido. Usa: PRESENTE, AUSENTE o JUSTIFICADO.');
    }

    const duplicated = attendance.some(
      (item) => Number(item.classId) === classId && Number(item.studentId) === studentId,
    );

    if (duplicated) {
      throw new Error('Un estudiante solo puede tener un registro de asistencia por clase.');
    }

    const nextRecord = {
      id: nextId(attendance),
      classId,
      studentId,
      fecha: classEntry.fecha,
      estado: normalizedState,
      observacion: (payload.observacion || '').trim(),
      createdAt: new Date().toISOString(),
    };

    const nextAttendance = [...attendance, nextRecord];
    writeArray(ATTENDANCE_STORAGE_KEY, nextAttendance);

    return delay(nextRecord);
  },

  async listAttendanceByStudent(studentId) {
    const attendance = readArray(ATTENDANCE_STORAGE_KEY, seedAttendance);
    const filtered = withNormalizedStates(attendance).filter((item) => item.studentId === Number(studentId));
    return delay(filtered);
  },

  async listAttendanceByCourse(courseName, classesCache) {
    const attendance = readArray(ATTENDANCE_STORAGE_KEY, seedAttendance);
    const classes = classesCache || readArray(CLASSES_STORAGE_KEY, seedClasses);

    const classIdsForCourse = classes
      .filter((item) => item.curso === courseName)
      .map((item) => item.id);

    const filtered = withNormalizedStates(attendance).filter((item) => classIdsForCourse.includes(item.classId));
    return delay(filtered);
  },
};
