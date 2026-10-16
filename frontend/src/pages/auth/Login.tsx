import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import api from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const token = data.token ?? data.data?.token;
      const user = data.user ?? data.data?.user;

      if (!token) {
        throw new Error(
          data.message || "Token not found in login response."
        );
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      toast.success(data.message || "Login successful!");
      const role = user?.role ?? user?.userRole;

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/author/dashboard");
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: { data?: { message?: string } };
        };

         toast.error(
        apiError.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
       } else {
      toast.error("Unable to connect to the server. Please try again.");
    }
    } finally {
      setLoading(false);
    }
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
            disabled={loading}
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