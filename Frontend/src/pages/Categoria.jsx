import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProductoCard from "../components/ProductoCard";
import BuscadorAvanzado from "../components/BuscadorAvanzado";
import Footer from "../components/Footer";
import { getCategorias } from "../utils/apihelper";

function Categoria({ usuario, onAgregarCarrito, productos }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoriaUrl = params.get("categoria") || "Todas";

  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productosOriginales, setProductosOriginales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Inicializar productos filtrados al cargar
  useEffect(() => {
    const inicial = categoriaUrl === "Todas"
      ? productos
      : productos.filter(p => p.categoria?.nombre === categoriaUrl);

    setProductosOriginales(inicial);
    setProductosFiltrados(inicial);
  }, [categoriaUrl, productos]);

  // Cargar categorías desde API
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const cats = await getCategorias();
        // Eliminar duplicados y siempre agregar "Todas" al inicio
        const categoriasUnicas = [
          { id: "todas", nombre: "Todas" },
          ...[...new Map(cats.map(c => [c.nombre, c])).values()].filter(c => c.nombre !== "Todas")
        ];
        setCategorias(categoriasUnicas);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategorias();
  }, []);

  const handleAgregar = (producto) => {
    if (!usuario?.usuarioId) {
      setMensaje("🔒 Debes iniciar sesión para agregar productos al carrito.");
      return;
    }
    if (producto.stock <= 0) {
      setMensaje("⚠️ El producto está agotado.");
      return;
    }

    onAgregarCarrito(producto); // <- enviar el objeto completo
    setMensaje(`✅ Se agregó "${producto.nombre}" al carrito.`);
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <>
      <div className="container py-4">
        {/* Buscador avanzado */}
        <BuscadorAvanzado
          categorias={categorias}
          onFilter={({ q, cat, min, max }) => {
            const filtrados = productosOriginales.filter((p) => {
              const matchQ = p.nombre.toLowerCase().includes(q.toLowerCase());
              const matchCat = cat === "Todas" || p.categoria?.nombre === cat;
              const matchPrecio = p.precio >= min && p.precio <= max;
              return matchQ && matchCat && matchPrecio;
            });
            setProductosFiltrados(filtrados);
          }}
        />

        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
          <h2 className="section-title mb-0">
            {categoriaUrl === "Todas" ? "Catálogo" : categoriaUrl}
          </h2>
        </div>

        {/* Mensaje amigable */}
        {mensaje && <div className="alert alert-info text-center">{mensaje}</div>}

        {productosFiltrados.length === 0 ? (
          <div className="text-center text-danger mt-3">
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          <div className="row g-4 mt-2">
            {productosFiltrados.map((prod) => (
              <div className="col-md-4" key={prod.id}>
                <ProductoCard
                  producto={prod}
                  usuario={usuario}
                  onAgregarCarrito={() => handleAgregar(prod)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Categoria;
