// core/controllers/Controller.js

class Controller {
  handleError(res, error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
}

module.exports = Controller;
