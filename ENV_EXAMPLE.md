# Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Como obter as chaves do Stripe:

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Vá em "Developers" > "API keys"
3. Copie a "Secret key" (começa com `sk_test_` para modo teste)
4. Copie a "Publishable key" (começa com `pk_test_` para modo teste)

## Como obter o Webhook Secret:

1. No Dashboard do Stripe, vá em "Developers" > "Webhooks"
2. Crie um novo webhook apontando para: `https://seu-dominio.com/api/stripe/webhook`
3. Selecione os eventos: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Copie o "Signing secret" (começa com `whsec_`)

## Importante:

- Use chaves de **teste** durante o desenvolvimento
- Nunca commite o arquivo `.env.local` no Git
- Reinicie o servidor após adicionar as variáveis
