package com.moedaestudantil.infrastructure.notification;

import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
class EmailJsClient {

  private final EmailJsProperties properties;
  private final RestClient restClient = RestClient.create();
  private long ultimoEnvioMs;

  boolean prontoParaEnviar(EmailNotificationMessage mensagem) {
    return properties.enabled() && properties.configurado() && properties.temTemplatePara(mensagem.type());
  }

  synchronized void enviar(EmailNotificationMessage mensagem) {
    aguardarLimiteEmailJs();
    Map<String, Object> corpo = new LinkedHashMap<>();
    corpo.put("service_id", properties.serviceId());
    corpo.put("template_id", properties.templateIdPara(mensagem.type()));
    corpo.put("user_id", properties.publicKey());
    corpo.put("template_params", mensagem.parametrosEmailJs());
    if (properties.temChavePrivada()) {
      corpo.put("accessToken", properties.privateKey());
    }

    restClient
        .post()
        .uri(properties.apiUrl())
        .contentType(MediaType.APPLICATION_JSON)
        .body(corpo)
        .retrieve()
        .toBodilessEntity();
    ultimoEnvioMs = System.currentTimeMillis();
  }

  private void aguardarLimiteEmailJs() {
    long agora = System.currentTimeMillis();
    long esperaMs = 1_050L - (agora - ultimoEnvioMs);
    if (esperaMs <= 0) {
      return;
    }
    try {
      Thread.sleep(esperaMs);
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Envio EmailJS interrompido.", ex);
    }
  }
}
