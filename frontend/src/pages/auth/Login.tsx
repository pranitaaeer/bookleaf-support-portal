
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import api from "../../services/api";

function getDashboardPath(role: string | undefined) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "author") return "/author/dashboard";
  return null;
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  // If a valid session already exists, skip the login page.
  useEffect(() => {
    let active = true;

    async function checkSession() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (active) setCheckingSession(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const user = response.data?.user;
        const dashboard = getDashboardPath(user?.role);

        if (!dashboard) {
          throw new Error("Invalid user role");
        }

        localStorage.setItem("user", JSON.stringify(user));

        if (active) {
          navigate(dashboard, { replace: true });
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (active) setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;
      const token = data?.token ?? data?.data?.token;
      const user = data?.user ?? data?.data?.user;

      if (!token || !user) {
        throw new Error("Invalid login response. Token or user is missing.");
      }

      const dashboard = getDashboardPath(user.role ?? user.userRole);

      if (!dashboard) {
        throw new Error("Invalid user role received from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(data.message || "Login successful!");
      navigate(dashboard, { replace: true });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

        const message =
          apiError.response?.data?.message ||
          "Login failed. Please check your credentials.";

        setError(message);
        toast.error(message);
      } else {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to connect to the server. Please try again.";

        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return <main className="portal-page auth-page">Checking session...</main>;
  }

  return (
    <main className="portal-page auth-page">
      <section className="auth-card">
        <div className="brand">BookLeaf Author Studio</div>

        <h1>Welcome back</h1>
        <p>Sign in to manage your books, royalties, and support tickets.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading || checkingSession}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          New to BookLeaf? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
