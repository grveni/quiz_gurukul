// backend/models/Model.js

class Model {
  constructor(queryClass) {
    this.queryClass = queryClass;
  }

  async findById(id) {
    return this.queryClass.findById(id);
  }

  async findAll() {
    return this.queryClass.findAll();
  }

  async deleteById(id) {
    return this.queryClass.deleteById(id);
  }
}

module.exports = Model;
