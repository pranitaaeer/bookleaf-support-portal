
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Demo form only; registration API abhi connected nahi hai.
    navigate("/login");
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
            <input id="name" required value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pranita Aeer" />
          </div>

          <div className="field">
            <label htmlFor="register-email">Email address</label>
            <input id="register-email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" />
          </div>

          <div className="field">
            <label htmlFor="register-password">Password</label>
            <input id="register-password" type="password" minLength={8}
              required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters" />
          </div>

          <button className="primary-btn" type="submit">Create account</button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
