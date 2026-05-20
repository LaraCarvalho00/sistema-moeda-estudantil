package com.moedaestudantil.infrastructure.notification;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.notifications.rabbit", name = "enabled", havingValue = "true")
class RabbitNotificationWorker {

  private final EmailJsClient emailJsClient;
  private final ZapSenderClient zapSenderClient;
  private final ObjectMapper objectMapper;

  @RabbitListener(queues = "${app.notifications.rabbit.queue}")
  void processar(String payload) throws Exception {
    var evento = objectMapper.readValue(payload, EmailNotificationMessage.class);
    if (emailJsClient.prontoParaEnviar(evento)) {
      emailJsClient.enviar(evento);
      log.info("E-mail enviado via EmailJS: tipo={} destino={}", evento.type(), evento.toEmail());
    } else {
      log.warn(
          "EmailJS desabilitado, incompleto ou sem template para tipo={}; e-mail nao enviado para {}",
          evento.type(),
          evento.toEmail());
    }

    if (zapSenderClient.prontoParaEnviar() && temTexto(evento.toPhone())) {
      zapSenderClient.enviar(evento);
      log.info("WhatsApp enviado via ZapSender: tipo={} telefone={}", evento.type(), evento.toPhone());
    } else if (temTexto(evento.toPhone())) {
      log.warn("ZapSender desabilitado ou incompleto; WhatsApp nao enviado para {}", evento.toPhone());
    }
  }

  private static boolean temTexto(String valor) {
    return valor != null && !valor.isBlank();
  }
}
