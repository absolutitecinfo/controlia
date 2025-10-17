import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useStripeBilling() {
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = useCallback(async (planoId: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plano_id: planoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
      }

      const data = await response.json();
      
      // Se for plano gratuito, redirecionar diretamente
      if (data.success) {
        toast.success(data.message);
        window.location.href = data.redirect_url;
        return;
      }
      
      // Se for plano pago, redirecionar para o Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
      
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Erro ao processar pagamento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const openBillingPortal = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao abrir portal de cobrança');
      }

      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
      
    } catch (error: any) {
      console.error('Error opening billing portal:', error);
      toast.error(error.message || 'Erro ao abrir portal de cobrança');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createCheckoutSession,
    openBillingPortal,
  };
}
