import { useState, useEffect } from 'react';

// 🌐 Твій Production URL з ноди Webhook в n8n (без слова -test)
const N8N_URL = 'http://161.97.165.81:5678/webhook/84b08eab-899e-43f8-ba2f-1895544e3d40';

function App() {
  const [analytics, setAnalytics] = useState(null);
  const [currency, setCurrency] = useState('UAH');
  const [loading, setLoading] = useState(false);

  // Функція для отримання даних з бекенду n8n
  const loadData = async (selectedCurrency) => {
    setLoading(true);
    try {
      const response = await fetch(`${N8N_URL}?currency=${selectedCurrency}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Помилка завантаження даних:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currency);
  }, [currency]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-slate-800 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-amber-400 tracking-tight">MONO ANALYTICS</h1>
            <p className="text-slate-400 text-sm mt-1">Мультивалютний фінансовий дашборд</p>
          </div>

          {/* ПУЛЬТ КЕРУВАННЯ ВАЛЮТОЮ */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 self-start md:self-auto">
            {['UAH', 'USD', 'EUR'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  currency === curr 
                    ? 'bg-amber-400 text-slate-900 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </header>

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-20 text-amber-400 font-bold animate-pulse">
            Завантаження аналітики з n8n...
          </div>
        )}

        {/* MAIN DASHBOARD CONTENT */}
        {!loading && analytics && (
          <div className="space-y-8">
            
            {/* GLOBAL STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-750 shadow-lg">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Загальні витрати</p>
                <p className="text-3xl font-black text-white mt-2">
                  {analytics.global?.total_spent_converted?.toLocaleString()} <span className="text-amber-400 text-xl">{analytics.report_base_currency}</span>
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-750 shadow-lg">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Кількість транзакцій</p>
                <p className="text-3xl font-black text-white mt-2">
                  {analytics.global?.transactions_count} <span className="text-slate-500 text-xl">операцій</span>
                </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-750 shadow-lg">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Топ категорія</p>
                <p className="text-3xl font-black text-rose-400 mt-2 capitalize">
                  {analytics.global?.top_category || 'Немає'}
                  <span className="text-slate-400 text-lg font-medium ml-2">({analytics.global?.top_percent}%)</span>
                </p>
              </div>
            </div>

            {/* BREAKDOWN & ACCOUNTS LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* СПИСОК КАТЕГОРІЙ */}
              <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-lg font-bold mb-4 text-white">Витрати за категоріями</h3>
                <div className="space-y-4">
                  {analytics.global?.breakdown?.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="capitalize text-slate-300">{item.category}</span>
                        <span className="text-white">{item.amount_converted} {analytics.report_base_currency} ({item.percent}%)</span>
                      </div>
                      {/* Кастомний прогрес-бар на Tailwind */}
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* СПИСОК КАРТОК (BY ACCOUNT) */}
              <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-lg font-bold mb-4 text-white">Аналітика по рахунках</h3>
                <div className="space-y-3">
                  {analytics.by_account?.map((acc) => (
                    <div key={acc.account_id} className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-xs font-mono text-slate-500 truncate w-40 md:w-60">ID: {acc.account_id}</p>
                        <p className="text-sm font-semibold text-slate-300 mt-1">Транзакцій: {acc.transactions_count}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-white">{acc.total_spent_converted} {analytics.report_base_currency}</p>
                        <p className="text-xs text-slate-400 font-medium">Оригінал: {acc.total_spent_original} ({acc.currency_code === 840 ? 'USD' : acc.currency_code === 978 ? 'EUR' : 'UAH'})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;