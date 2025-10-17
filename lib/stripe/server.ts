import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não está configurada');
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Verificar se a chave tem o formato correto
if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  console.error('❌ STRIPE_SECRET_KEY não tem o formato correto (deve começar com sk_)');
  throw new Error('STRIPE_SECRET_KEY format is invalid');
}

console.log('✅ Stripe Secret Key loaded:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});