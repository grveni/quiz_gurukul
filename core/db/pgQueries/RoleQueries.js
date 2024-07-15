const Query = require('./Query');
const db = require('../db');

class RoleQueries extends Query {
  constructor() {
    super('roles');
  }

  async create(roleName) {
    const result = await db.query(
      `INSERT INTO ${this.tableName} (role_name) VALUES ($1) RETURNING *`,
      [roleName]
    );
    return result.rows[0];
  }

  async updateById(id, roleName) {
    const result = await db.query(
      `UPDATE ${this.tableName} SET role_name = $1 WHERE id = $2 RETURNING *`,
      [roleName, id]
    );
    return result.rows[0];
  }

  async findByName(roleName) {
    const result = await this.findByField('role_name', roleName);
    return result;
  }

  async findByField(fieldName, value) {
    const result = await db.query(
      `SELECT * FROM ${this.tableName} WHERE ${fieldName} = $1`,
      [value]
    );
    return result.rows[0];
  }

  async findAll() {
    const result = await db.query(`SELECT * FROM ${this.tableName}`);
    return result.rows;
  }

  async deleteAll() {
    const result = await db.query(`DELETE FROM ${this.tableName} RETURNING *`);
    await db.query(`ALTER SEQUENCE roles_id_seq RESTART WITH 1`);
    return result.rows;
  }
}

module.exports = new RoleQueries();
