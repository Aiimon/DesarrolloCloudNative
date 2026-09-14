import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import Card from "../components/Card";
import Carrito from "../components/Carrito";
import Footer from "../components/Footer";

function Home({ productos: productosProp, carritoOpen, setCarritoOpen, carrito, onAgregarCarrito }) {
  const [cargando, setCargando] = useState(true);

  // Filtrar solo productos destacados cada vez que cambian los productos de Layout
  const productosDestacados = productosProp
    .filter((p) => Boolean(p.destacado))
    .slice(0, 3);

  useEffect(() => {
    setCargando(false);
  }, [productosProp]);

  return (
    <>
      <Hero
        titulo="Sube de nivel tu setup"
        descripcion={
          <>
            Consolas, PC, periféricos y más. Gana{" "}
            <span className="badge badge-neon">puntos LevelUp</span> por compras y referidos.
          </>
        }
        btn1={{
          link: "/categoria",
          clase: "btn-accent",
          icon: "bi-lightning-charge",
          text: "Explorar Productos",
        }}
        btn2={{
          link: "/auth",
          clase: "btn-outline-light",
          icon: "bi-stars",
          text: "Únete",
        }}
      />

      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Productos Destacados</h2>

        {cargando ? (
          <p className="text-center">Cargando productos...</p>
        ) : productosDestacados.length === 0 ? (
          <p className="text-center">No hay productos destacados disponibles.</p>
        ) : (
          <Card
            productosDestacados={productosDestacados}
            onAgregarCarrito={onAgregarCarrito}
          />
        )}
      </section>

      <Carrito open={carritoOpen} setOpen={setCarritoOpen} carrito={carrito} />

      <Footer />
    </>
  );
}

export default Home;
