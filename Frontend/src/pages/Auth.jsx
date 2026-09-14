import { useState, useEffect } from "react";
import RegistroForm from "../components/RegistroForm";
import LoginForm from "../components/LoginForm";
import { getImagenesPorTipo } from "../utils/apihelper";// Tu helper para traer imágenes

function Auth() {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png"); // fallback por si falla

  const abrirLogin = () => {
    setShowLogin(true);
  };

  useEffect(() => {
    // Traemos la imagen de tipo 'logo' desde la base de datos
    getImagenesPorTipo("logo")
      .then(data => {
        if (data.length > 0) setLogoUrl(data[0].url);
      })
      .catch(err => console.error("Error cargando logo:", err));
  }, []);

  return (
    <section className="banner-auth">
      <div className="banner-left d-flex flex-column justify-content-center align-items-center text-center">
        <img
          src={logoUrl}
          alt="Logo Level-Up Gamer"
          className="mb-4"
          style={{ maxWidth: "500px" }}
        />
        <h1 className="neon">Sube de nivel tu setup</h1>
        <p>
          Consolas, PC, periféricos y más.<br />
          Gana puntos LevelUp por compras y referidos.<br /><br />
          <span className="duoc-msg">
            Usuarios <strong>@duoc.cl</strong> obtienen{" "}
            <span className="accent">20% de descuento de por vida</span>.
          </span>
        </p>
      </div>

      <div className="banner-right">
        <div className="auth-box dark-card">
          <h2 className="mb-4">
            <i className="bi bi-person-circle me-2"></i>Bienvenido
          </h2>
          <button
            className="btn btn-accent w-100 mb-3"
            onClick={() => setShowRegister(true)}
          >
            <i className="bi bi-person-plus-fill me-2"></i>Crear cuenta
          </button>
          <button
            className="btn btn-outline-light w-100"
            onClick={() => setShowLogin(true)}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
          </button>
        </div>
      </div>

      {/* Modal Registro */}
      {showRegister && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content dark-card">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-person-plus-fill me-2"></i>Creación de cuenta
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowRegister(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <RegistroForm
                    onClose={() => setShowRegister(false)}
                    onUsuarioChange={() => window.dispatchEvent(new Event("usuarioCambiado"))}
                    abrirLogin={abrirLogin}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Login */}
      {showLogin && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content dark-card">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Inicio de sesión
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowLogin(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <LoginForm
                    onClose={() => setShowLogin(false)}
                    onUsuarioChange={() => window.dispatchEvent(new Event("usuarioCambiado"))}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Auth;
