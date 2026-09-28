package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Entity.Producto;
import cl.tiendalevelup.Service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/v2/carrito")
@CrossOrigin(origins = "*")
public class CarritoController {

    @Autowired
    private ProductoService productoService;

    // Estructura en memoria por usuario (simula persistencia si no creaste tablas de BD para carrito)
    // Map<usuarioId, Map<productoId, Item>>
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
            @PathVariable String productoId, // String para aceptar KB001
            @RequestParam(defaultValue = "1") int cantidad) {

        Producto prod = productoService.obtenerPorId(productoId).orElse(null);
        if (prod == null) {
            return ResponseEntity.notFound().build();
        }

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
            item.put("stock", prod.getStock());
            item.put("imagen", prod.getImagen());
            item.put("cantidad", cantidad);
            userCart.put(productoId, item);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", new ArrayList<>(userCart.values()));
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{usuarioId}/item/{productoId}")
    public ResponseEntity<?> actualizarCantidad(
            @PathVariable Long usuarioId,
            @PathVariable String productoId,
            @RequestParam int cantidad) {

        Map<String, Map<String, Object>> userCart = carritos.get(usuarioId);
        if (userCart != null && userCart.containsKey(productoId)) {
            if (cantidad <= 0) {
                userCart.remove(productoId);
            } else {
                userCart.get(productoId).put("cantidad", cantidad);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", userCart != null ? new ArrayList<>(userCart.values()) : Collections.emptyList());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{usuarioId}/item/{productoId}")
    public ResponseEntity<?> eliminarItem(
            @PathVariable Long usuarioId,
            @PathVariable String productoId) {

        Map<String, Map<String, Object>> userCart = carritos.get(usuarioId);
        if (userCart != null) {
            userCart.remove(productoId);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", userCart != null ? new ArrayList<>(userCart.values()) : Collections.emptyList());
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{usuarioId}/vaciar")
    public ResponseEntity<?> vaciar(@PathVariable Long usuarioId) {
        carritos.remove(usuarioId);
        return ResponseEntity.ok(true);
    }
}