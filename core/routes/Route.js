// backend/routes/Route.js

const express = require('express');

class Route {
  constructor(controller) {
    this.router = express.Router();
    this.controller = controller;
  }

  getRouter() {
    return this.router;
  }
}

module.exports = Route;
