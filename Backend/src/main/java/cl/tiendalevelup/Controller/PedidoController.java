package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Service.PedidoProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoProducerService pedidoProducerService;

    public PedidoController(PedidoProducerService pedidoProducerService) {
        this.pedidoProducerService = pedidoProducerService;
    }

    @PostMapping("/crear")
    public ResponseEntity<Map<String, String>> crearPedido(@RequestBody Map<String, String> payload) {
        String idPedido = payload.getOrDefault("idPedido", payload.getOrDefault("cliente", "ORD-" + System.currentTimeMillis()));
        String cliente = payload.getOrDefault("cliente", "Cliente General");
        String detalle = payload.getOrDefault("detalle", "Compra regular");
        String hora = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        String mensajeDetalle = String.format("Cliente: %s | Detalle: %s | Hora: %s", cliente, detalle, hora);

        // Envío estructurado hacia pedidos.queue mediante el servicio productor
        pedidoProducerService.enviarPedido(idPedido, mensajeDetalle);

        Map<String, String> response = new HashMap<>();
        response.put("status", "Enviado a RabbitMQ");
        response.put("idPedido", idPedido);
        response.put("mensaje", mensajeDetalle);

        return ResponseEntity.ok(response);
    }
}