// frontend/src/hooks/useEmails.ts
import { useState, useEffect } from 'react';
import { fetchEmails } from '../services/emailService';

export function useEmails(maxResults = 20, q?: string) {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchEmails(maxResults, q)
      .then((res) => {
        if (!mounted) return;
        if (res?.success) {
          setEmails(res.data.messages || []);
        } else {
          setError('Failed to fetch emails');
        }
      })
      .catch((err) => {
        setError(err?.message || 'Error fetching emails');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [maxResults, q]);

  return { loading, emails, error };
}
