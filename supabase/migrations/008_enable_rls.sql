-- Migration 008: Enable Row Level Security and create policies

-- Enable RLS on all tables
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE uso_recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- Policies for empresas table
CREATE POLICY "Master users can view all empresas"
  ON empresas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND perfis.role = 'master'
    )
  );

CREATE POLICY "Admins can view their own empresa"
  ON empresas FOR SELECT
  USING (
    id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
  );

-- Policies for perfis table
CREATE POLICY "Users can view their own profile"
  ON perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles from same empresa"
  ON perfis FOR SELECT
  USING (
    empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage profiles in their empresa"
  ON perfis FOR ALL
  USING (
    empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
    AND (
      SELECT role FROM perfis 
      WHERE perfis.id = auth.uid()
    ) IN ('admin', 'master')
  );

-- Policies for agentes_ia table
CREATE POLICY "Users can view agentes from their empresa"
  ON agentes_ia FOR SELECT
  USING (
    empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage agentes in their empresa"
  ON agentes_ia FOR ALL
  USING (
    empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
    AND (
      SELECT role FROM perfis 
      WHERE perfis.id = auth.uid()
    ) IN ('admin', 'master')
  );

-- Policies for conversas table
CREATE POLICY "Users can view their own conversas"
  ON conversas FOR SELECT
  USING (
    user_id = auth.uid()
    AND empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversas"
  ON conversas FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own conversas"
  ON conversas FOR UPDATE
  USING (
    user_id = auth.uid()
    AND empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
  );

-- Policies for uso_recursos table
CREATE POLICY "Admins can view usage from their empresa"
  ON uso_recursos FOR SELECT
  USING (
    empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
    AND (
      SELECT role FROM perfis 
      WHERE perfis.id = auth.uid()
    ) IN ('admin', 'master')
  );

CREATE POLICY "System can manage usage records"
  ON uso_recursos FOR ALL
  USING (true); -- This will be managed by service role

-- Policies for auditoria table
CREATE POLICY "Master users can view all auditoria"
  ON auditoria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND perfis.role = 'master'
    )
  );

CREATE POLICY "Admins can view auditoria from their empresa"
  ON auditoria FOR SELECT
  USING (
    empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
    AND (
      SELECT role FROM perfis 
      WHERE perfis.id = auth.uid()
    ) IN ('admin', 'master')
  );

CREATE POLICY "System can insert auditoria records"
  ON auditoria FOR INSERT
  WITH CHECK (true); -- This will be managed by service role
