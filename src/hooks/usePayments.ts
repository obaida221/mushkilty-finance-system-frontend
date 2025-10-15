import { useState, useEffect } from "react"
import axios from "axios"

export const usePayments = () => {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get("/payments") // تأكد من مسار الباك
      setPayments(res.data)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "حدث خطأ أثناء جلب الدفعات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const createPayment = async (payload: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post("/payments", payload)
      setPayments(prev => [res.data, ...prev])
      return res.data
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدفعة")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePayment = async (id: number, payload: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.put(`/payments/${id}`, payload)
      setPayments(prev => prev.map(p => (p.id === id ? res.data : p)))
      return res.data
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "حدث خطأ أثناء تحديث الدفعة")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePayment = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await axios.delete(`/payments/${id}`)
      setPayments(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "حدث خطأ أثناء حذف الدفعة")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
  }
}
