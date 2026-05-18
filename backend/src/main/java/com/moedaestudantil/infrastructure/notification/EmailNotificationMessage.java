package com.moedaestudantil.infrastructure.notification;

import java.util.LinkedHashMap;
import java.util.Map;

public record EmailNotificationMessage(
    String type,
    String toEmail,
    String toPhone,
    String toName,
    String subject,
    String body,
    Map<String, Object> templateParams) {

  public Map<String, Object> parametrosEmailJs() {
    Map<String, Object> params = new LinkedHashMap<>();
    if (templateParams != null) {
      params.putAll(templateParams);
    }
    params.put("event_type", valor(type));
    params.put("to_email", valor(toEmail));
    params.put("to_phone", valor(toPhone));
    params.put("to_name", valor(toName));
    params.put("subject", valor(subject));
    params.put("message", valor(body));
    return params;
  }

  private static String valor(Object valor) {
    return valor == null ? "" : String.valueOf(valor);
  }
}
