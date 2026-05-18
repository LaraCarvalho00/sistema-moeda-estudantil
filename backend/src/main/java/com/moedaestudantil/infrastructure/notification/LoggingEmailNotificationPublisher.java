package com.moedaestudantil.infrastructure.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnMissingBean(EmailNotificationPublisher.class)
class LoggingEmailNotificationPublisher implements EmailNotificationPublisher {

  @Override
  public void publicar(EmailNotificationMessage mensagem) {
    log.info(
        "[RabbitMQ desligado] notificacao tipo={} destino={} assunto={}",
        mensagem.type(),
        mensagem.toEmail(),
        mensagem.subject());
  }
}
