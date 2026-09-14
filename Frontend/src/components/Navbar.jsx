import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getProductos, getCategorias } from "../utils/apihelper";

function Navbar({ cantidad, abrirCarrito, usuario }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productosOpen, setProductosOpen] = useState(false);
  const [usuarioOpen, setUsuarioOpen] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(usuario);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [imagenesCategoria, setImagenesCategoria] = useState({});

  const dropdownRef = useRef(null);
  const usuarioRef = useRef(null);
  const navRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleProductos = () => setProductosOpen(!productosOpen);
  const toggleUsuario = () => setUsuarioOpen(!usuarioOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prods = await getProductos();
        const cats = await getCategorias();

        setProductos(Array.isArray(prods) ? prods : []);
        setCategorias(Array.isArray(cats) ? cats : []);

        // Mapear imagen de producto por categoría
        const mapImg = {};
        cats.forEach((cat) => {
          const prodCat = prods.find(
            (p) => p.categoria?.nombre === cat.nombre && p.imagen
          );
          if (prodCat) mapImg[cat.nombre] = prodCat.imagen;
        });
        setImagenesCategoria(mapImg);
      } catch (err) {
        console.error("Error cargando productos o categorías:", err);
        setProductos([]);
        setCategorias([]);
        setImagenesCategoria({});
      }
    };
    fetchData();
  }, []);

  // Cerrar dropdowns al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setProductosOpen(false);
      if (usuarioRef.current && !usuarioRef.current.contains(event.target))
        setUsuarioOpen(false);
      if (navRef.current && !navRef.current.contains(event.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleUsuarioCambiado = () => {
      const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
      setUsuarioActual(usuarioLS || null);
    };
    window.addEventListener("usuarioCambiado", handleUsuarioCambiado);
    return () =>
      window.removeEventListener("usuarioCambiado", handleUsuarioCambiado);
  }, []);

  return (
    <nav
      ref={navRef}
      className="navbar navbar-expand-lg border-bottom border-secondary-subtle sticky-top"
      style={{ background: "#05050580", backdropFilter: "blur(8px)" }}
    >
      <div className="container">
        <Link className="navbar-brand brand neon active" to="/">
          <i className="bi bi-joystick me-2"></i>Level-Up Gamer
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="nav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`} id="nav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Dropdown de categorías */}
            <li className="nav-item position-relative" ref={dropdownRef}>
              <button
                className="nav-link btn btn-link text-decoration-none"
                onClick={toggleProductos}
                style={{ color: "white" }}
              >
                Categoría <i className="bi bi-chevron-down"></i>
              </button>

              {productosOpen && (
                <div
                  className="position-absolute bg-dark p-3 rounded shadow"
                  style={{
                    top: "100%",
                    left: 0,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: "10px",
                    minWidth: "320px",
                    zIndex: 2000,
                  }}
                >
                  <Link
                    key="ver-todos"
                    to="/categoria"
                    className="dropdown-item card-mini d-flex flex-column align-items-center justify-content-center p-2 bg-dark rounded hover-neon text-center"
                    onClick={() => setProductosOpen(false)}
                  >
                    <i className="bi bi-box-seam fs-2 mb-1"></i>
                    <span style={{ fontSize: "0.85rem" }}>Ver todos</span>
                  </Link>

                  {categorias
                    .filter((cat) =>
                      productos.some((p) => p.categoria?.nombre === cat.nombre)
                    )
                    .map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/categoria?categoria=${encodeURIComponent(cat.nombre)}`}
                        className="dropdown-item card-mini d-flex flex-column align-items-center justify-content-center p-2 bg-dark rounded hover-neon text-center"
                        onClick={() => setProductosOpen(false)}
                      >
                        {imagenesCategoria[cat.nombre] && (
                          <img
                            src={imagenesCategoria[cat.nombre]}
                            alt={cat.nombre}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "contain",
                              marginBottom: "5px",
                              borderRadius: "8px",
                            }}
                          />
                        )}
                        <span style={{ fontSize: "0.85rem" }}>{cat.nombre}</span>
                      </Link>
                    ))}
                </div>
              )}
            </li>

            {/* Links fijos */}
            <li className="nav-item"><Link className="nav-link neon-link" to="/ofertas">🔥 Ofertas</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/blog">Blog</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/eventos">Eventos</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/soporte">Soporte</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/nosotros">Nosotros</Link></li>
          </ul>

          {/* Carrito y usuario */}
          <div className="d-flex gap-2 align-items-center position-relative">
            <button className="btn btn-accent position-relative" onClick={abrirCarrito}>
              <i className="bi bi-cart3"></i>
              {cantidad > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                  {cantidad}
                </span>
              )}
            </button>

            {/* Usuario dropdown */}
            <div className="position-relative" ref={usuarioRef}>
              <button
                className="btn text-white"
                onClick={toggleUsuario}
                style={{
                  border: "1px solid #fff",
                  background: "transparent",
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                {usuarioActual?.nombre || "Invitado"}
                <i className="bi bi-caret-down-fill ms-1"></i>
              </button>

              {usuarioOpen && (
                <div
                  className="position-absolute bg-dark p-2 rounded shadow"
                  style={{ top: "110%", right: 0, minWidth: "150px", zIndex: 3000 }}
                >
                  {!usuarioActual ? (
                    <>
                      <Link to="/auth" className="dropdown-item text-white p-2 hover-neon" onClick={() => setUsuarioOpen(false)}>Iniciar sesión</Link>
                      <Link to="/auth" className="dropdown-item text-white p-2 hover-neon" onClick={() => setUsuarioOpen(false)}>Registrarse</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/perfil" className="dropdown-item text-white p-2 hover-neon" onClick={() => setUsuarioOpen(false)}>Perfil</Link>
                      {usuarioActual?.rol?.toLowerCase() === "admin" && (
                        <Link
                          to="/homeadmin"
                          className="dropdown-item text-white p-2 hover-neon"
                          onClick={() => setUsuarioOpen(false)}
                        >
                          Dashboard Admin
                        </Link>
                      )}

                      <button className="dropdown-item text-white p-2 hover-neon w-100 text-start" onClick={() => {
                        const carritoLS = JSON.parse(localStorage.getItem("carrito")) || [];
                        carritoLS.forEach((item) => {
                          const stockActual = Number(localStorage.getItem(`stock_${item.id}`)) || 0;
                          localStorage.setItem(`stock_${item.id}`, stockActual + item.cantidad);
                        });
                        localStorage.removeItem("carrito");
                        localStorage.removeItem("usuario");
                        window.dispatchEvent(new Event("usuarioCambiado"));
                        window.dispatchEvent(new Event("carritoCambiado"));
                        window.location.href = "/";
                      }}>Cerrar sesión</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
