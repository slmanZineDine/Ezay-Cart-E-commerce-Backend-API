import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Load .env.local only if it exists (used locally; ignored safely in cloud environments)
dotenv.config({ path: '.env.local' });

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  // Use the single connection string for both Local and Neon
  url: process.env.DATABASE_URL,

  // Dynamically resolve .js in dist/ (after build) or .ts in ../../ (local dev)
  entities: [isProduction ? 'dist/**/*.entity.js' : '../../**/*.entity.ts'],
  migrations: [isProduction ? 'dist/migrations/*.js' : '../../migrations/*.ts'],

  // Required for Neon in production
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
