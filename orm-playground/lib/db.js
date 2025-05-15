const { Pool } = require('pg');

let pool = null;

function initPool(connectionUrl) {
  if (pool) {
    pool.end();
  }
  pool = new Pool({
    connectionString: connectionUrl,
    ssl: { rejectUnauthorized: false }, 
  });
  return pool;
}

async function getTables() {
  if (!pool) {
    throw new Error('Database not connected');
  }
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  `;
  const { rows } = await pool.query(query);
  return rows.map(row => row.table_name);
}

async function getTableSchema(tableName) {
  if (!pool) {
    throw new Error('Database not connected');
  }
  const query = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1
  `;
  const { rows } = await pool.query(query, [tableName]);
  return rows;
}

async function disconnect() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { initPool, getTables, getTableSchema, disconnect };