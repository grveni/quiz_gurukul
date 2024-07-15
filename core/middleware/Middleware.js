// backend/middleware/Middleware.js

class Middleware {
  handleError(res, error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
}

module.exports = Middleware;
