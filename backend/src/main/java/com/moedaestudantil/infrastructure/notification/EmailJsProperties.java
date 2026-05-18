package com.moedaestudantil.infrastructure.notification;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications.emailjs")
public record EmailJsProperties(
    boolean enabled,
    String apiUrl,
    String serviceId,
    String templateId,
    String publicKey,
    String privateKey) {

  public boolean configurado() {
    return texto(apiUrl) && texto(serviceId) && texto(templateId) && texto(publicKey);
  }

  public boolean temChavePrivada() {
    return texto(privateKey);
  }

  private static boolean texto(String valor) {
    return valor != null && !valor.isBlank();
  }
}
