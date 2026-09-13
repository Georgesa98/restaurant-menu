// Shared contact/brand config for the sales landing page.
// WhatsApp number is overridable at build time without code edits.
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? '963982330189';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const PHONE_LINK = 'tel:+963982330189';
export const EMAIL_LINK = 'mailto:georgesalebe0@gmail.com';
