package com.moedaestudantil.infrastructure.notification;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications.zapsender")
public record ZapSenderProperties(
    boolean enabled,
    String apiUrl,
    String token) {

  public boolean configurado() {
    return enabled
        && apiUrl != null
        && !apiUrl.isBlank()
        && token != null
        && !token.isBlank();
  }
}
