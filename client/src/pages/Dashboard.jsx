import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, Clock, AlertTriangle, ListTodo, FolderKanban, User } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  if (!data) return null;

  const { stats, overdueTasks, recentTasks } = data;

  const statCards = [
    { label: 'Projects', value: stats.totalProjects, icon: FolderKanban, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: ListTodo, color: 'bg-gray-50 text-gray-600' },
    { label: 'To Do', value: stats.todo, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Done', value: stats.done, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
    { label: 'My Open Tasks', value: stats.myOpenTasks, icon: User, color: 'bg-purple-50 text-purple-600' },
  ];

  const statusColor = { TODO: 'bg-yellow-100 text-yellow-700', IN_PROGRESS: 'bg-indigo-100 text-indigo-700', DONE: 'bg-green-100 text-green-700' };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <s.icon size={20} className="mb-2" />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs opacity-75">{s.label}</div>
          </div>
        ))}
      </div>

      {overdueTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-red-600 mb-3">Overdue Tasks</h2>
          <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
            {overdueTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 border-b border-red-100 last:border-0">
                <div>
                  <span className="font-medium text-sm">{t.title}</span>
                  <span className="text-xs text-gray-500 ml-2">{t.project?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-red-500">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
                  {t.assignee && <span className="text-gray-400">{t.assignee.name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Tasks</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {recentTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No tasks yet. <Link to="/projects" className="text-indigo-600 hover:underline">Create a project</Link> to get started.
            </div>
          ) : (
            recentTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>{t.status.replace('_', ' ')}</span>
                  <span className="text-sm font-medium">{t.title}</span>
                  <Link to={`/projects/${t.project?.id}`} className="text-xs text-gray-400 hover:text-indigo-500">{t.project?.name}</Link>
                </div>
                <span className="text-xs text-gray-400">{t.assignee?.name || 'Unassigned'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
