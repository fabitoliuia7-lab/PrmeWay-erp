import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, ShoppingBag, FolderKanban, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSales: 0,
    inTransit: 0,
    totalOpps: 0,
  });
  const [oppsData, setOppsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#818cf8', '#38bdf8', '#fbbf24', '#34d399', '#fb7185'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsSnap, salesSnap, oppsSnap] = await Promise.all([
          getDocs(collection(db, 'clients')),
          getDocs(collection(db, 'sales')),
          getDocs(collection(db, 'opportunities')),
        ]);
        
        let inTransitCount = 0;
        salesSnap.forEach(doc => {
          if (doc.data().status === 'In Transit') {
            inTransitCount++;
          }
        });

        const oppsCountByStatus: any = {};
        oppsSnap.forEach(doc => {
          const status = doc.data().status || 'Sem status';
          oppsCountByStatus[status] = (oppsCountByStatus[status] || 0) + 1;
        });

        const oppsChartData = Object.keys(oppsCountByStatus).map(key => ({
          name: key,
          value: oppsCountByStatus[key]
        }));

        setOppsData(oppsChartData);

        setStats({
          totalClients: clientsSnap.size,
          totalSales: salesSnap.size,
          inTransit: inTransitCount,
          totalOpps: oppsSnap.size,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-slate-500 p-8">Carregando dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Visão Geral</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Clientes</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalClients}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Oportunidades</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalOpps}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Vendas/Import.</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalSales}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Em Trânsito</p>
            <p className="text-2xl font-bold text-slate-900">{stats.inTransit}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-6">Funil de Oportunidades</h2>
          <div className="h-[300px]">
            {oppsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={oppsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {oppsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Nenhuma oportunidade cadastrada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
