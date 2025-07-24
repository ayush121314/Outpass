const jwt = require('jsonwebtoken');
const Student = require('../models/Student'); 

const authMiddleware =async(req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email; // Extract email from JWT payload
    // Find user by email (could be a student or admin)
    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user does not exist' });
    }
    req.user = user; // Attach user to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed', error: err.message });
  }
};

module.exports = authMiddleware;
