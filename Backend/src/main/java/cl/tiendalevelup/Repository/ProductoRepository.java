package cl.tiendalevelup.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import cl.tiendalevelup.Entity.Producto;


public interface ProductoRepository extends JpaRepository<Producto, String> { 

    Optional<Producto> findByNombre(String nombre);

    @Query(value = "SELECT * FROM productos WHERE destacado = 1 AND ROWNUM <= 3", nativeQuery = true)
    List<Producto> findTop3Destacados();
}
