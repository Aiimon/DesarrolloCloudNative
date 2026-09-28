package cl.tiendalevelup;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

@Service
public class OrderConsumer {

    @RabbitListener(queues = RabbitMQConfig.ORDERS_QUEUE)
    public void processOrder(String message, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) {
        try {
            System.out.println("[PROCESADOR] Recibida orden: " + message);

            // Simulación de fallo aleatorio (50% de probabilidad)
            if (Math.random() < 0.5) {
                throw new RuntimeException("Error simulado al procesar: " + message);
            }

            System.out.println("[ÉXITO] Orden procesada correctamente: " + message);
            channel.basicAck(deliveryTag, false); // Confirmación manual
        } catch (Exception e) {
            System.out.println("[! ERROR] " + e.getMessage());
            try {
                // Requeue = false envía el mensaje directamente al DLX
                channel.basicNack(deliveryTag, false, false);
                System.out.println("[→ DLX] Mensaje enviado a Dead Letter Exchange");
            } catch (Exception nackException) {
                nackException.printStackTrace();
            }
        }
    }

    @RabbitListener(queues = RabbitMQConfig.DLQ_QUEUE)
    public void processDLQ(String message) {
        System.out.println("[DLQ] MENSAJE EN CUARENTENA: " + message);
    }
}
