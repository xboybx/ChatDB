export const APP_CONFIG = {
  name: 'AI Data Query Assistant',
  version: '1.0.0',
  description: 'Query your data using natural language powered by Gemini AI',
};

export const QUERY_CONFIG = {
  maxResults: 1000,
  queryTimeout: 30000,
  defaultLimit: 100,
};

export const FILE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024,
  allowedFormats: ['xlsx', 'xls', 'csv'],
  maxRows: 100000,
};

export const DATABASE_CONFIG = {
  sqlTimeout: 30000,
  mongoTimeout: 30000,
  connectionTestQuery: 'SELECT 1',
};

export const UI_CONFIG = {
  messagePageSize: 50,
  resultsPreviewRows: 10,
  sidebarWidth: 256,
};

export const GEMINI_CONFIG = {
  model: 'gemini-pro',
  temperature: 0.3,
  maxTokens: 2048,
};

export const ERROR_MESSAGES = {
  NO_API_KEY: 'Gemini API key not configured. Please add GEMINI_API_KEY to .env.local',
  NO_DATASET: 'Please upload a file or connect to a database first',
  INVALID_CONNECTION: 'Failed to connect to database. Please verify your connection string.',
  QUERY_FAILED: 'Query execution failed. Please check your question and try again.',
  FILE_UPLOAD_FAILED: 'File upload failed. Please ensure the file is valid and under 10MB.',
  DATABASE_TIMEOUT: 'Database connection timed out. Please try again.',
};

export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded and parsed successfully!',
  DATABASE_CONNECTED: 'Database connected successfully!',
  QUERY_EXECUTED: 'Query executed successfully.',
};
