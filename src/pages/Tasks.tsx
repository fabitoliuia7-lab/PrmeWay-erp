import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Plus, AlertCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  date: any;
  status: 'Pendente' | 'Concluída' | 'Cancelada';
  priority: 'Baixa' | 'Média' | 'Alta';
  userEmail?: string;
  completedBy?: string;
}

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: '',
    priority: 'Média' as const,
  });

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, 'tasks'), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        date: Timestamp.fromDate(new Date(newTask.date)),
        status: 'Pendente',
        createdAt: Timestamp.now(),
        userId: user?.uid,
        userEmail: user?.email, // Rastreia quem criou
      });
      setShowAddModal(false);
      setNewTask({ title: '', description: '', date: '', priority: 'Média' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const isNowCompleted = task.status !== 'Concluída';
    const newStatus = isNowCompleted ? 'Concluída' : 'Pendente';
    try {
      await updateDoc(doc(db, 'tasks', task.id), { 
        status: newStatus,
        completedBy: isNowCompleted ? user?.email : null, // Rastreia quem concluiu
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Carregando agenda...</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Agenda & Follow-ups</h1>
          <p className="text-sm text-slate-500">Gerencie as tarefas da equipe de vendas</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Nenhum compromisso agendado</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Categorize Tasks */}
            {(() => {
              const now = new Date();
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

              const atrasadas = tasks.filter(t => t.status !== 'Concluída' && t.date?.toDate() < todayStart);
              const hoje = tasks.filter(t => t.status !== 'Concluída' && t.date?.toDate() >= todayStart && t.date?.toDate() <= todayEnd);
              const proximas = tasks.filter(t => t.status !== 'Concluída' && t.date?.toDate() > todayEnd);
              const concluidas = tasks.filter(t => t.status === 'Concluída');

              const renderGroup = (title: string, groupTasks: Task[], colorClass: string, icon: React.ReactNode) => {
                if (groupTasks.length === 0) return null;
                return (
                  <div className="flex flex-col gap-3">
                    <h2 className={`text-sm font-bold flex items-center gap-2 uppercase tracking-wide ${colorClass}`}>
                      {icon} {title} ({groupTasks.length})
                    </h2>
                    <div className="flex flex-col gap-3">
                      {groupTasks.map((task) => (
                        <motion.div 
                          layout
                          key={task.id}
                          className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all ${task.status === 'Concluída' ? 'opacity-60' : 'hover:border-slate-300'}`}
                        >
                          <button 
                            onClick={() => toggleTaskStatus(task)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.status === 'Concluída' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                            {task.status === 'Concluída' && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-slate-900 ${task.status === 'Concluída' ? 'line-through decoration-slate-400' : ''}`}>
                                {task.title}
                              </h3>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                task.priority === 'Alta' ? 'bg-rose-50 text-rose-600' : 
                                task.priority === 'Média' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                              }`}>
                                  {task.priority}
                              </span>
                            </div>
                            {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
                            <div className="flex items-center gap-2 mt-2">
                              {task.userEmail && (
                                <span className="text-[10px] flex items-center gap-1 text-slate-400">
                                  <User className="w-3 h-3" />
                                  Agendado por: {task.userEmail.split('@')[0]}
                                </span>
                              )}
                              {task.completedBy && task.status === 'Concluída' && (
                                <span className="text-[10px] flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Concluído por: {task.completedBy.split('@')[0]}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${task.status !== 'Concluída' && title === 'Atrasadas' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50'}`}>
                              <Clock className="w-4 h-4" />
                              {task.date instanceof Timestamp ? task.date.toDate().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Data inválida'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              };

              return (
                <>
                  {renderGroup('Atrasadas', atrasadas, 'text-rose-600', <AlertCircle className="w-4 h-4" />)}
                  {renderGroup('Hoje', hoje, 'text-amber-600', <Clock className="w-4 h-4" />)}
                  {renderGroup('Próximas', proximas, 'text-blue-600', <CalendarIcon className="w-4 h-4" />)}
                  {renderGroup('Concluídas', concluidas, 'text-slate-400', <CheckCircle2 className="w-4 h-4" />)}
                </>
              );
            })()}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Agendar Novo Registro</h2>
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg">
                  <CalendarIcon className="w-4 h-4" />
                </div>
              </div>
              
              <form onSubmit={handleAddTask} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Título da Atividade</label>
                  <input
                    required
                    type="text"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Ex: Ligar para Cliente X"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Data e Hora</label>
                  <input
                    required
                    type="datetime-local"
                    value={newTask.date}
                    onChange={e => setNewTask({...newTask, date: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm bg-white"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Observações (Opcional)</label>
                  <textarea
                    rows={3}
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Salvar na Agenda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
