import { useEffect, useState } from "react";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
} from "./pages/AuthPages.jsx";
import {
  DamageReportPage,
  FarmerDashboard,
  MyReportsPage,
  NotificationsPage,
  ProfileLandPage,
  WeatherPage,
} from "./pages/FarmerPages.jsx";
import {
  CropDetectionHistoryPage,
  CropDetectionPage,
} from "./pages/CropDetectionPages.jsx";
import FarmMappingPage from "./pages/FarmMappingPage.jsx";
import FarmReportsPage from "./pages/FarmReportsPage.jsx";
import { api } from "./services/api.js";

function readSession() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("agrisystem-session") || "null",
    );

    if (!stored?.token || !stored?.user?.role) return null;
    return stored;
  } catch {
    localStorage.removeItem("agrisystem-session");
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const [checkingSessionRole, setCheckingSessionRole] = useState(
    () => Boolean(readSession()?.token),
  );
  const [route, setRoute] = useState(
    () => window.location.hash || "#login",
  );

  useEffect(() => {
    const changeRoute = () => {
      setRoute(window.location.hash || "#login");
    };

    window.addEventListener("hashchange", changeRoute);

    return () => {
      window.removeEventListener("hashchange", changeRoute);
    };
  }, []);

  useEffect(() => {
    if (!session?.token) {
      setCheckingSessionRole(false);
      return undefined;
    }

    let active = true;
    setCheckingSessionRole(true);

    api("/auth/me", { token: session.token })
      .then(({ user }) => {
        if (!active || !user?.role) return;

        const verified = {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            fullName: user.full_name,
            role: user.role,
            contactNumber: user.contact_number,
          },
        };

        localStorage.setItem(
          "agrisystem-session",
          JSON.stringify(verified),
        );
        setSession(verified);
      })
      .catch(() => {
        if (!active) return;

        localStorage.removeItem("agrisystem-session");
        setSession(null);

        if (window.location.hash !== "#login") {
          window.location.hash = "#login";
        }
      })
      .finally(() => {
        if (active) setCheckingSessionRole(false);
      });

    return () => {
      active = false;
    };
  }, [session?.token]);

  function login(result) {
    const next = {
      token: result.token,
      user: result.user,
    };

    localStorage.setItem("agrisystem-session", JSON.stringify(next));
    setCheckingSessionRole(true);
    setSession(next);
    window.location.hash = "#farmer";
  }

  function logout() {
    localStorage.removeItem("agrisystem-session");
    setSession(null);
    setCheckingSessionRole(false);
    window.location.hash = "#login";
  }

  if (route === "#register") {
    return (
      <RegisterPage
        onLogin={login}
        onNavigate={hash => {
          window.location.hash = hash;
        }}
      />
    );
  }

  if (route === "#forgot-password") {
    return (
      <ForgotPasswordPage
        onNavigate={hash => {
          window.location.hash = hash;
        }}
      />
    );
  }

  if (route === "#login") {
    return (
      <LoginPage
        onLogin={login}
        onNavigate={hash => {
          window.location.hash = hash;
        }}
      />
    );
  }

  if (!session) {
    return (
      <LoginPage
        onLogin={login}
        onNavigate={hash => {
          window.location.hash = hash;
        }}
      />
    );
  }

  if (checkingSessionRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-6">
        <p className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          Checking your account access…
        </p>
      </div>
    );
  }

  if (session.user.role !== "farmer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f5] p-6">
        <section className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Farmer accounts only
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This application is for farmer accounts. Sign out and use a farmer
            account to continue.
          </p>
          <button
            type="button"
            onClick={logout}
            className="button mt-5 !w-auto"
          >
            Sign out
          </button>
        </section>
      </div>
    );
  }

  const props = {
    token: session.token,
    onLogout: logout,
  };

  switch (route) {
    case "#profile":
      return <ProfileLandPage {...props} />;

    case "#farm-mapping":
      return <FarmMappingPage {...props} />;

    case "#farm-reports":
      return <FarmReportsPage {...props} />;

    case "#crop-detection":
      return <CropDetectionPage {...props} />;

    case "#crop-history":
      return <CropDetectionHistoryPage {...props} />;

    case "#report":
      return <DamageReportPage {...props} />;

    case "#my-reports":
      return <MyReportsPage {...props} />;

    case "#weather":
      return <WeatherPage {...props} />;

    case "#notifications":
      return <NotificationsPage {...props} />;

    case "#farmer":
    default:
      return <FarmerDashboard {...props} />;
  }
}