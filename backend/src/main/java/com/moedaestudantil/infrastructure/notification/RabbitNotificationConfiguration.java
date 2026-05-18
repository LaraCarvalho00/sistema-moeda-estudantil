package com.moedaestudantil.infrastructure.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.notifications.rabbit", name = "enabled", havingValue = "true")
class RabbitNotificationConfiguration {

  private final RabbitNotificacaoProperties properties;

  @Bean
  DirectExchange notificationExchange() {
    return new DirectExchange(properties.exchange(), true, false);
  }

  @Bean
  Queue notificationQueue() {
    return new Queue(properties.queue(), true);
  }

  @Bean
  Binding notificationBinding(Queue notificationQueue, DirectExchange notificationExchange) {
    return BindingBuilder.bind(notificationQueue)
        .to(notificationExchange)
        .with(properties.routingKey());
  }
}
