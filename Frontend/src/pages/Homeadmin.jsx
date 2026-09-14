// pages/Homeadmin.jsx

import { Routes, Route } from "react-router-dom"; 
import SidebarAdmin from "../components/SidebarAdmin"; 
import DashboardContent from "../components/DashboardContent"; 
import Notiadmn from '../components/Notiadmn';
import Footer from "../components/Footer";

// Asegúrate de que estas rutas de importación sean correctas:
import Productosadmin from "./Productosadmin"; 
import Usuariosadmin from "./Usuariosadmin"; 
// Importa los componentes de creación y edición (asumimos que existen)
// import NuevoProducto from "./NuevoProducto"; 
// import EditarProducto from "./EditarProducto"; 
// import EditarUsuario from "./EditarUsuario"; 


function Homeadmin() {
    return (
        <>
            <SidebarAdmin>
                
                {/* Ruteo de subpáginas. Esto es lo que se convierte en {children} de SidebarAdmin */}
                <Routes>
                    {/* 1. Ruta por defecto: Muestra el Dashboard */}
                    <Route path="/" element={<DashboardContent />} /> 
                    
                    {/* 2. Rutas de gestión (Listado) */}
                    <Route path="productosadmin" element={<Productosadmin />} /> 
                    <Route path="usuariosadmin" element={<Usuariosadmin />} /> 
                    
                    {/* 3. Rutas de Creación/Edición (CRUD) */}
                    
                    {/* CREAR PRODUCTO (usará POST a /v2/productos/crear) */}
                    <Route 
                        path="nuevoproducto" 
                        element={<h1>Página Crear Producto (POST)</h1>} 
                        // element={<NuevoProducto />}
                    />
                    
                    {/* EDITAR PRODUCTO (usará GET/PUT a /v2/productos/actualizar/{id}) */}
                    <Route 
                        path="productosadmin/editar/:id" 
                        element={<h1>Página Editar Producto (PUT)</h1>} 
                        // element={<EditarProducto />}
                    />
                    
                    {/* EDITAR USUARIO (usará GET/PUT a /v2/usuarios/actualizar) */}
                    <Route 
                        path="usuariosadmin/editar/:id" 
                        element={<h1>Página Editar Usuario (PUT)</h1>} 
                        // element={<EditarUsuario />}
                    />
                    
                    {/* 4. Manejo de 404 para el área admin */}
                    <Route path="*" element={<h1 style={{color: 'white', padding: '20px'}}>404 | Contenido de Admin No Encontrado</h1>} />
                </Routes>
                
                {/* La Notificación flotante se mantiene aquí si no quieres que el SidebarAdmin la gestione */}
                <Notiadmn />
                
            </SidebarAdmin>
            
            <Footer />
        </>
    );
}

export default Homeadmin;