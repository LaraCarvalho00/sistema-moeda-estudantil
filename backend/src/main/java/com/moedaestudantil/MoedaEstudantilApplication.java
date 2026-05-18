package com.moedaestudantil;

import com.moedaestudantil.infrastructure.security.JwtPropriedades;
import com.moedaestudantil.infrastructure.notification.EmailJsProperties;
import com.moedaestudantil.infrastructure.notification.RabbitNotificacaoProperties;
import com.moedaestudantil.infrastructure.notification.ZapSenderProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties({
  JwtPropriedades.class,
  RabbitNotificacaoProperties.class,
  EmailJsProperties.class,
  ZapSenderProperties.class
})
@EnableScheduling
public class MoedaEstudantilApplication {

  public static void main(String[] args) {
    SpringApplication.run(MoedaEstudantilApplication.class, args);
  }
}
