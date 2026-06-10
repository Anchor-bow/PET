import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function Layout() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">PET</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="sidebar-link">
            Dashboard
          </NavLink>
          <NavLink to="/editor" className="sidebar-link">
            Editor
          </NavLink>
          <NavLink to="/licenses" className="sidebar-link">
            Lizenzen
          </NavLink>
        </nav>
        <div className="sidebar-spacer" />
        <button className="sidebar-logout" onClick={logout}>
          Abmelden
        </button>
      </aside>
      <main className="canvas">
        <Outlet />
      </main>
    </div>
  );
}
