/**
 * Application configuration
 * API and infrastructure settings
 */

export const API_CONFIG = {
  VERSION: "v1",
  PREFIX: "/api/v1",
} as const;

export const DB_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  CONNECTION_LIMIT: 10,
} as const;

export const ENV = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;
