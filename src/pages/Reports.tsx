import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Reports() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oppsSnap, salesSnap] = await Promise.all([
          getDocs(collection(db, 'opportunities')),
          getDocs(collection(db, 'sales'))
        ]);
        setOpportunities(oppsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setSales(salesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Aggregation for Opportunities by Status
  const oppsByStatusCount = opportunities.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const oppsStatusData = Object.keys(oppsByStatusCount).map(key => ({
    name: key,
    value: oppsByStatusCount[key]
  }));

  const COLORS = ['#818cf8', '#38bdf8', '#fbbf24', '#34d399', '#fb7185'];

  // Aggregation for Won Opportunities Value over time (Mocking months using createdAt if exists, else putting in generic bucket)
  const oppsByMonth = opportunities.reduce((acc, curr) => {
    if (curr.status === 'Ganho' && curr.createdAt) {
      const date = curr.createdAt.toDate(); // Firebase timestamp
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      acc[monthYear] = (acc[monthYear] || 0) + (curr.value || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  const wonOppsTrend = Object.keys(oppsByMonth).map(key => ({
    name: key,
    Total: oppsByMonth[key]
  }));

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando Relatórios...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Relatórios de Vendas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Breakdown (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Pipeline de Oportunidades</h2>
          <div className="h-[300px]">
            {oppsStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={oppsStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {oppsStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">Sem dados</div>
            )}
          </div>
        </div>

        {/* Won Sales Trend (Bar Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Faturamento de Vendas (Ganhos) por Mês</h2>
          <div className="h-[300px]">
            {wonOppsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wonOppsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={val => `MZN ${val/1000}k`} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(val) => `MZN ${val}`} />
                  <Bar dataKey="Total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center px-4">
                Não há dados suficientes. Tente marcar uma oportunidade como "Ganho".
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
