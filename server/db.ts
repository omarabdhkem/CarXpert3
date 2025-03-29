import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// تنظيم مجموعة الاتصالات لقاعدة البيانات PostgreSQL باستخدام URL المحدد في المتغير البيئي
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// دالة للتحقق من حالة الاتصال بقاعدة البيانات PostgreSQL
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات PostgreSQL:', error);
    return false;
  }
}
