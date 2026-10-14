import { Bell, Menu, Search, ChevronDown } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
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
          <span>Author Studio</span>
          <span className="topbar__separator">/</span>
          <strong>Dashboard</strong>
        </div>
      </div>

      <div className="topbar__right">
        <button className="topbar__search" aria-label="Search">
          <Search size={17} />
          <span>Search anything...</span>
          <kbd>⌘ K</kbd>
        </button>

        <button className="icon-button topbar__notification" aria-label="Notifications">
          <Bell size={19} />
          <span />
        </button>

        <div className="topbar__divider" />

        <button className="topbar__profile">
          <div className="avatar">PA</div>
          <div className="topbar__profile-info">
            <strong>Pranita Aeer</strong>
            <span>Author account</span>
          </div>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}