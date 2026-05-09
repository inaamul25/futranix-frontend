import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <section className="hero auth-grid">
      <div className="auth-copy">
        <p className="eyebrow">Futranix Academy</p>
        <h1>Build mastery through structured learning.</h1>
        <p className="hero-copy">
          Learn in a cleaner, guided way with modular lessons, stronger progress flow, and a
          workspace that feels focused instead of overwhelming.
        </p>
        <div className="feature-band">
          <div className="feature-chip">
            <span>Smart uploads</span>
            <strong>Batch videos become ready-to-edit modules</strong>
          </div>
          <div className="feature-chip">
            <span>Progress memory</span>
            <strong>Resume exactly where you stopped</strong>
          </div>
        </div>
      </div>
      <form className="card form-card auth-panel" onSubmit={submit}>
        <div className="auth-panel-header">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>{mode === "login" ? "Enter Futranix Academy" : "Create your Futranix Academy account"}</h2>
          </div>
          <div className="tab-row">
            <button type="button" className={mode === "login" ? "active-tab" : ""} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "register" ? "active-tab" : ""} onClick={() => setMode("register")}>Register</button>
          </div>
        </div>
        <p className="auth-helper">
          {mode === "login"
            ? "Sign in to continue your progress, discussions, and creator workspace."
            : "Create an account to learn, build courses, or manage your own Futranix Academy workspace."}
        </p>
        <div className="field-stack">
          {mode === "register" && (
            <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          )}
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {mode === "register" && (
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STUDENT">Student</option>
              <option value="CREATOR">Creator</option>
            </select>
          )}
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="primary-button auth-submit" type="submit">{mode === "login" ? "Sign In" : "Create Account"}</button>
      </form>
    </section>
  );
}
