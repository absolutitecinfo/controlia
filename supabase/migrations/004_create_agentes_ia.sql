-- Migration 004: Create agentes_ia table
CREATE TABLE agentes_ia (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  instrucoes TEXT,
  icone_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  cor VARCHAR(7),
  created_by BIGINT REFERENCES perfis(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE agentes_ia IS 'Agentes IA customizados por empresa';
COMMENT ON COLUMN agentes_ia.empresa_id IS 'Empresa proprietária do agente (ESSENCIAL para RLS)';
COMMENT ON COLUMN agentes_ia.nome IS 'Nome do agente IA';
COMMENT ON COLUMN agentes_ia.descricao IS 'Descrição do agente';
COMMENT ON COLUMN agentes_ia.instrucoes IS 'System prompt específico do agente';
COMMENT ON COLUMN agentes_ia.icone_url IS 'URL do ícone do agente';
COMMENT ON COLUMN agentes_ia.is_active IS 'Se o agente está ativo';
COMMENT ON COLUMN agentes_ia.is_popular IS 'Se o agente deve aparecer nos botões de acesso rápido';
COMMENT ON COLUMN agentes_ia.cor IS 'Cor hexadecimal para UI';
COMMENT ON COLUMN agentes_ia.created_by IS 'Usuário que criou o agente';
