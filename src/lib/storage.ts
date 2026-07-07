export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const stored = localStorage.getItem(`muzsports_${key}`);
    if (!stored) return defaultValue;
    try {
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: any) => {
    localStorage.setItem(`muzsports_${key}`, JSON.stringify(value));
  },
  remove: (key: string) => {
    localStorage.removeItem(`muzsports_${key}`);
  }
};
