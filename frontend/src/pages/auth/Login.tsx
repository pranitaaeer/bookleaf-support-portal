
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Frontend demo only: real authentication backend connect hone par aayegi.
    navigate("/author/dashboard");
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

          <button className="primary-btn" type="submit">Sign in</button>
        </form>

        <p className="auth-footer">
          New to BookLeaf? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
