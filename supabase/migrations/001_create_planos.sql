-- Migration 001: Create planos table
CREATE TABLE planos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL CHECK (nome IN ('Free', 'Básico', 'Empresa', 'Master')),
  preco_mensal DECIMAL(10,2) NOT NULL,
  max_usuarios INTEGER NOT NULL,
  max_agentes INTEGER,
  limite_mensagens_mes INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id VARCHAR(255) UNIQUE,
  cor VARCHAR(7),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE planos IS 'Planos de assinatura da plataforma';
COMMENT ON COLUMN planos.nome IS 'Nome do plano: Free, Básico, Empresa, Master';
COMMENT ON COLUMN planos.preco_mensal IS 'Preço mensal em reais';
COMMENT ON COLUMN planos.max_usuarios IS 'Máximo de usuários permitidos (NULL = ilimitado)';
COMMENT ON COLUMN planos.max_agentes IS 'Máximo de agentes IA permitidos (NULL = ilimitado)';
COMMENT ON COLUMN planos.limite_mensagens_mes IS 'Limite de mensagens por mês (NULL = ilimitado)';
COMMENT ON COLUMN planos.features IS 'Lista de recursos do plano em JSON';
COMMENT ON COLUMN planos.stripe_price_id IS 'ID do preço no Stripe';
COMMENT ON COLUMN planos.cor IS 'Cor hexadecimal para UI';
