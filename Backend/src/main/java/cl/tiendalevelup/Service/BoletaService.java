package cl.tiendalevelup.Service;

import cl.tiendalevelup.Entity.*;
import cl.tiendalevelup.Repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class BoletaService {

    @Autowired
    private BoletaRepository boletaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired(required = false)
    private PedidoProducerService pedidoProducerService;

    /**
     * Genera una boleta a partir del carrito y emite el evento asíncrono a RabbitMQ
     */
    @Transactional
    public Boleta generarBoleta(int usuarioId, List<Map<String, Object>> items) {

        // 1. Validar usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        if (items == null || items.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // 2. Crear boleta
        Boleta boleta = new Boleta();
        boleta.setUsuario(usuario);
        boleta.setFechaEmision(new Date());

        double total = 0;

        for (Map<String, Object> item : items) {
            String productoId = (String) item.get("productoId");
            int cantidad = (int) item.get("cantidad");
            double precioUnitario = ((Number) item.get("precioUnitario")).doubleValue();

            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + productoId));

            if (producto.getStock() < cantidad) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            producto.setStock(producto.getStock() - cantidad);

            DetalleBoleta detalle = new DetalleBoleta();
            detalle.setBoleta(boleta);
            detalle.setProducto(producto);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setSubtotal(cantidad * precioUnitario);

            boleta.getDetalles().add(detalle);
            total += detalle.getSubtotal();
        }

        boleta.setTotal(total);

        // Guardar boleta y sus detalles en Oracle Autonomous Database
        Boleta boletaGuardada = boletaRepository.save(boleta);

        // Disparar evento hacia RabbitMQ (pedidos.queue)
        if (pedidoProducerService != null) {
            String descripcion = String.format("Boleta N° %d generada para %s %s por un total de $%.2f (%d items)",
                    boletaGuardada.getId(),
                    usuario.getNombre(),
                    usuario.getApellido(),
                    boletaGuardada.getTotal(),
                    boletaGuardada.getDetalles().size());

            pedidoProducerService.enviarPedido("BOL-" + boletaGuardada.getId(), descripcion);
        }

        return boletaGuardada;
    }

    public Boleta getBoletaById(Long id) {
        return boletaRepository.findById(id).orElse(null);
    }

    public List<Boleta> getBoletasByUsuario(int usuarioId) {
        return boletaRepository.findByUsuario_UsuarioId(usuarioId);
    }
}