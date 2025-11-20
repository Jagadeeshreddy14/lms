import api from './config.js';

export const runCode = async ({ language, code, stdin = '', args = [] }) => {
  const response = await api.post('/exec/run', { language, code, stdin, args });
  return response.data;
};


