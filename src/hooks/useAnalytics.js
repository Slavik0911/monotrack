import { useEffect, useState } from "react";
import { N8N_URL } from "../services/api";

export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const res = await fetch(`${N8N_URL}?currency=UAH`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Помилка завантаження даних:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, error, loading };
}
