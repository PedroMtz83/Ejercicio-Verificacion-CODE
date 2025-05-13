const mongoose = require('mongoose');

const authCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  code: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// limpieza automática de códigos expirados
authCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }); // 5 minutos

module.exports = mongoose.model('AuthCode', authCodeSchema);