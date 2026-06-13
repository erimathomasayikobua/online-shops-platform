import { useState, useEffect, useCallback } from 'react';
import { fetchAdminOverview, fetchSystemStatus } from '../services/api';

export const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, status] = await Promise.all([
        fetchAdminOverview(),
        fetchSystemStatus(),
      ]);
      setData(overview);
      setSystemStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [loadData]);

  return { data, systemStatus, loading, error, refresh: loadData };
};
