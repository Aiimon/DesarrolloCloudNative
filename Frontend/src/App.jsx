import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./App.css";
import {
  getProductos,
  getCategorias,
  agregarAlCarrito,
  obtenerCarrito,
  actualizarItemCarrito,
  eliminarItemCarrito,
  getOrderStatus,
  sendOrderEvent,
} from "./utils/apihelper";

import Navbar from "./components/Navbar";
import CarritoSidebar from "./components/CarritoSidebar";
import BotonWsp from "./components/BotonWsp";
import BuscadorAvanzado from "./components/BuscadorAvanzado";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Categoria from "./pages/Categoria";
import Ofertas from "./pages/Ofertas";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import Eventos from "./pages/Eventos";
import Soporte from "./pages/Soporte";
import Detalles from "./pages/Detalles";
import Termino from "./pages/Termino";
import Privacidad from "./pages/Privacidad";
import Checkout from "./pages/Checkout";
import Carro from "./pages/Carro";
import Boleta from "./pages/Boleta";
import Perfil from "./pages/Perfil";
import ProteccionUser from "./components/ProteccionUser";
import HomeAdmin from "./pages/HomeAdmin";
import PerfilAdmin from "./pages/Perfiladmin";
import CategoriaAdmin from "./pages/Categoria_Admin";
import EditarProducto from "./pages/EditarProducto";
import EditarUser from "./pages/EditarUser";
import NuevoProducto from "./pages/NuevoProducto";
import NuevoUsuario from "./pages/NuevoUsuario";
import Productosadmin from "./pages/Productosadmin";
import Usuariosadmin from "./pages/Usuariosadmin";

// Helper robusto para extraer la información de usuario contemplando estructuras con Tenant
const obtenerUsuarioLS = () => {
  try {
    const stored = localStorage.getItem("usuario");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.usuario || parsed?.user || parsed?.data || parsed;
  } catch (e) {
    console.error("Error al parsear el usuario de localStorage:", e);
    return null;
  }
};

