const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendWhatsApp = async (to, body) => {
  try {
    await client.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+523232823141'}`,
      to: `whatsapp:${to}`
    });
    console.log(`Mensaje WhatsApp enviado a ${to}`);
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    throw new Error('Error al enviar el código por WhatsApp');
  }
};

module.exports = { sendWhatsApp };