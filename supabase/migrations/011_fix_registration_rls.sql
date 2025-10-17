-- Migration 011: Fix registration RLS issues

-- Function to update user profile during registration (bypasses RLS)
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id BIGINT,
  nome_completo VARCHAR(255),
  empresa_id BIGINT,
  role VARCHAR(20),
  status VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
  -- Update the user profile with the provided data
  UPDATE perfis 
  SET 
    nome_completo = update_user_profile.nome_completo,
    empresa_id = update_user_profile.empresa_id,
    role = update_user_profile.role,
    status = update_user_profile.status,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Check if the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Perfil não encontrado para o usuário %', user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to allow users to update their own profile during registration
CREATE POLICY "Users can update their own profile during registration"
  ON perfis FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add policy to allow users to insert their own profile (for the trigger)
CREATE POLICY "Users can insert their own profile"
  ON perfis FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Add policy to allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON perfis FOR SELECT
  USING (auth.uid() = id);

-- Add policy to allow master users to manage all profiles
CREATE POLICY "Master users can manage all profiles"
  ON perfis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM perfis 
      WHERE perfis.id = auth.uid() 
      AND perfis.role = 'master'
    )
  );

-- Add policy to allow admins to manage profiles in their empresa
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

-- Add policy to allow users to view profiles from same empresa
CREATE POLICY "Users can view profiles from same empresa"
  ON perfis FOR SELECT
  USING (
    empresa_id = (
      SELECT empresa_id FROM perfis 
      WHERE perfis.id = auth.uid()
    )
  );

-- Add comments
COMMENT ON FUNCTION update_user_profile IS 'Function to update user profile during registration, bypasses RLS';
