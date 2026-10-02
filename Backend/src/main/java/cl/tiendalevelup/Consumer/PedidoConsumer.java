package cl.tiendalevelup.Consumer;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class PedidoConsumer {

    @RabbitListener(queues = "pedidos.queue", ackMode = "MANUAL")
    public void consumirPedido(
            Object payload, 
            Message message, 
            Channel channel, 
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {

        System.out.println("=================================================");
        System.out.println("[CONSUMIDOR] Mensaje recibido de pedidos.queue: " + payload);

        try {
            String texto = payload.toString();

            // Si el mensaje incluye "ERROR", lo enviamos intencionalmente a la DLQ
            if (texto.contains("ERROR")) {
                System.err.println("[CONSUMIDOR] Error detectado. Enviando a DLQ con NACK...");
                channel.basicNack(deliveryTag, false, false); // requeue = false -> va a pedidos.dlq
                return;
            }

            // PROCESAMIENTO EXITOSO
            System.out.println("[CONSUMIDOR] Procesando orden/evento con éxito...");
            
            // Enviar confirmación explícita para liberar el canal
            channel.basicAck(deliveryTag, false);
            System.out.println("[CONSUMIDOR] ACK confirmado exitosamente para tag: " + deliveryTag);

        } catch (Exception e) {
            System.err.println("[CONSUMIDOR EXCEPCIÓN] Fallo inesperado: " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
        System.out.println("=================================================");
    }
}