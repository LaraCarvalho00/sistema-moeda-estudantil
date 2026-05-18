package com.moedaestudantil.infrastructure.notification;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
class ZapSenderClient {

  private final ZapSenderProperties properties;
  private final RestClient restClient = RestClient.create();

  boolean prontoParaEnviar() {
    return properties.configurado();
  }

  void enviar(EmailNotificationMessage mensagem) {
    restClient
        .post()
        .uri(properties.apiUrl())
        .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.token())
        .contentType(MediaType.APPLICATION_JSON)
        .body(Map.of("phone", mensagem.toPhone(), "text", mensagem.body()))
        .retrieve()
        .toBodilessEntity();
  }
}
