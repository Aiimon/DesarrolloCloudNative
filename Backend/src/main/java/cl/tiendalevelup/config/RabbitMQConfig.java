package cl.tiendalevelup.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ========== NOMBRES CENTRALIZADOS ==========
    public static final String PEDIDOS_EXCHANGE = "pedidos.exchange";
    public static final String PEDIDOS_QUEUE = "pedidos.queue";
    public static final String PEDIDOS_ROUTING_KEY = "pedido.creado";

    // ========== DEAD LETTER EXCHANGE (DLX) Y DLQ ==========
    public static final String PEDIDOS_DLX = "pedidos.dlx";
    public static final String PEDIDOS_DLQ = "pedidos.dlq";
    public static final String PEDIDOS_DLX_ROUTING_KEY = "pedido.dead";

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // Exchange Principal (Direct)
    @Bean
    public DirectExchange pedidosExchange() {
        return new DirectExchange(PEDIDOS_EXCHANGE, true, false);
    }

    // Cola Principal con TTL de 30s y desvío a DLX
    @Bean
    public Queue pedidosQueue() {
        return QueueBuilder.durable(PEDIDOS_QUEUE)
                .withArgument("x-message-ttl", 30000)
                .withArgument("x-dead-letter-exchange", PEDIDOS_DLX)
                .withArgument("x-dead-letter-routing-key", PEDIDOS_DLX_ROUTING_KEY)
                .withArgument("x-max-length", 1000)
                .build();
    }

    // Binding Cola Principal <-> Exchange Principal
    @Bean
    public Binding pedidosBinding(Queue pedidosQueue, DirectExchange pedidosExchange) {
        return BindingBuilder.bind(pedidosQueue)
                .to(pedidosExchange)
                .with(PEDIDOS_ROUTING_KEY);
    }

    // Dead Letter Exchange (Fanout)
    @Bean
    public FanoutExchange deadLetterExchange() {
        return new FanoutExchange(PEDIDOS_DLX, true, false);
    }

    // Cola de Mensajes Muertos (DLQ)
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(PEDIDOS_DLQ)
                .withArgument("x-message-ttl", 86400000) // Retención de 24h
                .build();
    }

    // Binding DLQ <-> DLX
    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, FanoutExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue)
                .to(deadLetterExchange);
    }
}