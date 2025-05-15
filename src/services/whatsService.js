require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);


const sendWhatsApp = async (to, otp) => {
  try {
    console.log('[DEBUG] Enviando WhatsApp usando plantilla');

    await client.messages.create({
      from: 'whatsapp:+12792375335',
      to: `whatsapp:${to}`,
      body: `Tu código de verificación es: ${otp}`
    });
    

    console.log(`✅ Mensaje WhatsApp enviado a ${to}`);
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error?.response?.data || error.message);
  }
};

module.exports = { sendWhatsApp };
