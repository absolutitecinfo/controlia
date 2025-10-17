# Configuração de Variáveis de Ambiente no Vercel

## Variáveis Obrigatórias

Para que o deploy funcione no Vercel, você precisa configurar as seguintes variáveis de ambiente:

### 1. Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### 2. Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret
```

### 3. Next.js
```
NEXTAUTH_SECRET=sua_chave_secreta_nextauth
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

## Como Configurar no Vercel

1. Acesse o dashboard do Vercel
2. Vá para seu projeto
3. Clique em **Settings**
4. Clique em **Environment Variables**
5. Adicione cada variável acima
6. Faça um novo deploy

## ⚠️ Importante

- **STRIPE_SECRET_KEY** é obrigatória para o build funcionar
- Use chaves de **teste** do Stripe para desenvolvimento
- Use chaves de **produção** apenas quando estiver pronto para produção
- O **STRIPE_WEBHOOK_SECRET** só é necessário se você configurar webhooks

## Teste Local

Para testar localmente, copie o `.env.example` para `.env.local` e preencha com suas chaves reais.
