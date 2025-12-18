import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p>Modules: {user?.modules?.join(', ') || 'None'}</p>
    </div>
  );
}
