-- Migration 007: Create auditoria table
CREATE TABLE auditoria (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT REFERENCES empresas(id),
  user_id BIGINT REFERENCES perfis(id),
  acao VARCHAR(100) NOT NULL,
  entidade_tipo VARCHAR(50),
  entidade_id BIGINT,
  detalhes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_auditoria_empresa ON auditoria(empresa_id, created_at DESC);

-- Add comments
COMMENT ON TABLE auditoria IS 'Logs de ações administrativas';
COMMENT ON COLUMN auditoria.empresa_id IS 'Empresa afetada (pode ser NULL para ações do master)';
COMMENT ON COLUMN auditoria.user_id IS 'Usuário que executou a ação';
COMMENT ON COLUMN auditoria.acao IS 'Tipo de ação: suspender_empresa, banir_usuario, alterar_plano, etc.';
COMMENT ON COLUMN auditoria.entidade_tipo IS 'Tipo da entidade: empresa, usuario, agente, plano';
COMMENT ON COLUMN auditoria.entidade_id IS 'ID da entidade afetada';
COMMENT ON COLUMN auditoria.detalhes IS 'Dados adicionais da ação em JSON';
COMMENT ON COLUMN auditoria.ip_address IS 'Endereço IP de onde veio a ação';
COMMENT ON COLUMN auditoria.user_agent IS 'User-Agent do navegador';
