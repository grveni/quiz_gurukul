const Model = require('./Model');
const roleQueries = require('../db/pgQueries/RoleQueries');

class Role extends Model {
  constructor() {
    super(roleQueries);
  }

  async create(roleName) {
    return this.queryClass.create(roleName);
  }

  async updateById(id, roleName) {
    return this.queryClass.updateById(id, roleName);
  }

  async deleteById(id) {
    return this.queryClass.deleteById(id);
  }

  async deleteAll() {
    return this.queryClass.deleteAll();
  }

  async findById(id) {
    return this.queryClass.findById(id);
  }

  async findByName(roleName) {
    return this.queryClass.findByName(roleName);
  }

  async findAll() {
    return this.queryClass.findAll();
  }
}

module.exports = new Role();
