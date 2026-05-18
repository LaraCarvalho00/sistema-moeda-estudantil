package com.moedaestudantil.infrastructure.notification;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications.rabbit")
public record RabbitNotificacaoProperties(
    boolean enabled,
    String exchange,
    String queue,
    String routingKey) {}
