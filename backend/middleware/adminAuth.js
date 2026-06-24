const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user)
      return res.status(403).json({ error: 'User not found' });
    
    if (user.role !== 'admin')
      return res.status(403).json({ error: 'Admin access required. Your role: ' + user.role });
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Admin auth error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
