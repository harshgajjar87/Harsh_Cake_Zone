/**
 * Generates a WhatsApp click-to-chat URL.
 * Opens WhatsApp with a pre-filled message — user just hits Send.
 * 100% free, no API, no registration.
 */
exports.generateWhatsAppLink = (phone, customerName, amount, upiLink, receiptURL) => {
  const digits = phone.replace(/\D/g, '');
  const formattedPhone = digits.startsWith('91') ? digits : `91${digits}`;
  const bizName = process.env.BUSINESS_NAME || 'Harsh Cake Zone';

  const message =
    `🎂✨ *${bizName}* ✨🎂\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `Hello *${customerName}*! 👋\n\n` +
    `🎉 Great news! Your cake is *Ready for Pickup!*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Amount Due:* ₹${amount}\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `📲 *Pay via UPI (tap to open):*\n` +
    `👉 ${upiLink}\n\n` +
    `🧾 *View Your Receipt:*\n` +
    `👉 ${receiptURL}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🙏 Thank you for choosing us!\n` +
    `We hope you love your cake! 💕`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};
