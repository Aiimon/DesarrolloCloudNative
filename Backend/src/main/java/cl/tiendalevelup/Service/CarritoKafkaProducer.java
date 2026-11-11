package cl.tiendalevelup.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class CarritoKafkaProducer {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void registrarAccionCarrito(Object evento) {
        this.kafkaTemplate.send("eventos-carrito", evento);
    }
}