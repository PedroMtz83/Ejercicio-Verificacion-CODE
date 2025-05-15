const { generateOTP, generateToken } = require('../services/authService');
const { sendEmail } = require('../services/emailService');
const { sendWhatsApp } = require('../services/whatsService');

let users = [];
let authCodes = [];

const resolvers = {
  Mutation: {
    registerUser: async (_, { input }) => {
      if (!input.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        throw new Error('Formato de email inválido');

      if (input.phone && !input.phone.match(/^\+\d{10,15}$/))
        throw new Error('Formato de teléfono inválido. Use formato internacional: +[código país][número]');

      let user = users.find(u => u.email === input.email);
      const otp = generateOTP();
      console.log(`[DEBUG] OTP para ${input.email}: ${otp}`);
      console.log(`[DEBUG] Mensaje enviado: Tu código de verificación es: ${otp}`);
      if (user) {
        if (user.isVerified) throw new Error('Usuario ya registrado y verificado');
        authCodes.push({ userId: user.id, code: otp, createdAt: new Date() });
      } else {
        user = { id: `${Date.now()}`, email: input.email, phone: input.phone, isVerified: false };
        users.push(user);
        authCodes.push({ userId: user.id, code: otp, createdAt: new Date() });
      }

      if (input.via === 'email') {
        await sendEmail(input.email, `Tu código de verificación es: ${otp}`);
      } else if (input.via === 'whatsapp' && input.phone) {
        await sendWhatsApp(input.phone, `Tu código de verificación es: ${otp}`);
      }

      return { message: 'Código de verificación enviado.', user };
    },

    verifyCode: async (_, { input }) => {
      const user = users.find(u => u.email === input.email);
      if (!user) throw new Error('Usuario no encontrado');

      const authCode = authCodes.find(c => c.userId === user.id && c.code === input.code);
      if (!authCode) throw new Error('Código inválido');

      const diff = (new Date() - new Date(authCode.createdAt)) / (1000 * 60);
      if (diff > 5) throw new Error('Código expirado. Solicite uno nuevo.');

      user.isVerified = true;
      authCodes = authCodes.filter(c => c.userId !== user.id);

      const token = generateToken(user);
      return { token, user, message: 'Usuario verificado exitosamente' };
    },

    login: async (_, { email }) => {
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('Usuario no encontrado');

      if (user.isVerified) {
        const token = generateToken(user);
        return { token, user, message: 'Login exitoso' };
      }

      const otp = generateOTP();
      authCodes.push({ userId: user.id, code: otp, createdAt: new Date() });

      if (user.email) {
        await sendEmail(user.email, `Tu código de verificación es: ${otp}`);
      } else if (user.phone) {
        await sendWhatsApp(user.phone, `Tu código de verificación es: ${otp}`);
      }

      return { message: 'Usuario no verificado. Nuevo código enviado.', user };
    }
  }
};

module.exports = resolvers;