function Layout() {
  const location = useLocation();
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);

  // Estado de usuario tolerante a Tenant
  const [usuario, setUsuario] = useState(() => obtenerUsuarioLS());

  // Estados de monitoreo de RabbitMQ
  const [backendStatus, setBackendStatus] = useState("Conectando...");
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });


  // Escuchar cambios de usuario en localStorage
  useEffect(() => {
    const handleUsuarioCambiado = () => {
      setUsuario(obtenerUsuarioLS());
    };
    window.addEventListener("usuarioCambiado", handleUsuarioCambiado);
    return () => window.removeEventListener("usuarioCambiado", handleUsuarioCambiado);
  }, []);

  // Verificación de estado del Backend y RabbitMQ con freno ante 404
  // Verificación de estado del Backend y RabbitMQ
  useEffect(() => {
    let activo = true;

    const checkBackendStatus = async () => {
      const targetUserId = usuario?.usuarioId || usuario?.id || null;
      const res = await getOrderStatus(targetUserId);

      if (!activo) return;

      if (res.ok) {
        setBackendStatus("Conectado a Backend & RabbitMQ");
      } else {
        setBackendStatus("Backend Desconectado o Inactivo");
      }
    };

    checkBackendStatus();
    // Chequeo cada 30 segundos para evitar saturación
    const timer = setInterval(checkBackendStatus, 30000);

    return () => {
      activo = false;
      clearInterval(timer);
    };
  }, [usuario]);

  // Enviar mensaje de orden a RabbitMQ
  const sendOrderRabbitMQ = async (customerName) => {
    const enviado = await sendOrderEvent(customerName);
    if (enviado) {
      setStats((prev) => ({ ...prev, total: prev.total + 1 }));

      // Simular procesamiento del evento (Exitoso o DLQ)
      setTimeout(() => {
        const isSuccess = Math.random() > 0.4;
        setStats((prev) =>
          isSuccess
            ? { ...prev, success: prev.success + 1 }
            : { ...prev, failed: prev.failed + 1 }
        );
      }, 1500);
    }
  };

  // Cargar productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productosAPI = await getProductos();
        const categoriasAPI = await getCategorias();
        setProductos(productosAPI);

        const cats = Array.isArray(categoriasAPI)
          ? [{ id: 0, nombre: "Todas" }, ...categoriasAPI.map((c) => ({ id: c.id, nombre: c.nombre }))]
          : [{ id: 0, nombre: "Todas" }];
        setCategorias(cats);
      } catch (error) {
        console.error("Error cargando productos o categorías:", error);
        setProductos([]);
        setCategorias([{ id: 0, nombre: "Todas" }]);
      }
    };
    fetchData();
  }, []);

  const BACKEND_URL = "http://98.89.1.201:8082";
  const normalizarCarrito = (items = [], productosAPI = []) => {
  return items.map((item) => {
    const rawId = String(item.productoId ?? item.id ?? "");
    
    // Búsqueda tolerante a mayúsculas/minúsculas y tipos
    const prod =
      item.producto ||
      productosAPI.find(
        (p) => String(p.id).trim().toLowerCase() === rawId.trim().toLowerCase()
      ) ||
      {};

    // Extraer la ruta cruda de la imagen
    let imgPath = item.imagen || prod.imagen || "";

    // Si viene solo el nombre del archivo (ej: "KB001.jpg"), anteponer la ruta del backend si aplica
    if (imgPath && !imgPath.startsWith("http") && !imgPath.startsWith("data:") && !imgPath.startsWith("/")) {
      imgPath = `${BACKEND_URL}/v2/imagenes/${imgPath}`;
    }

    return {
      ...item,
      productoId: rawId || prod.id,
      producto: prod,
      nombre: item.nombre || prod.nombre || "Producto sin nombre",
      precio: Number(item.precio ?? prod.precio ?? 0),
      descuento: Number(item.descuento ?? prod.descuento ?? 0),
      stock: Number(item.stock ?? prod.stock ?? 0),
      cantidad: Number(item.cantidad ?? 1),
      imagen: imgPath || "/placeholder.png",
    };
  });
};
  // Cargar carrito del usuario
  useEffect(() => {
    const usuarioActivo = usuario || obtenerUsuarioLS();
    const idUsuario = usuarioActivo?.usuarioId || usuarioActivo?.id || usuarioActivo?.userId;

    if (idUsuario) {
      const fetchCarrito = async () => {
        try {
          const carritoData = await obtenerCarrito(idUsuario);
          const productosAPI = await getProductos();

          const items = Array.isArray(carritoData)
            ? carritoData
            : Array.isArray(carritoData?.items)
            ? carritoData.items
            : [];

          setCarrito(normalizarCarrito(items, productosAPI));
        } catch (err) {
          console.error("Error al obtener carrito:", err);
          setCarrito([]);
        }
      };
      fetchCarrito();
    } else {
      setCarrito([]);
    }
  }, [usuario]);

  const handleAgregarCarrito = async (producto) => {
      const usuarioActivo = usuario || obtenerUsuarioLS();

      if (!usuarioActivo) {
        return alert("Debes iniciar sesión para agregar al carrito");
      }

      if (producto.stock <= 0) {
        return alert("El producto está agotado");
      }

      const targetUserId = usuarioActivo.usuarioId || usuarioActivo.id || usuarioActivo.userId || 1;
      const targetProductoId = producto.id || producto.productoId;

      try {
        const carritoActualizado = await agregarAlCarrito(targetUserId, targetProductoId, 1);
        const items = carritoActualizado.items || [];
        setCarrito(normalizarCarrito(items, productos));

        // NOTA: Se eliminó el setProductos((prev) => prev.map(...)) de aquí

        sendOrderRabbitMQ(usuarioActivo.nombre || usuarioActivo.username || usuarioActivo.email || "Cliente");
      } catch (error) {
        console.error("Error agregando al carrito:", error);
        alert("No se pudo agregar el producto al carrito");
      }
    };

  // Actualizar cantidad en el carrito
const actualizarCantidadCarrito = async (productoId, nuevaCantidad) => {
    try {
      if (nuevaCantidad < 1) {
        return eliminarItemDelCarrito(productoId);
      }

      const usuarioActivo = usuario || obtenerUsuarioLS();
      const targetUserId = usuarioActivo?.usuarioId || usuarioActivo?.id || usuarioActivo?.userId || 1;
      
      const carritoActualizado = await actualizarItemCarrito(targetUserId, productoId, nuevaCantidad);
      setCarrito(normalizarCarrito(carritoActualizado.items || [], productos));

      // NOTA: Se eliminó el setProductos de aquí
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
    }
  };

  // Eliminar producto del carrito
