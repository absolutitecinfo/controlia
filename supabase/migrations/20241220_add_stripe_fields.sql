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

-- Comentários para documentação
COMMENT ON COLUMN planos.stripe_product_id IS 'ID do produto no Stripe';
COMMENT ON COLUMN planos.stripe_price_id IS 'ID do preço no Stripe';
COMMENT ON COLUMN empresas.stripe_customer_id IS 'ID do cliente no Stripe';
COMMENT ON COLUMN empresas.stripe_subscription_id IS 'ID da assinatura no Stripe';
