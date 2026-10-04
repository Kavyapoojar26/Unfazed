import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CreditCard,
  UserPlus,
  Check,
  CheckCheck,
  Search
} from "lucide-react";

import api from "../services/api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/notifications");

        const data = response.data;

        const notificationList =
          Array.isArray(data)
            ? data
            : Array.isArray(data.notifications)
              ? data.notifications
              : Array.isArray(data.data)
                ? data.data
                : [];

        setNotifications(notificationList);
      } catch (error) {
        console.error(
          "Failed to load notifications:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load notifications. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const getNotificationType = (notification) => {
    return (
      notification.type ||
      notification.category ||
      "appointment"
    ).toLowerCase();
  };

  const getTitle = (notification) => {
    return (
      notification.title ||
      notification.subject ||
      "Practice notification"
    );
  };

  const getDescription = (notification) => {
    return (
      notification.description ||
      notification.message ||
      notification.body ||
      "You have a new practice update."
    );
  };

  const getReadState = (notification) => {
    if (
      notification.read === true ||
      notification.isRead === true ||
      notification.readAt
    ) {
      return false;
    }

    if (
      notification.unread === true ||
      notification.isRead === false
    ) {
      return true;
    }

    return false;
  };

  const formatTime = (notification) => {
    const value =
      notification.createdAt ||
      notification.timestamp ||
      notification.date ||
      notification.updatedAt;

    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const now = new Date();
    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / (1000 * 60)
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${
        hours === 1 ? "" : "s"
      } ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getIcon = (type) => {
    if (type === "client") {
      return <UserPlus size={19} />;
    }

    if (type === "payment") {
      return <CreditCard size={19} />;
    }

    return <CalendarDays size={19} />;
  };

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notifications;
    }

    return notifications.filter(
      (notification) => {
        const title =
          getTitle(notification).toLowerCase();

        const description =
          getDescription(notification).toLowerCase();

        const type =
          getNotificationType(notification);

        return (
          title.includes(query) ||
          description.includes(query) ||
          type.includes(query)
        );
      }
    );
  }, [notifications, search]);

  const unreadCount = notifications.filter(
    (notification) =>
      getReadState(notification)
  ).length;

  const handleLocalMarkAsRead = (notification) => {
    setNotifications((current) =>
      current.map((item) => {
        const itemId =
          item._id || item.id;

        const notificationId =
          notification._id ||
          notification.id;

        if (
          itemId &&
          notificationId &&
          itemId === notificationId
        ) {
          return {
            ...item,
            unread: false,
            isRead: true,
            read: true
          };
        }

        return item;
      })
    );
  };

  const handleLocalMarkAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
        isRead: true,
        read: true
      }))
    );
  };

  return (
    <div className="dashboard-page notifications-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">
            COMMUNICATION
          </p>

          <h1>
            Notifications
          </h1>

          <p className="dashboard-subtitle">
            Stay updated with activity across your practice.
          </p>

        </div>

        <div className="header-actions">

          <button
            className="new-button"
            onClick={handleLocalMarkAllAsRead}
            disabled={
              loading ||
              notifications.length === 0 ||
              unreadCount === 0
            }
          >
            <CheckCheck size={17} />
            Mark all as read
          </button>

        </div>

      </header>

      {/* ERROR */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* NOTIFICATION SUMMARY */}

      <section className="notification-summary-grid">

        <div className="notification-summary-card">

          <div className="notification-summary-icon">
            <Bell size={20} />
          </div>

          <div>
            <span>
              Total notifications
            </span>

            <strong>
              {loading
                ? "—"
                : notifications.length}
            </strong>
          </div>

        </div>

        <div className="notification-summary-card">

          <div className="notification-summary-icon">
            <Bell size={20} />
          </div>

          <div>
            <span>
              Unread
            </span>

            <strong>
              {loading
                ? "—"
                : unreadCount}
            </strong>
          </div>

        </div>

      </section>

      {/* NOTIFICATIONS */}

      <div className="dashboard-card notifications-card">

        <div className="notifications-toolbar">

          <div>
            <h2>
              Recent notifications
            </h2>

            <p>
              {loading
                ? "Loading notifications..."
                : `${filteredNotifications.length} notifications shown`}
            </p>
          </div>

          <div className="notifications-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        <div className="notification-list">

          {loading ? (

            <div className="empty-state">
              Loading notifications...
            </div>

          ) : filteredNotifications.length === 0 ? (

            <div className="empty-state">
              {search
                ? "No notifications match your search."
                : "No notifications found."}
            </div>

          ) : (

            filteredNotifications.map(
              (notification, index) => {

                const unread =
                  getReadState(notification);

                const type =
                  getNotificationType(
                    notification
                  );

                return (
                  <div
                    className={`notification-row ${
                      unread ? "unread" : ""
                    }`}
                    key={
                      notification._id ||
                      notification.id ||
                      `${getTitle(
                        notification
                      )}-${index}`
                    }
                  >

                    <div className="notification-icon">
                      {getIcon(type)}
                    </div>

                    <div className="notification-content">

                      <div className="notification-title-row">

                        <strong>
                          {getTitle(
                            notification
                          )}
                        </strong>

                        {unread && (
                          <span className="notification-unread-dot"></span>
                        )}

                      </div>

                      <p>
                        {getDescription(
                          notification
                        )}
                      </p>

                      <span className="notification-time">
                        {formatTime(
                          notification
                        )}
                      </span>

                    </div>

                    {unread && (

                      <button
                        className="notification-read-button"
                        title="Mark as read"
                        onClick={() =>
                          handleLocalMarkAsRead(
                            notification
                          )
                        }
                      >
                        <Check size={16} />
                      </button>

                    )}

                  </div>
                );
              }
            )

          )}

        </div>

        <div className="notifications-footer">

          <span>
            {loading
              ? "Loading..."
              : `Showing ${filteredNotifications.length} of ${notifications.length} notifications`}
          </span>

        </div>

      </div>

    </div>
  );
}

export default Notifications;