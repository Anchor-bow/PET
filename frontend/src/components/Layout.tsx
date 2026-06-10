import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="6" height="6" />
      <rect x="9" y="1" width="6" height="6" />
      <rect x="1" y="9" width="6" height="6" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11.5V14h2.5L12 6.5 9.5 4 2 11.5z" />
      <path d="M9.5 4l2.5 2.5" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10a4 4 0 110-8 4 4 0 010 8z" />
      <path d="M9 7l4 4" />
      <path d="M11 9l1 1" />
      <path d="M6 6h.01" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 9.5A6 6 0 016.5 2.5 6 6 0 1013.5 9.5z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" />
      <path d="M11 11l3-3-3-3" />
      <path d="M14 8H6" />
    </svg>
  );
}

function IconCollapse() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3l-4 4 4 4" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l4 4-4 4" />
    </svg>
  );
}

export function Layout() {
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
        <div className="sidebar-brand">{collapsed ? 'P' : 'PET'}</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="sidebar-link" title="Dashboard">
            <IconGrid />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/editor" className="sidebar-link" title="Editor">
            <IconEdit />
            {!collapsed && <span>Editor</span>}
          </NavLink>
          <NavLink to="/licenses" className="sidebar-link" title="Lizenzen">
            <IconKey />
            {!collapsed && <span>Lizenzen</span>}
          </NavLink>
        </nav>
        <div className="sidebar-spacer" />
        <button className="sidebar-theme-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
          {theme === 'light' ? <IconMoon /> : <IconSun />}
          {!collapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>
        <button className="sidebar-logout" onClick={logout} title="Abmelden">
          <IconLogout />
          {!collapsed && <span>Abmelden</span>}
        </button>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Erweitern' : 'Einklappen'}
        >
          {collapsed ? <IconExpand /> : <IconCollapse />}
        </button>
      </aside>
      <main className="canvas">
        <Outlet />
      </main>
    </div>
  );
}
