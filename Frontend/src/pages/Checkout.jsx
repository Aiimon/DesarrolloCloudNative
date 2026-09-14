import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Footer from "../components/Footer";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function Checkout({ carrito, onActualizarCantidad, onCompraExitosa }) {
  const navigate = useNavigate();

  const obtenerStock = (id, stockOriginal) => {
    const almacen = localStorage.getItem(`stock_${id}`);
    return almacen !== null ? Number(almacen) : stockOriginal;
  };

  const totalProductos = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  const totalPrecio = carrito.reduce((acc, p) => {
    const precioFinal = p.descuento
      ? Math.round(p.precio * (1 - p.descuento / 100))
      : p.precio;
    return acc + p.cantidad * precioFinal;
  }, 0);

  return (
    <>
      <div className="container py-5">
        <h2 className="mb-4 text-center">Checkout</h2>

        {carrito.length === 0 ? (
          <p className="text-center text-muted">Tu carrito está vacío</p>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              {carrito.map((p) => {
                const precioFinal = p.descuento
                  ? Math.round(p.precio * (1 - p.descuento / 100))
                  : p.precio;
                const stockActual = obtenerStock(p.id, p.stock);

                return (
                  <div
                    key={p.id}
                    className="card mb-3 shadow-sm d-flex flex-row align-items-center p-2"
                  >
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "contain",
                        marginRight: 15,
                      }}
                    />
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{p.nombre}</h5>
                      {p.descuento > 0 && (
                        <span className="badge bg-danger mb-1">
                          -{p.descuento}%
                        </span>
                      )}
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            onActualizarCantidad(p.id, p.cantidad - 1)
                          }
                          disabled={p.cantidad <= 1}
                        >
                          -
                        </button>
                        <span className="fw-bold">{p.cantidad}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            onActualizarCantidad(
                              p.id,
                              Math.min(p.cantidad + 1, stockActual)
                            )
                          }
                          disabled={p.cantidad >= stockActual}
                        >
                          +
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onActualizarCantidad(p.id, 0)}
                        >
                          🗑
                        </button>
                      </div>
                      <small className="text-muted">
                        Stock disponible: {stockActual}
                      </small>
                    </div>
                    <div className="fw-bold">
                      ${(precioFinal * p.cantidad).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm p-3">
                <h4 className="mb-3">Resumen del pedido</h4>
                <p>
                  Total productos: <strong>{totalProductos}</strong>
                </p>
                <p>
                  Total a pagar: <strong>${totalPrecio.toLocaleString()}</strong>
                </p>

                <PayPalScriptProvider
                  options={{
                    "client-id":
                      "AdPk7nylxq-_Cjepu-zLtkRcs6MXPi9RkPJ6MOJKGA-5hF9IHIy-WCsEc5y0NHnSXUb5H_bsZMkIWauw",
                    currency: "USD",
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "blue",
                      shape: "rect",
                      label: "paypal",
                    }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: totalPrecio.toString(),
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const order = await actions.order.capture();

                        const items = carrito.map((p) => {
                          const precioFinal = p.descuento
                            ? Math.round(p.precio * (1 - p.descuento / 100))
                            : p.precio;

                          return {
                            id: p.id,
                            nombre: p.nombre,
                            cantidad: p.cantidad,
                            precioUnitario: precioFinal,
                            subtotal: precioFinal * p.cantidad,
                            imagen: p.imagen,
                          };
                        });

                        const totalProductosFinal = items.reduce(
                          (acc, it) => acc + it.cantidad,
                          0
                        );
                        const totalPrecioFinal = items.reduce(
                          (acc, it) => acc + it.subtotal,
                          0
                        );

                        const boleta = {
                          idTransaccionPayPal: order.id || data.orderID,
                          fecha: new Date().toISOString(),
                          items,
                          totalProductos: totalProductosFinal,
                          totalPrecio: totalPrecioFinal,
                          payer: order.payer || null,
                        };

                        // Usuario activo
                        const usuarioActivo = JSON.parse(localStorage.getItem("usuario")) || JSON.parse(localStorage.getItem("usuarioActual"));

                        // Guardar en "ultimaBoleta"
                        localStorage.setItem("ultimaBoleta", JSON.stringify(boleta));

                        // Guardar en "boletas" con email del usuario de la página
                        const todasBoletas = JSON.parse(localStorage.getItem("boletas")) || [];
                        todasBoletas.push({
                          ...boleta,
                          email: usuarioActivo.email,
                        });
                        localStorage.setItem("boletas", JSON.stringify(todasBoletas));

                        if (onCompraExitosa) onCompraExitosa();

                        Swal.fire({
                          title: "¡Compra exitosa!",
                          text: "Tu pago fue procesado correctamente.",
                          icon: "success",
                          confirmButtonText: "Ver boleta",
                          confirmButtonColor: "#3085d6",
                        }).then(() => {
                          navigate("/boleta");
                        });
                      } catch (err) {
                        console.error("Error capturando orden:", err);
                        Swal.fire({
                          title: "Error en el pago",
                          text: "Hubo un problema al procesar tu compra. Intenta nuevamente.",
                          icon: "error",
                          confirmButtonText: "Aceptar",
                          confirmButtonColor: "#d33",
                        });
                      }
                    }}
                    onCancel={() => {
                      Swal.fire({
                        title: "Pago rechazado",
                        text: "Cancelaste el pago o cerraste la ventana de PayPal.",
                        icon: "warning",
                        confirmButtonText: "Aceptar",
                        confirmButtonColor: "#f39c12",
                      });
                    }}
                    onError={(err) => {
                      console.error("Error en el pago:", err);
                      Swal.fire({
                        title: "Pago rechazado",
                        text: "El pago fue rechazado o hubo un error. Intenta nuevamente.",
                        icon: "warning",
                        confirmButtonText: "Reintentar",
                        confirmButtonColor: "#f39c12",
                      });
                    }}
                  />
                </PayPalScriptProvider>

                <button
                  className="btn btn-secondary w-100 mt-3"
                  onClick={() => navigate(-1)}
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Checkout;
