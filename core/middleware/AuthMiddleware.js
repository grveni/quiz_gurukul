// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const Middleware = require('./Middleware');

class AuthMiddleware extends Middleware {
  verifyToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res
        .status(401)
        .json({ message: 'No token, authorization denied' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      this.handleError(res, error);
    }
  }

  authorizeRoles(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    };
  }
}

module.exports = new AuthMiddleware();
