package com.moedaestudantil.infrastructure.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.notifications.rabbit", name = "enabled", havingValue = "true")
class RabbitEmailNotificationPublisher implements EmailNotificationPublisher {

  private final RabbitTemplate rabbitTemplate;
  private final RabbitNotificacaoProperties properties;
  private final ObjectMapper objectMapper;

  @Override
  public void publicar(EmailNotificationMessage mensagem) {
    try {
      rabbitTemplate.convertAndSend(
          properties.exchange(),
          properties.routingKey(),
          objectMapper.writeValueAsString(mensagem));
      log.info(
          "Evento de notificacao publicado no RabbitMQ: tipo={} destino={}",
          mensagem.type(),
          mensagem.toEmail());
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Nao foi possivel serializar evento de notificacao.", ex);
    }
  }
}
