import { Pool, PoolClient, types } from 'pg';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

// Parse Postgres BIGINT (OID 20) as JS number to match mysql2 behavior for IDs and COUNT(*)
types.setTypeParser(20, (val: string) => parseInt(val, 10));

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${encodeURIComponent(process.env.DB_USER || 'postgres.usrbtogxmotmtmbppbvs')}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST || 'aws-0-ap-southeast-1.pooler.supabase.com'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'postgres'}`;

const pgPool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const CONFLICT_TARGETS: Record<string, string> = {
  activity_submissions: 'student_id, activity_id',
  attendance: 'student_id, class_id, date',
  lesson_reads: 'lesson_id, student_id',
  live_game_results: 'game_id, student_id',
  student_enrollments: 'student_id, class_id',
  student_notification_reads: 'student_id, notification_key',
  student_badges: 'student_id, badge_id',
  classes: 'teacher_id, grade_level, section',
  users: 'email',
  schema_migrations: 'filename',
};

function translateMysqlToPostgres(rawSql: string, rawParams: any[] = []): { sql: string; params: any[] } {
  let sql = rawSql.trim();
  const params = [...rawParams];

  if (/^SET\s+FOREIGN_KEY_CHECKS\s*=/i.test(sql)) {
    return { sql: 'SELECT 1', params: [] };
  }

  if (/^SHOW\s+TABLES$/i.test(sql)) {
    return {
      sql: `SELECT tablename AS table_name FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
      params: [],
    };
  }

  // Replace TABLE_SCHEMA = DATABASE() with table_schema = 'public'
  sql = sql.replace(/\bTABLE_SCHEMA\s*=\s*DATABASE\(\)/gi, "table_schema = 'public'");

  // Replace DATABASE() with current_database()
  sql = sql.replace(/\bDATABASE\(\)/gi, 'current_database()');

  // Replace legacy double-quoted string literals used in a few queries
  sql = sql.replace(/status\s*=\s*"active"/gi, "status = 'active'");
  sql = sql.replace(/VALUES\s*\(([^)]*),\s*"active"\)/gi, "VALUES ($1, 'active')");
  sql = sql.replace(/user_type\s*=\s*"student"/gi, "user_type = 'student'");
  sql = sql.replace(/user_type\s*=\s*"teacher"/gi, "user_type = 'teacher'");

  // Replace MySQL IF(cond, 1, 0) with CASE WHEN cond THEN 1 ELSE 0 END
  sql = sql.replace(/\bIF\s*\(\s*([^,]+?)\s*,\s*1\s*,\s*0\s*\)/gi, 'CASE WHEN $1 THEN 1 ELSE 0 END');

  // Replace GROUP_CONCAT(DISTINCT expr SEPARATOR 'sep') and GROUP_CONCAT(expr SEPARATOR 'sep')
  sql = sql.replace(
    /\bGROUP_CONCAT\s*\(\s*DISTINCT\s+([\s\S]+?)\s+SEPARATOR\s+'([^']*)'\s*\)/gi,
    "STRING_AGG(DISTINCT $1, '$2')"
  );
  sql = sql.replace(
    /\bGROUP_CONCAT\s*\(\s*([\s\S]+?)\s+SEPARATOR\s+'([^']*)'\s*\)/gi,
    "STRING_AGG($1, '$2')"
  );

  // Replace DATE_FORMAT(col, '%b %e') and DATE_FORMAT(col, '%Y-%m-%d')
  sql = sql.replace(/\bDATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*'%b %e'\s*\)/gi, "TO_CHAR($1, 'Mon FMDD')");
  sql = sql.replace(/\bDATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*'%Y-%m-%d'\s*\)/gi, "TO_CHAR($1, 'YYYY-MM-DD')");

  // Replace DATE_ADD(NOW(), INTERVAL 7 DAY)
  sql = sql.replace(/\bDATE_ADD\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "(NOW() + INTERVAL '$1 days')");

  // Replace MySQL boolean integer comparisons on lessons.is_visible
  sql = sql.replace(/\b(l\.)?is_visible\s*=\s*1\b/gi, '$1is_visible = TRUE');
  sql = sql.replace(/\b(l\.)?is_visible\s*=\s*0\b/gi, '$1is_visible = FALSE');

  // Convert boolean parameter for UPDATE lessons SET is_visible = ?
  if (/UPDATE\s+lessons\s+SET\s+is_visible\s*=\s*\?/i.test(sql) && params.length > 0) {
    params[0] = Boolean(params[0]);
  }

  // Convert boolean parameter for INSERT INTO lessons (... is_visible ...)
  const lessonInsertMatch = sql.match(/INSERT\s+INTO\s+lessons\s*\(([^)]+)\)/i);
  if (lessonInsertMatch) {
    const cols = lessonInsertMatch[1].split(',').map((c) => c.trim().toLowerCase());
    const visIdx = cols.indexOf('is_visible');
    if (visIdx !== -1 && visIdx < params.length) {
      params[visIdx] = Boolean(params[visIdx]);
    }
  }

  // Convert MySQL UPDATE ... JOIN ... SET ... WHERE ... (in live-games PATCH)
  if (/UPDATE\s+live_game_results\s+lgr\s+JOIN\s+live_games\s+lg/i.test(sql)) {
    sql = `
      UPDATE live_game_results lgr
      SET result_status = CASE WHEN u.name = ? THEN 'selected' ELSE 'joined' END
      FROM live_games lg, users u
      WHERE lg.id = lgr.game_id AND u.id = lgr.student_id AND lgr.game_id = ?
    `;
  }

  // Fix GROUP BY a.id / l.id when joined with classes c (c.name, c.section)
  if (/FROM\s+activities\s+a[\s\S]*?JOIN\s+classes\s+c[\s\S]*?GROUP\s+BY\s+a\.id\b(?!\s*,)/i.test(sql)) {
    sql = sql.replace(/GROUP\s+BY\s+a\.id\b/i, 'GROUP BY a.id, c.name, c.section');
  }
  if (/FROM\s+lessons\s+l[\s\S]*?JOIN\s+classes\s+c[\s\S]*?GROUP\s+BY\s+l\.id\b(?!\s*,)/i.test(sql)) {
    sql = sql.replace(/GROUP\s+BY\s+l\.id\b/i, 'GROUP BY l.id, c.name, c.section');
  }

  // Fix HAVING is_enrolled_here = 1 alias in teacher/students
  if (/HAVING\s+is_enrolled_here\s*=\s*1/i.test(sql)) {
    sql = sql.replace(
      /HAVING\s+is_enrolled_here\s*=\s*1/i,
      'HAVING MAX(CASE WHEN se.class_id = ? THEN 1 ELSE 0 END) = 1'
    );
    if (params.length === 1) {
      params.push(params[0]);
    }
  }

  // Convert ON DUPLICATE KEY UPDATE -> ON CONFLICT (...) DO UPDATE SET ...
  const onDupMatch = sql.match(/\bON\s+DUPLICATE\s+KEY\s+UPDATE\s+([\s\S]+)$/i);
  if (onDupMatch) {
    const tableMatch = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : '';
    const conflictCols = CONFLICT_TARGETS[tableName];
    let updateClause = onDupMatch[1].replace(/\bVALUES\s*\(\s*([a-zA-Z0-9_]+)\s*\)/gi, 'EXCLUDED.$1');
    if (conflictCols) {
      sql = sql.replace(
        /\bON\s+DUPLICATE\s+KEY\s+UPDATE\s+[\s\S]+$/i,
        `ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateClause}`
      );
    }
  }

  // Convert ? placeholders outside of single-quoted strings to $1, $2, ...
  let paramIndex = 0;
  let inSingleQuote = false;
  let converted = '';
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'" && sql[i - 1] !== '\\') {
      inSingleQuote = !inSingleQuote;
      converted += ch;
    } else if (ch === '?' && !inSingleQuote) {
      paramIndex++;
      converted += `$${paramIndex}`;
    } else {
      converted += ch;
    }
  }
  sql = converted;

  // Append RETURNING id to INSERT statements that don't already have RETURNING
  if (/^INSERT\s+INTO\s+/i.test(sql) && !/\bRETURNING\b/i.test(sql)) {
    sql = `${sql.replace(/;\s*$/, '')} RETURNING id`;
  }

  return { sql, params };
}

