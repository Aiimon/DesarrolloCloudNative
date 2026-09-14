// src/pages/Perfiladmin.jsx (CÓDIGO MIGRADO A API)

import React, { useState, useEffect, useCallback } from 'react'; // 🛑 AÑADIMOS hooks de API
import { Link, useNavigate } from 'react-router-dom';
import SidebarAdmin from "../components/SidebarAdmin"; 
import Footer from "../components/Footer"; 
// ELIMINAMOS DATOS ESTÁTICOS Y LÓGICA OBSOLETA:
// import usuariosD from "../data/usuarios.json"; 
// const LOCAL_STORAGE_KEY_USERS = 'usuarios_maestro';
import Notiadmn from '../components/Notiadmn';


// --- Configuración API ---
const API_URL_BUSCAR_ID = 'http://localhost:8082/v2/usuarios/buscar/id/';
// 🛑 NOTA: Debes usar el ID del usuario logueado, pero por ahora usamos un ID fijo para testear.
const MOCK_ADMIN_ID = 1; 


function Perfiladmin() {
    const navigate = useNavigate();
    
    // 1. Estados para la data
    const [adminData, setAdminData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. FUNCIÓN DE CARGA (GET)
    const fetchAdminData = useCallback(async (userId) => {
        setIsLoading(true);
        setError(null);
        try {
            // GET: /v2/usuarios/buscar/id/{usuarioId}
            const response = await fetch(`${API_URL_BUSCAR_ID}${userId}`);
            
            if (response.status === 404) {
                throw new Error("Usuario administrador no encontrado.");
            }
            if (!response.ok) {
                throw new Error(`Error al cargar los datos: ${response.statusText}`);
            }
            
            const data = await response.json();
            setAdminData(data);
            
        } catch (err) {
            console.error("Error cargando perfil admin:", err);
            setError(err.message);
            setAdminData({});
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 3. Ejecutar la carga al inicio
    useEffect(() => {
        // En un entorno real, usarías el ID del contexto de autenticación
        fetchAdminData(MOCK_ADMIN_ID); 
    }, [fetchAdminData]);


    // Función para formatear el RUT (ej: 12345678K -> 12.345.678-K)
    const formatRut = (rut) => {
        if (!rut) return 'N/A';
        const rutSanitized = String(rut).replace(/[^0-9kK]/g, "");
        if (rutSanitized.length < 2) return rutSanitized;
        
        const dv = rutSanitized.slice(-1).toUpperCase();
        const body = rutSanitized.slice(0, -1);
        
        return body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + dv;
    };
    
    // Función para determinar el estilo del rol
    const getRoleBadge = (rol) => {
        let color = 'bg-info';
        const normalizedRol = rol ? rol.toLowerCase() : 'usuario';
        if (normalizedRol === 'admin') color = 'bg-warning text-dark';
        if (normalizedRol === 'editor') color = 'bg-primary';
        return <span className={`badge ${color}`}>{normalizedRol.toUpperCase()}</span>;
    };
    
    const PerfilContent = () => {
        
        // Manejar el estado de carga y error
        if (isLoading) {
            return <div className="text-light p-5 text-center"><i className="fas fa-spinner fa-spin me-2"></i> Cargando perfil...</div>;
        }
        if (error) {
            return <div className="alert alert-danger p-4">{error}</div>;
        }

        // Usamos adminData (datos de la API) para renderizar
        return (
            <div className="admin-content-wrapper p-4 flex-grow-1" style={{ backgroundColor: '#000000ff' }}>
            
            <h1 className="text-light h4 mb-1">Mi Perfil</h1>
            <p className="text-muted mb-4">Información y configuraciones de la cuenta de administrador.</p>

            {/* Tarjeta de Información del Perfil */}
            <div className="p-4" style={{ backgroundColor: '#212529', borderRadius: '8px', color: 'white', maxWidth: '800px' }}>
                
                <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-secondary">
                    <i className="fas fa-user-circle fa-4x me-4 text-primary"></i>
                    <div>
                        <h3 className="mb-0 text-light">{adminData.nombre || adminData.NOMBRE} {adminData.apellido || adminData.APELLIDO}</h3>
                        <p className="text-muted mb-0">{adminData.email || adminData.EMAIL}</p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <h5 className="text-primary mb-3">Detalles de la Cuenta</h5>
                        <p><strong>Rol:</strong> {getRoleBadge(adminData.rol || adminData.ROL)}</p>
                        <p><strong>RUT:</strong> {formatRut(adminData.rut || adminData.RUT)}</p>
                        <p><strong>Email:</strong> {adminData.email || adminData.EMAIL || 'N/A'}</p>
                        <p><strong>Contraseña:</strong> *********</p>
                    </div>
                    <div className="col-md-6">
                        <h5 className="text-primary mb-3">Detalles Adicionales</h5>
                        <p><strong>Teléfono:</strong> {adminData.telefono || adminData.TELEFONO || 'N/A'}</p>
                        <p><strong>Fecha Nac.:</strong> {adminData.fecha || adminData.FECHA || 'N/A'}</p>
                        <p><strong>Región:</strong> {adminData.region || adminData.REGION || 'N/A'}</p>
                        <p><strong>Comuna:</strong> {adminData.comuna || adminData.COMUNA || 'N/A'}</p>
                        <p>
                            <strong>Duoc UC:</strong> 
                            <span className={(adminData.esDuoc || adminData.ESDUOC) ? 'text-success' : 'text-danger'}>
                                {(adminData.esDuoc || adminData.ESDUOC) ? ' Sí (Verificado)' : ' No'}
                            </span>
                        </p>
                    </div>
                </div>

                <hr className="text-secondary mt-3 mb-4" />

                {/* Opción de Editar (Abajo) */}
                <div className="text-end">
                    {/* Redirigimos a la ruta de edición de usuarios con el ID */}
                    <Link to={`/homeadmin/usuariosadmin/editar/${adminData.usuarioId || adminData.ID}`} className="btn btn-warning fw-bold">
                        <i className="fas fa-edit me-2"></i> EDITAR PERFIL
                    </Link>
                </div>
            </div>
            
        </div>
    );
    };

    return (
      <>
        <SidebarAdmin>
            <PerfilContent />
            <Notiadmn />
        </SidebarAdmin>
        <Footer />
     </>
    );
}

export default Perfiladmin;