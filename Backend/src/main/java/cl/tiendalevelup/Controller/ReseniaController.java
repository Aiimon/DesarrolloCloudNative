package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Entity.Resenia;
import cl.tiendalevelup.Service.ReseniaService;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequestMapping("/v2/resenias")
@CrossOrigin(origins = "*")
@Tag(name = "Reseñas", description = "Operaciones relacionadas con las reseñas de productos")
public class ReseniaController {

    private final ReseniaService reseniaService;

    public ReseniaController(ReseniaService reseniaService) {
        this.reseniaService = reseniaService;
    }

    @Operation(summary = "Obtener todas las reseñas de un producto")
    @GetMapping("/producto/{productoId}")
    public List<Resenia> getReseniasPorProducto(@PathVariable String productoId) {
        return reseniaService.obtenerReseniasPorProducto(productoId);
    }

    @Operation(summary = "Agregar una nueva reseña a un producto")
    @PostMapping("/crear/{productoId}/{usuarioId}")
    public Resenia agregarResenia(
            @PathVariable String productoId,
            @PathVariable int usuarioId,
            @RequestBody Resenia resenia) {

        return reseniaService.guardarResenia(productoId, usuarioId, resenia);
    }
}
