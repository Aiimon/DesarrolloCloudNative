package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Entity.Boleta;
import cl.tiendalevelup.Service.BoletaService;
import cl.tiendalevelup.Service.PedidoProducerService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v2/boletas")
@CrossOrigin(origins = "*")
@Tag(name = "Boletas", description = "Operaciones relacionadas a la generación e historial de boletas")
public class BoletaController {

    @Autowired
    private BoletaService boletaService;

    @Autowired(required = false)
    private PedidoProducerService pedidoProducerService;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    /** Generar boleta desde carrito y notificar a RabbitMQ y Kafka */
    @Operation(summary = "Generar boleta desde carrito y notificar a RabbitMQ")
    @PostMapping("/generar")
    @SuppressWarnings({"unchecked", "rawtypes"})
    public Boleta generarBoleta(@RequestBody Map<String, Object> body) {

        int usuarioId = ((Number) body.get("usuarioId")).intValue();
        
        // Uso de tipo crudo List para evitar el token '>' y errores de sintaxis en el IDE
        List items = (List) body.get("items");

        // 1. Guardar la boleta en la base de datos Oracle
        Boleta boletaGuardada = boletaService.generarBoleta(usuarioId, items);

        // 2. Disparar eventos concurrentes a RabbitMQ (pedidos, notificaciones, inventario)
        if (pedidoProducerService != null && boletaGuardada != null) {
            try {
                String emailCliente = (boletaGuardada.getUsuario() != null && boletaGuardada.getUsuario().getEmail() != null)
                        ? boletaGuardada.getUsuario().getEmail()
                        : "cliente@tiendalevelup.cl";

                Double totalMonto = boletaGuardada.getTotal();

                pedidoProducerService.publicarEventosDeCompra(
                        boletaGuardada.getId(),
                        items,
                        totalMonto,
                        emailCliente
                );
                System.out.println("[BOLETA CONTROLLER] Eventos de compra distribuidos con exito para boleta ID: " + boletaGuardada.getId());
            } catch (Exception e) {
                System.err.println("[BOLETA CONTROLLER ERROR] Error al emitir eventos RabbitMQ: " + e.getMessage());
            }
        }

        // 3. Disparar evento a Kafka (boletas-creadas -> Kafka Streams -> boletas-alertas)
        if (kafkaTemplate != null && boletaGuardada != null) {
            try {
                String key = boletaGuardada.getId().toString();
                kafkaTemplate.send("boletas-creadas", key, boletaGuardada);
                System.out.println("[BOLETA CONTROLLER] Evento transmitido a Kafka para boleta ID: " + boletaGuardada.getId());
            } catch (Exception e) {
                System.err.println("[BOLETA CONTROLLER ERROR] Error al emitir a Kafka: " + e.getMessage());
            }
        }

        return boletaGuardada;
    }

    /** Endpoint de prueba para verificar Kafka por curl o frontend */
    @PostMapping("/kafka-test/boleta")
    public String emitirBoletaKafkaPrueba(@RequestBody Boleta boleta) {
        if (kafkaTemplate != null) {
            String key = boleta.getId() != null ? boleta.getId().toString() : "test-key";
            kafkaTemplate.send("boletas-creadas", key, boleta);
            return "Boleta transmitida exitosamente a Kafka con ID: " + boleta.getId();
        }
        return "KafkaTemplate no disponible";
    }

    /** Obtener una boleta por ID */
    @Operation(summary = "Obtener una boleta por ID")
    @GetMapping("/{id}")
    public Boleta getBoleta(@PathVariable Long id) {
        return boletaService.getBoletaById(id);
    }

    /** Historial de boletas por usuario */
    @Operation(summary = "Historial de boletas de un usuario")
    @GetMapping("/usuario/{usuarioId}")
    public List<Boleta> getBoletasByUsuario(@PathVariable int usuarioId) {
        return boletaService.getBoletasByUsuario(usuarioId);
    }
}