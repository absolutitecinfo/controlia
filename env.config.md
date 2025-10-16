# Configuração de Variáveis de Ambiente

## Para Desenvolvimento (.env.local)

```env
# Configurações para desenvolvimento flexível
NODE_ENV=development
NEXT_PUBLIC_STRICT_MODE=false
NEXT_PUBLIC_TYPE_CHECK=false
NEXT_PUBLIC_DEBUG=true

# Supabase (configure suas chaves)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe (opcional - configure se necessário)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# URLs de desenvolvimento
NEXT_PUBLIC_URL=http://localhost:3000
```

## Para Produção (.env.production)

```env
# Configurações para produção rigorosa
NODE_ENV=production
NEXT_PUBLIC_STRICT_MODE=true
NEXT_PUBLIC_TYPE_CHECK=true
NEXT_PUBLIC_DEBUG=false

# Suas chaves de produção aqui
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
STRIPE_SECRET_KEY=your_production_stripe_key
STRIPE_WEBHOOK_SECRET=your_production_webhook_secret
NEXT_PUBLIC_URL=https://your-domain.com
```

## Como Usar

1. **Desenvolvimento**: Crie `.env.local` com as configurações de desenvolvimento
2. **Produção**: Configure as variáveis no seu provedor de hosting (Vercel, etc.)
3. **Teste**: Use `NODE_ENV=production` para testar configuração rigorosa localmente
