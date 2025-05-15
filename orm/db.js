const { Pool } = require('pg');

let pool;

function initPool(connectionUrl) {
  pool = new Pool({ connectionString: connectionUrl });
  return pool;
}

async function getTables() {
  const query = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  `;
  const { rows } = await pool.query(query);
  return rows.map(row => row.table_name);
}

module.exports = { initPool, getTables };