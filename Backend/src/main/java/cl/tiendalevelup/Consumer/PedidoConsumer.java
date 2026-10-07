package cl.tiendalevelup.Consumer;

import cl.tiendalevelup.config.RabbitMQConfig;
import cl.tiendalevelup.Service.ProductoService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class PedidoConsumer {

    @Autowired
    private ProductoService productoService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // =========================================================================
    // 1. CONSUMIDOR DE PEDIDOS
    // =========================================================================
    @RabbitListener(queues = RabbitMQConfig.PEDIDOS_QUEUE, ackMode = "MANUAL")
    public void consumirPedido(Message message, Channel channel, 
                               @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {

        String cuerpoTexto = new String(message.getBody(), StandardCharsets.UTF_8);
        System.out.println("=================================================");
        System.out.println("[CONSUMIDOR PEDIDOS] Recibido: " + cuerpoTexto);

        try {
            if (cuerpoTexto.contains("ERROR")) {
                System.err.println("[CONSUMIDOR PEDIDOS] Error forzado detectado. Desviando a DLQ...");
                channel.basicNack(deliveryTag, false, false);
                return;
            }

            channel.basicAck(deliveryTag, false);
            System.out.println("[CONSUMIDOR PEDIDOS] Orden procesada con ACK manual.");
        } catch (Exception e) {
            System.err.println("[CONSUMIDOR PEDIDOS EXCEPCIÓN] " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
        System.out.println("=================================================");
    }

    // =========================================================================
    // 2. CONSUMIDOR DE NOTIFICACIONES
    // =========================================================================
    @RabbitListener(queues = RabbitMQConfig.NOTIFICACIONES_QUEUE, ackMode = "MANUAL")
    public void consumirNotificacion(Message message, Channel channel, 
                                     @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {

        String cuerpoTexto = new String(message.getBody(), StandardCharsets.UTF_8);
        System.out.println("-------------------------------------------------");
        System.out.println("[CONSUMIDOR NOTIFICACIONES] Recibido: " + cuerpoTexto);

        try {
            if (cuerpoTexto.contains("ERROR")) {
                System.err.println("[NOTIFICACIONES] Error forzado. Desviando a DLQ...");
                channel.basicNack(deliveryTag, false, false);
                return;
            }

            System.out.println("[NOTIFICACIONES] Comprobante emitido vía correo electrónico.");
            channel.basicAck(deliveryTag, false);
        } catch (Exception e) {
            System.err.println("[NOTIFICACIONES EXCEPCIÓN] " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
        System.out.println("-------------------------------------------------");
    }

    // =========================================================================
    // 3. CONSUMIDOR DE INVENTARIO (DESCUENTO DE STOCK REAL)
    // =========================================================================
    @RabbitListener(queues = RabbitMQConfig.INVENTARIO_QUEUE, ackMode = "MANUAL")
    public void consumirInventario(Message message, Channel channel, 
                                   @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) throws IOException {

        String cuerpoTexto = new String(message.getBody(), StandardCharsets.UTF_8);
        System.out.println("-------------------------------------------------");
        System.out.println("[CONSUMIDOR INVENTARIO] Recibido: " + cuerpoTexto);

        try {
            if (cuerpoTexto.contains("ERROR")) {
                System.err.println("[INVENTARIO] Error forzado. Desviando a DLQ...");
                channel.basicNack(deliveryTag, false, false);
                return;
            }

            JsonNode root = objectMapper.readTree(cuerpoTexto);
            JsonNode items = root.get("items");

            boolean exitoTotal = true;

            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    String productoId = item.has("id") ? item.get("id").asText() : item.get("productoId").asText();
                    int cantidad = item.get("cantidad").asInt();

                    boolean actualizado = productoService.descontarStock(productoId, cantidad);
                    if (!actualizado) {
                        exitoTotal = false;
                        break;
                    }
                }
            }

            if (exitoTotal) {
                channel.basicAck(deliveryTag, false);
                System.out.println("[INVENTARIO] Stock descontado exitosamente en Oracle DB. ACK confirmado.");
            } else {
                System.err.println("[INVENTARIO ERROR] Falla al actualizar stock. Desviando a DLQ...");
                channel.basicNack(deliveryTag, false, false);
            }

        } catch (Exception e) {
            System.err.println("[INVENTARIO EXCEPCIÓN] " + e.getMessage());
            channel.basicNack(deliveryTag, false, false);
        }
        System.out.println("-------------------------------------------------");
    }
}