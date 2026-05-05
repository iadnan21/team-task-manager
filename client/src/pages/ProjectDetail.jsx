import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserPlus, X } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const isAdmin = project?.members?.find((m) => m.userId === user?.id)?.role === 'ADMIN';

  const fetchProject = () => {
    api.get(`/projects/${id}`).then((res) => setProject(res.data)).catch(() => navigate('/projects')).finally(() => setLoading(false));
  };

  useEffect(fetchProject, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: taskTitle, description: taskDesc, projectId: id,
        priority: taskPriority, dueDate: taskDueDate || undefined, assigneeId: taskAssignee || undefined,
      });
      toast.success('Task created');
      setTaskTitle(''); setTaskDesc(''); setTaskDueDate(''); setTaskAssignee('');
      setShowTaskForm(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchProject();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      toast.success('Member added');
      setMemberEmail('');
      setShowMemberForm(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error('Failed to delete project');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  if (!project) return null;

  const statusColor = { TODO: 'bg-yellow-100 text-yellow-700', IN_PROGRESS: 'bg-indigo-100 text-indigo-700', DONE: 'bg-green-100 text-green-700' };
  const priorityColor = { LOW: 'text-gray-400', MEDIUM: 'text-yellow-500', HIGH: 'text-red-500' };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <button onClick={handleDeleteProject} className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1">
            <Trash2 size={14} /> Delete Project
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tasks ({project.tasks?.length || 0})</h2>
            <button onClick={() => setShowTaskForm(!showTaskForm)}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700">
              <Plus size={14} /> Add Task
            </button>
          </div>

          {showTaskForm && (
            <form onSubmit={handleCreateTask} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-3">
              <input type="text" placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <textarea placeholder="Description (optional)" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="grid grid-cols-3 gap-3">
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Unassigned</option>
                  {project.members?.map((m) => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Create Task</button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {project.tasks?.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No tasks yet. Create one to get started.</div>
            ) : (
              project.tasks.map((t) => (
                <div key={t.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`text-xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</span>
                    <span className="text-sm font-medium truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{t.assignee?.name || 'Unassigned'}</span>
                    <select value={t.status} onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColor[t.status]}`}>
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                    {isAdmin && (
                      <button onClick={() => handleDeleteTask(t.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Team</h2>
            {isAdmin && (
              <button onClick={() => setShowMemberForm(!showMemberForm)} className="text-indigo-600 hover:text-indigo-700">
                <UserPlus size={16} />
              </button>
            )}
          </div>

          {showMemberForm && (
            <form onSubmit={handleAddMember} className="bg-white border border-gray-200 rounded-xl p-3 mb-4 space-y-2">
              <input type="email" placeholder="Member email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="w-full bg-indigo-600 text-white py-1.5 rounded-lg text-sm hover:bg-indigo-700">Add Member</button>
            </form>
          )}

          <div className="space-y-2">
            {project.members?.map((m) => (
              <div key={m.id} className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{m.user.name}</div>
                  <div className="text-xs text-gray-400">{m.role}</div>
                </div>
                {isAdmin && m.userId !== user.id && (
                  <button onClick={() => handleRemoveMember(m.userId)} className="text-gray-300 hover:text-red-500">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
