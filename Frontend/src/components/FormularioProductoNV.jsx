import React, { useState } from 'react'; 
// ELIMINAMOS TODA DEPENDENCIA DE JSON Y LÓGICA OBSOLETA
// import productosD from "../data/productos.json"; 
// const IGNORED_WORDS = ['de', 'y', 'la', 'el', 'los', 'las', 'un', 'una'];
// const LOCAL_STORAGE_KEY = 'productos_maestro';
// const initializeProducts = () => { /* ... */ };
// const getMasterProducts = () => { /* ... */ };
// const generateProductId = (categoria, existingProducts) => { /* ... */ };

// Definimos las categorías estáticamente (Opcional: Si tienes un endpoint /v2/categorias/todas, úsalo con useEffect)
const CATEGORIES = [
    "Juegos de Mesa", "Accesorios", "Consolas", "Computadores Gamers",
    "Sillas Gamers", "Mouse", "Mousepad", "Poleras Personalizadas", "Teclados"
];

// 🛑 Configuración API para POST
const API_URL_CREAR = 'http://localhost:8082/v2/productos/crear';


function FormularioProductoNV() {
    
    const [formData, setFormData] = useState({
        categoria: CATEGORIES[0] || '',
        nombre: '',
        precio: '',
        rating: 0,
        descripcion: '',
        imagen: '',
        stock: '',
        stockCritico: '5', 
        // La propiedad 'detalles' y el JSON interno no son parte de tu entidad 'PRODUCTOS' SQL, lo quitamos.
        // Si necesitas enviarlo, Spring Boot requiere otra Entity asociada (ProductoDetalles).
        // detalles: '{}', 
    });
    const [status, setStatus] = useState({ loading: false, error: null, success: false });

    // 🛑 Eliminamos la lógica de ID generada localmente, ahora es automática
    // const existingProducts = getMasterProducts();
    // const currentGeneratedId = generateProductId(formData.categoria, existingProducts);
    const currentGeneratedId = "Automático (BD)";


    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        let finalValue = value;
        if (type === 'number' && value !== '') {
            finalValue = parseFloat(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        // --- 1. VALIDACIÓN DE PRECIO ---
        const priceValue = parseFloat(formData.precio);
        if (isNaN(priceValue) || priceValue <= 0) {
            alert("Error de validación: El Precio debe ser un número positivo mayor a cero.");
            setStatus({ loading: false, error: "Precio inválido." });
            return;
        }
        
        // 2. Crear el objeto final para la API
        const nuevoProducto = {
            // El ID es generado por Spring Boot (autoincremento o UUID), no lo enviamos.
            categoria: formData.categoria,
            nombre: formData.nombre,
            precio: priceValue, 
            rating: parseFloat(formData.rating) || 0,
            descripcion: formData.descripcion,
            imagen: formData.imagen,
            stock: parseInt(formData.stock, 10) || 0,
            stockCritico: parseInt(formData.stockCritico, 10) || 5,
            
            // Campos adicionales de tu tabla SQL:
            descuento: 0, // Asumimos 0% si no se proporciona
            oferta: 0,    // Asumimos 0 si no se proporciona
            destacado: 0, // Asumimos 0 si no se proporciona
            
            // Nota: CATEGORIA_ID debe ser manejado en Spring Boot si usas Entity/relaciones
        };
        
        // 3. Envío de datos a la API (POST)
        try {
            const response = await fetch(API_URL_CREAR, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoProducto),
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                // Si el servidor devuelve un error, lo mostramos
                throw new Error(errorMsg || "Fallo al crear el producto en el servidor.");
            }

            const productoCreado = await response.json();

            setStatus({ loading: false, error: null, success: true });
            alert(`✅ Producto "${productoCreado.nombre || formData.nombre}" (ID: ${productoCreado.id}) creado.`);
            
            // 4. Limpiar formulario
            setFormData({ 
                categoria: CATEGORIES[0] || '', nombre: '', precio: '', rating: 0, 
                descripcion: '', imagen: '', stock: '', stockCritico: '5',
            });
        } catch (err) {
            console.error("Error al registrar producto:", err);
            setStatus({ loading: false, error: err.message, success: false });
            alert(`❌ Fallo al registrar: ${err.message}`);
        }
    };
    
    // 🛑 Aquí debes agregar un useEffect para cargar las categorías de la tabla CATEGORIAS
    // Si tu Spring Boot expone GET /v2/categorias/todas, podrías cargar dinámicamente las CATEGORIES.


    return (
        <div className="p-4" style={{ backgroundColor: '#212529', borderRadius: '8px', color: 'white' }}>
            <form onSubmit={handleSubmit}>
                
                {/* Fila 1: ID (Display), Nombre, Categoría */}
                <div className="row mb-3">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">ID del Producto</label>
                        <div className="form-control bg-secondary text-white border-secondary fw-bold">
                            {currentGeneratedId}
                        </div>
                    </div>
                    {/* ... (Nombre y Categoría se mantienen) ... */}
                </div>

                {/* ... (Resto de filas del formulario) ... */}
                
                {/* Botón de Envío */}
                {status.error && <div className="alert alert-danger mt-3">{status.error}</div>}
                {status.success && <div className="alert alert-success mt-3">¡Producto creado con éxito!</div>}

                <button type="submit" className="btn btn-primary w-100" disabled={status.loading}>
                    {status.loading ? (
                        <> <i className="fas fa-spinner fa-spin me-2"></i> Creando Producto... </>
                    ) : (
                        <> <i className="fas fa-plus me-2"></i> Crear Nuevo Producto </>
                    )}
                </button>
                
            </form>
        </div>
    );
}

export default FormularioProductoNV;