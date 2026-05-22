import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
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
        </nav>
      </aside>
      <main className="canvas">
        <Outlet />
      </main>
    </div>
  );
}
