-- Migration 002: Create empresas table
CREATE TABLE empresas (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(50),
  endereco TEXT,
  plano_id BIGINT REFERENCES planos(id),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'banido', 'em_atraso')),
  chave_api_llm TEXT,
  contexto_ia JSONB,
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  data_adesao DATE DEFAULT CURRENT_DATE,
  proxima_cobranca DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE empresas IS 'Empresas (tenants) da plataforma';
COMMENT ON COLUMN empresas.nome IS 'Nome da empresa';
COMMENT ON COLUMN empresas.email IS 'Email principal da empresa';
COMMENT ON COLUMN empresas.plano_id IS 'Plano de assinatura atual';
COMMENT ON COLUMN empresas.status IS 'Status da empresa: ativo, suspenso, banido, em_atraso';
COMMENT ON COLUMN empresas.chave_api_llm IS 'Chave API do cliente para LLM (BYOK) - Encrypted';
COMMENT ON COLUMN empresas.contexto_ia IS 'Prompt global da empresa em JSON';
COMMENT ON COLUMN empresas.stripe_customer_id IS 'ID do customer no Stripe';
COMMENT ON COLUMN empresas.stripe_subscription_id IS 'ID da subscription no Stripe';
COMMENT ON COLUMN empresas.data_adesao IS 'Data de adesão à plataforma';
COMMENT ON COLUMN empresas.proxima_cobranca IS 'Data da próxima cobrança';
