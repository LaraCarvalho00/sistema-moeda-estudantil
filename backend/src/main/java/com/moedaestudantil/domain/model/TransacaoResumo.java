package com.moedaestudantil.domain.model;

import java.time.Instant;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class TransacaoResumo {
  Long id;
  TransacaoTipo tipo;
  long quantidade;
  String mensagem;
  /** E-mail do outro lado da operação (relevante p/ extrato). */
  String contatoRelacionado;
  String cupom;
  Instant criadoEm;
}
