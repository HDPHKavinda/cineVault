import { neon } from '@neondatabase/serverless';

type SqlFn = (strings: TemplateStringsArray, ...values: any[]) => Promise<Record<string, any>[]>;

let _sql: ReturnType<typeof neon> | null = null;

function getSql(): ReturnType<typeof neon> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

const sql = ((strings: TemplateStringsArray, ...values: any[]) =>
  (getSql() as any)(strings, ...values)) as SqlFn;

export default sql;