package cl.tiendalevelup.Service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PedidoProducerService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // Ajustado a los nombres exactos de tu RabbitMQ
    private static final String EXCHANGE = "pedidos.exchange";
    private static final String ROUTING_KEY = "pedido.creado";

    public void enviarPedido(String ordenId, String detalle) {
        Map<String, Object> mensaje = new HashMap<>();
        mensaje.put("cliente", ordenId);
        mensaje.put("detalle", detalle);
        mensaje.put("timestamp", System.currentTimeMillis());

        try {
            rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, mensaje);
            System.out.println("[RABBITMQ PRODUCER] Mensaje enrutado a pedidos.queue: " + mensaje);
        } catch (Exception e) {
            System.err.println("[RABBITMQ PRODUCER ERROR] Falla al enviar: " + e.getMessage());
        }
    }
}