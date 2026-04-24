package com.moedaestudantil.application;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Gera a chave lógica do semestre (ex.: 2026-1 para jan–jul) para crédito de moedas do
 * professor (US02).
 */
public final class SemestreUtil {

  public static final long MOEDAS_CREDITO_SEMESTRAL = 1_000L;
  public static final ZoneId DEFAULT_ZONE = ZoneId.of("America/Sao_Paulo");

  private SemestreUtil() {}

  public static String chaveSemestre(Instant agora) {
    return chaveSemestre(agora, DEFAULT_ZONE);
  }

  public static String chaveSemestre(Instant agora, ZoneId zone) {
    var z = ZonedDateTime.ofInstant(agora, zone);
    int ano = z.getYear();
    int semestre = z.getMonthValue() <= 6 ? 1 : 2;
    return ano + "-" + semestre;
  }

  public static String chaveSemestre() {
    return chaveSemestre(Instant.now(Clock.systemDefaultZone()));
  }
}
