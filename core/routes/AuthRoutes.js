// backend/routes/authRoutes.js

const AuthController = require('../controllers/AuthController');
const Role = require('../models/Role');
const Route = require('./Route');

class AuthRoutes extends Route {
  constructor() {
    super(AuthController);
    this.router.post('/register', (req, res) =>
      this.controller.register(req, res)
    );
    this.router.post('/login', (req, res) => this.controller.login(req, res));
    this.router.get('/roles', async (req, res) => {
      try {
        console.log('Fetching roles');
        const roles = await Role.findAll();
        console.log('Roles fetched:', roles);
        res.json({ roles });
      } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Failed to fetch roles' });
      }
    });
  }
}

module.exports = new AuthRoutes().getRouter();
