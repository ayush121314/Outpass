const jwt = require('jsonwebtoken');
const Visitor = require('../models/Visitor'); // Assuming you have a Visitor model

const authVisitor = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    // Verify and decode the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email; // Extract the email from the JWT payload

    // Find the visitor by email
    const visitor = await Visitor.findOne({ visitoremail:email });

    if (!visitor) {
      return res.status(403).json({ message: 'Visitor not authorized'});
    }

    // Attach the visitor to the request
    req.visitor = visitor;
    next(); // Proceed to the next middleware or controller
  } catch (err) {
    return res.status(401).json({ message: 'Authentication failed', error: err.message });
  }
};

module.exports = authVisitor;
