// core/db/pgQueries/Query.js

const db = require('../db');

class Query {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findById(id) {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findAll() {
    const result = await db.query(`SELECT * FROM ${this.tableName}`);
    return result.rows;
  }

  async deleteById(id) {
    await db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
  }
}

module.exports = Query;
