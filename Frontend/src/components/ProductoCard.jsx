import { useNavigate } from "react-router-dom";

export default function ProductoCard({ producto, usuario = {}, onAgregarCarrito }) {
  const navigate = useNavigate();
  const { id, nombre, categoria, precio, stock, rating, imagen, descuento = 0 } = producto;

  const esDuoc = usuario?.esDuoc || false;

  let precioConDescuento = precio;
  if (descuento > 0) {
    precioConDescuento = precio - Math.round((precio * descuento) / 100);
  }
  const precioFinal = esDuoc ? Math.round(precioConDescuento * 0.8) : precioConDescuento;

  const imgSrc = imagen || "/img/default.png";

  const verDetalles = () => {
    navigate("/detalles", { state: { productoId: id } });
  };

  return (
    <div className="card h-100 shadow-sm d-flex flex-column position-relative">
      <div className="card-img-container">
        <img src={imgSrc} alt={nombre} className="card-img-top" />
      </div>

      <div className="card-body p-3 d-flex flex-column">
        <h5 className="card-title">{nombre}</h5>
        <p className="text-secondary mb-2">{categoria?.nombre || "Sin categoría"}</p>

        <p className="price mb-2">
          {descuento > 0 || esDuoc ? (
            <>
              <span className="text-secondary text-decoration-line-through">
                ${precio.toLocaleString()}
              </span>{" "}
              <span className="text-danger">${precioFinal.toLocaleString()}</span>
              {descuento > 0 && <span className="badge bg-danger ms-2">-{descuento}%</span>}
            </>
          ) : (
            <>${precio.toLocaleString()}</>
          )}
        </p>

        <p className={`stock mb-2 ${stock === 0 ? "text-danger" : "text-success"}`}>
          {stock > 0
            ? `${stock} unidad${stock !== 1 ? "es" : ""} disponible${stock !== 1 ? "s" : ""}`
            : "Agotado"}
        </p>

        <div className="rating mb-3">{rating ? "★".repeat(Math.floor(rating)) : ""}</div>

        <div className="d-flex gap-2 mt-auto">
          <button
            className="btn btn-accent flex-grow-1"
            onClick={() => onAgregarCarrito(id)}
            disabled={stock === 0}
          >
            <i className="bi bi-cart3 me-1"></i>
            {stock === 0 ? "Agotado" : "Agregar"}
          </button>

          <button
            className="btn btn-outline-light flex-grow-1"
            onClick={verDetalles}
          >
            <i className="bi bi-eye me-1"></i> Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}