const eliminarItemDelCarrito = async (productoId) => {
    try {
      const usuarioActivo = usuario || obtenerUsuarioLS();
      const targetUserId = usuarioActivo?.usuarioId || usuarioActivo?.id || usuarioActivo?.userId || 1;
      
      const carritoActualizado = await eliminarItemCarrito(targetUserId, productoId);
      setCarrito(normalizarCarrito(carritoActualizado.items || [], productos));

      // NOTA: Se eliminó el setProductos de aquí
    } catch (error) {
      console.error("Error al eliminar item:", error);
    }
  };

  // Filtrado de productos
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const handleFiltrarProductos = ({ q, cat, min, max }) => {
    const filtrados = productos.filter((p) => {
      const matchCat = cat === "Todas" || p.categoria?.nombre === cat;
      const matchQ = q ? p.nombre.toLowerCase().includes(q.toLowerCase()) : true;
      const matchPrecio = p.precio >= min && p.precio <= max;
      return matchCat && matchQ && matchPrecio;
    });
    setProductosFiltrados(filtrados);
  };

  const productosConStockReal = useMemo(() => {
    return (productosFiltrados.length ? productosFiltrados : productos).map((p) => {
      const enCarrito = carrito.find((c) => c.productoId === p.id);
      return {
        ...p,
        stock: enCarrito ? p.stock - enCarrito.cantidad : p.stock,
      };
    });
  }, [productos, productosFiltrados, carrito]);

  const hideNavbarRoutes = ["/checkout", "/boleta"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  const shouldShowBotonWsp = shouldShowNavbar;
  const mostrarBuscador = location.pathname.startsWith("/categoria") || location.pathname.startsWith("/ofertas");

  return (
    <>
      {shouldShowNavbar && (
        <>
          <Navbar
            cantidad={carrito.reduce((acc, item) => acc + item.cantidad, 0)}
            abrirCarrito={() => setCarritoOpen(true)}
            usuario={usuario}
          />

          {/* Banner con el estado de RabbitMQ y Métricas */}
          <div style={{ padding: "8px 16px", background: "#f1f5f9", textAlign: "center", borderBottom: "1px solid #cbd5e1", fontSize: "0.9rem" }}>
            <span><strong>Estado Backend:</strong> {backendStatus}</span>
            <span style={{ marginLeft: "15px" }}><strong>Órdenes Totales:</strong> {stats.total} | </span>
            <span style={{ color: "#16a34a", fontWeight: "bold" }}>Procesadas: {stats.success} | </span>
            <span style={{ color: "#dc2626", fontWeight: "bold" }}>DLQ: {stats.failed}</span>
          </div>

          {mostrarBuscador && (
            <BuscadorAvanzado categorias={categorias} onFilter={handleFiltrarProductos} />
          )}
        </>
      )}

      <CarritoSidebar
        abierto={carritoOpen}
        cerrar={() => setCarritoOpen(false)}
        carrito={carrito}
        onActualizarCantidad={actualizarCantidadCarrito}
        onEliminarItem={eliminarItemDelCarrito}
      />

      <Routes>
        <Route path="/homeadmin" element={<HomeAdmin usuario={usuario} />} />
        <Route path="/perfiladmin" element={<PerfilAdmin />} />
        <Route path="/categoria_admin" element={<CategoriaAdmin />} />
        <Route path="/editarproducto" element={<EditarProducto />} />
        <Route path="/editaruser" element={<EditarUser />} />
        <Route path="/nuevoproducto" element={<NuevoProducto />} />
        <Route path="/nuevousuario" element={<NuevoUsuario />} />
        <Route path="/productosadmin" element={<Productosadmin />} />
        <Route path="/usuariosadmin" element={<Usuariosadmin />} />

        <Route path="/" element={<Home productos={productosConStockReal} usuario={usuario} onAgregarCarrito={handleAgregarCarrito} />} />
        <Route path="/categoria" element={<Categoria productos={productosConStockReal} usuario={usuario} onAgregarCarrito={handleAgregarCarrito} />} />
        <Route path="/ofertas" element={<Ofertas productos={productosConStockReal} usuario={usuario} onAgregarCarrito={handleAgregarCarrito} />} />

        <Route path="/auth" element={<Auth onUsuarioChange={setUsuario} />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/soporte" element={<Soporte usuario={usuario} />} />
        <Route path="/detalles" element={<Detalles usuario={usuario} onAgregarCarrito={handleAgregarCarrito} />} />
        <Route path="/carro" element={<Carro carrito={carrito} onActualizarCantidad={actualizarCantidadCarrito} onEliminarItem={eliminarItemDelCarrito} />} />
        <Route
          path="/checkout"
          element={
            <ProteccionUser usuario={usuario}>
              <Checkout carrito={carrito} onActualizarCantidad={actualizarCantidadCarrito} onCompraExitosa={() => setCarrito([])} />
            </ProteccionUser>
          }
        />
        <Route path="/boleta" element={<Boleta />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/termino" element={<Termino />} />
        <Route path="/privacidad" element={<Privacidad />} />
      </Routes>

      {shouldShowBotonWsp && <BotonWsp />}
    </>
  );
}

export default Layout;