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
  console.log("pool from /lib/db.js", pool);
  // pool from /lib/db.js BoundPool {
  //   _events: [Object: null prototype] {},
  //   _eventsCount: 0,
  //   _maxListeners: undefined,
  //   options: {
  //     connectionString: 'postgresql://postgres:guruji1*@localhost:5432/fastapi?sslmode=disable',
  //     ssl: { rejectUnauthorized: false },
  //     max: 10,
  //     min: 0,
  //     maxUses: Infinity,
  //     allowExitOnIdle: false,
  //     maxLifetimeSeconds: 0,
  //     idleTimeoutMillis: 10000
  //   },
  //   log: [Function (anonymous)],
  //   Client: [class Client extends EventEmitter] {
  //     Query: [class Query extends EventEmitter]
  //   },
  //   Promise: [Function: Promise],
  //   _clients: [],
  //   _idle: [],
  //   _expired: WeakSet { <items unknown> },
  //   _pendingQueue: [],
  //   _endCallback: undefined,
  //   ending: false,
  //   ended: false,
  //   [Symbol(kCapture)]: false
  // }
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
  console.log("rows from /lib/db.js", rows);
  // rows from /lib/db.js [
  //   { table_name: 'users' },
  //   { table_name: 'votes' },
  //   { table_name: 'posts' },
  //   { table_name: 'alembic_version' }
  // ]
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
  console.log("rows from /lib/db.js", rows);
//   tables from /api/connect endpoint [ 'users', 'votes', 'posts', 'alembic_version' ]
// rows from /lib/db.js [
//   { column_name: 'id', data_type: 'integer' },
//   { column_name: 'email', data_type: 'character varying' },
//   { column_name: 'password', data_type: 'character varying' },
//   { column_name: 'created_at', data_type: 'timestamp with time zone' }
// ]
  // rows from /lib/db.js [
  //   { column_name: 'post_id', data_type: 'integer' },
  //   { column_name: 'user_id', data_type: 'integer' }
  // ]
  // rows from /lib/db.js [
  //   { column_name: 'id', data_type: 'integer' },
  //   { column_name: 'title', data_type: 'character varying' },
  //   { column_name: 'content', data_type: 'character varying' },
  //   { column_name: 'published', data_type: 'boolean' },
  //   { column_name: 'created_at', data_type: 'timestamp with time zone' },
  //   { column_name: 'owner_id', data_type: 'integer' },
  //   { column_name: 'content_new', data_type: 'character varying' }
  // ]
  return rows;
}

async function disconnect() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { initPool, getTables, getTableSchema, disconnect };