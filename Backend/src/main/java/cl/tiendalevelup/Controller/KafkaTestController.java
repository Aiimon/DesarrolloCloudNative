package cl.tiendalevelup.Controller;

import cl.tiendalevelup.Entity.Boleta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kafka-test")
@CrossOrigin(origins = "*")
public class KafkaTestController {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @PostMapping("/boleta")
    public String emitirBoletaPrueba(@RequestBody Boleta boleta) {
        String key = boleta.getId() != null ? boleta.getId().toString() : "boleta-test";
        kafkaTemplate.send("boletas-creadas", key, boleta);
        return "Boleta enviada a Kafka exitosamente con ID: " + boleta.getId();
    }
}