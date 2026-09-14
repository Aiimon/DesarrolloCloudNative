// apihelper.js
// http://localhost:8082/swagger-ui/index.html


// Definir la URL del backend según el entorno
const BACKEND_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8082"         // Backend local
    : "https://tiendalevelup.netlify.app"; // Frontend en Netlify

// Endpoints
export const API_USUARIOS = `${BACKEND_URL}/v2/usuarios`;
export const API_PRODUCTOS = `${BACKEND_URL}/v2/productos`;
export const API_CATEGORIAS = `${BACKEND_URL}/v2/categorias`;
export const API_CARRITO = `${BACKEND_URL}/v2/carrito`;
export const API_BOLETAS = `${BACKEND_URL}/v2/boletas`;
export const API_IMAGENES = `${BACKEND_URL}/v2/imagenes`;

// Headers con JWT si existe
export const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// IMAGENES

// Obtener todas las imágenes
export const getImagenes = async () => {
  const resp = await fetch(`${API_IMAGENES}/todas`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener imágenes");
};

// Obtener imágenes por tipo (ej: 'nosotros', 'evento', 'logo')
export const getImagenesPorTipo = async (tipo) => {
  const resp = await fetch(`${API_IMAGENES}/tipo/${tipo}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject(`Error al obtener imágenes tipo ${tipo}`);
};

// Obtener imagen por ID
export const getImagenPorId = async (id) => {
  const resp = await fetch(`${API_IMAGENES}/${id}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Imagen no encontrada");
};

// USUARIOS 

// Login
export const loginUsuario = async (email, password) => {
  const resp = await fetch(`${API_USUARIOS}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    throw new Error("Credenciales incorrectas");
  }

  const data = await resp.json();

  // 🔐 GUARDAR JWT Y USUARIO
  localStorage.setItem("token", data.token);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));

  return data.usuario;
};

// Crear usuario
export const crearUsuario = async (data) => {
  const resp = await fetch(`${API_USUARIOS}/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error("Error al crear usuario");
  }

  return await resp.json();
};

// Crear múltiples usuarios
export const crearUsuarios = async (usuarios) => {
  const resp = await fetch(`${API_USUARIOS}/crear/lista`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(usuarios),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al crear usuarios");
};

// Obtener todos los usuarios
export const getUsuarios = async () => {
  const resp = await fetch(`${API_USUARIOS}/todos`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener usuarios");
};

// Buscar usuario
export const getUsuarioPorId = async (usuarioId) => {
  const resp = await fetch(`${API_USUARIOS}/buscar/id/${usuarioId}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Usuario no encontrado");
};

export const getUsuarioPorEmail = async (email) => {
  const resp = await fetch(`${API_USUARIOS}/buscar/email/${email}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Usuario no encontrado");
};

export const getUsuarioPorRut = async (rut) => {
  const resp = await fetch(`${API_USUARIOS}/buscar/rut/${rut}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Usuario no encontrado");
};

export const getUsuarioPorNombre = async (nombre) => {
  const resp = await fetch(`${API_USUARIOS}/buscar/nombre/${nombre}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Usuario no encontrado");
};

// Actualizar usuario
export const updateUsuario = async (data) => {
  const resp = await fetch(`${API_USUARIOS}/actualizar`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al actualizar usuario");
};

// Eliminar usuario
export const deleteUsuario = async (usuarioId) => {
  const resp = await fetch(`${API_USUARIOS}/eliminar/id/${usuarioId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return resp.ok ? true : Promise.reject("Error al eliminar usuario");
};

export const deleteUsuarioPorRut = async (rut) => {
  const resp = await fetch(`${API_USUARIOS}/eliminar/rut/${rut}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return resp.ok ? true : Promise.reject("Error al eliminar usuario");
};

// PRODUCTOS

export const crearProducto = async (data) => {
  const resp = await fetch(`${API_PRODUCTOS}/crear`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al crear producto");
};

export const getProductos = async () => {
  const resp = await fetch(`${API_PRODUCTOS}/todos`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener productos");
};

export const getProductoPorId = async (id) => {
  const resp = await fetch(`${API_PRODUCTOS}/buscar/id/${id}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Producto no encontrado");
};

export const getProductoPorNombre = async (nombre) => {
  const resp = await fetch(`${API_PRODUCTOS}/buscar/nombre/${nombre}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Producto no encontrado");
};

export const updateProducto = async (id, data) => {
  const resp = await fetch(`${API_PRODUCTOS}/actualizar/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al actualizar producto");
};

export const deleteProducto = async (id) => {
  const resp = await fetch(`${API_PRODUCTOS}/eliminar/id/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return resp.ok ? true : Promise.reject("Error al eliminar producto");
};

// CATEGORÍAS

export const crearCategoria = async (data) => {
  const resp = await fetch(`${API_CATEGORIAS}/crear`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al crear categoría");
};

export const getCategorias = async () => {
  const resp = await fetch(`${API_CATEGORIAS}/todas`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener categorías");
};

export const getCategoriaPorId = async (id) => {
  const resp = await fetch(`${API_CATEGORIAS}/buscar/id/${id}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Categoría no encontrada");
};

export const getCategoriaPorNombre = async (nombre) => {
  const resp = await fetch(`${API_CATEGORIAS}/buscar/nombre/${nombre}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Categoría no encontrada");
};

export const updateCategoria = async (id, data) => {
  const resp = await fetch(`${API_CATEGORIAS}/actualizar/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al actualizar categoría");
};

export const deleteCategoria = async (id) => {
  const resp = await fetch(`${API_CATEGORIAS}/eliminar/id/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return resp.ok ? true : Promise.reject("Error al eliminar categoría");
};

// CARRITO 

export const obtenerCarrito = async (usuarioId) => {
  const resp = await fetch(`${API_CARRITO}/${usuarioId}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener carrito");
};

export const agregarAlCarrito = async (usuarioId, productoId, cantidad) => {
  const resp = await fetch(`${API_CARRITO}/${usuarioId}/agregar/${productoId}?cantidad=${cantidad}`, {
    method: "POST",
    headers: getHeaders(),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al agregar producto al carrito");
};

export const vaciarCarrito = async (usuarioId) => {
  const resp = await fetch(`${API_CARRITO}/${usuarioId}/vaciar`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return resp.ok ? true : Promise.reject("Error al vaciar carrito");
};

export const actualizarItemCarrito = async (usuarioId, itemId, cantidad) => {
  const resp = await fetch(`${API_CARRITO}/${usuarioId}/item/${itemId}?cantidad=${cantidad}`, {
    method: "PUT",
    headers: getHeaders(),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al actualizar cantidad del item");
};

export const eliminarItemCarrito = async (usuarioId, itemId) => {
  const resp = await fetch(`${API_CARRITO}/${usuarioId}/item/${itemId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al eliminar item del carrito");
};

// BOLETAS 

export const generarBoleta = async (usuarioId) => {
  const resp = await fetch(`${API_BOLETAS}/generar/${usuarioId}`, {
    method: "POST",
    headers: getHeaders(),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al generar boleta");
};

export const getBoletaPorId = async (id) => {
  const resp = await fetch(`${API_BOLETAS}/${id}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Boleta no encontrada");
};

export const getBoletasPorUsuario = async (usuarioId) => {
  const resp = await fetch(`${API_BOLETAS}/usuario/${usuarioId}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener historial de boletas");
};
