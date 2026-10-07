package cl.tiendalevelup.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ========== EXCHANGES ==========
    public static final String PEDIDOS_EXCHANGE = "pedidos.exchange";
    public static final String PEDIDOS_DLX = "pedidos.dlx";

    // ========== ROUTING KEYS ==========
    public static final String PEDIDOS_ROUTING_KEY = "pedido.creado";
    public static final String NOTIFICACIONES_ROUTING_KEY = "pedido.notificacion";
    public static final String INVENTARIO_ROUTING_KEY = "pedido.stock";
    public static final String PEDIDOS_DLX_ROUTING_KEY = "pedido.dead";

    // ========== QUEUES ==========
    public static final String PEDIDOS_QUEUE = "pedidos.queue";
    public static final String NOTIFICACIONES_QUEUE = "notificaciones.queue";
    public static final String INVENTARIO_QUEUE = "inventario.queue";
    public static final String PEDIDOS_DLQ = "pedidos.dlq";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public DirectExchange pedidosExchange() {
        return new DirectExchange(PEDIDOS_EXCHANGE, true, false);
    }

    @Bean
    public FanoutExchange deadLetterExchange() {
        return new FanoutExchange(PEDIDOS_DLX, true, false);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(PEDIDOS_DLQ)
                .withArgument("x-message-ttl", 86400000) // 24 horas
                .build();
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, FanoutExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange);
    }

    // 1. Pedidos Queue
    @Bean
    public Queue pedidosQueue() {
        return QueueBuilder.durable(PEDIDOS_QUEUE)
                .withArgument("x-message-ttl", 30000)
                .withArgument("x-dead-letter-exchange", PEDIDOS_DLX)
                .withArgument("x-dead-letter-routing-key", PEDIDOS_DLX_ROUTING_KEY)
                .withArgument("x-max-length", 1000)
                .build();
    }

    @Bean
    public Binding pedidosBinding(Queue pedidosQueue, DirectExchange pedidosExchange) {
        return BindingBuilder.bind(pedidosQueue).to(pedidosExchange).with(PEDIDOS_ROUTING_KEY);
    }

    // 2. Notificaciones Queue
    @Bean
    public Queue notificacionesQueue() {
        return QueueBuilder.durable(NOTIFICACIONES_QUEUE)
                .withArgument("x-message-ttl", 60000)
                .withArgument("x-dead-letter-exchange", PEDIDOS_DLX)
                .withArgument("x-dead-letter-routing-key", PEDIDOS_DLX_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding notificacionesBinding(Queue notificacionesQueue, DirectExchange pedidosExchange) {
        return BindingBuilder.bind(notificacionesQueue).to(pedidosExchange).with(NOTIFICACIONES_ROUTING_KEY);
    }

    // 3. Inventario Queue
    @Bean
    public Queue inventarioQueue() {
        return QueueBuilder.durable(INVENTARIO_QUEUE)
                .withArgument("x-message-ttl", 60000)
                .withArgument("x-dead-letter-exchange", PEDIDOS_DLX)
                .withArgument("x-dead-letter-routing-key", PEDIDOS_DLX_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding inventarioBinding(Queue inventarioQueue, DirectExchange pedidosExchange) {
        return BindingBuilder.bind(inventarioQueue).to(pedidosExchange).with(INVENTARIO_ROUTING_KEY);
    }
}