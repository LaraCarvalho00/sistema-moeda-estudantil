package com.moedaestudantil.domain.model;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class Vantagem {
  Long id;
  long parceiroId;
  String titulo;
  String descricao;
  long custoEmMoedas;
  String fotoUrl;
  String parceiroNome;
}
