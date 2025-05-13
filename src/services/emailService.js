const nodemailer = require('nodemailer');

// Configuración básica de nodemailer
// configurar el email y la contraseña en variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tuemail@gmail.com',
    pass: process.env.EMAIL_PASS || 'tucontraseña'
  }
});

const sendEmail = async (to, text) => {
  try {
    await transporter.sendMail({
      from: '"Servicio de Verificación" <verificacion@example.com>',
      to,
      subject: 'Tu código de verificación',
      text
    });
    console.log(`Email enviado a ${to}`);
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('Error al enviar el código por email');
  }
};

module.exports = { sendEmail };