package com.moedaestudantil.application.factory;

import lombok.Value;

/**
 * Padrão Factory: centraliza criação de invariantes de lançamento, evitando regras espalhadas.
 */
public final class TransacaoFabrica {

  private TransacaoFabrica() {}

  public static LoteEnvio novoEnvio(long quantidade, String mensagem) {
    if (quantidade <= 0) {
      throw new IllegalArgumentException("Quantidade de envio deve ser positiva.");
    }
    if (mensagem == null || mensagem.isBlank()) {
      throw new IllegalArgumentException("Mensagem justificativa é obrigatória (US03).");
    }
    return new LoteEnvio(quantidade, mensagem.trim());
  }

  public static LoteResgate novoResgate(long quantidade) {
    if (quantidade <= 0) {
      throw new IllegalArgumentException("Quantidade do resgate inválida.");
    }
    return new LoteResgate(quantidade, null);
  }

  @Value
  public static class LoteEnvio {
    long quantidade;
    String mensagem;
  }

  @Value
  public static class LoteResgate {
    long quantidade;
    /** Complemento opcional na transação (não exigido pela US de resgate). */
    String nota;
  }
}
