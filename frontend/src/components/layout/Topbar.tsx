import { useEffect, useState } from "react";
import { Bell, Menu, Search, ChevronDown } from "lucide-react";
import api from "../../services/api";

interface TopbarProps {
  onMenuClick: () => void;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "author";
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCurrentUser() {
      try {
        const response = await api.get("/auth/me");

        if (!cancelled && response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          console.error("Failed to fetch current user:", error);
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false);
        }
      }
    }

    void fetchCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = userLoading
    ? "Loading..."
    : user?.name || "User";

  const displayRole = userLoading
    ? "Loading profile"
    : user?.role === "admin"
      ? "Administrator"
      : user?.role === "author"
        ? "Author"
        : "Not signed in";

  const avatarText =
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "...";

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="icon-button topbar__menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="topbar__breadcrumb">
          <span>BookLeaf</span>
          <span className="topbar__separator">/</span>
          <strong>
            {user?.role === "admin"
              ? "Admin Dashboard"
              : "Author Dashboard"}
          </strong>
        </div>
      </div>

      <div className="topbar__right">
        <button
          className="topbar__search"
          aria-label="Search"
          type="button"
        >
          <Search size={17} />
          <span>Search anything...</span>
          <kbd>Ctrl K</kbd>
        </button>

        <button
          className="icon-button topbar__notification"
          aria-label="Notifications"
          type="button"
        >
          <Bell size={19} />
          <span />
        </button>

        <div className="topbar__divider" />

        <button
          className="topbar__profile"
          aria-label="User profile"
          type="button"
        >
          <div className="avatar">{avatarText}</div>

          <div className="topbar__profile-info">
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}