-- Migration 006: Create uso_recursos table
CREATE TABLE uso_recursos (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL,
  mensagens_enviadas INTEGER DEFAULT 0,
  tokens_consumidos INTEGER DEFAULT 0,
  agentes_ativos INTEGER DEFAULT 0,
  usuarios_ativos INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, mes_referencia)
);

-- Add comments
COMMENT ON TABLE uso_recursos IS 'Controle de limites de uso por empresa e mês';
COMMENT ON COLUMN uso_recursos.empresa_id IS 'Empresa (ESSENCIAL para RLS)';
COMMENT ON COLUMN uso_recursos.mes_referencia IS 'Mês de referência no formato YYYY-MM-01';
COMMENT ON COLUMN uso_recursos.mensagens_enviadas IS 'Total de mensagens enviadas no mês';
COMMENT ON COLUMN uso_recursos.tokens_consumidos IS 'Total de tokens consumidos no mês';
COMMENT ON COLUMN uso_recursos.agentes_ativos IS 'Número de agentes ativos no mês';
COMMENT ON COLUMN uso_recursos.usuarios_ativos IS 'Número de usuários ativos no mês';
