-- Migration 012: Allow pending users and make id optional
-- This allows creating user profiles before they register in auth.users

-- First, drop the existing constraint
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_pkey;

-- Make id nullable and add a new primary key
ALTER TABLE perfis ALTER COLUMN id DROP NOT NULL;

-- Add a new auto-incrementing primary key
ALTER TABLE perfis ADD COLUMN internal_id BIGSERIAL PRIMARY KEY;

-- Update the status constraint to include 'pendente'
ALTER TABLE perfis DROP CONSTRAINT IF EXISTS perfis_status_check;
ALTER TABLE perfis ADD CONSTRAINT perfis_status_check 
  CHECK (status IN ('ativo', 'inativo', 'suspenso', 'pendente'));

-- Add a unique constraint on id when it's not null
CREATE UNIQUE INDEX idx_perfis_auth_id_unique ON perfis(id) WHERE id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN perfis.internal_id IS 'Internal auto-incrementing ID for the profile';
COMMENT ON COLUMN perfis.id IS 'ID do usuário no auth.users (FK) - NULL para usuários pendentes';
COMMENT ON COLUMN perfis.status IS 'Status do usuário: ativo, inativo, suspenso, pendente';
