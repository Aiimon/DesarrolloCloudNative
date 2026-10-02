import React, { useState } from 'react';
import { enviarPedidoAMQP } from '../services/pedidosService';

export const RabbitControlPanel = () => {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(false);

  const manejarEnvio = async (esFallo) => {
    setCargando(true);
    const id = `ORD-${Date.now()}`;
    const detalle = esFallo 
      ? "ERROR: Simulación de fallo forzado para Dead Letter Queue" 
      : "Compra exitosa - Procesamiento regular con ACK";

    try {
      const data = await enviarPedidoAMQP(id, detalle);
      setLogs((prev) => [
        {
          id,
          tipo: esFallo ? 'DLQ' : 'ACK',
          mensaje: data.detalle,
          hora: new Date().toLocaleTimeString()
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Panel de Resiliencia RabbitMQ (Pedidos360)</h2>
      <p>Simulación de procesamiento asíncrono, confirmación manual y Dead Letter Queue.</p>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => manejarEnvio(false)} 
          disabled={cargando}
          style={{ background: '#10b981', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Disparar Orden Exitosa (ACK)
        </button>

        <button 
          onClick={() => manejarEnvio(true)} 
          disabled={cargando}
          style={{ background: '#ef4444', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Disparar Orden con Error (Enviar a DLQ)
        </button>
      </div>

      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <h3>Historial de Mensajes Despachados</h3>
        {logs.length === 0 ? <p>No hay mensajes enviados aún.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {logs.map((item, index) => (
              <li key={index} style={{ padding: '10px', marginBottom: '8px', background: 'white', borderLeft: `5px solid ${item.tipo === 'ACK' ? '#10b981' : '#ef4444'}` }}>
                <strong>[{item.tipo}]</strong> {item.id} - <em>{item.hora}</em>
                <br />
                <span style={{ fontSize: '0.9em', color: '#555' }}>{item.mensaje}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};