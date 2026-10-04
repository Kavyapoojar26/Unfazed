import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  IndianRupee,
  Receipt,
  TrendingUp,
  Bell,
  LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { therapist, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const workspaceItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      label: "Appointments",
      path: "/appointments",
      icon: CalendarDays
    },
    {
      label: "Clients",
      path: "/clients",
      icon: Users
    }
  ];

  const practiceItems = [
    {
      label: "Clinical Notes",
      path: "/clinical-notes",
      icon: FileText
    },
    {
      label: "Payments",
      path: "/payments",
      icon: IndianRupee
    },
    {
      label: "Invoices",
      path: "/invoices",
      icon: Receipt
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: TrendingUp
    }
  ];

  const communicationItems = [
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell
    }
  ];

  const renderItems = (items) =>
    items.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Icon size={19} strokeWidth={1.8} />
          <span>{item.label}</span>
        </NavLink>
      );
    });

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">U</div>

        <div className="brand-name">
          <strong>UNFAZED</strong>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-heading">WORKSPACE</div>
        <nav>{renderItems(workspaceItems)}</nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-heading">PRACTICE</div>
        <nav>{renderItems(practiceItems)}</nav>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-heading">COMMUNICATION</div>
        <nav>{renderItems(communicationItems)}</nav>
      </div>

      <div className="sidebar-footer">
        <div className="therapist-avatar">
          {(therapist?.name || "T").charAt(0).toUpperCase()}
        </div>

        <div className="therapist-info">
          <strong>{therapist?.name || "Therapist"}</strong>
          <span>Professional Plan</span>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;