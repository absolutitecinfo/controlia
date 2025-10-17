import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Empresa {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  status: 'ativa' | 'suspensa' | 'inativa';
  plano: {
    id: string;
    nome: string;
    preco_mensal: number;
  };
  usuariosCount: number;
  usuariosAtivos: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpresaData {
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  plano_id: string;
}

export interface UpdateEmpresaData {
  nome?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status?: 'ativa' | 'suspensa' | 'inativa';
  plano_id?: string;
}

export function useMasterEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = useCallback(async (filters?: {
    search?: string;
    status?: string;
    plano?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.plano) params.append('plano', filters.plano);

      const response = await fetch(`/api/master/empresas?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar empresas');
      }
      const data: Empresa[] = await response.json();
      setEmpresas(data);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.message || 'Erro ao carregar empresas');
      toast.error(err.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const createEmpresa = async (newEmpresaData: CreateEmpresaData) => {
    try {
      const response = await fetch('/api/master/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmpresaData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar empresa');
      }
      toast.success('Empresa criada com sucesso!');
      fetchEmpresas(); // Recarregar lista
    } catch (err: any) {
      console.error('Error creating company:', err);
      toast.error(err.message || 'Erro ao criar empresa');
      throw err;
    }
  };

  const updateEmpresa = async (id: string, updateData: UpdateEmpresaData) => {
    try {
      const response = await fetch(`/api/master/empresas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar empresa');
      }
      toast.success('Empresa atualizada com sucesso!');
      fetchEmpresas(); // Recarregar lista
    } catch (err: any) {
      console.error('Error updating company:', err);
      toast.error(err.message || 'Erro ao atualizar empresa');
      throw err;
    }
  };

  const deleteEmpresa = async (id: string) => {
    try {
      const response = await fetch(`/api/master/empresas/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar empresa');
      }
      toast.success('Empresa deletada com sucesso!');
      fetchEmpresas(); // Recarregar lista
    } catch (err: any) {
      console.error('Error deleting company:', err);
      toast.error(err.message || 'Erro ao deletar empresa');
      throw err;
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativa' ? 'suspensa' : 'ativa';
    await updateEmpresa(id, { status: newStatus as 'ativa' | 'suspensa' | 'inativa' });
  };

  return {
    empresas,
    loading,
    error,
    fetchEmpresas,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    toggleStatus,
  };
}
