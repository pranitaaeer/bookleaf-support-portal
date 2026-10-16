import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react";
import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      toast.success(
        response.data?.message || "Account created successfully!"
      );

      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        toast.error(
          apiError.response?.data?.message ||
            "Registration failed. Please try again."
        );
      } else {
        toast.error(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-page auth-page">
      <section className="auth-card">
        <div className="brand">BookLeaf Author Studio</div>

        <h1>Create your account</h1>
        <p>Register to keep your publishing activity in one place.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}