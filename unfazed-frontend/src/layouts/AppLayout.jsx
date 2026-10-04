import { NavLink, Outlet, useNavigate } from "react-router-dom";
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

import { useAuth } from "../context/AuthContext";

function AppLayout() {
  const { therapist, logout } = useAuth();
  const navigate = useNavigate();

  const therapistName =
    therapist?.name || "Therapist";

  const initials = therapistName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const therapistSlug =
    therapist?.slug ||
    therapist?.publicSlug;

  const handleProfileClick = () => {
    if (!therapistSlug) {
      return;
    }

    navigate(`/therapist/${therapistSlug}`);
  };

  const navigation = [
    {
      section: "WORKSPACE",
      items: [
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
      ]
    },
    {
      section: "PRACTICE",
      items: [
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
      ]
    },
    {
      section: "COMMUNICATION",
      items: [
        {
          label: "Notifications",
          path: "/notifications",
          icon: Bell
        }
      ]
    }
  ];

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">

        {/* BRAND */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            U
          </div>

          <span>UNFAZED</span>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">

          {navigation.map((group) => (
            <div
              className="sidebar-nav-group"
              key={group.section}
            >
              <div className="nav-section-title">
                {group.section}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-item ${
                        isActive ? "active" : ""
                      }`
                    }
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                    />

                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}

        </nav>

        {/* PROFILE */}
        <div
          className="sidebar-profile"
          onClick={handleProfileClick}
          role={therapistSlug ? "button" : undefined}
          tabIndex={therapistSlug ? 0 : undefined}
          onKeyDown={(event) => {
            if (
              therapistSlug &&
              (event.key === "Enter" ||
                event.key === " ")
            ) {
              event.preventDefault();
              handleProfileClick();
            }
          }}
          title={
            therapistSlug
              ? "View public therapist profile"
              : "Therapist profile unavailable"
          }
          style={{
            cursor: therapistSlug
              ? "pointer"
              : "default"
          }}
        >

          <div className="profile-avatar">
            {initials}
          </div>

          <div className="profile-info">
            <strong>{therapistName}</strong>
            <span>Professional Plan</span>
          </div>

        </div>

        {/* LOGOUT */}
        <button
          className="sidebar-logout"
          onClick={logout}
          type="button"
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="app-main">
        <Outlet />
      </main>

    </div>
  );
}

export default AppLayout;