// src/components/SidebarAdmin.jsx (CÓDIGO FINAL CORREGIDO Y COMPLETO)

import React, { useState, useEffect, useCallback } from 'react'; 
import { NavLink, Link } from 'react-router-dom';

// --- Configuración Global ---
const BLUE_LIGHT = '#1E90FF';
const GREEN_LIGHT = '#39FF14';
const STOCK_CRITICO = 5;
const hoverStyle = { transition: 'box-shadow 0.3s ease-in-out' };
const API_BASE_URL = 'http://localhost:8080/v2'; // Mantenemos 8080

// --- StockNotification (Componente Flotante) ---
export const StockNotification = ({ products }) => {
// ... (Código de StockNotification se mantiene igual) ...
    if (products.length === 0) return null;
    return (
        <div style={{
            position: 'fixed', top: '20px', right: '20px', zIndex: 1050, 
            backgroundColor: '#dc3545', color: 'white', padding: '15px 20px', 
            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', maxWidth: '300px',
        }}>
            <h5 style={{ margin: 0 }}><i className="fas fa-exclamation-triangle me-2"></i> ¡Stock Crítico!</h5>
            <hr style={{ margin: '8px 0', borderColor: 'rgba(255, 255, 255, 0.4)' }} />
            {products.map((p, index) => (
                <p key={index} style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                    Producto: **{p.nombre || p.NOMBRE}** (ID: {p.id})
                </p>
            ))}
        </div>
    );
};
// --- Fin Componente de Notificación ---


// --- 🛑 Componente Sidebar COMPLETO ---
export const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard',  path: '/homeadmin' }, 
        { name: 'Órdenes', path: '/ordenes' },
        { name: 'Productos', path: '/productosadmin' },
        { name: 'Categorías', path: '/categoria_admin' },
        { name: 'Usuarios', path: '/usuariosadmin' },
        { name: 'Reportes', path: '/reporte' },
    ];
    const [hoveredNav, setHoveredNav] = useState(null);
    const GREEN_LIGHT = '#39FF14'; 
    const BLUE_LIGHT = '#1E90FF';
    const hoverStyle = { transition: 'box-shadow 0.3s ease-in-out' };

    return (
        <div className="d-flex flex-column p-3 text-white sidebar-admin" 
            style={{ width: '250px', backgroundColor: '#161616ff', minHeight: '100vh', flexShrink: 0 }}>
            
            {/* Logo y link (MOCK) */}
            <Link className="navbar-brand brand neon active text-decoration-none text-light mb-4 text-center fs-5 fw-bold" to="/homeadmin">
                <i className="bi bi-joystick me-2"></i>Level‑Up Gamer
            </Link>
            
            <hr className="text-secondary" />

            {/* Navegación Principal */}
            <ul className="nav nav-pills flex-column mb-4">
                {navItems.map((item, index) => (
                    <li className="nav-item" key={index}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => 
                                `nav-link text-white d-flex align-items-center mb-1 ${isActive ? 'sidebar-active' : ''}`
                            }
                            style={({ isActive }) => ({ 
                                // ... estilos y hover ...
                                boxShadow: hoveredNav === item.name ? `0 0 10px ${GREEN_LIGHT}` : 'none'
                            })}
                            onMouseEnter={() => setHoveredNav(item.name)}
                            onMouseLeave={() => setHoveredNav(null)}
                        >
                            {item.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};
// --- Fin Componente Sidebar ---


// --- Componente Principal: SidebarAdmin (LAYOUT) ---
function SidebarAdmin({ children }) {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    const fetchProductos = useCallback(async () => {
        try {
            // Usa el endpoint: /v2/productos/todos
            const response = await fetch(`${API_BASE_URL}/productos/todos`); 
            if (!response.ok) {
                throw new Error(`Error al obtener productos: ${response.statusText}`);
            }
            const data = await response.json();
            setProductos(data);
        } catch (err) {
            console.error("Error al cargar productos para la notificación:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    const productosCriticos = productos.filter(p => (p.stock || p.STOCK) <= STOCK_CRITICO);

    return (
        <div className="d-flex admin-layout-container" style={{ minHeight: '100vh', width: '100%' }}>
            <Sidebar /> 
            {/* 🛑 Contenedor de contenido flexible (arreglado en el paso anterior) */}
            <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: '100%' }}>
                {children} 
            </div>
            {!loading && !error && <StockNotification products={productosCriticos} />}
        </div>
    );
}

export default SidebarAdmin;