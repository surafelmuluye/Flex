// Simple logger service for development
export const log = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  },
};

export function getLogger(name: string) {
  return {
    info: (message: string, meta?: any) => {
      console.log(`[${name}] [INFO] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
    error: (message: string, meta?: any) => {
      console.error(`[${name}] [ERROR] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
    warn: (message: string, meta?: any) => {
      console.warn(`[${name}] [WARN] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
    debug: (message: string, meta?: any) => {
      console.debug(`[${name}] [DEBUG] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    },
  };
}
