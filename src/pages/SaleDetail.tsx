import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, deleteDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Trash2, Calendar, FileText } from 'lucide-react';

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    type: 'Importação Completa',
    status: 'Pending',
    amount: '',
    notes: '',
  });
  
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const q = query(collection(db, 'clients'), orderBy('name'));
        const clientsSnap = await getDocs(q);
        const clientsData = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClients(clientsData);

        if (!isNew && id) {
          const docRef = doc(db, 'sales', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setFormData(docSnap.data() as any);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        amount: Number(formData.amount) || 0,
        updatedAt: serverTimestamp(),
      };

      if (isNew) {
        const newId = crypto.randomUUID();
        await setDoc(doc(db, 'sales', newId), {
          ...dataToSave,
          createdAt: serverTimestamp(),
          ownerId: user?.uid,
          userEmail: user?.email,
        });
        navigate('/sales');
      } else if (id) {
        await updateDoc(doc(db, 'sales', id), dataToSave);
        navigate('/sales');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar operação');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Excluir esta operação permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'sales', id!));
      navigate('/sales');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <button
        onClick={() => navigate('/sales')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        VOLTAR
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {isNew ? 'Nova Operação' : 'Detalhes da Operação'}
        </h1>
        {!isNew && (
          <button
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
            title="Excluir Operação"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título / Referência da Carga</label>
            <input
              required
              type="text"
              placeholder="Ex: Madeiras da China Container 01"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cliente</label>
            <select
              required
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            >
              <option value="" disabled>Selecione um cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Serviço</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            >
              <option value="Importação Completa">Importação Completa</option>
              <option value="Importação Assistida">Importação Assistida</option>
              <option value="Transporte Regional">Transporte Regional</option>
              <option value="Consultoria">Consultoria em Importação</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status da Operação</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            >
              <option value="Pending">Pendente</option>
              <option value="Negotiating">Em Negociação</option>
              <option value="Purchased">Comprado na China</option>
              <option value="In Transit">Em Trânsito (Frete Internacional)</option>
              <option value="Customs">Desembaraço (Alfândega MZ)</option>
              <option value="Delivered">Entregue</option>
              <option value="Cancelled">Cancelado</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor Total (MZN)</label>
            <input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anotações e Detalhes da Carga</label>
            <textarea
              rows={4}
              placeholder="Descreva containers, pesos, volumes, parceiros..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-sm"
            ></textarea>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'SALVANDO...' : 'SALVAR OPERAÇÃO'}
          </button>
        </div>
      </form>
    </div>
  );
}
