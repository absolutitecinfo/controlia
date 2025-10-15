-- Migration 009: Create functions and triggers

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_planos_updated_at 
  BEFORE UPDATE ON planos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empresas_updated_at 
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfis_updated_at 
  BEFORE UPDATE ON perfis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agentes_ia_updated_at 
  BEFORE UPDATE ON agentes_ia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversas_updated_at 
  BEFORE UPDATE ON conversas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uso_recursos_updated_at 
  BEFORE UPDATE ON uso_recursos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile automatically after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last access timestamp
CREATE OR REPLACE FUNCTION update_last_access()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE perfis 
  SET ultimo_acesso = NOW() 
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track usage automatically
CREATE OR REPLACE FUNCTION track_message_usage()
RETURNS TRIGGER AS $$
DECLARE
  mes_referencia DATE;
BEGIN
  -- Get current month in YYYY-MM-01 format
  mes_referencia := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  -- Insert or update usage record
  INSERT INTO uso_recursos (empresa_id, mes_referencia, mensagens_enviadas, tokens_consumidos)
  VALUES (NEW.empresa_id, mes_referencia, 1, NEW.tokens_usados)
  ON CONFLICT (empresa_id, mes_referencia)
  DO UPDATE SET
    mensagens_enviadas = uso_recursos.mensagens_enviadas + 1,
    tokens_consumidos = uso_recursos.tokens_consumidos + NEW.tokens_usados,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate plan limits
CREATE OR REPLACE FUNCTION check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  plano_record RECORD;
  current_usage RECORD;
BEGIN
  -- Get plan information
  SELECT p.* INTO plano_record
  FROM planos p
  JOIN empresas e ON e.plano_id = p.id
  WHERE e.id = NEW.empresa_id;
  
  -- Check message limit
  IF plano_record.limite_mensagens_mes IS NOT NULL THEN
    SELECT mensagens_enviadas INTO current_usage
    FROM uso_recursos
    WHERE empresa_id = NEW.empresa_id
    AND mes_referencia = DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    IF current_usage.mensagens_enviadas >= plano_record.limite_mensagens_mes THEN
      RAISE EXCEPTION 'Limite mensal de mensagens atingido para este plano';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
