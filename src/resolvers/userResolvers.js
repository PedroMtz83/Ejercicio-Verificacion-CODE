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
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        if (existingUser.isVerified) {
          throw new Error('Usuario ya registrado y verificado');
        }
        // Si existe pero no está verificado, generamos nuevo código
        const otp = generateOTP();
        await AuthCode.create({ userId: existingUser.id, code: otp });
        
        // Enviar código según el método seleccionado
        if (input.via === 'email') {
          await sendEmail(input.email, `Tu código de verificación es: ${otp}`);
        } else if (input.via === 'whatsapp' && input.phone) {
          await sendWhatsApp(input.phone, `Tu código de verificación es: ${otp}`);
        }
        
        return { 
          message: 'Usuario existente no verificado. Nuevo código enviado.',
          user: existingUser
        };
      }
      
      // Crear nuevo usuario
      const user = await User.create({ 
        email: input.email, 
        phone: input.phone,
        isVerified: false 
      });
      
      const otp = generateOTP();
      await AuthCode.create({ userId: user.id, code: otp });
      
      // Enviar código según el método seleccionado
      if (input.via === 'email') {
        await sendEmail(input.email, `Tu código de verificación es: ${otp}`);
      } else if (input.via === 'whatsapp' && input.phone) {
        await sendWhatsApp(input.phone, `Tu código de verificación es: ${otp}`);
      }
      
      return { 
        message: 'Usuario registrado. Código de verificación enviado.',
        user
      };
    },
    
    verifyCode: async (_, { input }) => {
      const user = await User.findOne({ email: input.email });
      if (!user) throw new Error('Usuario no encontrado');
      
      if (user.isVerified) {
        const token = generateToken(user);
        return { token, user, message: 'Usuario ya verificado' };
      }
      
      const authCode = await AuthCode.findOne({ 
        userId: user.id, 
        code: input.code 
      });
      
      if (!authCode) throw new Error('Código inválido');
      
      // Verificar expiración (5 minutos)
      const now = new Date();
      const codeDate = new Date(authCode.createdAt);
      const diffInMinutes = (now - codeDate) / (1000 * 60);
      
      if (diffInMinutes > 5) {
        await AuthCode.deleteOne({ _id: authCode._id });
        throw new Error('Código expirado. Solicite uno nuevo.');
      }
      
      // Marcar usuario como verificado
      user.isVerified = true;
      await user.save();
      
      // Eliminar código usado
      await AuthCode.deleteOne({ _id: authCode._id });
      
      const token = generateToken(user);
      return { token, user, message: 'Usuario verificado exitosamente' };
    },
    
    login: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Usuario no encontrado');
      
      if (user.isVerified) {
        const token = generateToken(user);
        return { token, user, message: 'Login exitoso' };
      }
      
      // Si no está verificado, se genera un nuevo código
      const otp = generateOTP();
      await AuthCode.create({ userId: user.id, code: otp });
      
      // Intentamos enviar por email o whatsapp
      if (user.email) {
        await sendEmail(user.email, `Tu código de verificación es: ${otp}`);
      } else if (user.phone) {
        await sendWhatsApp(user.phone, `Tu código de verificación es: ${otp}`);
      }
      
      return { 
        message: 'Usuario no verificado. Nuevo código enviado.',
        user
      };
    }
  }
};

module.exports = resolvers;