'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Task, Priority } from '../types';

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { [Priority.HIGH]: 1, [Priority.MEDIUM]: 2, [Priority.LOW]: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
  }, [tasks, sortBy]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      dueDate,
      priority,
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setDueDate(undefined);
    setPriority(Priority.MEDIUM);
  };

  const handleDelete = (task: Task) => {
    setTasks(tasks.filter(t => t.id !== task.id));
    setTaskToDelete(null);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-[#141414]/5 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Task Management</h2>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="New task description..."
            className="col-span-2 md:col-span-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
          />
          <input
            type="date"
            onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm"
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </div>
        <button type="submit" className="mt-4 px-6 py-3 bg-[#141414] text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <Plus size={16} /> Add Task
        </button>
      </form>

      {/* Sorting Controls */}
      <div className="mb-4 flex justify-end gap-4">
        <select onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority')} className="text-sm font-medium">
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {sortedTasks.map(task => (
          <div key={task.id} className="p-4 flex items-center justify-between bg-white border border-gray-100 rounded-xl">
            <div>
              <p className="font-medium">{task.text}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                {task.dueDate && <span>Due: {format(task.dueDate, 'PPP')}</span>}
                <span>Priority: {task.priority}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTaskToDelete(task)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" />
              <h3 className="font-bold">Confirm Deletion</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(taskToDelete)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
