package com.moedaestudantil.infrastructure.notification;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propriedades para integração com WhatsApp Business API da Meta
 */
@ConfigurationProperties(prefix = "app.notifications.whatsapp-meta")
public record WhatsAppMetaProperties(
    boolean enabled,
    String accessToken,
    String businessAccountId,
    String phoneNumberId,
    String phoneNumber) {

  public boolean habilitado() {
    return enabled
        && accessToken != null
        && !accessToken.isBlank()
        && phoneNumberId != null
        && !phoneNumberId.isBlank()
        && businessAccountId != null
        && !businessAccountId.isBlank();
  }
}
