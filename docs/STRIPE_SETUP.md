# 🚀 Configuração do Stripe - ControlIA

## 📋 Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 Configuração do Stripe Dashboard

### 1. Criar Conta no Stripe
- Acesse [stripe.com](https://stripe.com)
- Crie uma conta ou faça login
- Ative o modo de teste para desenvolvimento

### 2. Obter Chaves da API
- No dashboard do Stripe, vá em **Developers > API keys**
- Copie a **Publishable key** (começa com `pk_test_`)
- Copie a **Secret key** (começa com `sk_test_`)

### 3. Configurar Webhooks
### ⚠️ IMPORTANTE: Webhook Obrigatório para Atualização Automática de Planos

**O webhook é essencial** para que o plano do usuário seja atualizado automaticamente após o pagamento no Stripe.

- No dashboard do Stripe, vá em **Developers > Webhooks**
- Clique em **Add endpoint**
- URL do endpoint: `https://seu-dominio.com/api/stripe/webhook` 
- Eventos para escutar:
  - `checkout.session.completed` ✅ **Obrigatório**
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Copie o **Signing secret** (começa com `whsec_`)

### Configuração Local (.env.local)
```bash
# Adicione esta variável ao seu .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Para Desenvolvimento Local
Para testar webhooks localmente, você pode usar o **Stripe CLI**:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Teste Manual
Se o webhook não estiver configurado, você pode testar a atualização manual:
1. Vá para o Dashboard Master
2. Clique em **"Testar Webhook"**
3. Digite o ID da empresa e o ID do novo plano
4. O plano será atualizado manualmente

## 🗄️ Configuração do Banco de Dados

### Migração Necessária
Execute a seguinte migração no Supabase:

```sql
-- Adicionar campos do Stripe na tabela planos
ALTER TABLE planos 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Adicionar campos do Stripe na tabela empresas
ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_planos_stripe_product_id ON planos(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_planos_stripe_price_id ON planos(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_empresas_stripe_customer_id ON empresas(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_empresas_stripe_subscription_id ON empresas(stripe_subscription_id);
```

## 🚀 Como Usar

### 1. Sincronizar Planos com Stripe
- Acesse a página Master (`/dashboard/master`)
- Vá para a aba "Gerenciar Planos"
- Clique em "Sincronizar com Stripe"
- Os planos serão criados/atualizados no Stripe automaticamente

### 2. Testar Checkout
- Acesse a página de Assinatura (`/dashboard/subscription`)
- Clique em "Fazer Upgrade" em qualquer plano
- Será redirecionado para o Stripe Checkout

### 3. Gerenciar Assinaturas
- Na página de Assinatura, clique em "Gerenciar Cobrança"
- Será redirecionado para o portal de cobrança do Stripe

## 🧪 Cartões de Teste

Use estes cartões para testar pagamentos:

- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Data de expiração: qualquer data futura
CVC: qualquer 3 dígitos

## 🔍 Monitoramento

### Logs do Webhook
- Verifique os logs no dashboard do Stripe em **Developers > Webhooks**
- Clique no webhook para ver os eventos e respostas

### Logs da Aplicação
- Verifique o console do navegador para erros
- Verifique os logs do servidor para problemas de API

## 🚨 Troubleshooting

### Erro: "Invalid signature"
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se de que a URL do webhook está correta

### Erro: "Plano não está sincronizado com o Stripe"
- Execute a sincronização de planos no painel Master
- Verifique se o plano tem `stripe_product_id` e `stripe_price_id`

### Erro: "Nenhuma assinatura encontrada"
- Verifique se a empresa tem `stripe_customer_id`
- Certifique-se de que o webhook processou o checkout corretamente

## 📚 Recursos Adicionais

- [Documentação do Stripe](https://stripe.com/docs)
- [Webhooks do Stripe](https://stripe.com/docs/webhooks)
- [Checkout do Stripe](https://stripe.com/docs/checkout)
- [Portal de Cobrança](https://stripe.com/docs/billing/subscriptions/customer-portal)
