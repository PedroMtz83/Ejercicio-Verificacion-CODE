const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generar código OTP de 6 dígitos
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generar token JWT simple
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1h' }
  );
};

module.exports = { generateOTP, generateToken };
