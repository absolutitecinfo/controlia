import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Usuario {
  id: string;
  nome_completo: string;
  email: string;
  role: 'admin' | 'colaborador';
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface CreateUsuarioData {
  email: string;
  nome_completo: string;
  role?: 'admin' | 'colaborador';
}

export interface UpdateUsuarioData {
  nome_completo?: string;
  role?: 'admin' | 'colaborador';
  status?: 'ativo' | 'inativo';
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/usuarios');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao buscar usuários');
      }
      const data: Usuario[] = await response.json();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUsuario = useCallback(async (userData: CreateUsuarioData) => {
    try {
      const response = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao criar usuário');
      }
      
      const result = await response.json();
      await fetchUsuarios(); // Recarregar lista
      toast.success('Usuário criado com sucesso!');
      return result.user;
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchUsuarios]);

  const updateUsuario = useCallback(async (userId: string, userData: UpdateUsuarioData) => {
    try {
      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao atualizar usuário');
      }
      
      await fetchUsuarios(); // Recarregar lista
      toast.success('Usuário atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchUsuarios]);

  const deleteUsuario = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao deletar usuário');
      }
      
      await fetchUsuarios(); // Recarregar lista
      toast.success('Usuário deletado com sucesso!');
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchUsuarios]);

  const toggleStatus = useCallback(async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    await updateUsuario(userId, { status: newStatus as 'ativo' | 'inativo' });
  }, [updateUsuario]);

  const changeRole = useCallback(async (userId: string, newRole: string) => {
    await updateUsuario(userId, { role: newRole as 'admin' | 'colaborador' });
  }, [updateUsuario]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  return {
    usuarios,
    loading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleStatus,
    changeRole
  };
}
