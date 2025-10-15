# Configuração de Variáveis de Ambiente

## Variáveis Necessárias para Deploy

### Supabase (Obrigatório)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### Stripe (Opcional)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Aplicação
```bash
NEXT_PUBLIC_URL=https://seu-dominio.vercel.app
```

## Como Configurar na Vercel

1. Acesse o painel da Vercel
2. Vá em Settings > Environment Variables
3. Adicione as variáveis acima
4. Faça o redeploy da aplicação

## Como Obter as Chaves do Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Vá no seu projeto
3. Settings > API
4. Copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Como Obter as Chaves do Stripe

1. Acesse [stripe.com](https://stripe.com)
2. Developers > API keys
3. Copie:
   - Secret key → `STRIPE_SECRET_KEY`
   - Webhook secret → `STRIPE_WEBHOOK_SECRET`
