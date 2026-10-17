import {
  LayoutDashboard,
  BookOpen,
  Headset,
  PlusCircle,
  Settings,
  LogOut,
  Leaf,
  X,
  ClipboardList,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const authorNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/author/dashboard",
  },
  {
    label: "My Books",
    icon: BookOpen,
    path: "/author/books",
  },
  {
    label: "My Tickets",
    icon: Headset,
    path: "/author/tickets",
  },
];

const adminNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    label: "All Tickets",
    icon: ClipboardList,
    path: "/admin/tickets",
  }
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith("/admin");
  const navigation = isAdmin ? adminNavigation : authorNavigation;

  // Exact match only — ensures /admin/tickets and /admin/tickets/manage
  // don't highlight each other, and /author/tickets vs /author/tickets/new
  // stay independent too.
  const isActive = (path: string) => location.pathname === path;

  function handleLogout() {
    // Demo UI only. Real logout backend authentication ke baad.
    navigate("/login");
    onClose();
  }

  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <Leaf size={23} />
          </div>

          <div>
            <h2>BookLeaf</h2>
            <span>{isAdmin ? "ADMIN PANEL" : "AUTHOR STUDIO"}</span>
          </div>

          <button
            className="icon-button sidebar__close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar__section-label">
          {isAdmin ? "ADMIN WORKSPACE" : "WORKSPACE"}
        </div>

        <nav className="sidebar__nav">
          {navigation.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              to={path}
              className={`sidebar__link ${
                isActive(path) ? "sidebar__link--active" : ""
              }`}
              onClick={onClose}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>

              {!isAdmin && label === "My Tickets" && (
                <span className="sidebar__count">2</span>
              )}
            </Link>
          ))}

          {/* Author-only: Create Ticket shortcut */}
          {!isAdmin && (
            <Link
              to="/author/tickets/new"
              className={`sidebar__link ${
                isActive("/author/tickets/new")
                  ? "sidebar__link--active"
                  : ""
              }`}
              onClick={onClose}
            >
              <PlusCircle size={19} strokeWidth={1.8} />
              <span>Create Ticket</span>
            </Link>
          )}
        </nav>

        <div className="sidebar__bottom">
          <div className="sidebar__help">
            <div className="sidebar__help-icon">
              <Headset size={20} />
            </div>

            <strong>
              {isAdmin ? "Support Management" : "Need assistance?"}
            </strong>

            <p>
              {isAdmin
                ? "Review and manage author support requests."
                : "Our support team is here to help."}
            </p>

            <Link
              to={isAdmin ? "/admin/tickets" : "/author/tickets/new"}
              onClick={onClose}
            >
              {isAdmin ? "View tickets ↗" : "Contact support ↗"}
            </Link>
          </div>

          {!isAdmin && (
            <Link
              to="/author/settings"
              className={`sidebar__link ${
                isActive("/author/settings")
                  ? "sidebar__link--active"
                  : ""
              }`}
              onClick={onClose}
            >
              <Settings size={19} strokeWidth={1.8} />
              <span>Settings</span>
            </Link>
          )}

          <button
            type="button"
            className="sidebar__link sidebar__logout"
            onClick={handleLogout}
          >
            <LogOut size={19} strokeWidth={1.8} />
            <span>Sign out</span>
          </button>

          <div className="sidebar__version">
            BOOKLEAF PORTAL · V1.0
          </div>
        </div>
      </aside>
    </>
  );
}