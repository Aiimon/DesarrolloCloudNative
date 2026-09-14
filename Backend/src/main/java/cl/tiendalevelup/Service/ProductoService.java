package cl.tiendalevelup.Service;

import cl.tiendalevelup.Entity.Producto;
import cl.tiendalevelup.Repository.ProductoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository repository;
    
    public List<Producto> getProductosDestacados() {
        return repository.findTop3Destacados();
    }

    // Guardar producto
    public Producto guardarProducto(Producto p) {
        return repository.save(p);
    }

    // Listar todos los productos
    public List<Producto> listarProductos() {
        return repository.findAll();
    }

    // Obtener producto por ID
    public Optional<Producto> obtenerPorId(String id) {
        return repository.findById(id);
    }

    // Buscar producto por nombre
    public Optional<Producto> buscarPorNombre(String nombre) {
        return repository.findByNombre(nombre);
    }

    // Actualizar producto
    public Producto actualizarProducto(String id, Producto p) {
        return repository.findById(id).map(prod -> {
            prod.setNombre(p.getNombre());
            prod.setPrecio(p.getPrecio());
            prod.setDescuento(p.getDescuento());
            prod.setOferta(p.isOferta());
            prod.setRating(p.getRating());
            prod.setDescripcion(p.getDescripcion());
            prod.setImagen(p.getImagen());
            prod.setStock(p.getStock());
            prod.setStockCritico(p.getStockCritico());
            prod.setDetalles(p.getDetalles());
            prod.setCategoria(p.getCategoria());
            return repository.save(prod);
        }).orElse(null);
    }

    // Eliminar producto
    public boolean eliminarProducto(String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}
