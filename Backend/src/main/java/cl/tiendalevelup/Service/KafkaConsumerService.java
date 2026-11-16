package cl.tiendalevelup.Service;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    // 1. Consumer para eventos del carrito
    @KafkaListener(
        topics = "eventos-carrito",
        groupId = "consumer-eventos-carrito",
        concurrency = "1"
    )
    public void consumirEventosCarrito(String mensaje) {
        System.out.println("[KAFKA][eventos-carrito] -> " + mensaje);
        // Lógica de auditoría o analítica del carrito
    }

    // 2. Consumer para alertas de stock crítico (inventario <= 5)
    @KafkaListener(
        topics = "stock-alertas-critico",
        groupId = "consumer-stock-alertas",
        concurrency = "1"
    )
    public void consumirStockCritico(String mensaje) {
        System.out.println("[KAFKA][stock-alertas-critico] -> " + mensaje);
        // Lógica de alerta de stock bajo
    }

    // 3. Consumer para boletas creadas
    @KafkaListener(
        topics = "boletas-creadas",
        groupId = "consumer-boletas-creadas",
        concurrency = "1"
    )
    public void consumirBoletasCreadas(String mensaje) {
        System.out.println("[KAFKA][boletas-creadas] -> " + mensaje);
        // Lógica de confirmación / registro de boleta
    }

    // 4. Consumer para alertas de boletas
    @KafkaListener(
        topics = "boletas-alertas",
        groupId = "consumer-boletas-alertas",
        concurrency = "1"
    )
    public void consumirBoletasAlertas(String mensaje) {
        System.out.println("[KAFKA][boletas-alertas] -> " + mensaje);
        // Lógica de manejo de incidencias en boletas
    }
}