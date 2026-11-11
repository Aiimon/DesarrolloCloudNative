package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Entity.Producto;
import cl.tiendalevelup.Service.ProductoService;
import cl.tiendalevelup.Service.PedidoProducerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/v2/carrito")
@CrossOrigin(origins = "*")
public class CarritoController {

    private static final Logger log = LoggerFactory.getLogger(CarritoController.class);
    private static final String KAFKA_TOPIC_CARRITO = "eventos-carrito";
    private static final String KAFKA_TOPIC_STOCK_ALERTA = "stock-alertas-critico";

    @Autowired
    private ProductoService productoService;

    @Autowired(required = false)
    private PedidoProducerService pedidoProducerService;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    // Estructura en memoria por usuario
    private final Map<Long, Map<String, Map<String, Object>>> carritos = new ConcurrentHashMap<>();

    @GetMapping("/{usuarioId}")
    public ResponseEntity<?> obtenerCarrito(@PathVariable Long usuarioId) {
        Map<String, Map<String, Object>> itemsMap = carritos.getOrDefault(usuarioId, new HashMap<>());
        Map<String, Object> resp = new HashMap<>();
        resp.put("items", new ArrayList<>(itemsMap.values()));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/{usuarioId}/agregar/{productoId}")
    public ResponseEntity<?> agregarAlCarrito(
            @PathVariable Long usuarioId,
            @PathVariable String productoId,
            @RequestParam(defaultValue = "1") int cantidad) {

        Producto prod = productoService.obtenerPorId(productoId).orElse(null);
        if (prod == null) {
            return ResponseEntity.notFound().build();
        }

        // 1. Restar el stock dinámicamente y guardar en BD
        int stockActual = prod.getStock();
        int nuevoStock = Math.max(0, stockActual - cantidad);
        prod.setStock(nuevoStock);
        
        // PERSISTIR EL NUEVO STOCK (Esencial para que en el siguiente clic baje a 4, 3, etc.)
       productoService.guardarProducto(prod);

        carritos.putIfAbsent(usuarioId, new ConcurrentHashMap<>());
        Map<String, Map<String, Object>> userCart = carritos.get(usuarioId);

        if (userCart.containsKey(productoId)) {
            Map<String, Object> item = userCart.get(productoId);
            int cantActual = (int) item.get("cantidad");
            item.put("cantidad", cantActual + cantidad);
        } else {
            Map<String, Object> item = new HashMap<>();
            item.put("productoId", prod.getId());
            item.put("id", prod.getId());
            item.put("nombre", prod.getNombre());
            item.put("precio", prod.getPrecio());
            item.put("descuento", prod.getDescuento());
            item.put("stock", nuevoStock);
            item.put("imagen", prod.getImagen());
            item.put("cantidad", cantidad);
            userCart.put(productoId, item);
        }

        // 2. EVENTO A RABBITMQ
        if (pedidoProducerService != null) {
            String evento = String.format("Usuario ID %d agregó %d unidad(es) de [%s] (ID: %s)",
                    usuarioId, cantidad, prod.getNombre(), productoId);
            pedidoProducerService.enviarPedido("CART-ADD-" + usuarioId + "-" + System.currentTimeMillis(), evento);
        }

        // 3. EVENTO A KAFKA (eventos-carrito)
        if (kafkaTemplate != null) {
            Map<String, Object> kafkaPayload = new HashMap<>();
            kafkaPayload.put("eventoId", "EVT-ADD-" + UUID.randomUUID().toString().substring(0, 8));
            kafkaPayload.put("tipoEvento", "ITEM_AGREGADO");
            kafkaPayload.put("timestamp", new Date().toString());
            kafkaPayload.put("usuarioId", usuarioId);
            kafkaPayload.put("productoId", prod.getId());
            kafkaPayload.put("nombreProducto", prod.getNombre());
            kafkaPayload.put("precio", prod.getPrecio());
            kafkaPayload.put("cantidadAgregada", cantidad);
            kafkaPayload.put("stockRestante", nuevoStock);

            kafkaTemplate.send(KAFKA_TOPIC_CARRITO, String.valueOf(usuarioId), kafkaPayload);

            // 4. EVALUACIÓN Y PUBLICACIÓN EN STOCK-ALERTAS-CRITICO (Informativo <= 5)
            if (nuevoStock <= 5) {
                Map<String, Object> alertaPayload = new HashMap<>();
                alertaPayload.put("alertaId", "ALT-STK-" + System.currentTimeMillis());
                alertaPayload.put("tipoAlerta", "STOCK_CRITICO_CARRITO");
                alertaPayload.put("productoId", prod.getId());
                alertaPayload.put("nombreProducto", prod.getNombre());
                alertaPayload.put("stockRestante", nuevoStock);
                alertaPayload.put("umbralCritico", 5);
                alertaPayload.put("usuarioId", usuarioId);
                alertaPayload.put("fechaAlerta", new Date().toString());
                alertaPayload.put("mensaje", String.format("¡ALERTA DE INVENTARIO! El producto '%s' (ID: %s) ha quedado en stock crítico (%d unidades).", 
                        prod.getNombre(), prod.getId(), nuevoStock));

                kafkaTemplate.send(KAFKA_TOPIC_STOCK_ALERTA, prod.getId(), alertaPayload);
                log.warn("[KAFKA STREAMS / ALERTAS] Alerta emitida a {}: Producto {} con stock crítico de {}", 
                        KAFKA_TOPIC_STOCK_ALERTA, prod.getNombre(), nuevoStock);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", new ArrayList<>(userCart.values()));
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{usuarioId}/item/{productoId}")
    public ResponseEntity<?> eliminarItem(
            @PathVariable Long usuarioId,
            @PathVariable String productoId) {

        Map<String, Map<String, Object>> userCart = carritos.get(usuarioId);
        if (userCart != null && userCart.containsKey(productoId)) {
            Map<String, Object> itemRemovido = userCart.remove(productoId);
            int cantidadDevuelta = itemRemovido != null ? (int) itemRemovido.get("cantidad") : 0;

            // Devolver stock al eliminar del carrito
            Producto prod = productoService.obtenerPorId(productoId).orElse(null);
            if (prod != null && cantidadDevuelta > 0) {
                prod.setStock(prod.getStock() + cantidadDevuelta);
                // productoService.actualizar(prod);
            }

            // EVENTO A RABBITMQ
            if (pedidoProducerService != null) {
                String evento = String.format("Usuario ID %d eliminó producto [%s] devolviendo %d al stock", usuarioId, productoId, cantidadDevuelta);
                pedidoProducerService.enviarPedido("CART-DEL-" + usuarioId + "-" + System.currentTimeMillis(), evento);
            }

            // EVENTO A KAFKA
            if (kafkaTemplate != null) {
                Map<String, Object> kafkaPayload = new HashMap<>();
                kafkaPayload.put("eventoId", "EVT-DEL-" + UUID.randomUUID().toString().substring(0, 8));
                kafkaPayload.put("tipoEvento", "ITEM_ELIMINADO");
                kafkaPayload.put("usuarioId", usuarioId);
                kafkaPayload.put("productoId", productoId);
                kafkaPayload.put("cantidadDevuelta", cantidadDevuelta);

                kafkaTemplate.send(KAFKA_TOPIC_CARRITO, String.valueOf(usuarioId), kafkaPayload);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", userCart != null ? new ArrayList<>(userCart.values()) : Collections.emptyList());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{usuarioId}/vaciar")
    public ResponseEntity<?> vaciar(@PathVariable Long usuarioId) {
        Map<String, Map<String, Object>> userCart = carritos.remove(usuarioId);

        // Restablecer stock de todos los items devueltos
        if (userCart != null) {
            for (Map<String, Object> item : userCart.values()) {
                String prodId = (String) item.get("productoId");
                int cant = (int) item.get("cantidad");
                Producto prod = productoService.obtenerPorId(prodId).orElse(null);
                if (prod != null) {
                    prod.setStock(prod.getStock() + cant);
                }
            }
        }

        if (pedidoProducerService != null) {
            String evento = String.format("Usuario ID %d vació todo su carrito y restituyó el stock", usuarioId);
            pedidoProducerService.enviarPedido("CART-CLR-" + usuarioId + "-" + System.currentTimeMillis(), evento);
        }

        if (kafkaTemplate != null) {
            Map<String, Object> kafkaPayload = new HashMap<>();
            kafkaPayload.put("eventoId", "EVT-CLR-" + UUID.randomUUID().toString().substring(0, 8));
            kafkaPayload.put("tipoEvento", "CARRITO_VACIADO");
            kafkaPayload.put("usuarioId", usuarioId);

            kafkaTemplate.send(KAFKA_TOPIC_CARRITO, String.valueOf(usuarioId), kafkaPayload);
        }

        return ResponseEntity.ok(true);
    }
}