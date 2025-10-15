-- Migration 010: Seed initial data

-- Insert initial plans
INSERT INTO planos (nome, preco_mensal, max_usuarios, max_agentes, limite_mensagens_mes, cor, features) VALUES
('Free', 0.00, 3, 2, 100, '#6B7280', '["Chat básico", "2 agentes IA", "Suporte por email"]'),
('Básico', 49.90, 10, 5, 1000, '#3B82F6', '["Chat ilimitado", "5 agentes IA", "Suporte prioritário", "Analytics básico"]'),
('Empresa', 199.90, 50, NULL, NULL, '#8B5CF6', '["Agentes ilimitados", "Mensagens ilimitadas", "API access", "Suporte prioritário", "Analytics avançado", "Integrações"]'),
('Master', 499.90, NULL, NULL, NULL, '#F59E0B', '["Tudo do Empresa", "White label", "Suporte 24/7", "SLA garantido", "Customizações", "Dedicated support"]');

-- Create a master user (this will be done manually in Supabase Auth)
-- The master user profile will be created automatically by the trigger

-- Add comments for the seed data
COMMENT ON TABLE planos IS 'Planos de assinatura - dados iniciais inseridos';
