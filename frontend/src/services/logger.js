const APP_PREFIX = '[COLEGIO-OHIGGINS]';

const logger = {
  info: (message, ...args) => {
    console.log(`${new Date().toISOString()}  INFO ${APP_PREFIX} - ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`${new Date().toISOString()}  WARN ${APP_PREFIX} - ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`${new Date().toISOString()} ERROR ${APP_PREFIX} - ${message}`, ...args);
  },
  debug: (message, ...args) => {
    console.debug(`${new Date().toISOString()} DEBUG ${APP_PREFIX} - ${message}`, ...args);
  },
};

export default logger;
