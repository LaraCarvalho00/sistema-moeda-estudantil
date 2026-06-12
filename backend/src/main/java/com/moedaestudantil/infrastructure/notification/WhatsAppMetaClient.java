package com.moedaestudantil.infrastructure.notification;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Cliente WhatsApp Business API da Meta
 * Envia mensagens via WhatsApp Cloud API
 */
@Slf4j
@Component
@RequiredArgsConstructor
class WhatsAppMetaClient {

  private final WhatsAppMetaProperties properties;
  private final ObjectMapper objectMapper;
  private final RestClient restClient = RestClient.create();

  boolean prontoParaEnviar() {
    return properties.habilitado();
  }

  void enviar(EmailNotificationMessage mensagem) {
    if (!prontoParaEnviar()) {
      log.warn("WhatsApp desabilitado ou incompleto");
      return;
    }

    if (mensagem.toPhone() == null || mensagem.toPhone().isBlank()) {
      log.debug("Número de telefone vazio, pulando WhatsApp para: {}", mensagem.toEmail());
      return;
    }

    try {
      String body = criarCorpoMensagem(mensagem);
      String url =
          String.format(
              "https://graph.instagram.com/v18.0/%s/messages",
              properties.phoneNumberId());

      var response =
          restClient
              .post()
              .uri(url)
              .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.accessToken())
              .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
              .body(body)
              .retrieve()
              .toEntity(String.class);

      if (response.getStatusCode().is2xxSuccessful()) {
        log.info(
            "WhatsApp enviado com sucesso: tipo={} telefone={}", mensagem.type(), mensagem.toPhone());
      } else {
        log.warn(
            "Falha ao enviar WhatsApp: status={} tipo={} telefone={}",
            response.getStatusCode(),
            mensagem.type(),
            mensagem.toPhone());
      }

    } catch (RestClientException ex) {
      log.error("Erro ao conectar com Meta API: {}", ex.getMessage(), ex);
    } catch (Exception ex) {
      log.error("Erro ao preparar mensagem WhatsApp: {}", ex.getMessage(), ex);
    }
  }

  private String criarCorpoMensagem(EmailNotificationMessage mensagem) throws Exception {
    ObjectNode root = objectMapper.createObjectNode();

    // Formatar número: remover caracteres especiais e adicionar código país
    String numeroFormatado = formatarNumero(mensagem.toPhone());

    root.put("messaging_product", "whatsapp");
    root.put("to", numeroFormatado);

    // Tipo de mensagem: template (pré-aprovado) ou texto livre
    ObjectNode messageNode = root.putObject("message");
    messageNode.put("type", "text");

    ObjectNode textNode = messageNode.putObject("text");
    textNode.put("body", mensagem.body());

    return objectMapper.writeValueAsString(root);
  }

  private String formatarNumero(String numero) {
    // Remove espaços, hífens, parênteses
    String limpo = numero.replaceAll("[^0-9+]", "");

    // Se não tiver +, adiciona
    if (!limpo.startsWith("+")) {
      limpo = "+55" + limpo; // Assume Brasil se não tiver código
    }

    return limpo;
  }
}
