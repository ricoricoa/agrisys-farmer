import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";
import useRealtimeRefresh from "../hooks/useRealtimeRefresh.js";

const farmerLinks = [
  { group: "Workspace", label: "Overview", href: "#farmer", tag: "Home" },
  { label: "My Profile & Land", href: "#profile", tag: "Land" },
  { label: "GPS Farm Mapping", href: "#farm-mapping", tag: "Map" },
  { label: "Crop Detection", href: "#crop-detection", tag: "Scan" },
  { label: "Detection History", href: "#crop-history", tag: "History" },
  { label: "Farm Reports", href: "#farm-reports", tag: "Farms" },
  { group: "Reports", label: "Report Damage", href: "#report", tag: "Report" },
  { label: "My Reports", href: "#my-reports", tag: "Reports" },
  { group: "Updates", label: "Weather Condition", href: "#weather", tag: "Weather" },
  { label: "Notifications", href: "#notifications", tag: "Alerts" },
];

function NavigationIcon({ tag }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  let icon;

  switch (tag) {
    case "Home":
      icon = <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />;
      break;
    case "Land":
      icon = <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c.6-3.3 3.1-5.2 7-5.2s6.4 1.9 7 5.2" /></>;
      break;
    case "Map":
      icon = <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" /><path d="M9 3v15M15 6v15" /></>;
      break;
    case "Scan":
      icon = <path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10" />;
      break;
    case "History":
      icon = <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>;
      break;
    case "Report":
      icon = <><path d="m12 3 9 16H3z" /><path d="M12 9v4M12 16h.01" /></>;
      break;
    case "Weather":
      icon = <path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z" />;
      break;
    case "Alerts":
      icon = <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />;
      break;
    default:
      icon = <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" /></>;
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="app-nav-svg h-5 w-5 shrink-0"
      {...common}
    >
      {icon}
    </svg>
  );
}

function HeaderBell() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[21px] w-[21px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
  );
}

export default function AppShell({ children, onLogout }) {
  const activeHash = window.location.hash || "#farmer";
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const currentSession = JSON.parse(
    localStorage.getItem("agrisystem-session") || "null",
  );
  const currentUser = currentSession?.user || {};
  const token = currentSession?.token;
  const profileName = currentUser.fullName
    || currentUser.full_name
    || "Farmer account";
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();

  const loadUnreadNotifications = useCallback(() => {
    if (!token) return Promise.resolve();

    return api("/notifications/mine", { token })
      .then(data => {
        setUnreadNotifications(
          data.notifications.filter(item => !item.read_at).length,
        );
      })
      .catch(() => setUnreadNotifications(0));
  }, [token]);

  useEffect(() => {
    loadUnreadNotifications();
  }, [loadUnreadNotifications]);

  useRealtimeRefresh(token, loadUnreadNotifications);

  const profileCard = (
    <>
      <span className="app-user-avatar" aria-hidden="true">
        {profileInitials || "U"}
      </span>
      <span className="app-user-details">
        <span className="app-user-name">{profileName}</span>
        <span className="app-user-role">Farmer</span>
      </span>
    </>
  );

  return (
    <div className="app-shell min-h-screen">
      <header className="app-header sticky top-0 z-30 border-b text-white">
        <div className="app-header-inner mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-7">
          <a
            href="#farmer"
            className="app-brand flex min-w-0 items-center"
            aria-label="AgriSystem home"
          >
            <span className="app-brand-logo flex shrink-0 items-center justify-center overflow-hidden">
              <img
                src="/icons/agrisystem-icon.svg"
                alt=""
                className="h-full w-full object-contain"
              />
            </span>
            <span className="app-brand-copy min-w-0">
              <span className="app-brand-heading flex min-w-0 items-center">
                <span className="app-brand-title block truncate font-extrabold">
                  <span className="app-brand-agri">Agri</span>
                  <span className="app-brand-system">System</span>
                </span>
              </span>
            </span>
          </a>

          <div className="app-header-actions">
            <a
              href="#notifications"
              className="app-notification-link"
              aria-label={`Notifications, ${unreadNotifications} unread`}
              title="Notifications"
            >
              <HeaderBell />
              {unreadNotifications > 0 && (
                <span className="app-notification-count">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </a>

            <a
              href="#profile"
              className="app-user-block"
              aria-label="Open profile and land"
            >
              {profileCard}
            </a>

            <button
              onClick={onLogout}
              className="app-signout shrink-0 rounded-lg border px-3 py-2 text-sm font-bold text-white transition focus:outline-none focus:ring-2 focus:ring-lime-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="app-sidebar border-b shadow-sm backdrop-blur lg:sticky lg:top-[66px] lg:self-start lg:border-b-0 lg:border-r lg:shadow-none">
          <nav
            aria-label="Farmer portal navigation"
            className="p-3 lg:p-4"
          >
            <div className="app-workspace-block flex items-start gap-3 border-b border-slate-200 px-3 py-4">
              <span className="app-workspace-icon" aria-hidden="true">
                <NavigationIcon tag="Land" />
              </span>
              <div className="min-w-0">
                <p className="app-workspace-title">Farmer Workspace</p>
                <p className="app-workspace-description">
                  Manage land records, crop reports, weather, and service updates.
                </p>
              </div>
            </div>

            <div className="app-nav-items flex flex-wrap lg:mt-3">
              {farmerLinks.map((link, index) => (
                <div
                  key={link.href}
                  className={`shrink-0 ${link.group ? "lg:mt-3" : ""}`}
                >
                  {link.group && (
                    <p
                      className={`hidden px-3 pb-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400 lg:block ${
                        index === 0 ? "lg:mt-0" : ""
                      }`}
                    >
                      {link.group}
                    </p>
                  )}
                  <a
                    href={link.href}
                    aria-current={activeHash === link.href ? "page" : undefined}
                    className={`app-nav-link group flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium ${
                      activeHash !== link.href
                        ? "border border-transparent"
                        : ""
                    }`}
                  >
                    <span className="app-nav-icon">
                      <NavigationIcon tag={link.tag} />
                    </span>
                    <span className="min-w-0 flex-1 break-words leading-5">
                      {link.label}
                    </span>
                    {link.href === "#notifications"
                      && unreadNotifications > 0 && (
                        <span
                          aria-label={`${unreadNotifications} unread notifications`}
                          className={`ml-auto flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                            activeHash === link.href
                              ? "bg-lime-300 text-emerald-950"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {unreadNotifications > 99 ? "99+" : unreadNotifications}
                        </span>
                      )}
                  </a>
                </div>
              ))}
            </div>
          </nav>
        </aside>

        <main className="app-main min-w-0 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <div className="app-page-container mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}