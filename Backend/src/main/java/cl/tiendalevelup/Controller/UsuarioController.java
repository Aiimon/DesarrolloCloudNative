package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Entity.Usuario;
import cl.tiendalevelup.Service.UsuarioService;
import cl.tiendalevelup.security.JwtUtil;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/v2/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuario", description = "Operaciones relacionadas con usuarios del sistema")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    @Autowired
    private PasswordEncoder encoder;

 @Operation(
    summary = "Iniciar sesión de usuario",
    description = "Valida las credenciales del usuario (email y contraseña). "
                + "Si son correctas, devuelve un JWT junto con los datos del usuario autenticado.")
    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    String email = body.get("email") != null ? body.get("email").trim().toLowerCase() : "";
    String password = body.get("password");

    System.out.println("=== INTENTO DE LOGIN ===");
    System.out.println("1. Email buscado: [" + email + "]");

    Usuario u = service.getUsuarioByEmail(email);

    if (u == null) {
        System.out.println("2. ERROR: No se encontró ningún usuario con ese email.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
    }

    System.out.println("2. Usuario encontrado en BD: " + u.getEmail());
    System.out.println("3. Hash en BD: " + u.getPassword());
    
    boolean match = encoder.matches(password, u.getPassword());
    System.out.println("4. ¿La contraseña coincide?: " + match);

    if (!match) {
        System.out.println("5. ERROR: La contraseña no coincide con el hash.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
    }

    String token = JwtUtil.generarToken(u.getEmail(), u.getRol());

    return ResponseEntity.ok(Map.of(
            "token", token,
            "usuario", u
    ));
}

    @Operation(
    summary = "Registrar un nuevo usuario",
    description = "Crea un nuevo usuario en el sistema con sus datos personales. "
                + "La contraseña se almacena de forma segura encriptada.")
@PostMapping("/crear")
public ResponseEntity<?> crearUsuario(@RequestBody Usuario u) {
    try {
        u.setRol("USER");
        u.setEsDuoc(u.getEmail() != null && u.getEmail().endsWith("@duoc.cl"));
        
        // NO encriptes aquí, el service ya lo hace de forma automática
        Usuario creado = service.saveUsuario(u);
        return ResponseEntity.ok(creado);

    } catch (RuntimeException e) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(e.getMessage());
    }
}

    
    @Operation(
        summary = "Obtener todos los usuarios",
        description = "Devuelve una lista con todos los usuarios registrados en el sistema.")
    @GetMapping("/todos")
    public List<Usuario> obtenerTodos() {
        return service.getUsuarios();
    }

    @Operation(
        summary = "Buscar usuario por ID",
        description = "Devuelve un usuario específico según su ID.")
    @GetMapping("/buscar/id/{usuarioId}")
    public Usuario buscarPorId(@PathVariable int usuarioId) {
        return service.getUsuarioById(usuarioId);
    }

    @Operation(
        summary = "Buscar usuario por email",
        description = "Busca un usuario utilizando su correo electrónico.")
    @GetMapping("/buscar/email/{email}")
    public ResponseEntity<Usuario> buscarPorEmail(@PathVariable String email) {
        Usuario u = service.getUsuarioByEmail(email);
        return u != null ? ResponseEntity.ok(u) : ResponseEntity.notFound().build();
    }

    @Operation(
        summary = "Buscar usuario por RUT",
        description = "Devuelve un usuario utilizando su RUT como referencia.")
    @GetMapping("/buscar/rut/{rut}")
    public Usuario buscarPorRut(@PathVariable String rut) {
        return service.getUsuarioByRut(rut);
    }

    @Operation(
        summary = "Buscar usuario por nombre",
        description = "Busca un usuario según su nombre registrado.")
    @GetMapping("/buscar/nombre/{nombre}")
    public Usuario buscarPorNombre(@PathVariable String nombre) {
        return service.getUsuarioByNombre(nombre);
    }

    @Operation(
        summary = "Eliminar usuario por ID",
        description = "Elimina un usuario del sistema utilizando su ID.")
    @DeleteMapping("/eliminar/id/{usuarioId}")
    public String eliminarUsuario(@PathVariable int usuarioId) {
        return service.deleteUsuario(usuarioId);
    }

    @Operation(
        summary = "Eliminar usuario por RUT",
        description = "Elimina un usuario utilizando su RUT.")
    @DeleteMapping("/eliminar/rut/{rut}")
    public String eliminarPorRut(@PathVariable String rut) {
        return service.deleteUsuarioByRut(rut);
    }

    @Operation(
        summary = "Actualizar un usuario",
        description = "Actualiza los datos completos de un usuario con su nueva información.")
    @PutMapping("/actualizar")
    public Usuario actualizarUsuario(@RequestBody Usuario u) {
        return service.updateUsuario(u);
    }

    @Operation(
        summary = "Sincronizar usuario de Azure Entra ID",
        description = "Recibe el email y nombre del usuario autenticado vía Azure Entra ID. "
                    + "Si ya existe en Oracle Cloud, lo retorna; si no, lo registra con valores por defecto."
    )
    @PostMapping("/sync-azure")
    public ResponseEntity<Usuario> syncAzure(@RequestBody Map<String, String> body) {
        String email = body.get("email") != null ? body.get("email").trim().toLowerCase() : "";
        String name = body.getOrDefault("name", "Usuario Tenant");

        if (email.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // 1. Verificar si ya existe en la base de datos Oracle
        Usuario existente = service.getUsuarioByEmail(email);
        if (existente != null) {
            return ResponseEntity.ok(existente);
        }

        // 2. Si no existe, separar nombre y apellido
        String[] partes = name.trim().split(" ", 2);
        String nombre = partes[0];
        String apellido = partes.length > 1 ? partes[1] : "Azure";

        // 3. Crear usuario cumpliendo con todas las columnas obligatorias de tu tabla
        Usuario nuevo = new Usuario();
        nuevo.setEmail(email);
        nuevo.setNombre(nombre);
        nuevo.setApellido(apellido);
        // Generar un identificador temporal único para la columna RUT (nullable = false, unique = true)
        nuevo.setRut("ID-" + (int)(Math.random() * 9000000 + 1000000));
        nuevo.setPassword("AZURE_ENTRA_ID"); // Contraseña dummy (la autenticación real la valida Azure)
        nuevo.setFechaNacimiento("2000-01-01");
        nuevo.setRegion("Metropolitana");
        nuevo.setComuna("Santiago");
        nuevo.setTelefono("+56900000000");
        nuevo.setEsDuoc(email.endsWith("@duoc.cl") || email.endsWith("@duocuc.cl"));
        nuevo.setRol("USER");

        Usuario guardado = service.saveUsuario(nuevo);
        System.out.println("[ORACLE DB] Usuario Azure sincronizado con ID: " + guardado.getUsuarioId());

        return ResponseEntity.status(HttpStatus.CREATED).body(guardado);
    }
}
