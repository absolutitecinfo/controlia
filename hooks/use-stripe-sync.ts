import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface StripeSyncResult {
  plano_id: string;
  plano_nome: string;
  status: 'success' | 'error';
  stripe_product_id?: string;
  stripe_price_id?: string;
  error?: string;
}

export function useStripeSync() {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<StripeSyncResult[]>([]);

  const syncPlans = useCallback(async () => {
    setSyncing(true);
    setResults([]);
    
    try {
      console.log('Starting sync request...');
      const response = await fetch('/api/stripe/sync-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        console.error('Response not ok:', response.status, response.statusText);
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('Failed to parse error response as JSON');
          const text = await response.text();
          console.error('Raw response:', text);
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        console.error('Error data:', errorData);
        throw new Error(errorData.error || 'Erro ao sincronizar planos');
      }

      const data = await response.json();
      console.log('Sync response data:', data);
      setResults(data.results);
      
      const successCount = data.results.filter((r: StripeSyncResult) => r.status === 'success').length;
      const errorCount = data.results.filter((r: StripeSyncResult) => r.status === 'error').length;
      
      if (errorCount === 0) {
        toast.success(`Todos os ${successCount} planos foram sincronizados com sucesso!`);
      } else {
        toast.warning(`${successCount} planos sincronizados, ${errorCount} com erro`);
      }
      
      return data.results;
    } catch (error: any) {
      console.error('Error syncing plans:', error);
      toast.error(error.message || 'Erro ao sincronizar planos com Stripe');
      throw error;
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    syncing,
    results,
    syncPlans,
  };
}
