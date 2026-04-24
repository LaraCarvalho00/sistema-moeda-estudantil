package com.moedaestudantil.common;

import java.util.UUID;

public final class IdGenerator {
  private IdGenerator() {}

  public static String cupom() {
    return UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
  }
}
