package com.moedaestudantil;

import com.moedaestudantil.infrastructure.security.JwtPropriedades;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties({JwtPropriedades.class})
@EnableScheduling
public class MoedaEstudantilApplication {

  public static void main(String[] args) {
    SpringApplication.run(MoedaEstudantilApplication.class, args);
  }
}
