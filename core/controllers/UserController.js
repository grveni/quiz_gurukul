// core/controllers/UserController.js

const User = require('../models/User');
const Controller = require('./Controller');

class UserController extends Controller {
  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const updatedUser = await user.update(req.body);
      res.json(updatedUser);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new UserController();
