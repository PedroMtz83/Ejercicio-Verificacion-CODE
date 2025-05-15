require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, code) => {
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // +14155238886
      to: `whatsapp:${to}`,
      contentSid: process.env.TWILIO_TEMPLATE_SID_OTP,
      contentVariables: JSON.stringify({
        "1": code
      })
    });

    console.log(`✅ OTP enviado por WhatsApp a ${to}: ${code}`);
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error.message);
    throw new Error('No se pudo enviar el código por WhatsApp');
  }
};

module.exports = { sendWhatsApp };

