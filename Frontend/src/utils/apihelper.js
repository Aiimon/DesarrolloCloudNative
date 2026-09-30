const API_BASE_URL = "http://3.210.29.100:8082";
const BACKEND_URL = "http://3.210.29.100:8082";
const GATEWAY_URL = "https://h1m5l703rk.execute-api.us-east-1.amazonaws.com/Desarrollo";

export { API_BASE_URL, BACKEND_URL, GATEWAY_URL };

// Endpoints
export const API_USUARIOS = `${BACKEND_URL}/v2/usuarios`;
export const API_PRODUCTOS = `${GATEWAY_URL}/v2/productos`; // Ruta por Gateway con JWT
export const API_CATEGORIAS = `${BACKEND_URL}/v2/categorias`; // Directo a la EC2
export const API_CARRITO = `${BACKEND_URL}/v2/carrito`;
export const API_BOLETAS = `${BACKEND_URL}/v2/boletas`;
export const API_IMAGENES = `${BACKEND_URL}/v2/imagenes`;
export const API_ORDERS = `${BACKEND_URL}/api/orders`;

export const getBffHomeData = async () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${GATEWAY_URL}/bff/home-data`, { headers });
  
  if (!response.ok) {
    throw new Error(`Error en BFF: ${response.status}`);
  }
  
  return await response.json();
};

// Headers con JWT si existe en localStorage
export const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ================= ESTADO / CONECTIVIDAD =================

export const getOrderStatus = async () => {
  try {
    // Usamos /v2/categorias/todas o un actuator/health si existe
    const resp = await fetch(`${BACKEND_URL}/v2/categorias/todas`, { 
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (resp.ok) {
      return { ok: true };
    }
    return { ok: false, status: resp.status };
  } catch (error) {
    return { ok: false, error };
  }
};

export const sendOrderEvent = async (customerName) => {
  // Simular evento localmente sin hacer fetch para no generar errores 404
  console.log(`[RabbitMQ Simulado] Evento de orden generado para: ${customerName}`);
  return true;
};

// ================= IMAGENES =================

export const getImagenes = async () => {
  const resp = await fetch(`${API_IMAGENES}/todas`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener imágenes");
};

export const getImagenesPorTipo = async (tipo) => {
  const resp = await fetch(`${API_IMAGENES}/tipo/${tipo}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject(`Error al obtener imágenes tipo ${tipo}`);
};

export const getImagenPorId = async (id) => {
  const resp = await fetch(`${API_IMAGENES}/${id}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Imagen no encontrada");
};

// ================= USUARIOS =================

export const loginUsuario = async (email, password) => {
  const resp = await fetch(`${API_USUARIOS}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    throw new Error("Credenciales incorrectas");
  }

  const data = await resp.json();
  if (data.token) localStorage.setItem("token", data.token);
  if (data.usuario) localStorage.setItem("usuario", JSON.stringify(data.usuario));

  return data.usuario;
};

export const crearUsuario = async (data) => {
  const resp = await fetch(`${API_USUARIOS}/crear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    throw new Error("Error al crear usuario");
  }

  return await resp.json();
};

export const crearUsuarios = async (usuarios) => {
  const resp = await fetch(`${API_USUARIOS}/crear/lista`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(usuarios),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al crear usuarios");
};

export const getUsuarios = async () => {
  const resp = await fetch(`${API_USUARIOS}/todos`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener usuarios");
};

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

export const updateUsuario = async (data) => {
  const resp = await fetch(`${API_USUARIOS}/actualizar`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return resp.ok ? resp.json() : Promise.reject("Error al actualizar usuario");
};

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

// ================= PRODUCTOS =================

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

// ================= CATEGORÍAS =================

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

// ================= CARRITO =================

// ================= CARRITO =================

export const obtenerCarrito = async (usuarioId) => {
  if (!usuarioId) return { items: [] };
  try {
    const raw = localStorage.getItem(`carrito_${usuarioId}`);
    return { items: raw ? JSON.parse(raw) : [] };
  } catch {
    return { items: [] };
  }
};

export const agregarAlCarrito = async (usuarioId, productoInput, cantidad = 1) => {
  if (!usuarioId) throw new Error("Debes iniciar sesión para agregar al carrito");

  const productoId = typeof productoInput === "object" && productoInput !== null
    ? (productoInput.productoId ?? productoInput.id)
    : productoInput;

  const raw = localStorage.getItem(`carrito_${usuarioId}`);
  let items = raw ? JSON.parse(raw) : [];

  const index = items.findIndex((it) => (it.productoId ?? it.id) === productoId);

  if (index >= 0) {
    items[index].cantidad += Number(cantidad);
  } else {
    items.push({
      productoId: productoId,
      id: productoId,
      cantidad: Number(cantidad),
      ...(typeof productoInput === "object" && productoInput !== null ? productoInput : {}),
    });
  }

  localStorage.setItem(`carrito_${usuarioId}`, JSON.stringify(items));
  return { items };
};

export const vaciarCarrito = async (usuarioId) => {
  if (!usuarioId) return false;
  localStorage.removeItem(`carrito_${usuarioId}`);
  return true;
};

export const actualizarItemCarrito = async (usuarioId, itemId, cantidad) => {
  if (!usuarioId) return Promise.reject("Usuario no definido");

  const raw = localStorage.getItem(`carrito_${usuarioId}`);
  let items = raw ? JSON.parse(raw) : [];

  items = items.map((it) => {
    if ((it.productoId ?? it.id) === itemId) {
      return { ...it, cantidad: Number(cantidad) };
    }
    return it;
  });

  localStorage.setItem(`carrito_${usuarioId}`, JSON.stringify(items));
  return { items };
};

export const eliminarItemCarrito = async (usuarioId, itemId) => {
  if (!usuarioId) return Promise.reject("Usuario no definido");

  const raw = localStorage.getItem(`carrito_${usuarioId}`);
  let items = raw ? JSON.parse(raw) : [];

  items = items.filter((it) => (it.productoId ?? it.id) !== itemId);

  localStorage.setItem(`carrito_${usuarioId}`, JSON.stringify(items));
  return { items };
};
// ================= BOLETAS =================

export const generarBoleta = async (usuarioId) => {
  if (!usuarioId) return Promise.reject("Usuario no definido");
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
  if (!usuarioId) return [];
  const resp = await fetch(`${API_BOLETAS}/usuario/${usuarioId}`, { headers: getHeaders() });
  return resp.ok ? resp.json() : Promise.reject("Error al obtener historial de boletas");
};