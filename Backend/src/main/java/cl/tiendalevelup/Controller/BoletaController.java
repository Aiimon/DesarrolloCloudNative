package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Entity.Boleta;
import cl.tiendalevelup.Service.BoletaService;

import org.springframework.beans.factory.annotation.Autowired;
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

    /** Generar boleta desde carrito */
    @Operation(summary = "Generar boleta desde carrito")
    @PostMapping("/generar")
    public Boleta generarBoleta(@RequestBody Map<String, Object> body) {

        int usuarioId = (int) body.get("usuarioId");
        List<Map<String, Object>> items =
                (List<Map<String, Object>>) body.get("items");

        return boletaService.generarBoleta(usuarioId, items);
    }

    /** Obtener una boleta por ID */
    @Operation(summary = "Obtener una boleta por ID")
    @GetMapping("/{id}")
    public Boleta getBoleta(@PathVariable Long id) {
        return boletaService.getBoletaById(id);
    }

    /**  Historial de boletas por usuario */
    @Operation(summary = "Historial de boletas de un usuario")
    @GetMapping("/usuario/{usuarioId}")
    public List<Boleta> getBoletasByUsuario(@PathVariable int usuarioId) {
        return boletaService.getBoletasByUsuario(usuarioId);
    }
}
