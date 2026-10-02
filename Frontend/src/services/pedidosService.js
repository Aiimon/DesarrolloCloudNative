const API_URL = "http://3.210.29.100:8082";

// 1. Enviar una orden a RabbitMQ (Productor)
export const enviarPedidoAMQP = async (idPedido, descripcion) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/pedidos/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ idPedido, descripcion })
  });

  if (!response.ok) {
    throw new Error(`Error en el envío: ${response.status}`);
  }
  return await response.json();
};

// 2. Crear una cola dinámicamente (Microservicio Administrador)
export const crearColaDinamica = async (queueName) => {
  const response = await fetch(`${API_URL}/api/rabbitmq/queues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ queueName, durable: true })
  });
  return await response.json();
};

// 3. Consultar métricas de una cola
export const obtenerInfoCola = async (queueName) => {
  const response = await fetch(`${API_URL}/api/rabbitmq/queues/${queueName}`);
  return await response.json();
};