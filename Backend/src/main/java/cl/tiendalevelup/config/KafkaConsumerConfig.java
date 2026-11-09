package cl.tiendalevelup.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.ExponentialBackOff;

@Configuration
public class KafkaConsumerConfig {

    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> template) {
        // Enviar mensajes fallidos a <topic_name>.DLT
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(template);

        // Exponential Backoff: Reintentos a 1s, 2s, 4s (máx 3 intentos)
        ExponentialBackOff backOff = new ExponentialBackOff(1000L, 2.0);
        backOff.setMaxAttempts(3);

        return new DefaultErrorHandler(recoverer, backOff);
    }
}