async function executeQuery(clientOrPool: Pool | PoolClient, rawSql: string, rawParams: any[] = []): Promise<[any, any]> {
  const { sql, params } = translateMysqlToPostgres(rawSql, rawParams);
  const res = await clientOrPool.query(sql, params);
  const command = (res.command || '').toUpperCase();

  if (command === 'SELECT' || command === 'SHOW') {
    return [res.rows, res.fields];
  }

  const header = {
    insertId: res.rows?.[0]?.id !== undefined ? Number(res.rows[0].id) : 0,
    affectedRows: res.rowCount ?? 0,
    rowCount: res.rowCount ?? 0,
  };
  return [header, res.fields];
}

const pool = {
  async query(sql: string, params?: any[]): Promise<[any, any]> {
    return executeQuery(pgPool, sql, params || []);
  },
  async execute(sql: string, params?: any[]): Promise<[any, any]> {
    return executeQuery(pgPool, sql, params || []);
  },
  async getConnection() {
    const client = await pgPool.connect();
    return {
      async query(sql: string, params?: any[]): Promise<[any, any]> {
        return executeQuery(client, sql, params || []);
      },
      async execute(sql: string, params?: any[]): Promise<[any, any]> {
        return executeQuery(client, sql, params || []);
      },
      async beginTransaction() {
        await client.query('BEGIN');
      },
      async commit() {
        await client.query('COMMIT');
      },
      async rollback() {
        await client.query('ROLLBACK');
      },
      release() {
        client.release();
      },
    };
  },
  async end() {
    await pgPool.end();
  },
};

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    console.log('✅ Supabase Postgres database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Supabase database connection failed:', error);
    return false;
  }
}

export default pool;
