package com.moedaestudantil.infrastructure.notification;

public interface EmailNotificationPublisher {

  void publicar(EmailNotificationMessage mensagem);
}
