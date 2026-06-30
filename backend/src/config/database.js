import mysql from 'mysql2/promise';
import './env.js';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'majority_db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 2000,
});

pool.on?.('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const query = async (text, params) => {
  const start = Date.now();
  const [rows, fields] = await pool.query(text, params);
  const duration = Date.now() - start;
  const rowCount = Array.isArray(rows) ? rows.length : rows.affectedRows;
  console.log('Executed query', { text: text.substring(0, 50), duration, rows: rowCount });
  return { rows: Array.isArray(rows) ? rows : [], rowCount };
};

export const getClient = () => pool.getConnection();

export default pool;
