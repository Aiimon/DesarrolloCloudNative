package cl.tiendalevelup.Consumer;

import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class PedidoConsumer {

    @RabbitListener(queues = "pedidos.queue", ackMode = "MANUAL")
    public void consumirPedido(
            Message message, 
            Channel channel, 
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {

        // Decodificar los bytes reales del mensaje a String UTF-8
        String cuerpoTexto = new String(message.getBody(), StandardCharsets.UTF_8);

        System.out.println("=================================================");
        System.out.println("[CONSUMIDOR] Payload recibido: " + cuerpoTexto);

        try {
            // Detección estricta de simulación de error
            if (cuerpoTexto.contains("ERROR")) {
                System.err.println("[CONSUMIDOR ERROR] Contiene 'ERROR'. Enviando NACK para desviar a DLQ...");
                
                // basicNack(deliveryTag, multiple=false, requeue=false) -> Transfiere a pedidos.dlq
                channel.basicNack(deliveryTag, false, false);
                System.err.println("[CONSUMIDOR] Mensaje derivado con éxito a pedidos.dlq (tag: " + deliveryTag + ")");
                System.out.println("=================================================");
                return;
            }

            // PROCESAMIENTO NORMAL EXITOSO
            System.out.println("[CONSUMIDOR] Procesando orden exitosa...");
            channel.basicAck(deliveryTag, false);
            System.out.println("[CONSUMIDOR] ACK manual confirmado para tag: " + deliveryTag);

        } catch (Exception e) {
            System.err.println("[CONSUMIDOR EXCEPCIÓN] Error inesperado: " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
        System.out.println("=================================================");
    }
}