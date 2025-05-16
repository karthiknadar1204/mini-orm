
const { getTables, getTableSchema } = require('./db');

class Model {
  constructor(tableName) {
    this.tableName = tableName;
    this.columns = null;
  }

  async getColumns() {
    if (!this.columns) {
      const schema = await getTableSchema(this.tableName);
      this.columns = schema.map(col => col.column_name);
    }
    return this.columns;
  }

  async findAll() {
    const query = `SELECT * FROM ${this.tableName}`;
    const { rows } = await global.pool.query(query);
    return rows;
  }

  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const { rows } = await global.pool.query(query, [id]);
    return rows[0] || null;
  }

  async create(data) {
    const columns = await this.getColumns();
    const dataWithTimestamps = { ...data };
    
    // Only add created_at if the column exists
    if (columns.includes('created_at')) {
      dataWithTimestamps.created_at = data.created_at || new Date().toISOString();
    }

    const dataColumns = Object.keys(dataWithTimestamps);
    const values = Object.values(dataWithTimestamps);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${this.tableName} (${dataColumns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await global.pool.query(query, values);
    return rows[0];
  }

  async update(id, data) {
    const columns = await this.getColumns();
    const dataWithTimestamps = { ...data };
    
    // Only add updated_at if the column exists
    if (columns.includes('updated_at')) {
      dataWithTimestamps.updated_at = new Date().toISOString();
    }

    const dataColumns = Object.keys(dataWithTimestamps);
    const values = Object.values(dataWithTimestamps);
    const setClause = dataColumns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${dataColumns.length + 1} RETURNING *`;
    const { rows } = await global.pool.query(query, [...values, id]);
    return rows[0] || null;
  }

  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
    const { rows } = await global.pool.query(query, [id]);
    return rows[0] || null;
  }
}

async function initORM(connectionUrl) {
  const { initPool } = require('./db');
  global.pool = initPool(connectionUrl);
  console.log("global.pool from /lib/orm.js", global.pool);
  // global.pool from /lib/orm.js BoundPool {
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
  const tables = await getTables();

  console.log("tables from /lib/orm.js", tables);
  // tables from /lib/orm.js [ 'users', 'votes', 'posts', 'alembic_version' ]
  const models = {};
  tables.forEach(table => {
    models[table] = new Model(table);
  });

  // If tables = ["users", "votes"], the forEach loop does:
// For "users":
// Creates new Model("users"), which makes a Model object: { tableName: "users", columns: null }.
// Stores it in models["users"].
// For "votes":
// Creates new Model("votes"), which makes { tableName: "votes", columns: null }.
// Stores it in models["votes"].
// columns: Starts as null (will store column names if getColumns is called later)
  console.log("models from /lib/orm.js", models);
  // models from /lib/orm.js {
  //   users: Model { tableName: 'users', columns: null },
  //   votes: Model { tableName: 'votes', columns: null },
  //   posts: Model { tableName: 'posts', columns: null },
  //   alembic_version: Model { tableName: 'alembic_version', columns: null }
  // }
  return models;
}

module.exports = { initORM, Model };