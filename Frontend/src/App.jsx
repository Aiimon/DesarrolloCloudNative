import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import {
  getProductos,
  getCategorias,
  agregarAlCarrito,
  obtenerCarrito,
  actualizarItemCarrito,
  eliminarItemCarrito,
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

function Layout() {
  const location = useLocation();
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuario, setUsuario] = useState(
    () => JSON.parse(localStorage.getItem("usuario")) || null
  );
  const [carrito, setCarrito] = useState([]);

  // Escuchar cambios de usuario en localStorage
  useEffect(() => {
    const handleUsuarioCambiado = () => {
      const usuarioLS = JSON.parse(localStorage.getItem("usuario"));
      setUsuario(usuarioLS || null);
    };
    window.addEventListener("usuarioCambiado", handleUsuarioCambiado);
    return () => window.removeEventListener("usuarioCambiado", handleUsuarioCambiado);
  }, []);

  // Cargar productos y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productosAPI = await getProductos();
        const categoriasAPI = await getCategorias();
        setProductos(productosAPI);

        const cats = Array.isArray(categoriasAPI)
          ? [{ id: 0, nombre: "Todas" }, ...categoriasAPI.map(c => ({ id: c.id, nombre: c.nombre }))]
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

  // Normalizar carrito
  const normalizarCarrito = (items, productosAPI) =>
    items.map(item => {
      const prod = item.producto || productosAPI.find(p => p.id === item.productoId || p.id === item.id) || {};
      return {
        ...item,
        productoId: item.productoId ?? item.id ?? prod.id,
        producto: prod,
        nombre: item.nombre || prod.nombre || 'Desconocido',
        precio: item.precio ?? prod.precio ?? 0,
        descuento: item.descuento ?? prod.descuento ?? 0,
        stock: item.stock ?? prod.stock ?? 0,
        cantidad: item.cantidad ?? 0,
        imagen: item.imagen || prod.imagen || '/placeholder.png'
      };
    });

  // Cargar carrito
  useEffect(() => {
    if (usuario) {
      const fetchCarrito = async () => {
        try {
          const carritoData = await obtenerCarrito(usuario.usuarioId);
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

  // Agregar al carrito
  const handleAgregarCarrito = async (producto) => {
    if (!usuario) return alert("Debes iniciar sesión para agregar al carrito");
    if (producto.stock <= 0) return alert("El producto está agotado");

    try {
      const carritoActualizado = await agregarAlCarrito(usuario.usuarioId, producto.id, 1);
      const productosAPI = await getProductos();
      const items = carritoActualizado.items || [...carrito, { ...producto, cantidad: 1 }];

      setCarrito(normalizarCarrito(items, productosAPI));

      // Reducir stock local
      setProductos(prev =>
        prev.map(p => p.id === producto.id ? { ...p, stock: p.stock - 1 } : p)
      );
    } catch (error) {
      console.error("Error agregando al carrito:", error);
      alert("No se pudo agregar el producto al carrito");
    }
  };

  // Actualizar cantidad
  const actualizarCantidadCarrito = async (productoId, nuevaCantidad) => {
    try {
      const itemPrev = carrito.find(p => p.productoId === productoId);
      if (!itemPrev) return;

      if (nuevaCantidad < 1) {
        // Si la cantidad baja a 0, eliminamos el producto
        return eliminarItemDelCarrito(productoId);
      }

      const carritoActualizado = await actualizarItemCarrito(usuario.usuarioId, productoId, nuevaCantidad);

      const diff = nuevaCantidad - itemPrev.cantidad;
      setProductos(prev =>
        prev.map(p =>
          p.id === productoId ? { ...p, stock: p.stock - diff } : p
        )
      );

      setCarrito(normalizarCarrito(carritoActualizado.items || carrito, productos));
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
    }
  };

  // Eliminar item del carrito y actualizar stock en productos
  const eliminarItemDelCarrito = async (productoId) => {
    try {
      const itemEliminado = carrito.find(p => p.productoId === productoId);
      if (!itemEliminado) return;

      // Primero devolvemos stock en el estado productos
      setProductos(prev =>
        prev.map(p =>
          p.id === productoId ? { ...p, stock: p.stock + itemEliminado.cantidad } : p
        )
      );

      // Llamamos al backend para eliminar el item
      const carritoActualizado = await eliminarItemCarrito(usuario.usuarioId, productoId);

      // Normalizamos carrito usando el stock actualizado
      setCarrito(prevCarrito =>
        normalizarCarrito(
          carritoActualizado.items || prevCarrito.filter(p => p.productoId !== productoId),
          productos.map(p =>
            p.id === productoId ? { ...p, stock: p.stock + itemEliminado.cantidad } : p
          )
        )
      );

    } catch (error) {
      console.error("Error al eliminar item:", error);
    }
  };

  // Filtrar productos
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const handleFiltrarProductos = ({ q, cat, min, max }) => {
    const filtrados = productos.filter(p => {
      const matchCat = cat === "Todas" || p.categoria?.nombre === cat;
      const matchQ = q ? p.nombre.toLowerCase().includes(q.toLowerCase()) : true;
      const matchPrecio = p.precio >= min && p.precio <= max;
      return matchCat && matchQ && matchPrecio;
    });
    setProductosFiltrados(filtrados);
  };

  const hideNavbarRoutes = ["/checkout", "/boleta"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  const shouldShowBotonWsp = shouldShowNavbar;

  const mostrarBuscador = location.pathname.startsWith("/categoria") || location.pathname.startsWith("/ofertas");

  // useEffect para sincronizar stock en las cards automáticamente
  useEffect(() => {
    setProductos(prev =>
      prev.map(p => {
        const carritoItem = carrito.find(c => c.productoId === p.id);
        if (carritoItem) {
          return { ...p, stock: p.stock }; // stock ya actualizado
        }
        return p;
      })
    );
  }, [carrito]);

  return (
    <>
      {shouldShowNavbar && (
        <>
          <Navbar
            cantidad={carrito.reduce((acc, item) => acc + item.cantidad, 0)}
            abrirCarrito={() => setCarritoOpen(true)}
            usuario={usuario}
          />

          {mostrarBuscador && (
            <BuscadorAvanzado
              categorias={categorias}
              onFilter={handleFiltrarProductos}
            />
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
        <Route
          path="/homeadmin"
          element={<HomeAdmin usuario={usuario} />}
        />
        <Route path="/perfiladmin" element={<PerfilAdmin />} />
      <Route path="/categoria_admin" element={<CategoriaAdmin />} />
      <Route path="/editarproducto" element={<EditarProducto />} />
      <Route path="/editaruser" element={<EditarUser />} />
      <Route path="/nuevoproducto" element={<NuevoProducto />} />
      <Route path="/nuevousuario" element={<NuevoUsuario />} />
      <Route path="/productosadmin" element={<Productosadmin />} />
      <Route path="/usuariosadmin" element={<Usuariosadmin />} />
        <Route
          path="/"
          element={
            <Home
              productos={productosFiltrados.length ? productosFiltrados : productos}
              usuario={usuario}
              onAgregarCarrito={handleAgregarCarrito}
            />
          }
        />
        <Route
          path="/categoria"
          element={
            <Categoria
              productos={productosFiltrados.length ? productosFiltrados : productos}
              usuario={usuario}
              onAgregarCarrito={handleAgregarCarrito}
            />
          }
        />
        <Route
          path="/ofertas"
          element={
            <Ofertas
              productos={productosFiltrados.length ? productosFiltrados : productos}
              usuario={usuario}
              onAgregarCarrito={handleAgregarCarrito}
            />
          }
        />
        <Route path="/auth" element={<Auth onUsuarioChange={setUsuario} />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/soporte" element={<Soporte usuario={usuario} />} />
        <Route path="/detalles" element={<Detalles usuario={usuario} onAgregarCarrito={handleAgregarCarrito} />} />
        <Route
          path="/carro"
          element={
            <Carro
              carrito={carrito}
              onActualizarCantidad={actualizarCantidadCarrito}
              onEliminarItem={eliminarItemDelCarrito}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <ProteccionUser usuario={usuario}>
              <Checkout
                carrito={carrito}
                onActualizarCantidad={actualizarCantidadCarrito}
                onCompraExitosa={() => setCarrito([])}
              />
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
