const { generateOTP, generateToken } = require('../services/authService');
const { sendEmail } = require('../services/emailService');
const { sendWhatsApp } = require('../services/whatsService');

const User = require('../models/User');
const AuthCode = require('../models/AuthCode');

const resolvers = {
  Mutation: {
    registerUser: async (_, { input }) => {
      // Validaciones básicas
      if (!input.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Formato de email inválido');
      }

      if (input.phone && !input.phone.match(/^\+\d{10,15}$/)) {
        throw new Error('Formato de teléfono inválido. Use formato internacional: +[código país][número]');
      }

      // Verificar si el usuario ya existe
      let user = User.findOne({ email: input.email });
      const otp = generateOTP();

      if (user) {
        if (user.isVerified) {
          throw new Error('Usuario ya registrado y verificado');
        }

        AuthCode.create({ userId: user.id, code: otp });

        if (input.via === 'email') {
          await sendEmail(user.email, `Tu código de verificación es: ${otp}`);
        } else if (input.via === 'whatsapp' && input.phone) {
          await sendWhatsApp(input.phone, otp);
        }

        return {
          message: 'Usuario existente no verificado. Nuevo código enviado.',
          user
        };
      }

      // Crear nuevo usuario
      user = User.create({
        email: input.email,
        phone: input.phone
      });

      AuthCode.create({ userId: user.id, code: otp });

      if (input.via === 'email') {
        await sendEmail(user.email, `Tu código de verificación es: ${otp}`);
      } else if (input.via === 'whatsapp' && input.phone) {
        await sendWhatsApp(input.phone, otp);
      }

      return {
        message: 'Usuario registrado. Código de verificación enviado.',
        user
      };
    },

    verifyCode: async (_, { input }) => {
      const user = User.findOne({ email: input.email });
      if (!user) throw new Error('Usuario no encontrado');

      if (user.isVerified) {
        const token = generateToken(user);
        return { token, user, message: 'Usuario ya verificado' };
      }

      const authCode = AuthCode.findOne({ userId: user.id, code: input.code });
      if (!authCode) throw new Error('Código inválido');

      const now = new Date();
      const codeTime = new Date(authCode.createdAt);
      const diffMinutes = (now - codeTime) / (1000 * 60);

      if (diffMinutes > 5) {
        AuthCode.deleteOne({ userId: user.id });
        throw new Error('Código expirado. Solicite uno nuevo.');
      }

      User.updateVerification(user.email);
      AuthCode.deleteOne({ userId: user.id });

      const token = generateToken(user);
      return { token, user, message: 'Usuario verificado exitosamente' };
    },

    login: async (_, { email }) => {
      const user = User.findOne({ email });
      if (!user) throw new Error('Usuario no encontrado');

      if (user.isVerified) {
        const token = generateToken(user);
        return { token, user, message: 'Login exitoso' };
      }

      const otp = generateOTP();
      AuthCode.create({ userId: user.id, code: otp });

      if (user.email) {
        await sendEmail(user.email, `Tu código de verificación es: ${otp}`);
      } else if (user.phone) {
        await sendWhatsApp(user.phone, otp);
      }

      return {
        message: 'Usuario no verificado. Nuevo código enviado.',
        user
      };
    }
  }
};

module.exports = resolvers;
