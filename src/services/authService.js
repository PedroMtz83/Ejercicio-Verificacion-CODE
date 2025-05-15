const jwt = require('jsonwebtoken');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    'secretkey',
    { expiresIn: '1h' }
  );
};

module.exports = { generateOTP, generateToken };
