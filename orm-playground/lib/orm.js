
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
  const tables = await getTables();
  const models = {};
  tables.forEach(table => {
    models[table] = new Model(table);
  });
  return models;
}

module.exports = { initORM, Model };