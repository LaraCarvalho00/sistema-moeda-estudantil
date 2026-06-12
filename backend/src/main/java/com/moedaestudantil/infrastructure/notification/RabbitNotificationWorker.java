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
  private final WhatsAppMetaClient whatsAppMetaClient;
  private final ObjectMapper objectMapper;

  @RabbitListener(queues = "${app.notifications.rabbit.queue}")
  void processar(String payload) throws Exception {
    var evento = objectMapper.readValue(payload, EmailNotificationMessage.class);
    
    // Enviar por Email
    if (emailJsClient.prontoParaEnviar(evento)) {
      emailJsClient.enviar(evento);
      log.info("E-mail enviado via EmailJS: tipo={} destino={}", evento.type(), evento.toEmail());
    } else {
      log.warn(
          "EmailJS desabilitado, incompleto ou sem template para tipo={}; e-mail nao enviado para {}",
          evento.type(),
          evento.toEmail());
    }

    // Tentar enviar por WhatsApp (Meta API) primeiro
    if (whatsAppMetaClient.prontoParaEnviar() && temTexto(evento.toPhone())) {
      whatsAppMetaClient.enviar(evento);
      log.info("WhatsApp enviado via Meta API: tipo={} telefone={}", evento.type(), evento.toPhone());
    } 
    // Fallback para ZapSender se Meta não estiver configurado
    else if (zapSenderClient.prontoParaEnviar() && temTexto(evento.toPhone())) {
      zapSenderClient.enviar(evento);
      log.info("WhatsApp enviado via ZapSender: tipo={} telefone={}", evento.type(), evento.toPhone());
    } 
    // Log se nenhum estiver configurado
    else if (temTexto(evento.toPhone())) {
      log.warn("WhatsApp não configurado; mensagem não enviada para {}", evento.toPhone());
    }
  }

  private static boolean temTexto(String valor) {
    return valor != null && !valor.isBlank();
  }
}
