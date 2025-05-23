const { getTables } = require('./db');

class Model {
  constructor(tableName) {
    this.tableName = tableName;
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
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await global.pool.query(query, values);
    return rows[0];
  }

  async update(id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
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
  const tables = await getTables();
  const models = {};
  tables.forEach(table => {
    models[table] = new Model(table);
  });
  return models;
}

module.exports = { initORM };