import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface DashboardStats {
  totalUsuarios: number;
  totalConversas: number;
  totalMensagens: number;
  totalAgentes: number;
  usuariosAtivos: number;
  tendenciaConversas: number;
  taxaSucesso: number;
  uptime: number;
  lastUpdated: string;
  context: {
    isMaster: boolean;
    userRole: string;
    empresaName: string;
  };
}

export interface ActivityItem {
  id: string;
  type: 'conversation' | 'user' | 'agent';
  title: string;
  description: string;
  timestamp: string;
  icon: 'message-square' | 'user' | 'bot';
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao buscar estatísticas');
      }
      const data: DashboardStats = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/activity');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao buscar atividade');
      }
      const data: ActivityItem[] = await response.json();
      setActivity(data);
    } catch (err: any) {
      console.error('Erro ao buscar atividade:', err);
      // Não definir erro para atividade, pois não é crítico
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchStats(), fetchActivity()]);
    } catch (err: any) {
      setError(err.message);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchActivity]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `Há ${Math.floor(diffInMinutes)} minutos`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Há ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (trend: number): string => {
    if (trend > 0) return '↗️';
    if (trend < 0) return '↘️';
    return '➡️';
  };

  const getTrendColor = (trend: number): string => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'message-square':
        return '💬';
      case 'user':
        return '👤';
      case 'bot':
        return '🤖';
      default:
        return '📋';
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    stats,
    activity,
    loading,
    error,
    fetchAllData,
    formatTimestamp,
    formatNumber,
    getTrendIcon,
    getTrendColor,
    getActivityIcon
  };
}
