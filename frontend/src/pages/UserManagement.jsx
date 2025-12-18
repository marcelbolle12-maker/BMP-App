import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', role: 'USER', modules: '' });
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        role: form.role,
        modules: splitModules(form.modules)
      };
      await api.post('/users', payload);
      setForm({ email: '', password: '', role: 'USER', modules: '' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const updateModules = async (userId, modules) => {
    try {
      await api.patch(`/users/${userId}/modules`, { modules: splitModules(modules) });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update modules');
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  return (
    <div className="grid">
      <div className="card">
        <h2>Create User</h2>
        <form className="form" onSubmit={handleCreate}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <label>
            Modules (comma separated)
            <input
              type="text"
              value={form.modules}
              onChange={(e) => setForm({ ...form, modules: e.target.value })}
              placeholder="MODULE_1, MODULE_2"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h2>Users</h2>
        {users.length === 0 && <p>No users found.</p>}
        <ul className="user-list">
          {users.map((user) => (
            <li key={user.id} className="user-item">
              <div className="user-main">
                <div>
                  <p className="user-email">{user.email}</p>
                  <p>Role: {user.role}</p>
                  <p>Modules: {user.modules.join(', ') || 'None'}</p>
                  <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="user-actions">
                  <button onClick={() => toggleStatus(user)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
              <ModuleEditor user={user} onSave={updateModules} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ModuleEditor({ user, onSave }) {
  const [value, setValue] = useState(user.modules.join(', '));

  const submit = (e) => {
    e.preventDefault();
    onSave(user.id, value);
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      <label>
        Modules
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="MODULE_1" />
      </label>
      <button type="submit">Save Modules</button>
    </form>
  );
}

function splitModules(input) {
  return input
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
}
