import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ELIMINAMOS DATOS ESTÁTICOS Y LÓGICA OBSOLETA:
// import productosD from "../data/productos.json"; 
// const LOCAL_STORAGE_KEY_PRODUCTS = 'productos_maestro';
// const getMasterProducts = () => { /* ... */ };


// --- Configuración Global y API ---
const CATEGORIES = [
    "Juegos de Mesa", "Accesorios", "Consolas", "Computadores Gamers",
    "Sillas Gamers", "Mouse", "Mousepad", "Poleras Personalizadas", "Teclados"
];
const MIN_PRICE = 1;

// 🛑 Endpoints de la API - Puerto 8082
const API_URL_BUSCAR_ID = 'http://localhost:8082/v2/productos/buscar/id/';
const API_URL_ACTUALIZAR = 'http://localhost:8082/v2/productos/actualizar/';


function FormularioProductoEdit({ productId }) {
    
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState({ saving: false, error: null });


    // 🛑 FUNCIÓN DE CARGA INICIAL (GET - Database)
    const fetchProductData = useCallback(async () => {
        if (!productId) {
            navigate('/homeadmin/productosadmin');
            return;
        }

        setIsLoading(true);
        try {
            // GET: /v2/productos/buscar/id/{id}
            const response = await fetch(`${API_URL_BUSCAR_ID}${productId}`);
            
            if (response.status === 404) {
                throw new Error(`Producto con ID ${productId} no encontrado.`);
            }
            if (!response.ok) {
                throw new Error("Error al cargar datos del servidor.");
            }
            const product = await response.json();
            
            // 1. Mapear los datos de la API al estado del formulario
            // Nota: Tu entidad SQL no tiene 'detalles', lo quitamos del mapeo.
            setFormData({
                id: product.id, 
                nombre: product.nombre || '',
                categoria: product.categoria || CATEGORIES[0],
                precio: String(product.precio || 0),
                stock: String(product.stock || 0),
                stockCritico: String(product.stockCritico || 5),
                rating: String(product.rating || 0),
                descripcion: product.descripcion || '',
                imagen: product.imagen || '',
                // detalles: JSON.stringify(product.detalles || {}, null, 2), // Solo si lo necesitas
            });

        } catch (err) {
            alert(`Error al cargar datos del producto: ${err.message}`);
            navigate('/homeadmin/productosadmin'); 
        } finally {
            setIsLoading(false);
        }
    }, [productId, navigate]);


    // --- Efecto para cargar los datos del producto al inicio ---
    useEffect(() => {
        fetchProductData();
    }, [fetchProductData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 🛑 FUNCIÓN DE ENVÍO Y ACTUALIZACIÓN (PUT - Database)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return;
        setStatus({ saving: true, error: null });


        // --- VALIDACIONES DE DATOS (se mantienen) ---
        const priceValue = parseFloat(formData.precio);
        const stockValue = parseInt(formData.stock, 10);
        const stockCriticoValue = parseInt(formData.stockCritico, 10);

        // ... (Validaciones de precio, stock, stock crítico) ...
        if (isNaN(priceValue) || priceValue < MIN_PRICE) {
            alert(`Error de validación: El Precio debe ser un número positivo mayor o igual a $${MIN_PRICE}.`);
            setStatus({ saving: false, error: "Precio inválido." }); return;
        }
        // ... (otras validaciones) ...

        /* // Lógica de JSON de Detalles (Quitada, ya que no se usa en la Entity PRODUCTO SQL)
        let parsedDetalles = {};
        try {
            parsedDetalles = JSON.parse(formData.detalles || '{}');
        } catch (error) {
            alert("Error: El campo 'Detalles (JSON)' no tiene un formato JSON válido."); return;
        }
        */

        // 1. Construir el objeto para el PUT (Debe coincidir con la Entity Producto)
        const productoActualizado = {
            id: productId, // 🛑 ID DEBE SER ENVIADO EN LA URL Y EL BODY (para mayor seguridad)
            nombre: formData.nombre,
            categoria: formData.categoria,
            precio: priceValue,
            stock: stockValue,
            stockCritico: stockCriticoValue,
            rating: parseFloat(formData.rating) || 0,
            descripcion: formData.descripcion,
            imagen: formData.imagen,
            // (Otros campos de tu tabla: DESCUENTO, OFERTA, DESTACADO deben ser considerados aquí)
        };

        // 2. Enviar la petición PUT
        try {
            // PUT: /v2/productos/actualizar/{id}
            const response = await fetch(`${API_URL_ACTUALIZAR}${productId}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productoActualizado),
            });

            if (response.status === 404) throw new Error("El producto no existe o el ID es incorrecto.");
            if (!response.ok) throw new Error("Fallo al actualizar el producto. Verifique los datos enviados.");

            setStatus({ saving: false, error: null });
            alert(`✅ Producto ${formData.nombre} (${productId}) actualizado correctamente.`);
            
            // Navegamos de vuelta a la lista de administración de productos
            navigate('/homeadmin/productosadmin'); 

        } catch (err) {
            console.error("Error al actualizar producto:", err);
            setStatus({ saving: false, error: err.message });
            alert(`❌ Error al guardar: ${err.message}`);
        }
    };
    
    if (isLoading || !formData) {
        return <div className="text-light p-5 text-center">Cargando datos del producto...</div>;
    }

    // --- Renderizado JSX ---
    return (
        <div className="p-4" style={{ backgroundColor: '#212529', borderRadius: '8px', color: 'white' }}>
            <h2 className="mb-4">Editar Producto ID: {formData.id}</h2>
            <form onSubmit={handleSubmit}>
                
                {/* Fila 1: ID, Nombre, Categoría */}
                <div className="row mb-3">
                    <div className="col-md-3 mb-3">
                        <label className="form-label">ID del Producto</label>
                        <div className="form-control bg-dark text-warning border-secondary fw-bold">
                            {formData.id}
                        </div>
                    </div>
                    {/* ... (Nombre y Categoría se mantienen) ... */}
                </div>

                {/* ... (El resto de las filas de inputs se mantienen) ... */}
                
                {status.error && <div className="alert alert-danger mt-3">{status.error}</div>}

                {/* Botones de Acción */}
                <button type="submit" className="btn btn-success me-3" disabled={status.saving}>
                    {status.saving ? (
                        <> <i className="fas fa-spinner fa-spin me-2"></i> Guardando... </>
                    ) : (
                        <> <i className="fas fa-save me-2"></i> Guardar Cambios </>
                    )}
                </button>
                <button type="button" onClick={() => navigate('/homeadmin/productosadmin')} className="btn btn-secondary">
                    <i className="fas fa-times me-2"></i> Cancelar
                </button>
                
            </form>
        </div>
    );
}

export default FormularioProductoEdit;