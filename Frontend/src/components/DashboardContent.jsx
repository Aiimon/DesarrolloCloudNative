import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8082/v2"; // Puerto correcto
const STOCK_CRITICO = 5;

const MetricCard = ({ title, value, icon, detail, color, textColor }) => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div
      className="p-4 rounded shadow"
      style={{ backgroundColor: color, color: textColor }}
    >
      <div className="d-flex align-items-center mb-2">
        <i className={`${icon} fa-2x me-3`}></i>
        <div>
          <h5 className="mb-0">{title}</h5>
          <h2 className="fw-bold">{value}</h2>
        </div>
      </div>
      <small>{detail}</small>
    </div>
  </div>
);

const FeatureCard = ({ title, id, icon, desc, path }) => (
  <Link
    to={path}
    className="col-lg-3 col-md-6 mb-4 text-decoration-none text-light"
    id={id}
  >
    <div className="p-3 rounded shadow bg-dark h-100">
      <i className={`${icon} fa-2x mb-2`}></i>
      <h5 className="text-light">{title}</h5>
      <p className="text-muted">{desc}</p>
    </div>
  </Link>
);

function DashboardContent() {
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatNumber = (num) => num.toLocaleString("es-CL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const productosResponse = await fetch(
        `${API_BASE_URL}/productos/todos`
      );
      const usuariosResponse = await fetch(
        `${API_BASE_URL}/usuarios/todos`
      );

      if (!productosResponse.ok || !usuariosResponse.ok) {
        throw new Error("Error al obtener datos de la API.");
      }

      const productosData = await productosResponse.json();
      const usuariosData = await usuariosResponse.json();

      setProductos(productosData);
      setUsuarios(usuariosData);
    } catch (err) {
      console.error("Error Dashboard:", err);
      setError("No se pudo conectar a la API para cargar las métricas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // METRICAS
  const totalProductos = productos.length;
  const inventarioActual = productos.reduce(
    (sum, p) => sum + (p.stock ?? p.STOCK ?? 0),
    0
  );
  const totalUsuarios = usuarios.length;
  const nuevosUsuariosEsteMes = 120; // Mock

  const metricCards = [
    {
      title: "Compras",
      value: "1,234",
      icon: "fas fa-shopping-cart",
      detail: "Probabilidad de aumento: 20%",
      color: "#39FF14",
      textColor: "black",
    },
    {
      title: "Productos",
      value: formatNumber(totalProductos),
      icon: "fas fa-box",
      detail: `Inventario actual: ${formatNumber(inventarioActual)}`,
      color: "#1E90FF",
      textColor: "black",
    },
    {
      title: "Usuarios",
      value: formatNumber(totalUsuarios),
      icon: "fas fa-users",
      detail: `Nuevos usuarios este mes: ${nuevosUsuariosEsteMes}`,
      color: "#39FF14",
      textColor: "black",
    },
  ];

  const featureCardsTop = [
    {
      title: "Dashboard",
      id: "fc-dashboard",
      icon: "fas fa-tachometer-alt",
      path: "/homeadmin",
      desc: "Visión general del sistema.",
    },
    {
      title: "Productos",
      id: "fc-prod",
      icon: "fas fa-box",
      path: "/homeadmin/productos",
      desc: "Administrar productos.",
    },
    {
      title: "Usuarios",
      id: "fc-users",
      icon: "fas fa-users",
      path: "/homeadmin/usuarios",
      desc: "Gestión de usuarios.",
    },
    {
      title: "Categorías",
      id: "fc-cat",
      icon: "fas fa-tags",
      path: "/homeadmin/categorias",
      desc: "Clasificación de productos.",
    },
  ];

  return (
    <div
      className="admin-content-wrapper p-4 flex-grow-1"
      style={{ backgroundColor: "#000" }}
    >
      <h1 className="text-light h4 mb-1">Dashboard</h1>
      <p className="text-muted mb-4">Resumen de las actividades diarias</p>

      {loading && (
        <div className="text-center text-warning p-4">
          <i className="fas fa-spinner fa-spin me-2"></i>
          Cargando métricas desde la API...
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          <div className="row mb-4">
            {metricCards.map((card, i) => (
              <MetricCard key={i} {...card} />
            ))}
          </div>

          <div className="row mb-4">
            {featureCardsTop.map((card) => (
              <FeatureCard key={card.id} {...card} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardContent;
