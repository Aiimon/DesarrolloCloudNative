package cl.tiendalevelup.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import cl.tiendalevelup.Entity.Boleta;
import java.util.List;

@Repository
public interface BoletaRepository extends JpaRepository<Boleta, Long> {

    List<Boleta> findByUsuario_UsuarioId(int usuarioId);

}
