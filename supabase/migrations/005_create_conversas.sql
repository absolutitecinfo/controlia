-- Migration 005: Create conversas table
CREATE TABLE conversas (
  id BIGSERIAL PRIMARY KEY,
  conversation_uuid UUID UNIQUE DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  agente_id BIGINT REFERENCES agentes_ia(id),
  titulo VARCHAR(500),
  mensagens JSONB DEFAULT '[]'::jsonb,
  tokens_usados INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'arquivada')),
  contexto_atual JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index for security
CREATE UNIQUE INDEX idx_conversas_unique ON conversas(empresa_id, user_id, conversation_uuid);

-- Add comments
COMMENT ON TABLE conversas IS 'Histórico de conversas de chat';
COMMENT ON COLUMN conversas.conversation_uuid IS 'UUID único da conversa (gerado pelo sistema)';
COMMENT ON COLUMN conversas.user_id IS 'Usuário da conversa';
COMMENT ON COLUMN conversas.empresa_id IS 'Empresa da conversa (ESSENCIAL para RLS)';
COMMENT ON COLUMN conversas.agente_id IS 'Agente IA usado na conversa';
COMMENT ON COLUMN conversas.titulo IS 'Título da conversa (gerado da primeira mensagem)';
COMMENT ON COLUMN conversas.mensagens IS 'Array de mensagens em JSON: {role, content, timestamp, message_uuid, llm_request_id}';
COMMENT ON COLUMN conversas.tokens_usados IS 'Total de tokens consumidos na conversa';
COMMENT ON COLUMN conversas.status IS 'Status: ativa, finalizada, arquivada';
COMMENT ON COLUMN conversas.contexto_atual IS 'Estado atual da conversa para continuidade';
