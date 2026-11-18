import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveSession } from "../../services/session.js";
import { PawPrint, ChevronRight, HelpCircle, Loader2 } from "lucide-react";
import { login } from "../../services/authService.js";
import { demoUsers, DEMO_PASSWORD } from "./demoUsers.js";
import heroImg from "../../assets/hero.png";
import "./loginPage.css";

const TEAM = [
  { label: "LV", bg: "#f9e0d6" },
  { label: "CR", bg: "#dbe8f5" },
  { label: "JM", bg: "#eadcf3" },
  { label: "+9", bg: "#e3efe9" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login({ email, password });
      saveSession(session, remember);
      navigate(session.user.home, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (user) => {
    setEmail(user.email);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  return (
    <main className="login">
      {/* ───────── Panel izquierdo ───────── */}
      <section
        className="login__hero"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="login__hero-overlay" />

        <div className="login__hero-content">
          <header className="brand">
            <div className="brand__icon">
              <PawPrint size={24} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="brand__name">huella</h2>
              <p className="brand__tag">Clínica veterinaria 24/7</p>
            </div>
          </header>

          <div className="hero-copy">
            <span className="status">
              <i className="status__dot" />
              Cuidado siempre disponible
            </span>
            <h1 className="hero-copy__title">
              Su bienestar es nuestra prioridad, a cualquier hora.
            </h1>
            <p className="hero-copy__text">
              Una plataforma para conectar a todo el equipo de Huella con las
              familias que confían en nosotros.
            </p>
          </div>

          <footer className="team">
            <div className="team__avatars">
              {TEAM.map((m) => (
                <span key={m.label} style={{ background: m.bg }}>
                  {m.label}
                </span>
              ))}
            </div>
            <div>
              <strong>Equipo médico de turno</strong>
              <p>12 profesionales disponibles ahora</p>
            </div>
          </footer>
        </div>
      </section>

      {/* ───────── Panel derecho ───────── */}
      <section className="login__panel">
        <div className="login__card">
          <h1 className="login__title">Bienvenido a Huella</h1>
          <p className="login__subtitle">
            Ingresa tus credenciales para acceder a tu espacio.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nombre@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="row">
              <label className="check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="check__box" />
                Recordarme
              </label>
              <a href="#" className="link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <>
                  Ingresar a mi cuenta <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
          
          <p className="login__legal">
            Acceso seguro y protegido · Huella Clínica Veterinaria
          </p>
        </div>

        <button type="button" className="help" aria-label="Ayuda">
          <HelpCircle size={22} />
        </button>
      </section>
    </main>
  );
}