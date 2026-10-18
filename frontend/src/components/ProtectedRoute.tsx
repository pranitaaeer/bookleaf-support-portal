
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../services/api";

type UserRole = "author" | "admin";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: UserRole;
}

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);

  const location = useLocation();

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) {
          setAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const user = response.data?.user;

        if (
          !user ||
          (user.role !== "author" && user.role !== "admin")
        ) {
          throw new Error("Invalid user session");
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (active) {
          setRole(user.role);
          setAuthenticated(true);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (active) {
          setAuthenticated(false);
          setRole(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div>Checking session...</div>;
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRole && role !== allowedRole) {
    return (
      <Navigate
        to={role === "admin" ? "/admin/dashboard" : "/author/dashboard"}
        replace
      />
    );
  }

  return <>{children}</>;
}
