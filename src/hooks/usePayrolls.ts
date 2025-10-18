import { useState, useEffect } from "react"
import axios from "axios"

export const usePayrolls = () => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/payrolls");
      setPayrolls(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل في جلب الرواتب");
    } finally {
      setLoading(false);
    }
  };

  const createPayroll = async (data: any) => {
    try {
      const res = await axios.post("/payrolls", data);
      setPayrolls(prev => [...prev, res.data]);
      return res.data;
    } catch (err: any) {
      throw err;
    }
  };

  const updatePayroll = async (id: number, data: any) => {
    try {
      const res = await axios.put(`/payrolls/${id}`, data);
      setPayrolls(prev => prev.map(p => p.id === id ? res.data : p));
      return res.data;
    } catch (err: any) {
      throw err;
    }
  };

  const deletePayroll = async (id: number) => {
    try {
      await axios.delete(`/payrolls/${id}`);
      setPayrolls(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  return {
    payrolls,
    loading,
    error,
    fetchPayrolls,
    createPayroll,
    updatePayroll,
    deletePayroll,
  };
};
