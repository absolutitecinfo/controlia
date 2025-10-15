-- Migration 003: Create perfis table
CREATE TABLE perfis (
  id BIGINT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nome_completo VARCHAR(255),
  telefone VARCHAR(50),
  cargo VARCHAR(100),
  empresa_id BIGINT REFERENCES empresas(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('master', 'admin', 'user')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  ultimo_acesso TIMESTAMPTZ,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE perfis IS 'Perfis de usuários (colaboradores)';
COMMENT ON COLUMN perfis.id IS 'ID do usuário no auth.users (FK)';
COMMENT ON COLUMN perfis.email IS 'Email do usuário';
COMMENT ON COLUMN perfis.nome_completo IS 'Nome completo do usuário';
COMMENT ON COLUMN perfis.cargo IS 'Cargo na empresa';
COMMENT ON COLUMN perfis.empresa_id IS 'Empresa do usuário (ESSENCIAL para RLS)';
COMMENT ON COLUMN perfis.role IS 'Role: master (plataforma), admin (empresa), user (colaborador)';
COMMENT ON COLUMN perfis.status IS 'Status do usuário: ativo, inativo, suspenso';
COMMENT ON COLUMN perfis.ultimo_acesso IS 'Timestamp do último acesso';
COMMENT ON COLUMN perfis.avatar_url IS 'URL do avatar do usuário';
