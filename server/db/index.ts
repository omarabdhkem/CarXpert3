import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import dotenv from 'dotenv';

// تحميل المتغيرات البيئية
dotenv.config();

const useNeon = process.env.DATABASE_URL?.includes('neon.tech');

// إعداد الاتصال بقاعدة البيانات
let pool: Pool;
let db: any;

if (useNeon) {
  // استخدام Neon Database إذا كانت متاحة
  import('@neondatabase/serverless').then(({ neonConfig }) => {
    import('ws').then((ws) => {
      neonConfig.webSocketConstructor = ws.default;
    });
  });
  
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  import('drizzle-orm/neon-serverless').then(({ drizzle: neonDrizzle }) => {
    db = neonDrizzle(pool, { schema });
  });
} else {
  // استخدام PostgreSQL العادي محليًا
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

// التحقق من الاتصال بقاعدة البيانات
export async function checkDatabaseConnection() {
  try {
    if (!pool) {
      throw new Error('لم يتم إنشاء اتصال بقاعدة البيانات');
    }
    
    const result = await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    return false;
  }
}

export { pool, db };
