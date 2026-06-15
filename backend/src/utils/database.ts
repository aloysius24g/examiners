import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import ENV from './envProvider.js';

const adapter = new PrismaPg({ 
  connectionString: ENV.DATABASE_URL
});
const db = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn','query', 'error'] : []
}); 

export default db;
